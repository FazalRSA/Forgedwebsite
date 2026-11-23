import test from 'node:test';
import assert from 'node:assert/strict';
import { findWheelBySlug, formatZAR, getAllBrandWheels, isSixnineWheel } from '../data/catalogue';
import { metaForPath } from './seo';
import { listingDetails, perDiameter, PICTURE_NOTE, sizesLine } from './listingDetails';
import { sixnineSizesForListing } from './listingSpecs';

const ff3 = () => listingDetails(findWheelBySlug('ff-3-pure-bronze')!)!;

test('the FF-THREE write-up is built from the listing and Sixnine\'s figures for its two sizes', () => {
  const details = ff3();
  assert.equal(details.headline, 'FF-THREE 10.5x20 ET15 and 11.5x21 ET17 · 5x112 – flow forged, up to 120 mm concave');
  assert.match(details.intro, /PureBronze/);
  assert.match(details.intro, /BMW M3 Competition Sedan \(G80\)/);
  assert.deepEqual(
    details.features.map((f) => f.heading),
    ['The design', 'Concave and weight', 'Fitment']
  );
  const text = details.features.map((f) => f.text).join(' ');
  for (const figure of ['105 mm on the 20″', '120 mm on the 21″', '11.8 kg', '13.2 kg', '5x112', '66.6 mm', 'ET15', 'ET17', '650 kg']) {
    assert.ok(text.includes(figure), `missing ${figure}`);
  }
  assert.equal(details.highlights.length, 5);
  assert.ok(details.highlights.at(-1)!.includes(formatZAR(80000)));
  assert.equal(details.pictureNote, PICTURE_NOTE);
});

test('a figure that differs by size is given per diameter; one that does not is given once', () => {
  const sizes = sixnineSizesForListing(findWheelBySlug('ff-1-silver')!);
  assert.equal(perDiameter(sizes, (s) => s.loadKg, 'kg'), '650 kg on the 20″ and 850 kg on the 21″');
  assert.equal(perDiameter(sizes, (s) => s.centreBoreMm, 'mm'), '66.6 mm');
  assert.equal(perDiameter(sizes, () => null, 'mm'), null);
});

test('edge cases: no sizes, one size, and a figure only some sizes give', () => {
  const sizes = sixnineSizesForListing(findWheelBySlug('ff-3-pure-bronze')!);
  assert.equal(perDiameter([], (s) => s.loadKg, 'kg'), null);
  assert.equal(sizesLine([], '5x112'), ' · 5x112');
  // One size: the figure is given once, and the size line has no "and".
  assert.equal(perDiameter(sizes.slice(0, 1), (s) => s.concavityMm, 'mm'), '105 mm');
  assert.equal(sizesLine(sizes.slice(0, 1), '5x112'), '10.5x20 ET15 · 5x112');
  assert.equal(sizesLine(sizes, undefined), '10.5x20 ET15 and 11.5x21 ET17');
  // A figure only the 21″ gives is named with its diameter, never spread over both.
  assert.equal(perDiameter(sizes, (s) => (s.diameter === 21 ? s.weightKg : null), 'kg'), '13.2 kg on the 21″');
  // Zero is a figure, not a missing one.
  assert.equal(perDiameter(sizes, () => 0, 'mm'), '0 mm');
});

// AGENTS.md rule 2: no invented facts. Every number in the write-up must be one the listing or its
// matched Sixnine sizes state, so a figure typed into the text by hand fails here.
test('every number in a Sixnine write-up comes from the listing or its matched sizes', () => {
  for (const wheel of getAllBrandWheels().filter(isSixnineWheel)) {
    const details = listingDetails(wheel);
    assert.ok(details, `${wheel.slug} has matched sizes, so it has a write-up`);
    const sizes = sixnineSizesForListing(wheel);
    const known = new Set<string>([
      ...sizes.flatMap((s) => [s.width, s.diameter, s.offset, s.loadKg, s.centreBoreMm, s.concavityMm, s.weightKg]).filter((v) => v !== null).map(String),
      ...(wheel.technicalSpecSheet ?? '').match(/\d+(?:\.\d+)?/g) ?? [],
      ...(wheel.compatibleCars ?? '').match(/\d+(?:\.\d+)?/g) ?? [],
      ...formatZAR(wheel.priceZAR).replace(/,/g, '').match(/\d+/g)!,
      String(wheel.stockQuantitySets ?? ''),
    ]);
    const designText = details!.features.find((f) => f.heading === 'The design')?.text ?? '';
    const written = [details!.headline, details!.intro, ...details!.features.filter((f) => f.heading !== 'The design').map((f) => f.text), ...details!.highlights]
      .join(' ')
      .replace(/,(?=\d{3})/g, '');
    for (const number of written.match(/\d+(?:\.\d+)?/g) ?? []) {
      assert.ok(known.has(number), `${wheel.slug}: "${number}" is not in the listing's data`);
    }
    assert.ok(designText.length > 0);
  }
});

test('a Forged SA listing has no Sixnine write-up', () => {
  const fsa = getAllBrandWheels().find((w) => !isSixnineWheel(w))!;
  assert.equal(listingDetails(fsa), null);
});

test('a Sixnine wheel page is titled with the brand, sizes and bolt pattern', () => {
  const m = metaForPath('/wheels/ff-3-pure-bronze');
  assert.equal(m.title, 'Sixnine FF-THREE — PureBronze 20/21 inch 5x112 wheels');
  assert.match(m.description, /^Sixnine FF-THREE — PureBronze, 10\.5Jx20 ET15 and 11\.5Jx21 ET17, PCD 5x112: flow forged, up to 120 mm concave\./);
  assert.match(m.description, /R 80,000 per set of four\. In stock: 1 set\./);
});
