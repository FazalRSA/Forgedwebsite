import test from 'node:test';
import assert from 'node:assert/strict';
import { SITE_NAME, metaForPath } from './seo';
import { BRAND_WHEELS, STORE_PRODUCTS } from '../data/kahnData';

test('home page metadata names the business and stays indexable', () => {
  const m = metaForPath('/');
  assert.ok(m.title.startsWith(SITE_NAME));
  assert.equal(m.canonicalPath, '/');
  assert.equal(m.noindex, false);
  assert.ok(m.description.length >= 50 && m.description.length <= 170);
});

test('every catalogue wheel gets a unique title, a Rand price and Product structured data', () => {
  const titles = new Set<string>();
  for (const wheel of BRAND_WHEELS) {
    const m = metaForPath(`/wheels/${wheel.slug}`);
    assert.equal(m.canonicalPath, `/wheels/${wheel.slug}`);
    assert.equal(m.noindex, false);
    assert.ok(m.title.includes(wheel.model));
    assert.match(m.description, /R\s?[\d,. ]+/);
    const ld = m.jsonLd as { '@type': string; offers: { price: number; priceCurrency: string; availability: string } };
    assert.equal(ld['@type'], 'Product');
    assert.equal(ld.offers.price, wheel.priceZAR);
    assert.equal(ld.offers.priceCurrency, 'ZAR');
    assert.match(ld.offers.availability, /^https:\/\/schema\.org\/(InStock|PreOrder)$/);
    titles.add(m.title);
  }
  assert.equal(titles.size, BRAND_WHEELS.length);
});

test('an unknown wheel or product slug is kept out of search results', () => {
  assert.equal(metaForPath('/wheels/not-a-real-wheel').noindex, true);
  assert.equal(metaForPath('/store/products/not-a-real-product').noindex, true);
});

test('store product pages use the product title and canonical slug', () => {
  const product = STORE_PRODUCTS[0];
  const m = metaForPath(`/store/products/${product.slug}/`);
  assert.ok(m.title.includes(product.title));
  assert.equal(m.canonicalPath, `/store/products/${product.slug}`);
  assert.equal(m.noindex, false);
});

test('private and preview pages are noindex; alias routes share one canonical path', () => {
  for (const p of ['/account', '/garage', '/admin', '/admin/wheels', '/studio/stf399']) {
    assert.equal(metaForPath(p).noindex, true, p);
  }
  assert.equal(metaForPath('/store/client-fitments').canonicalPath, '/client-fitments');
  assert.equal(metaForPath('/official-dealer-sixnine-wheels/').canonicalPath, '/sixnine-wheels');
  assert.equal(metaForPath('/client-fitments?x=1#top').canonicalPath, '/client-fitments');
});
