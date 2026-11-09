import test from 'node:test';
import assert from 'node:assert/strict';
import customWheels from './customWheels.json';
import {
  BMW_M_MODEL_OPTIONS,
  BRAND_WHEELS,
  MARQUE_FILTERS,
  VEHICLE_FITMENT_TREE,
  filterWheelsByMarque,
  getAllBrandWheels,
  getAvailableMakes,
  getModelsForMake,
  getMatchingProductsForFitment,
  resolveCollectionBySlug,
  filterAndSortStoreProducts,
  formatZAR,
  getStoreProductBySlug,
  getStoreProductImages,
  STORE_PRODUCTS,
} from './kahnData';

test('MARQUE_FILTERS and getAvailableMakes expose only BMW as the car brand option', () => {
  assert.deepEqual(MARQUE_FILTERS, ['ALL', 'BMW']);
  assert.deepEqual(getAvailableMakes(), ['BMW']);

  // The catalogue is the 14 in-stock seeds plus any customWheels.json entries
  // that do not override a seed slug, so compare against the combined list.
  const allWheels = filterWheelsByMarque('ALL');
  assert.equal(allWheels.length, getAllBrandWheels().length);
  assert.ok(allWheels.length >= BRAND_WHEELS.length);

  const bmwWheels = filterWheelsByMarque('BMW');
  assert.equal(bmwWheels.length, getAllBrandWheels().length);
  assert.ok(bmwWheels.every((w) => w.marques.includes('BMW')));
});

test('Vehicle Fitment Engine cascading lookup returns 5 alloy wheels for BMW M3', () => {
  const bmwModels = getModelsForMake('BMW');
  assert.ok(bmwModels.includes('M3'));
  assert.ok(bmwModels.includes('M2'));
  assert.ok(bmwModels.includes('M4'));
  assert.ok(bmwModels.includes('M5'));

  const m3Products = getMatchingProductsForFitment('BMW', 'M3');
  assert.equal(m3Products.length, 5);
});

test('resolveCollectionBySlug handles BMW M3, M2, M4, and M5 collections', () => {
  const m3Canonical = resolveCollectionBySlug('bmw-m3-2024-onwards-alloy-wheels');
  assert.equal(m3Canonical.make, 'BMW');
  assert.equal(m3Canonical.node.model, 'M3');
  assert.equal(m3Canonical.products.length, 5);

  const m3Shorthand = resolveCollectionBySlug('bmw-m3-2024-alloy-wheels');
  assert.equal(m3Shorthand.node.model, 'M3');
  assert.equal(m3Shorthand.products.length, 5);

  const m2Collection = resolveCollectionBySlug('bmw-m2-2023-onwards-alloy-wheels');
  assert.equal(m2Collection.make, 'BMW');
  assert.equal(m2Collection.node.model, 'M2');
  assert.equal(m2Collection.products.length, 4);

  const m4Collection = resolveCollectionBySlug('bmw-m4-2024-onwards-alloy-wheels');
  assert.equal(m4Collection.make, 'BMW');
  assert.equal(m4Collection.node.model, 'M4');
  assert.equal(m4Collection.products.length, 5);

  const m5Collection = resolveCollectionBySlug('bmw-m5-2024-onwards-alloy-wheels');
  assert.equal(m5Collection.make, 'BMW');
  assert.equal(m5Collection.node.model, 'M5');
  assert.equal(m5Collection.products.length, 4);
});

test('every stock-sheet model option belongs to exactly one fitment node, and every seed wheel fits one', () => {
  const allNodes = Object.values(VEHICLE_FITMENT_TREE).flat();
  const allVariants = allNodes.flatMap((n) => n.variants);

  assert.equal(BMW_M_MODEL_OPTIONS.length, 70);
  assert.equal(allVariants.length, BMW_M_MODEL_OPTIONS.length);
  for (const option of BMW_M_MODEL_OPTIONS) {
    assert.equal(allVariants.filter((v) => v === option).length, 1, option);
  }
  for (const wheel of BRAND_WHEELS) {
    assert.ok(BMW_M_MODEL_OPTIONS.includes(wheel.compatibleCars ?? ''), wheel.slug);
  }

  const slugs = allNodes.map((n) => n.collectionSlug);
  assert.equal(new Set(slugs).size, slugs.length);
  assert.ok(allNodes.every((n) => n.years.length > 0));
  assert.equal(getModelsForMake('BMW').length, 26);
});

test('sheet model-line collection slugs resolve to their own node, never the M3/M2/M4/M5 shorthand', () => {
  assert.equal(resolveCollectionBySlug('bmw-m340-alloy-wheels').node.model, 'M340');
  assert.equal(resolveCollectionBySlug('bmw-m240-alloy-wheels').node.model, 'M240');
  assert.equal(resolveCollectionBySlug('bmw-m440-alloy-wheels').node.model, 'M440');
  assert.equal(resolveCollectionBySlug('bmw-m550-alloy-wheels').node.model, 'M550');
  assert.deepEqual(resolveCollectionBySlug('bmw-x5-m-alloy-wheels').products, []);
  assert.equal(resolveCollectionBySlug('bmw-m3-2024-alloy-wheels').node.model, 'M3');
  assert.equal(resolveCollectionBySlug('bmw-m5-2024-onwards-alloy-wheels').node.model, 'M5');
});

test('FSA001 store product carries the 19/20 inch badge from the stock sheet', () => {
  assert.equal(getStoreProductBySlug('bmw-m3-type-52-forged').diameterBadge, '19-20"');
});

test('customWheels.json overrides of stock-sheet wheels keep the sheet finish names', () => {
  for (const override of customWheels.brandWheels) {
    const seed = BRAND_WHEELS.find((w) => w.slug === override.slug);
    if (!seed) continue; // a brand-new wheel, not a photography override
    assert.equal(override.finishName, seed.finishName, override.slug);
    assert.equal(override.model, seed.model, override.slug);
  }
});

test('filterAndSortStoreProducts filters by diameter, sale flag, and price sorting', () => {
  const { products } = resolveCollectionBySlug('bmw-m3-2024-onwards-alloy-wheels');

  const staggeredOnly = filterAndSortStoreProducts(products, { diameter: '20-21"' });
  assert.ok(staggeredOnly.length >= 2);
  assert.ok(staggeredOnly.every((p) => p.diameterBadge === '20-21"'));

  const saleOnly = filterAndSortStoreProducts(products, { saleOnly: true });
  assert.equal(saleOnly.length, 1);
  assert.equal(saleOnly[0].slug, 'bmw-m3-le-mans-gt-forged');

  const sortedAsc = filterAndSortStoreProducts(products, { sortBy: 'price-asc' });
  assert.ok(sortedAsc[0].priceZAR <= sortedAsc[sortedAsc.length - 1].priceZAR);
});

test('formatZAR formats Rand with comma thousands and optional two decimals', () => {
  assert.equal(formatZAR(75000), 'R 75,000');
  assert.equal(formatZAR(75000, true), 'R 75,000.00');
  assert.equal(formatZAR(1234567.5, true), 'R 1,234,567.50');
  assert.equal(formatZAR(0), 'R 0');
  assert.equal(formatZAR(Number.NaN), 'R 0');
});

test('getStoreProductBySlug resolves technical PDPs and BRAND_WHEELS matches 14 in-stock sheet rows', () => {
  assert.equal(BRAND_WHEELS.length, 14);
  const type52 = getStoreProductBySlug('bmw-m3-type-52-forged');
  assert.equal(type52.technicalSpecs.partNo, 'WAKB9250B0F-2-KIT');
  assert.equal(type52.priceZAR, 90000);

  const rs30 = getStoreProductBySlug('bmw-m3-rs-3-0');
  assert.equal(rs30.shortModel, 'WHEEL PLACEHOLDER 03');
});

test('createWheelAndProductEntries builds custom wheel and store product with images, price, and fitment', async () => {
  const { createWheelAndProductEntries } = await import('../utils/wheelBuilder');
  const { brandWheel, storeProduct } = createWheelAndProductEntries({
    name: 'TYPE 60 CARBON',
    series: 'FORGED',
    priceZAR: 5400,
    originalPriceZAR: 6200,
    imageUrl: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=800',
    marques: ['BMW'],
    make: 'BMW',
    vehicleModel: 'M3',
    diameterBadge: '20-21"',
    defaultFinish: 'satin-black',
    geometry: 'aero-disc-f1',
    partNo: 'WAKB6000-KIT',
  });

  assert.equal(brandWheel.slug, 'type-60-carbon');
  assert.equal(brandWheel.priceZAR, 5400);
  assert.equal(
    brandWheel.imageUrl,
    'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=800'
  );

  assert.equal(storeProduct.priceZAR, 5400);
  assert.equal(storeProduct.isSale, true);
  assert.equal(storeProduct.technicalSpecs.partNo, 'WAKB6000-KIT');

  const mergedBmwWheels = filterWheelsByMarque('BMW', [brandWheel]);
  assert.ok(mergedBmwWheels.some((w) => w.slug === 'type-60-carbon'));

  const mergedM3Collection = resolveCollectionBySlug(
    'bmw-m3-2024-onwards-alloy-wheels',
    [storeProduct]
  );
  assert.equal(mergedM3Collection.products.length, 6);
  assert.equal(mergedM3Collection.products[0].slug, storeProduct.slug);
});

test('findWheelBySlug has no silent fallback and modelUrl flows through the wheel builder to both entries', async () => {
  const { findWheelBySlug, getWheelBySlug } = await import('./kahnData');
  const { createWheelAndProductEntries } = await import('../utils/wheelBuilder');

  assert.equal(findWheelBySlug('does-not-exist'), undefined);
  assert.equal(findWheelBySlug('fsa002-gold')?.slug, 'fsa002-gold');
  assert.equal(findWheelBySlug('FSA002')?.modelCode, 'FSA002');
  assert.equal(getWheelBySlug('does-not-exist').slug, getWheelBySlug('').slug);

  const withModel = createWheelAndProductEntries({
    name: 'TYPE 99',
    priceZAR: 1000,
    modelUrl: '  /models/wheels/type-99.glb  ',
  });
  assert.equal(withModel.brandWheel.modelUrl, '/models/wheels/type-99.glb');
  assert.equal(withModel.storeProduct.modelUrl, '/models/wheels/type-99.glb');

  const withoutModel = createWheelAndProductEntries({ name: 'TYPE 98', priceZAR: 1000 });
  assert.equal(withoutModel.brandWheel.modelUrl, undefined);
  assert.equal(withoutModel.storeProduct.modelUrl, undefined);
});

test('getStoreProductImages resolves every STORE_PRODUCTS wheelSlug to real photography when it exists', () => {
  assert.equal(STORE_PRODUCTS.length, 8);

  // Verified by reading src/data/customWheels.json: these wheelSlugs resolve to
  // BrandWheelItem entries (via getAllBrandWheels(), which merges customWheels.json
  // on top of the FSA seed catalogue) carrying a real `images` array under
  // /images/wheels/..., not a generated placeholder. fsa002-gold and fsa004-silver
  // are included here too — customWheels.json now overrides those two seed slugs
  // with real renders as well, in addition to the four FF-1/FF-3 products shot
  // this session.
  const wheelSlugsWithRealPhotography = [
    'fsa002-gold',
    'fsa004-silver',
    'ff-1-silver',
    'ff-1-liquid-metal',
    'ff-3-pure-bronze',
    'ff-3-liquid-metal',
  ];

  for (const wheelSlug of wheelSlugsWithRealPhotography) {
    const product = STORE_PRODUCTS.find((p) => p.wheelSlug === wheelSlug);
    assert.ok(product, `expected a STORE_PRODUCTS entry with wheelSlug "${wheelSlug}"`);

    const { images, labels } = getStoreProductImages(product!, []);
    assert.equal(images.length, 3);
    for (const image of images) {
      assert.ok(
        image.startsWith(`/images/wheels/${wheelSlug}/`),
        `expected a real render path for "${wheelSlug}", got "${image}"`
      );
      assert.ok(!image.startsWith('data:image/svg+xml'), `"${wheelSlug}" should not fall back to a placeholder`);
    }
    assert.equal(labels.length, 3);
  }
});

test('getStoreProductImages degrades to a placeholder, not undefined or a throw, for wheelSlugs with no real photography yet', () => {
  // fsa001-black-matte and fsa003-silver are seed-only FSA entries: no
  // customWheels.json override and no imageUrl/galleryImages of their own exist
  // for them. This is a known, out-of-scope content gap (not a wiring bug), so
  // getStoreProductImages must keep degrading gracefully to a generated
  // placeholder rather than throwing or returning undefined images.
  const wheelSlugsWithoutRealPhotographyYet = ['fsa001-black-matte', 'fsa003-silver'];

  for (const wheelSlug of wheelSlugsWithoutRealPhotographyYet) {
    const product = STORE_PRODUCTS.find((p) => p.wheelSlug === wheelSlug);
    assert.ok(product, `expected a STORE_PRODUCTS entry with wheelSlug "${wheelSlug}"`);

    const { images, labels } = getStoreProductImages(product!, []);
    assert.equal(images.length, 3);
    for (const image of images) {
      assert.ok(
        image.startsWith('data:image/svg+xml'),
        `expected "${wheelSlug}" to degrade to a placeholder data URL, got "${image.slice(0, 40)}..."`
      );
    }
    assert.equal(labels.length, 3);
  }
});

test('getStoreProductImages degrades to a placeholder rather than throwing when wheelSlug matches no BrandWheelItem at all', () => {
  const productWithUnknownWheel = { ...STORE_PRODUCTS[0], wheelSlug: 'does-not-exist-slug' };

  const { images, labels } = getStoreProductImages(productWithUnknownWheel, []);
  assert.equal(images.length, 3);
  assert.ok(images.every((image) => image.startsWith('data:image/svg+xml')));
  assert.equal(labels.length, 3);
});
