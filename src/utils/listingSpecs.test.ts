import test from 'node:test';
import assert from 'node:assert/strict';
import { findWheelBySlug, getAllBrandWheels, isSixnineWheel } from '../data/catalogue';
import { sizeLine } from '../data/sixnineSeries';
import { listingDiameters, listingFitment, sixnineSizesForListing } from './listingSpecs';

test('a listing\'s diameters, offsets and bolt pattern are read from its own record', () => {
  assert.deepEqual(listingDiameters('20 inch / 21 inch'), [20, 21]);
  assert.deepEqual(listingFitment('PCD 5×112 · ET15/20 · CB66.6'), { offsets: [15, 20], pcd: '5x112' });
  assert.deepEqual(listingFitment(undefined), { offsets: [], pcd: undefined });
});

test('each stocked FF set matches one Sixnine size per diameter', () => {
  const lines = (slug: string) => sixnineSizesForListing(findWheelBySlug(slug)!).map(sizeLine);
  assert.deepEqual(lines('ff-1-silver'), ['10.5x20 ET15 · 5x112', '10.5x21 ET20 · 5x112']);
  assert.deepEqual(lines('ff-3-pure-bronze'), ['10.5x20 ET15 · 5x112', '11.5x21 ET17 · 5x112']);
});

test('every matched size carries Sixnine\'s figures and agrees with the listing', () => {
  for (const wheel of getAllBrandWheels().filter(isSixnineWheel)) {
    const { offsets, pcd } = listingFitment(wheel.technicalSpecSheet);
    for (const size of sixnineSizesForListing(wheel)) {
      assert.ok(offsets.includes(size.offset!), `${wheel.slug}: ET${size.offset} is not on the listing`);
      assert.ok(size.boltPatterns.includes(pcd!), `${wheel.slug}: ${pcd} differs`);
      assert.ok(listingDiameters(wheel.sizesAvailable).includes(size.diameter!));
    }
  }
});

test('a Forged SA listing has no Sixnine sizes', () => {
  const fsa = getAllBrandWheels().find((w) => !isSixnineWheel(w))!;
  assert.deepEqual(sixnineSizesForListing(fsa), []);
});
