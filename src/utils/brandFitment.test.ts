import test from 'node:test';
import assert from 'node:assert/strict';
import { getAllBrandWheels, isForgedSaWheel, isSixnineWheel, type BrandWheelItem } from '../data/catalogue';
import { designCodes, fitmentAtAGlance, joinList } from './brandFitment';

const wheel = (over: Partial<BrandWheelItem>) => ({ compatibleCars: 'M3 Sedan (G80)', ...over }) as BrandWheelItem;

test('joinList reads as English', () => {
  assert.equal(joinList([]), '');
  assert.equal(joinList(['FF-1']), 'FF-1');
  assert.equal(joinList(['FF-1', 'FF-3']), 'FF-1 and FF-3');
  assert.equal(joinList(['FSA001', 'FSA002', 'FSA003']), 'FSA001, FSA002 and FSA003');
});

test('designCodes lists each design once, in natural order', () => {
  assert.deepEqual(designCodes([{ modelCode: 'FF-3' }, { modelCode: 'FF-1' }, { modelCode: 'FF-3' }, { modelCode: undefined }]), ['FF-1', 'FF-3']);
  assert.deepEqual(designCodes([{ modelCode: 'FSA003' }, { modelCode: 'FSA010' }, { modelCode: 'FSA001' }]), ['FSA001', 'FSA003', 'FSA010']);
});

test('fitment lists every car, and a size, bolt pattern or bore only when every set agrees', () => {
  const same = fitmentAtAGlance([
    wheel({ sizesAvailable: '20 inch / 21 inch', technicalSpecSheet: 'PCD 5×112 · ET15/20 · CB66.6' }),
    wheel({ compatibleCars: 'M3 Competition Sedan (G80)', sizesAvailable: '20 inch / 21 inch', technicalSpecSheet: 'PCD 5×112 · ET8/15 · CB66.6' }),
  ]);
  assert.deepEqual(same, [
    { label: 'Fits', value: 'M3 Sedan (G80), M3 Competition Sedan (G80)' },
    { label: 'Wheel sizes', value: '20" / 21"' },
    { label: 'Bolt pattern', value: '5×112' },
    { label: 'Centre bore', value: '66.6 mm' },
  ]);
  const mixed = fitmentAtAGlance([
    wheel({ sizesAvailable: '19 inch / 20 inch', technicalSpecSheet: 'PCD 5×112' }),
    wheel({ sizesAvailable: '20 inch / 21 inch', technicalSpecSheet: 'PCD 5×120' }),
  ]);
  assert.deepEqual(mixed.map((row) => row.label), ['Fits']);
  assert.deepEqual(fitmentAtAGlance([]), []);
});

test('each brand page has fitment facts from today\'s stock', () => {
  for (const match of [isForgedSaWheel, isSixnineWheel]) {
    const rows = fitmentAtAGlance(getAllBrandWheels().filter(match));
    assert.equal(rows[0]?.label, 'Fits');
  }
});
