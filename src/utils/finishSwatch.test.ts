import test from 'node:test';
import assert from 'node:assert/strict';
import { WHEEL_FINISHES } from '../data/catalogue';
import { STUDIO_FINISH_PBR, getStudioFinish } from '../data/studioFinishes';
import { defaultPaintRenderer, type StudioFinish } from '../wheel-viewer/paint';
import { cachedSwatch, fallbackSwatchBackground, swatchFor, swatchKey } from '../wheel-viewer/swatch';

const gold: StudioFinish = {
  id: 'champagne-bronze',
  name: 'Gold',
  swatchHex: '#C5A059',
  paint: { hex: '#b98a52', metalness: 1, roughness: 0.3, clearcoat: 0.3 },
};

test('every colour a visitor can pick has paint numbers, so it has a swatch that matches the wheel', () => {
  for (const id of Object.keys(WHEEL_FINISHES)) {
    assert.ok(STUDIO_FINISH_PBR[id as keyof typeof STUDIO_FINISH_PBR], `${id} has no studio paint`);
    const paint = getStudioFinish(id);
    assert.match(paint.hex, /^#[0-9a-f]{6}$/i);
    assert.ok(paint.metalness >= 0 && paint.metalness <= 1 && paint.roughness >= 0 && paint.roughness <= 1);
  }
});

test('a swatch is keyed by what changes how it looks: the paint, the matte or gloss name and the size', () => {
  assert.equal(swatchKey(gold, 36), swatchKey({ ...gold, id: 'other', swatchHex: '#000000' }, 36), 'id and dot colour do not matter');
  assert.notEqual(swatchKey(gold, 36), swatchKey(gold, 24));
  assert.notEqual(swatchKey(gold, 36), swatchKey({ ...gold, paint: { ...gold.paint, roughness: 0.5 } }, 36));
  assert.notEqual(swatchKey(gold, 36), swatchKey({ ...gold, name: 'Satin Gold' }, 36), 'a matte name reads as matte paint');
});

test('without WebGL (here: no document) a swatch is null, never a throw, and nothing is cached', async () => {
  assert.equal(cachedSwatch(gold, 36), null);
  assert.equal(await swatchFor({ finish: gold, size: 36, paint: defaultPaintRenderer }), null);
  assert.equal(cachedSwatch(gold, 36), null);
});

test('the drawn stand-in is a lit ball in the finish colour', () => {
  const css = fallbackSwatchBackground('#C5A059');
  assert.match(css, /radial-gradient/);
  assert.ok(css.includes('#C5A059'));
});
