import test from 'node:test';
import assert from 'node:assert/strict';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import {
  BuildMissingError,
  buildFromRow,
  deleteBuild,
  deleteMyAccount,
  describeBuild,
  exportFilename,
  exportMyData,
  fetchProfile,
  listBuilds,
  loadCatalogueNames,
  profileFromRow,
  profilePatchToRow,
  renameBuild,
  saveProfile,
} from './accountService';

const USER = { id: 'u1', email: 'a@example.com', user_metadata: { full_name: 'Ada Lovelace', picture: 'https://img/x.png' } } as unknown as User;

/** A chainable stand-in for the Supabase query builder: every method returns it, awaiting it gives `result`. */
function query(result: { data?: unknown; error?: { message: string } | null }, log?: unknown[]) {
  const q: Record<string, unknown> = {};
  for (const m of ['select', 'eq', 'in', 'order', 'limit', 'update', 'insert', 'delete']) {
    q[m] = (...args: unknown[]) => {
      log?.push([m, ...args]);
      return q;
    };
  }
  q.maybeSingle = () => Promise.resolve({ data: result.data ?? null, error: result.error ?? null });
  q.single = () => Promise.resolve({ data: result.data ?? null, error: result.error ?? null });
  q.then = (resolve: (v: unknown) => unknown) => resolve({ data: result.data ?? null, error: result.error ?? null });
  return q;
}
const client = (handlers: { from?: (t: string) => unknown; rpc?: (n: string, a?: unknown) => unknown }) => handlers as unknown as SupabaseClient;

test('a profile patch writes only the five editable columns, trimmed, clamped and never the email', () => {
  const row = profilePatchToRow({
    displayName: `  ${'x'.repeat(150)}  `,
    phone: ' 082 000 0000 ',
    city: '',
    brakeSystem: 'M Carbon Ceramic',
    marketingOptIn: true,
    ...({ email: 'evil@example.com', id: 'other', marketing_opt_in_at: 'now' } as object),
  });
  assert.deepEqual(Object.keys(row).sort(), ['brake_system', 'city', 'display_name', 'marketing_opt_in', 'phone']);
  assert.equal((row.display_name as string).length, 100);
  assert.equal(row.phone, '082 000 0000');
  assert.equal(row.city, null, 'a blank clears the field');
  assert.equal(row.brake_system, 'M Carbon Ceramic');
  assert.equal(row.marketing_opt_in, true);
});

test('an unknown brake system is dropped, a long phone and city are cut to the database limits, and an empty patch is empty', () => {
  assert.equal(profilePatchToRow({ brakeSystem: 'Rocket brakes' as never }).brake_system, null);
  assert.equal(profilePatchToRow({ brakeSystem: '' }).brake_system, null);
  assert.equal((profilePatchToRow({ phone: '1'.repeat(80) }).phone as string).length, 40);
  assert.equal((profilePatchToRow({ city: 'c'.repeat(300) }).city as string).length, 120);
  assert.deepEqual(profilePatchToRow({}), {});
  assert.equal(profilePatchToRow({ marketingOptIn: false }).marketing_opt_in, false, 'off is written, not skipped');
});

test('a profile row maps to the profile, and an unknown brake system reads as not set', () => {
  const p = profileFromRow({
    id: 'u1', email: 'a@example.com', display_name: 'Ada', avatar_url: null, phone: '0820000000', city: 'Durban',
    brake_system: 'something else', marketing_opt_in: null, marketing_opt_in_at: null, created_at: '2026-11-23T10:00:00Z',
  });
  assert.equal(p.brakeSystem, null);
  assert.equal(p.marketingOptIn, false, 'marketing is off unless the row says true');
  assert.equal(p.displayName, 'Ada');
});

test('fetchProfile fills a missing name and picture from the Google account, and creates the row when absent', async () => {
  const withRow = client({
    from: () => query({ data: { id: 'u1', email: null, display_name: null, avatar_url: null, phone: null, city: null, brake_system: null, marketing_opt_in: false, marketing_opt_in_at: null, created_at: 't' } }),
  });
  const p = await fetchProfile(withRow, USER);
  assert.equal(p.displayName, 'Ada Lovelace');
  assert.equal(p.avatarUrl, 'https://img/x.png');
  assert.equal(p.email, 'a@example.com');

  const log: unknown[] = [];
  let calls = 0;
  const empty = client({
    from: () => {
      calls++;
      // first call: select finds nothing; second: the insert returns the new row
      return calls === 1
        ? query({ data: null }, log)
        : query({ data: { id: 'u1', email: 'a@example.com', display_name: 'Ada Lovelace', avatar_url: null, phone: null, city: null, brake_system: null, marketing_opt_in: false, marketing_opt_in_at: null, created_at: 't' } }, log);
    },
  });
  const created = await fetchProfile(empty, USER);
  assert.equal(created.id, 'u1');
  assert.ok(log.some((e) => (e as unknown[])[0] === 'insert'), 'a missing profile is inserted');
});

test('saveProfile sends only the patch columns and returns the stored row', async () => {
  const log: unknown[] = [];
  const c = client({
    from: () => query({ data: { id: 'u1', email: 'a@example.com', display_name: 'Ada', avatar_url: null, phone: '082', city: null, brake_system: null, marketing_opt_in: true, marketing_opt_in_at: '2026-11-23T10:00:00Z', created_at: 't' } }, log),
  });
  const p = await saveProfile(c, USER, { phone: '082', marketingOptIn: true });
  const update = log.find((e) => (e as unknown[])[0] === 'update') as unknown[];
  assert.deepEqual(update[1], { phone: '082', marketing_opt_in: true });
  assert.equal(p.marketingOptIn, true);
  assert.equal(p.marketingOptInAt, '2026-11-23T10:00:00Z');
});

test('saveProfile reports a database error and a row that was not updated', async () => {
  await assert.rejects(saveProfile(client({ from: () => query({ error: { message: 'permission denied' } }) }), USER, { city: 'x' }), /permission denied/);
  await assert.rejects(saveProfile(client({ from: () => query({ data: null }) }), USER, { city: 'x' }), /could not be saved/);
});

test('saved builds map their payload and are listed for the signed-in customer only', async () => {
  const log: unknown[] = [];
  const c = client({
    from: () => query({ data: [{ code: 'AB12CD', name: 'Track M3', payload: { carId: 'm3', paintId: 'p1', wheelId: 'w1', finishId: 'f1', size: '19"', regionId: 'za' }, created_at: '2026-11-20T10:00:00Z' }, { code: 'ZZ99ZZ', name: null, payload: null, created_at: '2026-11-01T10:00:00Z' }] }, log),
  });
  const builds = await listBuilds(c, 'u1');
  assert.equal(builds.length, 2);
  assert.deepEqual(builds[0], { code: 'AB12CD', name: 'Track M3', carId: 'm3', paintId: 'p1', wheelId: 'w1', finishId: 'f1', size: '19"', createdAt: '2026-11-20T10:00:00Z' });
  assert.equal(builds[1].carId, '', 'a payload without ids does not crash');
  assert.deepEqual(log.find((e) => (e as unknown[])[0] === 'eq'), ['eq', 'user_id', 'u1']);
  assert.deepEqual(buildFromRow({ code: 'X', name: null, payload: { size: 20 }, created_at: 't' }).size, '', 'a non-text value is ignored');
});

test('catalogue names turn ids into words, and a failed lookup falls back to the ids', async () => {
  const builds = [buildFromRow({ code: 'A', name: null, payload: { carId: 'm3', paintId: 'p1', wheelId: 'w1', finishId: 'f1', size: '19"' }, created_at: 't' })];
  const tables: Record<string, Array<{ id: string; name: string }>> = {
    cars: [{ id: 'm3', name: 'BMW M3' }],
    paints: [{ id: 'p1', name: 'Brooklyn Grey' }],
    wheels: [{ id: 'w1', name: 'FSA003' }],
    wheel_finishes: [{ id: 'f1', name: 'Hyper Black' }],
  };
  const names = await loadCatalogueNames(client({ from: (t: string) => query({ data: tables[t] }) }), builds);
  assert.equal(describeBuild(builds[0], names), 'BMW M3 · Brooklyn Grey · FSA003 · 19" · Hyper Black');

  const broken = await loadCatalogueNames(client({ from: () => { throw new Error('offline'); } }), builds);
  assert.equal(describeBuild(builds[0], broken), 'm3 · p1 · w1 · 19" · f1');
});

test('rename returns normally for the customer\'s own build and fails for one that is not theirs', async () => {
  const seen: unknown[] = [];
  await renameBuild(client({ rpc: (n, a) => { seen.push([n, a]); return Promise.resolve({ data: true, error: null }); } }), 'AB12CD', '  My M3  ');
  assert.deepEqual(seen[0], ['rename_configuration', { p_code: 'AB12CD', p_name: 'My M3' }]);
  await renameBuild(client({ rpc: (n, a) => { seen.push([n, a]); return Promise.resolve({ data: true, error: null }); } }), 'AB12CD', '   ');
  assert.deepEqual(seen[1], ['rename_configuration', { p_code: 'AB12CD', p_name: null }], 'a blank name clears it');
  await assert.rejects(renameBuild(client({ rpc: () => Promise.resolve({ data: false, error: null }) }), 'X', 'n'), BuildMissingError);
  await assert.rejects(renameBuild(client({ rpc: () => Promise.resolve({ data: null, error: { message: 'boom' } }) }), 'X', 'n'), /boom/);
});

test('delete says so when nothing was deleted', async () => {
  await deleteBuild(client({ from: () => query({ data: [{ code: 'AB12CD' }] }) }), 'AB12CD');
  await assert.rejects(deleteBuild(client({ from: () => query({ data: [] }) }), 'AB12CD'), BuildMissingError);
  await assert.rejects(deleteBuild(client({ from: () => query({ error: { message: 'nope' } }) }), 'AB12CD'), /nope/);
});

test('the data export calls the database function, and its file name carries the date and nothing personal', async () => {
  const doc = { account: { id: 'u1' } };
  assert.deepEqual(await exportMyData(client({ rpc: (n) => Promise.resolve({ data: n === 'export_my_data' ? doc : null, error: null }) })), doc);
  await assert.rejects(exportMyData(client({ rpc: () => Promise.resolve({ data: null, error: { message: 'Sign in to export your data' } }) })), /Sign in/);
  assert.equal(exportFilename(new Date('2026-11-23T22:30:00Z')), 'forged-my-data-2026-11-23.json');
  assert.doesNotMatch(exportFilename(), /@/);
});

test('deleting the account calls the database function and surfaces its refusal', async () => {
  const seen: string[] = [];
  await deleteMyAccount(client({ rpc: (n) => { seen.push(n); return Promise.resolve({ error: null }); } }));
  assert.deepEqual(seen, ['delete_my_account']);
  await assert.rejects(deleteMyAccount(client({ rpc: () => Promise.resolve({ error: { message: 'An admin login is removed from the Supabase dashboard' } }) })), /admin login/);
});
