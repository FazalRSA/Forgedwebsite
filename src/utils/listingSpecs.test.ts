import test from 'node:test';
import assert from 'node:assert/strict';
import { findWheelBySlug, getAllBrandWheels, isSixnineWheel } from '../data/catalogue';
import { sizeLine } from '../data/sixnineSeries';
import { listingDiameters, listingFitment, sixnineSizesForListing } from './listingSpecs';

test('a listing\'s diameters, offsets and bolt pattern are read from its own record', () => {
  assert.deepEqual(listingDiameters('20 inch / 21 inch'), [20, 21]);
  assert.deepEqual(listingFitment('PCD 5×112 · ET15/20 · CB66.6'), { offsets: [15, 20], pcd: '5x112' });
  // A sheet it cannot read names what is missing rather than throwing.
  assert.deepEqual(listingFitment(undefined), { offsets: [], problem: 'no spec sheet' });
  assert.equal(listingFitment('CB66.6').problem, 'no bolt pattern');
  assert.equal(listingFitment('PCD 5×112 · CB66.6').problem, 'no offset');
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

// listingFitment and listingDiameters return empty values for text they cannot read, and the page then
// hides the figures (AGENTS.md rule 2). So a mistyped spec sheet fails here instead of silently
// dropping a wheel's technical data.
test('every Sixnine listing in stock has a readable spec sheet and a Sixnine size per diameter', () => {
  for (const wheel of getAllBrandWheels().filter(isSixnineWheel)) {
    const { offsets, pcd, problem } = listingFitment(wheel.technicalSpecSheet);
    const diameters = listingDiameters(wheel.sizesAvailable);
    assert.equal(problem, undefined, `${wheel.slug}: ${problem} in "${wheel.technicalSpecSheet}"`);
    assert.ok(pcd, `${wheel.slug}: no bolt pattern in "${wheel.technicalSpecSheet}"`);
    assert.ok(offsets.length && offsets.every(Number.isFinite), `${wheel.slug}: no offset in "${wheel.technicalSpecSheet}"`);
    assert.ok(diameters.length, `${wheel.slug}: no diameter in "${wheel.sizesAvailable}"`);
    assert.equal(sixnineSizesForListing(wheel).length, diameters.length, `${wheel.slug}: a diameter matches no single Sixnine size`);
  }
});

test('an unreadable spec sheet on a Sixnine listing hides the table and says why', (t) => {
  const warn = t.mock.method(console, 'warn', () => {});
  assert.deepEqual(sixnineSizesForListing({ slug: 'ff-1-test', modelCode: 'FF-1', sizesAvailable: '20 inch', technicalSpecSheet: 'CB66.6' }), []);
  assert.equal(warn.mock.callCount(), 1);
  assert.match(String(warn.mock.calls[0].arguments[0]), /ff-1-test: no bolt pattern/);
});
