import {
  findWheelBySlug,
  formatZAR,
  getAllStoreProducts,
  getWheelImages,
  resolveCollectionBySlug,
  BRAND_WHEELS,
  VEHICLE_FITMENT_TREE,
  type BrandWheelItem,
} from '../data/catalogue';
import { SITE } from '../config/site';

/**
 * Per-page metadata for search engines and link previews.
 *
 * The site is a single-page app, so every route would otherwise share the one <title> and
 * description in index.html. `metaForPath` works out the right ones for a path from the
 * catalogue data, and `applyPageMeta` writes them into <head>.
 */

export const SITE_NAME = 'FORGED Custom Wheels';

/** Production origin from config/site.ts. Canonical URLs always point here, whichever host served the page. */
export const SITE_ORIGIN = `https://${SITE.domain}`;

/** Link-preview image for pages that have no picture of their own (a catalogue wheel photo). */
export const DEFAULT_SHARE_IMAGE = '/images/share/forged-wheels-share.jpg';

/** Longest title that search results show without cutting it off. */
const MAX_TITLE_LENGTH = 60;

/** Catalogue model codes made by Sixnine Wheels (the same ones the Sixnine dealer page lists). */
const SIXNINE_MODEL_CODES = new Set(['FF-1', 'FF-3']);

/**
 * The manufacturer of a wheel, when the catalogue says who it is. Only the Sixnine FF-1 and FF-3
 * are attributed to a maker in this repo; other wheels return undefined rather than a guess.
 */
export function wheelBrand(wheel: BrandWheelItem): string | undefined {
  return wheel.modelCode && SIXNINE_MODEL_CODES.has(wheel.modelCode) ? 'Sixnine' : undefined;
}

/** Organization and WebSite structured data for the home page, built only from config/site.ts. */
export function homeJsonLd(): Record<string, unknown> {
  const sameAs = [SITE.instagramUrl, SITE.facebookUrl].filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': '/#organization',
        name: SITE.name,
        url: '/',
        areaServed: { '@type': 'Country', name: SITE.country },
        ...(sameAs.length ? { sameAs } : {}),
      },
      {
        '@type': 'WebSite',
        '@id': '/#website',
        name: SITE.name,
        url: '/',
        inLanguage: 'en-ZA',
        publisher: { '@id': '/#organization' },
      },
    ],
  };
}

export interface PageMeta {
  title: string;
  description: string;
  /** Path of the canonical URL (no origin, no query string). */
  canonicalPath: string;
  /** True for pages that should stay out of search results. */
  noindex: boolean;
  /** Site-relative image for link previews. */
  image?: string;
  /** schema.org structured data; relative `url` and `image` values are made absolute when applied. */
  jsonLd?: Record<string, unknown>;
}

const HOME: PageMeta = {
  title: `${SITE_NAME} | Forged BMW M wheels in South Africa`,
  description:
    'Forged alloy wheel sets for BMW M cars, supplied in South Africa. Browse in-stock designs, see client fitments and request a fitment quote.',
  canonicalPath: '/',
  noindex: false,
  jsonLd: homeJsonLd(),
};

/** The home page's title and description for a path that must stay out of search results. */
function hidden(canonicalPath: string): PageMeta {
  return { title: HOME.title, description: HOME.description, canonicalPath, noindex: true };
}

function page(title: string, description: string, canonicalPath: string, noindex = false): PageMeta {
  // Drop the site name when it would push the title past what search results display.
  const withSite = `${title} | ${SITE_NAME}`;
  return { title: withSite.length <= MAX_TITLE_LENGTH ? withSite : title, description, canonicalPath, noindex };
}

function isInStock(wheel: BrandWheelItem): boolean {
  return /in stock/i.test(wheel.stockStatus ?? '') && (wheel.stockQuantitySets ?? 1) > 0;
}

function wheelMeta(wheel: BrandWheelItem): PageMeta {
  const path = `/wheels/${wheel.slug}`;
  const facts = [
    wheel.compatibleCars ? `for BMW ${wheel.compatibleCars}` : '',
    wheel.sizesAvailable ?? '',
    wheel.technicalSpecSheet ?? '',
  ].filter(Boolean);
  const description = [
    `${wheel.model} forged wheels${facts.length ? ` ${facts.join(', ')}` : ''}.`,
    `${formatZAR(wheel.priceZAR)} per set of four.`,
    wheel.stockStatus ? `${wheel.stockStatus}.` : '',
  ]
    .filter(Boolean)
    .join(' ');
  const image = getWheelImages(wheel).images[0];
  const brand = wheelBrand(wheel);
  return {
    title: `${wheel.model} forged wheels | ${SITE_NAME}`,
    description,
    canonicalPath: path,
    noindex: false,
    image: image.startsWith('/') ? image : undefined,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: `${wheel.model} forged wheel set`,
      description,
      ...(image.startsWith('/') ? { image } : {}),
      ...(brand ? { brand: { '@type': 'Brand', name: brand } } : {}),
      ...(wheel.modelCode ? { sku: wheel.modelCode } : {}),
      url: path,
      offers: {
        '@type': 'Offer',
        price: wheel.priceZAR,
        priceCurrency: 'ZAR',
        availability: isInStock(wheel) ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
        url: path,
      },
    },
  };
}

/** Metadata for a site path. Unknown wheel, product and preview pages are kept out of search results. */
export function metaForPath(rawPath: string): PageMeta {
  const path = (rawPath.split(/[?#]/)[0] || '/').replace(/\/+$/, '') || '/';

  if (path === '/') return HOME;

  if (path.startsWith('/wheels/')) {
    const slug = path.slice('/wheels/'.length).split('/')[0];
    const wheel = findWheelBySlug(slug);
    // An unknown slug still renders a wheel page; do not let it be indexed as a duplicate.
    return wheel ? wheelMeta(wheel) : hidden(path);
  }

  if (path.startsWith('/store/products/')) {
    const slug = path.slice('/store/products/'.length).split('/')[0].toLowerCase();
    const product = getAllStoreProducts().find((p) => p.slug.toLowerCase() === slug);
    if (!product) return hidden(path);
    return page(
      product.title,
      `${product.title}. ${product.technicalSpecs.frontWheelSize} front, ${product.technicalSpecs.rearWheelSize} rear, ${product.technicalSpecs.boltPattern}. ${formatZAR(product.priceZAR)} per set of four.`,
      `/store/products/${product.slug}`
    );
  }

  if (path.startsWith('/store/collections/')) {
    const slug = path.slice('/store/collections/'.length).split('/')[0];
    const { node, make } = resolveCollectionBySlug(slug);
    // An unknown slug falls back to another model's collection; do not let it be indexed as a duplicate.
    if (node.collectionSlug.toLowerCase() !== slug.toLowerCase()) return hidden(path);
    return page(
      `Forged wheels for ${make} ${node.model}`,
      `Forged wheel sets that fit the ${make} ${node.model}, with sizes, offsets and Rand prices per set of four.`,
      path
    );
  }

  switch (path) {
    case '/store':
      return page(
        'Find forged wheels for your BMW',
        'Choose your BMW model and year to see the forged wheel sets that fit it, with sizes, offsets and Rand prices.',
        path
      );
    case '/client-fitments':
    case '/store/client-fitments':
      return page(
        'Client fitments',
        'Client BMW M cars on forged wheel sets, shown as studio re-shoots of each customer’s own photo.',
        '/client-fitments'
      );
    case '/sixnine-wheels':
    case '/official-dealer-sixnine-wheels':
      return page(
        'Sixnine Wheels official dealer',
        `${SITE_NAME} is an official dealer of Sixnine forged wheels. See the FF-ONE and FF-THREE designs, finishes and prices.`,
        '/sixnine-wheels'
      );
    case '/dealer-application':
    case '/store/dealer-application':
      return page(
        'Dealer and trade application',
        `Apply to become a ${SITE_NAME} trade partner.`,
        '/dealer-application'
      );
    case '/privacy-policy':
      return page('Privacy policy', `How ${SITE_NAME} collects, uses and protects personal information.`, path);
    case '/account':
    case '/garage':
      return page('Your account and garage', 'Sign in to save your vehicle and preferred finish.', '/account', true);
    default:
      break;
  }

  if (path.startsWith('/admin') || path.startsWith('/studio/')) {
    return hidden(path);
  }
  if (isHomePath(path)) return HOME;
  // Anything else is not a page on this site.
  return {
    title: `Page not found | ${SITE_NAME}`,
    description: `That page does not exist on ${SITE_NAME}. Browse the forged wheel catalogue instead.`,
    canonicalPath: path,
    noindex: true,
  };
}

/** True for the paths that show the home page. */
export function isHomePath(path: string): boolean {
  return path === '' || path === '/' || path === '/index.html';
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Bake one page's metadata into the built HTML shell, for crawlers and link-preview bots
 * (WhatsApp, Facebook, Slack) that do not run JavaScript. The app still applies the same
 * metadata in the browser, so the two always agree.
 */
export function renderPageHtml(shell: string, meta: PageMeta, origin: string = SITE_ORIGIN): string {
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  const canonicalUrl = escapeHtml(absoluteUrl(meta.canonicalPath, origin));
  const shareImage = escapeHtml(absoluteUrl(meta.image ?? DEFAULT_SHARE_IMAGE, origin));
  const setContent = (html: string, attr: 'name' | 'property', key: string, content: string) =>
    html.replace(new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`), `$1${content}$2`);

  let html = shell.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
  html = setContent(html, 'name', 'description', description);
  html = setContent(html, 'property', 'og:title', title);
  html = setContent(html, 'property', 'og:description', description);
  html = setContent(html, 'property', 'og:image', shareImage);
  html = setContent(html, 'name', 'twitter:title', title);
  html = setContent(html, 'name', 'twitter:description', description);
  html = setContent(html, 'name', 'twitter:image', shareImage);

  const extra = [
    `<link rel="canonical" href="${canonicalUrl}" />`,
    `<meta property="og:url" content="${canonicalUrl}" />`,
    meta.noindex ? '<meta name="robots" content="noindex, nofollow" />' : '',
    meta.jsonLd
      ? `<script id="page-jsonld" type="application/ld+json">${JSON.stringify(
          absolutiseJsonLd(meta.jsonLd, origin)
        ).replace(/</g, '\\u003c')}</script>`
      : '',
  ]
    .filter(Boolean)
    .join('\n    ');
  return html.replace('</head>', `    ${extra}\n  </head>`);
}

/** Make a site-relative path absolute; leave full URLs alone. */
export function absoluteUrl(value: string, origin: string = SITE_ORIGIN): string {
  return value.startsWith('/') ? `${origin}${value}` : value;
}

/** Copy of structured data with every site-relative `url`, `image` and `@id` made absolute. */
export function absolutiseJsonLd(
  jsonLd: Record<string, unknown>,
  origin: string = SITE_ORIGIN
): Record<string, unknown> {
  return JSON.parse(
    JSON.stringify(jsonLd, (key, value) =>
      (key === 'url' || key === 'image' || key === '@id') && typeof value === 'string'
        ? absoluteUrl(value, origin)
        : value
    )
  );
}

function setMeta(attr: 'name' | 'property', key: string, content: string | null): void {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (content === null) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

/** Write a page's metadata into <head>. Safe to call on every route change. */
export function applyPageMeta(meta: PageMeta, origin: string = SITE_ORIGIN): void {
  const absolute = (value: string) => absoluteUrl(value, origin);
  const canonicalUrl = absolute(meta.canonicalPath);
  const shareImage = absolute(meta.image ?? DEFAULT_SHARE_IMAGE);

  document.title = meta.title;
  setMeta('name', 'description', meta.description);
  setMeta('name', 'robots', meta.noindex ? 'noindex, nofollow' : null);
  setMeta('property', 'og:title', meta.title);
  setMeta('property', 'og:description', meta.description);
  setMeta('property', 'og:url', canonicalUrl);
  setMeta('property', 'og:site_name', SITE_NAME);
  setMeta('property', 'og:image', shareImage);
  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', meta.title);
  setMeta('name', 'twitter:description', meta.description);
  setMeta('name', 'twitter:image', shareImage);

  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = canonicalUrl;

  const existing = document.getElementById('page-jsonld');
  if (!meta.jsonLd) {
    existing?.remove();
    return;
  }
  const absolutised = absolutiseJsonLd(meta.jsonLd, origin);
  const script = existing ?? document.createElement('script');
  script.id = 'page-jsonld';
  script.setAttribute('type', 'application/ld+json');
  script.textContent = JSON.stringify(absolutised);
  if (!existing) document.head.appendChild(script);
}

/** Every indexable page path: the fixed pages plus one per wheel, product and car collection. */
export function sitemapPaths(): string[] {
  const candidates = [
    '/',
    '/store',
    '/client-fitments',
    '/sixnine-wheels',
    '/dealer-application',
    '/privacy-policy',
    ...BRAND_WHEELS.map((w) => `/wheels/${w.slug}`),
    ...getAllStoreProducts().map((p) => `/store/products/${p.slug}`),
    ...Object.values(VEHICLE_FITMENT_TREE).flatMap((nodes) =>
      nodes.map((n) => `/store/collections/${n.collectionSlug}`)
    ),
  ];
  // Keep only pages that are their own canonical URL and are allowed in search results.
  const paths = candidates.filter((path) => {
    const meta = metaForPath(path);
    return !meta.noindex && meta.canonicalPath === path;
  });
  return [...new Set(paths)];
}

/** sitemap.xml for the production domain in config/site.ts. */
export function buildSitemapXml(origin: string = `https://${SITE.domain}`): string {
  const urls = sitemapPaths()
    .map((path) => `  <url><loc>${origin}${path === '/' ? '/' : path}</loc></url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

const PAGE_ROUTES_BEGIN = '# BEGIN generated page routes';
const PAGE_ROUTES_END = '# END generated page routes';

/**
 * Put one Render rewrite rule per sitemap page between the markers in render.yaml, pointing the
 * page's address at its prerendered HTML file. Render does not map /wheels/x to wheels/x.html on
 * its own, and its catch-all rule would otherwise serve the bare app shell to preview bots.
 */
export function withRenderPageRoutes(renderYaml: string): string {
  const start = renderYaml.indexOf(PAGE_ROUTES_BEGIN);
  const end = renderYaml.indexOf(PAGE_ROUTES_END);
  if (start === -1 || end === -1 || end < start) {
    throw new Error('render.yaml is missing the generated page routes markers');
  }
  const lineStart = renderYaml.lastIndexOf('\n', start) + 1;
  const indent = renderYaml.slice(lineStart, start);
  const rules = sitemapPaths()
    .filter((p) => !isHomePath(p))
    .map(
      (p) =>
        `${indent}- type: rewrite\n${indent}  source: ${p}\n${indent}  destination: ${p}.html`
    );
  const block = [PAGE_ROUTES_BEGIN, ...rules].join('\n') + `\n${indent}`;
  return renderYaml.slice(0, start) + block + renderYaml.slice(end);
}
