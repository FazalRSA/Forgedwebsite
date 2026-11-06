import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BRAND_WHEELS,
  MARQUE_FILTERS,
  filterWheelsByMarque,
  getAvailableMakes,
  getModelsForMake,
  getMatchingProductsForFitment,
  resolveCollectionBySlug,
  filterAndSortStoreProducts,
  formatCurrencyPrice,
  getStoreProductBySlug,
} from './kahnData';

test('MARQUE_FILTERS and getAvailableMakes expose only BMW as the car brand option', () => {
  assert.deepEqual(MARQUE_FILTERS, ['ALL', 'BMW']);
  assert.deepEqual(getAvailableMakes(), ['BMW']);

  const allWheels = filterWheelsByMarque('ALL');
  assert.equal(allWheels.length, BRAND_WHEELS.length);
  assert.ok(allWheels.length >= 8);

  const bmwWheels = filterWheelsByMarque('BMW');
  assert.equal(bmwWheels.length, BRAND_WHEELS.length);
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

test('filterAndSortStoreProducts filters by diameter, sale flag, and price sorting', () => {
  const { products } = resolveCollectionBySlug('bmw-m3-2024-onwards-alloy-wheels');

  const staggeredOnly = filterAndSortStoreProducts(products, { diameter: '20-21"' });
  assert.ok(staggeredOnly.length >= 2);
  assert.ok(staggeredOnly.every((p) => p.diameterBadge === '20-21"'));

  const saleOnly = filterAndSortStoreProducts(products, { saleOnly: true });
  assert.equal(saleOnly.length, 1);
  assert.equal(saleOnly[0].slug, 'bmw-m3-le-mans-gt-forged');

  const sortedAsc = filterAndSortStoreProducts(products, { sortBy: 'price-asc' });
  assert.ok(sortedAsc[0].priceGBP <= sortedAsc[sortedAsc.length - 1].priceGBP);
});

test('formatCurrencyPrice formats GBP, USD, and EUR with optional decimals', () => {
  assert.equal(formatCurrencyPrice(4600, 'GBP', false), '£4,600');
  assert.equal(formatCurrencyPrice(4600, 'GBP', true), '£4,600.00');
  assert.ok(formatCurrencyPrice(4600, 'USD', false).startsWith('$'));
  assert.ok(formatCurrencyPrice(4600, 'EUR', false).startsWith('€'));
});

test('getStoreProductBySlug resolves technical PDPs and BRAND_WHEELS matches 14 in-stock sheet rows', () => {
  assert.equal(BRAND_WHEELS.length, 14);
  const type52 = getStoreProductBySlug('bmw-m3-type-52-forged');
  assert.equal(type52.technicalSpecs.partNo, 'WAKB9250B0F-2-KIT');
  assert.equal(type52.priceGBP, 90000);

  const rs30 = getStoreProductBySlug('bmw-m3-rs-3-0');
  assert.equal(rs30.shortModel, 'WHEEL PLACEHOLDER 03');
});

test('createWheelAndProductEntries builds custom wheel and store product with images, price, and fitment', async () => {
  const { createWheelAndProductEntries } = await import('../utils/wheelBuilder');
  const { brandWheel, storeProduct } = createWheelAndProductEntries({
    name: 'TYPE 60 CARBON',
    series: 'FORGED',
    priceGBP: 5400,
    originalPriceGBP: 6200,
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
  assert.equal(brandWheel.basePriceGBP, 5400);
  assert.equal(
    brandWheel.imageUrl,
    'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=800'
  );

  assert.equal(storeProduct.priceGBP, 5400);
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
    priceGBP: 1000,
    modelUrl: '  /models/wheels/type-99.glb  ',
  });
  assert.equal(withModel.brandWheel.modelUrl, '/models/wheels/type-99.glb');
  assert.equal(withModel.storeProduct.modelUrl, '/models/wheels/type-99.glb');

  const withoutModel = createWheelAndProductEntries({ name: 'TYPE 98', priceGBP: 1000 });
  assert.equal(withoutModel.brandWheel.modelUrl, undefined);
  assert.equal(withoutModel.storeProduct.modelUrl, undefined);
});
