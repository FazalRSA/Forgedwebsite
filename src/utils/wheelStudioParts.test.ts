import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BRAKE_PARTS,
  FINISH_PARTS,
  cameraDistanceScale,
  classifyStudioPart,
  explodeOffsets,
  isMatteFinishName,
} from './wheelStudioParts';
import {
  describeWheelForEnquiry,
  parseTechnicalSpecSheet,
  stockLabel,
  wheelEnquiryMessage,
} from './wheelEnquiry';
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

test('isMatteFinishName flattens matte and satin names only', () => {
  assert.equal(isMatteFinishName('Black Matte'), true);
  assert.equal(isMatteFinishName('Satin Bronze'), true);
  assert.equal(isMatteFinishName('Gloss Black'), false);
  assert.equal(isMatteFinishName('Glossy Black'), false);
  assert.equal(isMatteFinishName('Hyper Black'), false);
  assert.equal(isMatteFinishName(undefined), false);
});

test('parseTechnicalSpecSheet reads PCD, ET and CB from the stock sheet line', () => {
  assert.deepEqual(parseTechnicalSpecSheet('PCD 5×112 · ET8/15 · CB66.6'), {
    pcd: '5×112',
    et: '8/15',
    cb: '66.6',
  });
  assert.deepEqual(parseTechnicalSpecSheet('PCD 5×112 · ET15/17'), { pcd: '5×112', et: '15/17' });
  assert.deepEqual(parseTechnicalSpecSheet('Load rating on request'), {});
  assert.deepEqual(parseTechnicalSpecSheet(undefined), {});
});

test('stockLabel words the stock count and says nothing without one', () => {
  assert.equal(stockLabel(1), '1 set in stock');
  assert.equal(stockLabel(2), '2 sets in stock');
  assert.equal(stockLabel(0), null);
  assert.equal(stockLabel(undefined), null);
});

test('the enquiry wording names design, finish, sizes and price', () => {
  const descriptor = describeWheelForEnquiry({
    design: 'FSA002',
    finish: 'Gold',
    sizes: '20 inch / 21 inch',
    price: 'R 75,000',
  });
  assert.equal(descriptor, 'FSA002 in Gold (20 inch / 21 inch), R 75,000 per set of 4');
  assert.equal(
    wheelEnquiryMessage(descriptor),
    "Hi, I'd like to ask about the FSA002 in Gold (20 inch / 21 inch), R 75,000 per set of 4. Is it still available?"
  );
  assert.equal(
    describeWheelForEnquiry({ design: 'FF-1', finish: 'Silver', price: 'R 80,000' }),
    'FF-1 in Silver, R 80,000 per set of 4'
  );
});
