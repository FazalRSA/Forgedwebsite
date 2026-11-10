import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {
  DEFAULT_SHARE_IMAGE,
  SITE_NAME,
  SITE_ORIGIN,
  absoluteUrl,
  absolutiseJsonLd,
  homeJsonLd,
  metaForPath,
  wheelBrand,
} from './seo';
import { BRAND_WHEELS, STORE_PRODUCTS, VEHICLE_FITMENT_TREE, getAllStoreProducts } from '../data/catalogue';
import { SITE } from '../config/site';

const PUBLIC_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'public');

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

test('titles fit in a search result and no two indexable pages share one', () => {
  const paths = [
    '/',
    '/store',
    '/client-fitments',
    '/sixnine-wheels',
    '/dealer-application',
    '/privacy-policy',
    ...BRAND_WHEELS.map((w) => `/wheels/${w.slug}`),
    ...getAllStoreProducts().map((p) => `/store/products/${p.slug}`),
  ];
  const titles = new Set<string>();
  for (const p of paths) {
    const m = metaForPath(p);
    assert.ok(m.title.length <= 60, `${p}: "${m.title}" is ${m.title.length} characters`);
    assert.ok(m.description.length >= 50 && m.description.length <= 170, `${p}: description length`);
    titles.add(m.title);
  }
  assert.equal(titles.size, paths.length);
});

test('a car collection is indexable under its own slug only', () => {
  const node = Object.values(VEHICLE_FITMENT_TREE)[0][0];
  const known = metaForPath(`/store/collections/${node.collectionSlug}`);
  assert.equal(known.noindex, false);
  assert.equal(known.canonicalPath, `/store/collections/${node.collectionSlug}`);
  assert.equal(metaForPath('/store/collections/not-a-real-collection').noindex, true);
});

test('pages kept out of search results carry no structured data', () => {
  for (const p of ['/wheels/not-a-real-wheel', '/store/collections/not-a-real-collection', '/admin']) {
    assert.equal(metaForPath(p).jsonLd, undefined, p);
  }
});

test('home page structured data describes the organisation and website from site config only', () => {
  const ld = metaForPath('/').jsonLd as { '@graph': Array<Record<string, unknown>> };
  assert.deepEqual(ld, homeJsonLd());
  const [org, site] = ld['@graph'];
  assert.equal(org['@type'], 'Organization');
  assert.equal(org.name, SITE.name);
  assert.equal(site['@type'], 'WebSite');
  // Nothing the repo does not know: no address, phone, reviews or ratings.
  for (const key of ['address', 'telephone', 'aggregateRating', 'review', 'logo']) {
    assert.equal(key in org, false, key);
  }
  // Social profiles appear only once they are configured.
  assert.equal('sameAs' in org, Boolean(SITE.instagramUrl || SITE.facebookUrl));
  // No empty values anywhere.
  assert.doesNotMatch(JSON.stringify(ld), /:""|:null|\[\]/);
});

test('Sixnine wheels name their brand; other wheels do not guess one', () => {
  for (const wheel of BRAND_WHEELS) {
    const ld = metaForPath(`/wheels/${wheel.slug}`).jsonLd as { brand?: { '@type': string; name: string } };
    if (wheel.modelCode === 'FF-1' || wheel.modelCode === 'FF-3') {
      assert.equal(wheelBrand(wheel), 'Sixnine');
      assert.deepEqual(ld.brand, { '@type': 'Brand', name: 'Sixnine' });
    } else {
      assert.equal(wheelBrand(wheel), undefined);
      assert.equal('brand' in ld, false, wheel.slug);
    }
    assert.equal('aggregateRating' in ld, false);
    assert.equal('review' in ld, false);
  }
});

test('structured data and canonical URLs are absolute on the production domain', () => {
  assert.equal(SITE_ORIGIN, `https://${SITE.domain}`);
  assert.equal(absoluteUrl('/store'), `${SITE_ORIGIN}/store`);
  assert.equal(absoluteUrl('https://example.com/x'), 'https://example.com/x');

  const home = absolutiseJsonLd(homeJsonLd()) as { '@graph': Array<{ '@id': string; url: string; publisher?: { '@id': string } }> };
  assert.equal(home['@graph'][0]['@id'], `${SITE_ORIGIN}/#organization`);
  assert.equal(home['@graph'][1].url, `${SITE_ORIGIN}/`);
  assert.equal(home['@graph'][1].publisher?.['@id'], `${SITE_ORIGIN}/#organization`);

  const wheel = BRAND_WHEELS[0];
  const product = absolutiseJsonLd(metaForPath(`/wheels/${wheel.slug}`).jsonLd!, 'https://example.test') as {
    url: string;
    offers: { url: string };
  };
  assert.equal(product.url, `https://example.test/wheels/${wheel.slug}`);
  assert.equal(product.offers.url, `https://example.test/wheels/${wheel.slug}`);
});

test('link-preview images are real files in public/', () => {
  assert.ok(existsSync(path.join(PUBLIC_DIR, DEFAULT_SHARE_IMAGE)), DEFAULT_SHARE_IMAGE);
  for (const wheel of BRAND_WHEELS) {
    const image = metaForPath(`/wheels/${wheel.slug}`).image;
    if (image) assert.ok(existsSync(path.join(PUBLIC_DIR, image)), image);
  }
});
