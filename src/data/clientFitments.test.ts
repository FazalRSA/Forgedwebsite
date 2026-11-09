import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { CLIENT_FITMENTS, FITMENT_FAMILIES } from './clientFitments';

test('the gallery is not empty and has at least one model family', () => {
  assert.ok(CLIENT_FITMENTS.length > 0, 'CLIENT_FITMENTS must not be empty');
  assert.ok(FITMENT_FAMILIES.length > 0, 'FITMENT_FAMILIES must not be empty');
});

test('every client fitment has a unique id and exactly two studio images', () => {
  const ids = new Set(CLIENT_FITMENTS.map((f) => f.id));
  assert.equal(ids.size, CLIENT_FITMENTS.length);
  for (const f of CLIENT_FITMENTS) {
    assert.equal(f.images.length, 2, `${f.id} must have two images`);
    assert.ok(f.images[0].endsWith('/front34.webp'), `${f.id} image 1 is the front 3/4 shot`);
    assert.ok(f.images[1].endsWith('/side.webp'), `${f.id} image 2 is the side profile`);
    assert.ok(f.vehicleTitle.length > 0 && f.wheelLook.length > 0 && f.paint.length > 0);
  }
});

test('every referenced studio image exists under public/', () => {
  for (const f of CLIENT_FITMENTS) {
    for (const img of f.images) {
      const path = join(process.cwd(), 'public', img);
      assert.ok(existsSync(path), `missing ${img}`);
    }
  }
});

test('slot labels are sequential and match the fitment count', () => {
  CLIENT_FITMENTS.forEach((f, i) => {
    const expected = `${String(i + 1).padStart(2, '0')} / ${String(CLIENT_FITMENTS.length).padStart(2, '0')}`;
    assert.equal(f.slotLabel, expected);
  });
});

test('filter families cover every fitment and list BMW M cars first', () => {
  for (const f of CLIENT_FITMENTS) assert.ok(FITMENT_FAMILIES.includes(f.family));
  const bmwOrder = ['M2', 'M3', 'M4', 'M5'].filter((m) => FITMENT_FAMILIES.includes(m));
  assert.deepEqual(FITMENT_FAMILIES.slice(0, bmwOrder.length), bmwOrder);
});
