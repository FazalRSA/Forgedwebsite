import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { designPalette, getAllBrandWheels } from './catalogue';
import { allFinishStills, finishSwatchSrc } from './finishStills';
import { getStudioFinish } from './studioFinishes';

const PUBLIC = join(process.cwd(), 'public');

test('every design with a 3D model has a swatch still in every colour it is offered in', () => {
  const designs = new Set(getAllBrandWheels().filter((w) => w.modelUrl).map((w) => w.modelCode));
  assert.ok(designs.size > 0);
  for (const design of designs) {
    for (const finish of designPalette(design)) {
      assert.ok(finishSwatchSrc(design, finish), `${design} ${finish} has no swatch still`);
    }
  }
});

test('every swatch still file exists on disk', () => {
  const stills = allFinishStills();
  assert.ok(stills.length > 0);
  for (const s of stills) assert.ok(existsSync(join(PUBLIC, s.src)), `${s.src} is missing`);
});

test('design lookup ignores case and spacing, and an unknown design has no still', () => {
  assert.equal(finishSwatchSrc(' ff-3 ', 'pure-bronze'), finishSwatchSrc('FF-3', 'pure-bronze'));
  assert.equal(finishSwatchSrc('NOPE', 'silver'), undefined);
  assert.equal(finishSwatchSrc(undefined, 'silver'), undefined);
});

test('a design-specific paint replaces the finish paint for that design only', () => {
  assert.notDeepEqual(getStudioFinish('liquid-metal', 'FF-1'), getStudioFinish('liquid-metal', 'FF-3'));
  assert.deepEqual(getStudioFinish('liquid-metal', 'FF-3'), getStudioFinish('liquid-metal'));
});
