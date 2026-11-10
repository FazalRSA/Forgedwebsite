import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import customWheels from './customWheels.json';
import * as catalogue from './catalogue';
import {
  BMW_M_MODEL_OPTIONS,
  BRAND_WHEELS,
  MARQUE_FILTERS,
  filterWheelsByMarque,
  findWheelBySlug,
  formatZAR,
  getAllBrandWheels,
  getSiblingListings,
  getWheelBySlug,
  getWheelImages,
  isInStock,
  type BrandWheelItem,
} from './catalogue';
import { createWheelEntry } from '../utils/wheelBuilder';

/** The 14 stock-sheet rows: design, finish name, sets in stock, price in Rand per set of four. */
const STOCK_SHEET: Array<[string, string, number, number]> = [
  ['FF-1', 'Silver', 1, 80000],
  ['FF-1', 'Liquid Metal', 2, 95000],
  ['FF-3', 'Pure Bronze', 1, 80000],
  ['FF-3', 'Glossy Black', 1, 80000],
  ['FF-3', 'Liquid Metal', 2, 95000],
  ['FSA001', 'Black Matte', 1, 90000],
  ['FSA002', 'Gold', 1, 75000],
  ['FSA002', 'Hyper Black', 1, 75000],
  ['FSA002', 'Polished Face', 1, 85000],
  ['FSA003', 'Silver', 1, 75000],
  ['FSA003', 'Hyper Black', 1, 75000],
  ['FSA004', 'Silver', 1, 70000],
  ['FSA004', 'Hyper Black', 1, 70000],
  ['FSA004', 'Gloss Black', 1, 70000],
];

const soldOut = (slug: string): BrandWheelItem => ({
  ...BRAND_WHEELS[0],
  id: `wheel-${slug}`,
  slug,
  stockStatus: 'Out of stock',
  stockQuantitySets: 0,
});

test('MARQUE_FILTERS only offers BMW, and every listing is for BMW', () => {
  assert.deepEqual(MARQUE_FILTERS, ['ALL', 'BMW']);
  const all = filterWheelsByMarque('ALL');
  assert.equal(all.length, getAllBrandWheels().length);
  assert.ok(filterWheelsByMarque('BMW').every((w) => w.marques.includes('BMW')));
});

test('the catalogue exports nothing from the removed store, fitment finder or collections', () => {
  const removed = [
    'STORE_PRODUCTS',
    'VEHICLE_FITMENT_TREE',
    'getAllStoreProducts',
    'getStoreProductBySlug',
    'getStoreProductImages',
    'getAvailableMakes',
    'getModelsForMake',
    'getFitmentNode',
    'getMatchingProductsForFitment',
    'resolveCollectionBySlug',
    'filterAndSortStoreProducts',
  ];
  for (const name of removed) assert.equal(name in catalogue, false, `${name} should not exist`);

  assert.equal('STORE_PRODUCTS' in catalogue, false);
  assert.equal('storeProducts' in customWheels, false, 'customWheels.json has no store products');
  for (const wheel of getAllBrandWheels()) {
    assert.equal('compatibleStoreProductSlug' in wheel, false, wheel.slug);
  }
});

test('every wheel the site can show is in stock with at least one set', () => {
  const all = getAllBrandWheels();
  assert.ok(all.length > 0);
  for (const wheel of all) {
    assert.equal(wheel.stockStatus, 'In Stock', wheel.slug);
    assert.ok((wheel.stockQuantitySets ?? 0) > 0, `${wheel.slug} has no sets`);
    assert.equal(isInStock(wheel), true, wheel.slug);
  }
});

test('there are exactly 14 listings across 6 designs, matching the stock sheet', () => {
  const all = getAllBrandWheels();
  assert.equal(all.length, 14);
  assert.equal(new Set(all.map((w) => w.slug)).size, 14, 'slugs are unique');
  assert.deepEqual(
    [...new Set(all.map((w) => w.modelCode))].sort(),
    ['FF-1', 'FF-3', 'FSA001', 'FSA002', 'FSA003', 'FSA004']
  );
  assert.ok(!all.some((w) => /15[- ]?spoke/i.test(`${w.model} ${w.slug}`)), 'there is no 15-spoke in stock');

  const key = (row: Array<string | number | undefined>) => row.join('|');
  const actual = all
    .map((w) => key([w.modelCode, w.finishName, w.stockQuantitySets, w.priceZAR]))
    .sort();
  const expected = STOCK_SHEET.map(key).sort();
  assert.deepEqual(actual, expected);
});

test('each listing is one design in one finish: availableFinishes holds only its own', () => {
  for (const wheel of getAllBrandWheels()) {
    assert.ok(wheel.availableFinishes.length <= 1, `${wheel.slug} lists several finishes`);
    assert.deepEqual(wheel.availableFinishes, [wheel.defaultFinish], wheel.slug);
  }
});

test('sold-out and zero-set listings are hidden everywhere, never greyed out', () => {
  const gone = soldOut('type-99-sold');
  const sheetSold: BrandWheelItem = { ...gone, slug: 'sold-status', stockStatus: 'Sold', stockQuantitySets: 3 };
  const noSets: BrandWheelItem = { ...gone, slug: 'no-sets', stockStatus: 'In Stock', stockQuantitySets: 0 };
  const unknownStock: BrandWheelItem = { ...gone, slug: 'no-stock-fields', stockStatus: undefined, stockQuantitySets: undefined };
  const live: BrandWheelItem = { ...gone, slug: 'type-98-live', stockStatus: 'In Stock', stockQuantitySets: 1 };

  const slugs = getAllBrandWheels([gone, sheetSold, noSets, unknownStock, live]).map((w) => w.slug);
  assert.ok(slugs.includes('type-98-live'));
  for (const hidden of ['type-99-sold', 'sold-status', 'no-sets', 'no-stock-fields']) {
    assert.ok(!slugs.includes(hidden), hidden);
    assert.equal(findWheelBySlug(hidden, [gone, sheetSold, noSets, unknownStock]), undefined, hidden);
  }

  // A sold-out override of a stock-sheet slug takes that listing off the site.
  const override = { ...BRAND_WHEELS[0], stockStatus: 'Out of stock', stockQuantitySets: 0 };
  assert.ok(!getAllBrandWheels([override]).some((w) => w.slug === BRAND_WHEELS[0].slug));
});

test('getSiblingListings returns the other in-stock finishes of the same design', () => {
  const gold = findWheelBySlug('fsa002-gold')!;
  assert.deepEqual(
    getSiblingListings(gold).map((w) => w.slug).sort(),
    ['fsa002-hyper-black', 'fsa002-polished-face']
  );

  const ff3 = findWheelBySlug('ff-3-pure-bronze')!;
  assert.deepEqual(
    getSiblingListings(ff3).map((w) => w.slug).sort(),
    ['ff-3-glossy-black', 'ff-3-liquid-metal']
  );

  assert.deepEqual(getSiblingListings(findWheelBySlug('fsa001-black-matte')!), [], 'FSA001 has a single finish');

  for (const wheel of getAllBrandWheels()) {
    const siblings = getSiblingListings(wheel);
    assert.ok(siblings.every((s) => s.modelCode === wheel.modelCode && s.slug !== wheel.slug && isInStock(s)), wheel.slug);
    const sameDesign = getAllBrandWheels().filter((w) => w.modelCode === wheel.modelCode);
    assert.equal(siblings.length, sameDesign.length - 1, wheel.slug);
  }

  // A sold-out sibling is not offered, and a wheel with no model code has no siblings.
  assert.ok(!getSiblingListings(gold, [soldOut('fsa002-sold')].map((w) => ({ ...w, modelCode: 'FSA002' }))).some((w) => w.slug === 'fsa002-sold'));
  assert.deepEqual(getSiblingListings({ ...gold, modelCode: undefined }), []);
});

test('findWheelBySlug has no silent fallback, getWheelBySlug does, and both only see in-stock wheels', () => {
  assert.equal(findWheelBySlug('does-not-exist'), undefined);
  assert.equal(findWheelBySlug('fsa002-gold')?.slug, 'fsa002-gold');
  assert.equal(findWheelBySlug('FSA002')?.modelCode, 'FSA002');
  assert.equal(getWheelBySlug('does-not-exist').slug, getWheelBySlug('').slug);
  assert.ok(isInStock(getWheelBySlug('does-not-exist')));
});

test('customWheels.json adds photography to stock-sheet listings, and every photo exists', () => {
  const slugs = new Set(BRAND_WHEELS.map((w) => w.slug));
  assert.ok(customWheels.brandWheels.length > 0);
  for (const entry of customWheels.brandWheels) {
    assert.ok(slugs.has(entry.slug), `${entry.slug} is not a stock-sheet listing`);
    assert.equal(entry.images.length, 3, entry.slug);
    for (const image of entry.images) assert.ok(existsSync(`public${image}`), `${image} is missing from public/`);

    // The sheet stays the source for names, sizes, prices and stock.
    const merged = getAllBrandWheels().find((w) => w.slug === entry.slug)!;
    const seed = BRAND_WHEELS.find((w) => w.slug === entry.slug)!;
    for (const key of ['model', 'finishName', 'priceZAR', 'stockQuantitySets', 'sizesAvailable'] as const) {
      assert.equal(merged[key], seed[key], `${entry.slug}.${key}`);
    }
    assert.deepEqual(getWheelImages(merged).images, entry.images);
  }
});

test('every listing fits a car from the stock sheet, and the sheet has 70 cars', () => {
  assert.equal(BMW_M_MODEL_OPTIONS.length, 70);
  assert.equal(new Set(BMW_M_MODEL_OPTIONS).size, 70);
  for (const wheel of getAllBrandWheels()) {
    assert.ok(BMW_M_MODEL_OPTIONS.includes(wheel.compatibleCars ?? ''), wheel.slug);
  }
});

test('formatZAR formats Rand with comma thousands and optional two decimals', () => {
  assert.equal(formatZAR(75000), 'R 75,000');
  assert.equal(formatZAR(75000, true), 'R 75,000.00');
  assert.equal(formatZAR(1234567.5, true), 'R 1,234,567.50');
  assert.equal(formatZAR(0), 'R 0');
  assert.equal(formatZAR(Number.NaN), 'R 0');
});

test('getWheelImages gives three pictures and captions, with a plain stand-in when there is no photo', () => {
  for (const wheel of getAllBrandWheels()) {
    const { images, labels } = getWheelImages(wheel);
    assert.equal(images.length, 3, wheel.slug);
    assert.equal(labels.length, 3, wheel.slug);
    assert.ok(images.every(Boolean), wheel.slug);
  }
  const bare = createWheelEntry({ name: 'TYPE 60', priceZAR: 1000 });
  const { images } = getWheelImages(bare);
  assert.ok(images.every((i) => i.startsWith('data:image/svg+xml')));
  assert.equal(getWheelImages({ ...bare, imageUrl: '/images/x.webp' }).images[0], '/images/x.webp');
});

test('nothing internal or QA-like reaches a visitor through the wheel data', () => {
  for (const wheel of getAllBrandWheels()) {
    const images = getWheelImages(wheel).images.map((i) =>
      i.startsWith('data:') ? decodeURIComponent(i.slice(i.indexOf(',') + 1)) : i
    );
    const text = JSON.stringify({ ...wheel, images: undefined, imageLabels: undefined }) + images.join(' ') + getWheelImages(wheel).labels.join(' ');
    assert.doesNotMatch(text, /placeholder/i, wheel.slug);
    assert.doesNotMatch(text, /Picture \d/i, wheel.slug);
    assert.doesNotMatch(text, /6061|aerospace|engineered specifically/i, `${wheel.slug}: a claim the stock sheet does not make`);
  }
});

test('createWheelEntry builds one in-stock listing, with sets that decide whether it is shown', () => {
  const entry = createWheelEntry({
    name: 'TYPE 60 BRONZE',
    series: 'FORGED',
    priceZAR: 5400,
    imageUrl: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=800',
    marques: ['BMW'],
    compatibleCars: 'M3 Sedan (G80)',
    sizesAvailable: '20 inch / 21 inch',
    technicalSpecSheet: 'PCD 5×112 · ET8/15 · CB66.6',
    defaultFinish: 'champagne-bronze',
    geometry: 'aero-disc-f1',
    stockQuantitySets: 2,
  });
  assert.equal(entry.slug, 'type-60-bronze');
  assert.equal(entry.priceZAR, 5400);
  assert.equal(entry.stockStatus, 'In Stock');
  assert.equal(entry.stockQuantitySets, 2);
  assert.deepEqual(entry.availableFinishes, ['champagne-bronze']);
  assert.equal('compatibleStoreProductSlug' in entry, false);
  assert.equal(entry.imageUrl, 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=800');

  assert.ok(filterWheelsByMarque('BMW', [entry]).some((w) => w.slug === 'type-60-bronze'));
  assert.equal(getAllBrandWheels([entry]).length, 15);

  // Zero sets keeps it off the site; default is one set; bad input is refused.
  const hidden = createWheelEntry({ name: 'TYPE 61', priceZAR: 1000, stockQuantitySets: 0 });
  assert.equal(hidden.stockStatus, 'Out of stock');
  assert.ok(!getAllBrandWheels([hidden]).some((w) => w.slug === 'type-61'));
  assert.equal(createWheelEntry({ name: 'TYPE 62', priceZAR: 1000 }).stockQuantitySets, 1);
  assert.throws(() => createWheelEntry({ name: 'TYPE 63', priceZAR: 1000, stockQuantitySets: -1 }), /zero or more/);
  assert.throws(() => createWheelEntry({ name: '  ', priceZAR: 1000 }), /name/i);
  assert.throws(() => createWheelEntry({ name: 'TYPE 64', priceZAR: 0 }), /price/i);
});

test('modelUrl flows through the wheel builder', () => {
  const withModel = createWheelEntry({ name: 'TYPE 99', priceZAR: 1000, modelUrl: '  /models/wheels/type-99.glb  ' });
  assert.equal(withModel.modelUrl, '/models/wheels/type-99.glb');
  assert.equal(createWheelEntry({ name: 'TYPE 98', priceZAR: 1000 }).modelUrl, undefined);
});

test('FSA001 carries front and rear 3D models that exist in /public; every listing opens in 3D with one model per design', () => {
  const fsa001 = BRAND_WHEELS.find((w) => w.slug === 'fsa001-black-matte');
  assert.ok(fsa001);
  assert.equal(fsa001.modelUrl, '/models/wheels/stf399-front.glb');
  assert.equal(fsa001.rearModelUrl, '/models/wheels/stf399-rear.glb');
  for (const url of [fsa001.modelUrl, fsa001.rearModelUrl]) {
    assert.ok(existsSync(`public${url}`), `${url} is missing from public/`);
  }

  const all = getAllBrandWheels();
  for (const wheel of all) {
    assert.ok(wheel.modelUrl, `${wheel.slug} has no 3D model`);
    assert.ok(existsSync(`public${wheel.modelUrl}`), `${wheel.slug}: ${wheel.modelUrl} missing`);
  }
  const byCode = new Map<string, Set<string>>();
  for (const wheel of all) {
    const code = wheel.modelCode ?? wheel.slug;
    byCode.set(code, (byCode.get(code) ?? new Set()).add(wheel.modelUrl!));
  }
  for (const [code, urls] of byCode) assert.equal(urls.size, 1, `${code} finishes disagree on the model`);
  assert.equal(all.find((w) => w.slug === 'fsa002-gold')?.modelUrl, '/models/wheels/fsa002.glb');
});
