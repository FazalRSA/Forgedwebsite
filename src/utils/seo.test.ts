import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {
  DEFAULT_SHARE_IMAGE,
  SITE_NAME,
  SITE_ORIGIN,
  absoluteUrl,
  absolutiseJsonLd,
  isHomePath,
  renderPageHtml,
  buildSitemapXml,
  homeJsonLd,
  metaForPath,
  sitemapPaths,
  withRenderPageRoutes,
  wheelBrand,
} from './seo';
import { findWheelBySlug, getAllBrandWheels, isInStock } from '../data/catalogue';
import { SITE } from '../config/site';

const PUBLIC_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'public');

const WHEELS = getAllBrandWheels();

/** Addresses that were pages before the site was cut down to home, wheel, installs, the Sixnine dealer page and contact. */
const REMOVED_ROUTES = [
  '/store',
  '/store/collections/bmw-m3-2024-onwards-alloy-wheels',
  '/store/products/bmw-m3-type-52-forged',
  '/store/client-fitments',
  '/client-fitments',
  '/official-dealer-sixnine-wheels',
  '/dealer-application',
  '/store/dealer-application',
  '/account',
  '/garage',
];

test('home page metadata matches what people search for and stays indexable', () => {
  const m = metaForPath('/');
  assert.match(m.title, /forged wheels for BMW M cars/i);
  assert.match(m.title, /in stock/i);
  assert.ok(m.title.includes(SITE_NAME));
  assert.match(m.description, /South Africa/);
  assert.equal(m.canonicalPath, '/');
  assert.equal(m.noindex, false);
  assert.ok(m.description.length >= 50 && m.description.length <= 170);
  // The page-shell fallbacks in index.html say the same as the home page.
  const shell = readFileSync(path.join(PUBLIC_DIR, '..', 'index.html'), 'utf8');
  assert.ok(shell.includes(`<title>${m.title}</title>`), 'index.html title matches the home page');
  assert.ok(shell.includes(`content="${m.description}"`), 'index.html description matches the home page');
});

test('installs, contact and the Sixnine dealer page are indexable pages with their own title and canonical URL', () => {
  for (const p of ['/installs', '/contact', '/sixnine-wheels', '/privacy-policy']) {
    for (const variant of [p, `${p}/`, `${p}?x=1#top`]) {
      const m = metaForPath(variant);
      assert.equal(m.canonicalPath, p, variant);
      assert.equal(m.noindex, false, variant);
      assert.equal(m.jsonLd, undefined, variant);
    }
  }
  assert.notEqual(metaForPath('/installs').title, metaForPath('/contact').title);
  assert.notEqual(metaForPath('/sixnine-wheels').title, metaForPath('/contact').title);
});

test('every catalogue wheel gets a unique title, a Rand price and Product structured data', () => {
  const titles = new Set<string>();
  for (const wheel of WHEELS) {
    const m = metaForPath(`/wheels/${wheel.slug}`);
    assert.equal(m.canonicalPath, `/wheels/${wheel.slug}`);
    assert.equal(m.noindex, false);
    assert.ok(m.title.includes(wheel.model));
    assert.match(m.description, /R\s?[\d,. ]+/);
    const ld = m.jsonLd as { '@type': string; offers: { price: number; priceCurrency: string; availability: string } };
    assert.equal(ld['@type'], 'Product');
    assert.equal(ld.offers.price, wheel.priceZAR);
    assert.equal(ld.offers.priceCurrency, 'ZAR');
    assert.equal(ld.offers.availability, 'https://schema.org/InStock');
    assert.match(m.description, /in stock/i);
    titles.add(m.title);
  }
  assert.equal(titles.size, WHEELS.length);
});

test('an unknown wheel slug is kept out of search results', () => {
  assert.equal(metaForPath('/wheels/not-a-real-wheel').noindex, true);
  assert.equal(metaForPath('/wheels/not-a-real-wheel').jsonLd, undefined);
});

test('removed routes are no longer pages: they are noindex "not found" and never a store or dealer page', () => {
  for (const p of REMOVED_ROUTES) {
    const m = metaForPath(p);
    assert.equal(m.noindex, true, p);
    assert.ok(m.title.startsWith('Page not found'), `${p}: ${m.title}`);
    assert.equal(m.jsonLd, undefined, p);
    assert.doesNotMatch(`${m.title} ${m.description}`, /store|dealer|sixnine|garage|account/i, p);
  }
});

test('private and preview pages are noindex and carry no structured data', () => {
  for (const p of ['/admin', '/admin/wheels', '/studio/stf399']) {
    const m = metaForPath(p);
    assert.equal(m.noindex, true, p);
    assert.equal(m.jsonLd, undefined, p);
  }
});

test('titles fit in a search result and no two indexable pages share one', () => {
  const paths = ['/', '/installs', '/contact', '/privacy-policy', ...WHEELS.map((w) => `/wheels/${w.slug}`)];
  const titles = new Set<string>();
  for (const p of paths) {
    const m = metaForPath(p);
    assert.ok(m.title.length <= 60, `${p}: "${m.title}" is ${m.title.length} characters`);
    assert.ok(m.description.length >= 50 && m.description.length <= 170, `${p}: description length ${m.description.length}`);
    titles.add(m.title);
  }
  assert.equal(titles.size, paths.length);
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
  for (const wheel of WHEELS) {
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
  assert.equal(absoluteUrl('/installs'), `${SITE_ORIGIN}/installs`);
  assert.equal(absoluteUrl('https://example.com/x'), 'https://example.com/x');

  const home = absolutiseJsonLd(homeJsonLd()) as { '@graph': Array<{ '@id': string; url: string; publisher?: { '@id': string } }> };
  assert.equal(home['@graph'][0]['@id'], `${SITE_ORIGIN}/#organization`);
  assert.equal(home['@graph'][1].url, `${SITE_ORIGIN}/`);
  assert.equal(home['@graph'][1].publisher?.['@id'], `${SITE_ORIGIN}/#organization`);

  const wheel = WHEELS[0];
  const product = absolutiseJsonLd(metaForPath(`/wheels/${wheel.slug}`).jsonLd!, 'https://example.test') as {
    url: string;
    offers: { url: string };
  };
  assert.equal(product.url, `https://example.test/wheels/${wheel.slug}`);
  assert.equal(product.offers.url, `https://example.test/wheels/${wheel.slug}`);
});

test('link-preview images are real files in public/', () => {
  assert.ok(existsSync(path.join(PUBLIC_DIR, DEFAULT_SHARE_IMAGE)), DEFAULT_SHARE_IMAGE);
  for (const wheel of WHEELS) {
    const image = metaForPath(`/wheels/${wheel.slug}`).image;
    if (image) assert.ok(existsSync(path.join(PUBLIC_DIR, image)), image);
  }
});

test('the sitemap lists the home page, every in-stock wheel once, installs, the Sixnine dealer page, contact and the privacy policy, and nothing else', () => {
  const paths = sitemapPaths();
  assert.equal(new Set(paths).size, paths.length);
  assert.deepEqual(
    [...paths].sort(),
    ['/', '/contact', '/installs', '/privacy-policy', '/sixnine-wheels', ...WHEELS.map((w) => `/wheels/${w.slug}`)].sort()
  );
  assert.equal(paths.length, 5 + 14);
  for (const p of paths.filter((x) => x.startsWith('/wheels/'))) {
    const wheel = findWheelBySlug(p.slice('/wheels/'.length));
    assert.ok(wheel && isInStock(wheel), `${p} must be an in-stock wheel`);
  }
  for (const p of paths) {
    const m = metaForPath(p);
    assert.equal(m.noindex, false, p);
    assert.equal(m.canonicalPath, p);
  }

  // No removed route, store page, dealer page, account page or unlisted page is listed.
  const banned = /^\/(store|official-dealer|dealer-application|account|garage|client-fitments|admin|studio)/;
  assert.ok(!paths.some((p) => banned.test(p)));
  const xml = buildSitemapXml('https://example.test');
  assert.equal((xml.match(/<loc>/g) ?? []).length, paths.length);
  assert.ok(xml.includes('<loc>https://example.test/</loc>'));
  assert.ok(xml.includes('<loc>https://example.test/installs</loc>'));
  assert.ok(xml.includes('<loc>https://example.test/contact</loc>'));
  assert.ok(xml.includes('<loc>https://example.test/sixnine-wheels</loc>'));
  for (const removed of REMOVED_ROUTES) assert.ok(!xml.includes(`example.test${removed}<`), removed);
  const onDisk = readFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), 'utf8');
  assert.equal(onDisk, buildSitemapXml(), 'run `npm run build` to regenerate public/sitemap.xml');
});

test('an address that is not a page is a noindex "not found", while home paths stay the home page', () => {
  for (const home of ['', '/', '/index.html']) {
    assert.equal(isHomePath(home), true);
    assert.equal(metaForPath(home).noindex, false);
  }
  const missing = metaForPath('/no-such-page');
  assert.equal(isHomePath('/no-such-page'), false);
  assert.equal(missing.noindex, true);
  assert.ok(missing.title.startsWith('Page not found'));
  assert.ok(!sitemapPaths().includes('/no-such-page'));
});

test('renderPageHtml bakes a page\'s own title, description, canonical, image and structured data into the shell', () => {
  const shell = readFileSync(path.join(PUBLIC_DIR, '..', 'index.html'), 'utf8');
  const wheel = WHEELS.find((w) => w.slug === 'fsa002-gold')!;
  const meta = metaForPath(`/wheels/${wheel.slug}`);
  const html = renderPageHtml(shell, meta, 'https://example.test');

  assert.ok(html.includes(`<title>${meta.title.replace(/&/g, '&amp;')}</title>`));
  assert.equal((html.match(/<title>/g) ?? []).length, 1);
  assert.ok(html.includes('<link rel="canonical" href="https://example.test/wheels/fsa002-gold" />'));
  assert.ok(html.includes('<meta property="og:url" content="https://example.test/wheels/fsa002-gold" />'));
  assert.ok(html.includes(`<meta property="og:image" content="https://example.test${meta.image}" />`));
  assert.ok(html.includes('"@type":"Product"'));
  assert.ok(!html.includes('noindex'));
  assert.ok(html.includes('<div id="root"></div>'), 'the app shell body is untouched');

  // Hostile text in a title cannot break out of the tag.
  const hostile = renderPageHtml(shell, { ...meta, title: 'A "quoted" <b>title</b> & more', jsonLd: { name: '</script><script>x' } });
  assert.ok(hostile.includes('<title>A &quot;quoted&quot; &lt;b&gt;title&lt;/b&gt; &amp; more</title>'));
  assert.ok(!hostile.includes('</script><script>x'));

  const hiddenPage = renderPageHtml(shell, metaForPath('/no-such-page'));
  assert.ok(hiddenPage.includes('<meta name="robots" content="noindex, nofollow" />'));
});

test('render.yaml has a rewrite rule to the prerendered file for every sitemap page, and is up to date', () => {
  const renderYaml = readFileSync(path.join(PUBLIC_DIR, '..', 'render.yaml'), 'utf8');
  assert.equal(withRenderPageRoutes(renderYaml), renderYaml, 'run `npm run build` to regenerate render.yaml');
  for (const p of sitemapPaths()) {
    if (isHomePath(p)) continue;
    assert.ok(renderYaml.includes(`source: ${p}\n`), p);
    assert.ok(renderYaml.includes(`destination: ${p}.html\n`), p);
  }
  // Nothing is served for a removed page; the app redirects those addresses itself.
  for (const removed of REMOVED_ROUTES) assert.ok(!renderYaml.includes(`source: ${removed}\n`), removed);
  // The catch-all for the single-page app must stay after the per-page rules.
  assert.ok(renderYaml.indexOf('source: /*') > renderYaml.indexOf('# END generated page routes'));
  assert.throws(() => withRenderPageRoutes('services: []'), /markers/);
});
