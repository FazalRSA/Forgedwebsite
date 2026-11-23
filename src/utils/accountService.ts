/**
 * The customer account's data calls, written against a Supabase client that is passed in, so the same
 * code runs against the real client in the browser and a stub in the tests. The tables and functions
 * are the configurator's: public.profiles, public.saved_configurations, rename_configuration(),
 * export_my_data() and delete_my_account() (see README → Customer accounts).
 */
import type { SupabaseClient, User } from '@supabase/supabase-js';

export const BRAKE_SYSTEMS = ['M Compound Steel', 'M Carbon Ceramic', 'Bespoke Big Brake Kit'] as const;
export type BrakeSystem = (typeof BRAKE_SYSTEMS)[number];

export interface Profile {
  id: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  phone: string | null;
  city: string | null;
  brakeSystem: BrakeSystem | null;
  marketingOptIn: boolean;
  /** When the marketing choice was last changed (set by the database, read only). */
  marketingOptInAt: string | null;
  createdAt: string;
}

/** The part of a profile this site lets a customer edit. The configurator's extra fields are left as they are. */
export interface ProfilePatch {
  displayName?: string;
  phone?: string;
  city?: string;
  brakeSystem?: BrakeSystem | '' | null;
  marketingOptIn?: boolean;
}

export interface Build {
  code: string;
  name: string | null;
  carId: string;
  paintId: string;
  wheelId: string;
  finishId: string;
  size: string;
  createdAt: string;
}

/** Names for the ids a build holds, from the public catalogue tables; an id with no name is shown as the id. */
export type CatalogueNames = Record<'cars' | 'paints' | 'wheels' | 'finishes', Record<string, string>>;

export class BuildMissingError extends Error {
  constructor() {
    super('This build is no longer in your garage.');
    this.name = 'BuildMissingError';
  }
}

type ProfileRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  city: string | null;
  brake_system: string | null;
  marketing_opt_in: boolean | null;
  marketing_opt_in_at: string | null;
  created_at: string;
};

export const profileFromRow = (r: ProfileRow): Profile => ({
  id: r.id,
  email: r.email,
  displayName: r.display_name,
  avatarUrl: r.avatar_url,
  phone: r.phone,
  city: r.city,
  brakeSystem: (BRAKE_SYSTEMS as readonly string[]).includes(r.brake_system ?? '') ? (r.brake_system as BrakeSystem) : null,
  marketingOptIn: !!r.marketing_opt_in,
  marketingOptInAt: r.marketing_opt_in_at ?? null,
  createdAt: r.created_at,
});

const clean = (value: string | undefined, max: number): string | null => {
  const v = (value ?? '').trim().slice(0, max);
  return v === '' ? null : v;
};

/**
 * The columns a patch writes. Only the five this site edits can appear, text is trimmed and cut to the
 * database's own limits (display_name 100 here, phone 40, city 120), a blank clears the field, an unknown
 * brake system is dropped. `email`, `id` and the consent timestamp can never be written from here.
 */
export function profilePatchToRow(patch: ProfilePatch): Record<string, string | boolean | null> {
  const row: Record<string, string | boolean | null> = {};
  if (patch.displayName !== undefined) row.display_name = clean(patch.displayName, 100);
  if (patch.phone !== undefined) row.phone = clean(patch.phone, 40);
  if (patch.city !== undefined) row.city = clean(patch.city, 120);
  if (patch.brakeSystem !== undefined) {
    row.brake_system = (BRAKE_SYSTEMS as readonly string[]).includes(patch.brakeSystem ?? '') ? (patch.brakeSystem as string) : null;
  }
  if (patch.marketingOptIn !== undefined) row.marketing_opt_in = patch.marketingOptIn === true;
  return row;
}

const metaName = (u: User) => (u.user_metadata?.full_name || u.user_metadata?.name || null) as string | null;
const metaAvatar = (u: User) => (u.user_metadata?.avatar_url || u.user_metadata?.picture || null) as string | null;

/** The signed-in customer's profile; made from the Google account when the row is missing. */
export async function fetchProfile(client: SupabaseClient, user: User): Promise<Profile> {
  const { data, error } = await client.from('profiles').select('*').eq('id', user.id).maybeSingle();
  if (error) throw new Error(error.message);
  if (data) {
    const p = profileFromRow(data as ProfileRow);
    return { ...p, email: p.email ?? user.email ?? null, displayName: p.displayName ?? metaName(user), avatarUrl: p.avatarUrl ?? metaAvatar(user) };
  }
  // A plain insert, not an upsert: customers may update only their detail columns, never id or email.
  const { data: created, error: insertError } = await client
    .from('profiles')
    .insert({ id: user.id, email: user.email ?? null, display_name: metaName(user), avatar_url: metaAvatar(user) })
    .select('*')
    .single();
  if (insertError || !created) throw new Error(insertError?.message ?? 'Your profile could not be created.');
  return profileFromRow(created as ProfileRow);
}

/** Saves the edited fields and returns the row as stored. */
export async function saveProfile(client: SupabaseClient, user: User, patch: ProfilePatch): Promise<Profile> {
  const row = profilePatchToRow(patch);
  if (Object.keys(row).length === 0) return fetchProfile(client, user);
  const { data, error } = await client.from('profiles').update(row).eq('id', user.id).select('*').maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error('Your profile could not be saved. Please sign in again.');
  return profileFromRow(data as ProfileRow);
}

type BuildRow = { code: string; name: string | null; payload: Record<string, unknown> | null; created_at: string };

const str = (v: unknown): string => (typeof v === 'string' ? v : '');

export const buildFromRow = (r: BuildRow): Build => ({
  code: r.code,
  name: r.name ?? null,
  carId: str(r.payload?.carId),
  paintId: str(r.payload?.paintId),
  wheelId: str(r.payload?.wheelId),
  finishId: str(r.payload?.finishId),
  size: str(r.payload?.size),
  createdAt: r.created_at,
});

/** The customer's saved builds, newest first. */
export async function listBuilds(client: SupabaseClient, userId: string): Promise<Build[]> {
  const { data, error } = await client
    .from('saved_configurations')
    .select('code, name, payload, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return ((data ?? []) as BuildRow[]).map(buildFromRow);
}

/** Looks up display names for the ids in the builds. A failed lookup is not an error: ids are shown instead. */
export async function loadCatalogueNames(client: SupabaseClient, builds: Build[]): Promise<CatalogueNames> {
  const names: CatalogueNames = { cars: {}, paints: {}, wheels: {}, finishes: {} };
  const wanted: Array<[keyof CatalogueNames, string, (b: Build) => string]> = [
    ['cars', 'cars', (b) => b.carId],
    ['paints', 'paints', (b) => b.paintId],
    ['wheels', 'wheels', (b) => b.wheelId],
    ['finishes', 'wheel_finishes', (b) => b.finishId],
  ];
  await Promise.all(
    wanted.map(async ([key, table, pick]) => {
      const ids = [...new Set(builds.map(pick).filter(Boolean))];
      if (ids.length === 0) return;
      try {
        const { data } = await client.from(table).select('id, name').in('id', ids);
        for (const row of (data ?? []) as Array<{ id: string; name: string | null }>) {
          if (row.name) names[key][row.id] = row.name;
        }
      } catch {
        /* names are a nicety */
      }
    }),
  );
  return names;
}

/** "BMW M3 · Brooklyn Grey · FSA003 · 19" · Hyper Black", the ids standing in for any name that could not be found. */
export function describeBuild(build: Build, names: CatalogueNames): string {
  return [
    names.cars[build.carId] ?? build.carId,
    names.paints[build.paintId] ?? build.paintId,
    names.wheels[build.wheelId] ?? build.wheelId,
    build.size,
    names.finishes[build.finishId] ?? build.finishId,
  ]
    .filter(Boolean)
    .join(' · ');
}

/** Renames one of the customer's own builds. A blank name clears it. */
export async function renameBuild(client: SupabaseClient, code: string, name: string): Promise<void> {
  const { data, error } = await client.rpc('rename_configuration', { p_code: code, p_name: name.trim().slice(0, 80) || null });
  if (error) throw new Error(error.message);
  if (data !== true) throw new BuildMissingError();
}

/** Deletes one of the customer's own builds (row-level security turns anyone else's into zero rows). */
export async function deleteBuild(client: SupabaseClient, code: string): Promise<void> {
  const { data, error } = await client.from('saved_configurations').delete().eq('code', code).select('code');
  if (error) throw new Error(error.message);
  if (!data?.length) throw new BuildMissingError();
}

/** Everything stored about the customer, as the JSON the database function returns. */
export async function exportMyData(client: SupabaseClient): Promise<unknown> {
  const { data, error } = await client.rpc('export_my_data');
  if (error) throw new Error(error.message);
  return data;
}

/** The download's file name: the date makes two exports tell apart; never the customer's name or email. */
export function exportFilename(now: Date = new Date()): string {
  return `forged-my-data-${now.toISOString().slice(0, 10)}.json`;
}

/** Deletes the login, the profile and the saved builds. Enquiries already sent stay with the business. */
export async function deleteMyAccount(client: SupabaseClient): Promise<void> {
  const { error } = await client.rpc('delete_my_account');
  if (error) throw new Error(error.message);
}
