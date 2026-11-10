import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BRAKE_PARTS,
  FINISH_PARTS,
  cameraDistanceScale,
  classifyStudioPart,
  explodeOffsets,
} from './wheelStudioParts';
import { STUDIO_FINISH_PBR, getStudioFinish } from '../data/studioFinishes';
import { WHEEL_FINISHES } from '../data/catalogue';

test('classifyStudioPart recognises the documented mesh names and the short legacy names', () => {
  assert.equal(classifyStudioPart('Rim_Barrel'), 'barrel');
  assert.equal(classifyStudioPart('Rim_Lip_Outer'), 'barrel');
  assert.equal(classifyStudioPart('Rim_Face_Spokes'), 'face');
  assert.equal(classifyStudioPart('Hardware_Bolts'), 'bolts');
  assert.equal(classifyStudioPart('Center_Cap'), 'cap');
  assert.equal(classifyStudioPart('Brake_Rotor'), 'rotor');
  assert.equal(classifyStudioPart('Brake_Caliper'), 'caliper');
  assert.equal(classifyStudioPart('STF399_front_barrel'), 'barrel');
  assert.equal(classifyStudioPart('bolts'), 'bolts');
});

test('classifyStudioPart treats unknown or empty names as the face so they still take the finish', () => {
  assert.equal(classifyStudioPart(''), 'face');
  assert.equal(classifyStudioPart('Mesh_014'), 'face');
});

test('paint goes on barrel, face and cap only; brakes are their own group', () => {
  assert.deepEqual([...FINISH_PARTS].sort(), ['barrel', 'cap', 'face']);
  assert.deepEqual([...BRAKE_PARTS].sort(), ['caliper', 'rotor']);
});

test('explodeOffsets moves face parts outboard, barrel and brakes inboard, scaled by diameter', () => {
  const o = explodeOffsets(0.5);
  assert.ok(o.cap > o.face && o.face > o.bolts && o.bolts > 0);
  assert.ok(o.caliper < o.rotor && o.rotor < o.barrel && o.barrel < 0);
  assert.equal(explodeOffsets(1).cap, o.cap * 2);
});

test('cameraDistanceScale never zooms in, backs off on narrow stages and when the panel covers the stage', () => {
  assert.equal(cameraDistanceScale(1.6), 1);
  assert.ok(cameraDistanceScale(0.5) > 1.6);
  assert.ok(cameraDistanceScale(1.6, 0.6) > 1.2);
  assert.ok(Number.isFinite(cameraDistanceScale(0)));
  assert.ok(Number.isFinite(cameraDistanceScale(1, 0)));
});

test('every catalogue finish has studio paint settings within physical ranges', () => {
  for (const id of Object.keys(WHEEL_FINISHES)) {
    const f = STUDIO_FINISH_PBR[id as keyof typeof STUDIO_FINISH_PBR];
    assert.ok(f, `missing studio finish for ${id}`);
    assert.match(f.hex, /^#[0-9a-f]{6}$/i);
    for (const v of [f.metalness, f.roughness, f.clearcoat, f.clearcoatRoughness]) {
      assert.ok(v >= 0 && v <= 1, `${id} value out of range`);
    }
  }
  assert.equal(getStudioFinish('not-a-finish'), STUDIO_FINISH_PBR.silver);
});
