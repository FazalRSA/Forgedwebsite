import {
  findWheelBySlug,
  formatZAR,
  getAllBrandWheels,
  getWheelImages,
  isSixnineWheel,
  type BrandWheelItem,
} from '../data/catalogue';
import { SITE } from '../config/site';
import { normalizePath } from './redirects';
import { blogLastmod, blogMetaForPath, blogSitemapPaths } from './blogSeo';

/**
 * Per-page metadata for search engines and link previews.
 *
 * The site is a single-page app, so every route would otherwise share the one <title> and
 * description in index.html. `metaForPath` works out the right ones for a path from the
 * catalogue data, and `applyPageMeta` writes them into <head>.
 */

export const SITE_NAME = 'FORGED Custom Wheels';

/** Production origin from config/site.ts. Canonical URLs always point here, whichever host served the page. */
export const SITE_ORIGIN = `https://${SITE.host}`;

/** Link-preview image for pages that have no picture of their own (a catalogue wheel photo). */
export const DEFAULT_SHARE_IMAGE = '/images/share/forged-wheels-share.jpg';

/** Longest title that search results show without cutting it off. */
const MAX_TITLE_LENGTH = 60;

/** The home page section that lists the wheels in stock; the first crumb on every wheel page. */
export const CATALOGUE_PATH = '/#catalogue';

/**
 * The manufacturer of a wheel, when the stock sheet says who it is. Only Sixnine designs (codes
 * starting with FF) are attributed to a maker; other wheels return undefined rather than a guess.
 */
export function wheelBrand(wheel: BrandWheelItem): string | undefined {
  return isSixnineWheel(wheel) ? 'Sixnine' : undefined;
}

/**
 * Organization and WebSite structured data for the home page, built only from config/site.ts. The
 * phone number and street address appear only once they are filled in there.
 */
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
        ...(SITE.phoneDisplay ? { telephone: SITE.phoneDisplay } : {}),
        ...(SITE.addressLine
          ? { address: { '@type': 'PostalAddress', streetAddress: SITE.addressLine, addressCountry: 'ZA' } }
          : {}),
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
  title: `Forged wheels for BMW M cars in stock | ${SITE_NAME}`,
  description: `Forged wheel sets for BMW M cars, in stock in ${SITE.country}. Prices in Rand per set of four, each wheel in 3D, and wheels fitted on customer cars.`,
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

function wheelMeta(wheel: BrandWheelItem): PageMeta {
  const path = `/wheels/${wheel.slug}`;
  const facts = [
    wheel.compatibleCars ? `for BMW ${wheel.compatibleCars}` : '',
    wheel.sizesAvailable ?? '',
    wheel.technicalSpecSheet ?? '',
  ].filter(Boolean);
  const sets = wheel.stockQuantitySets ?? 0;
  const description = [
    `${wheel.model} forged wheels${facts.length ? ` ${facts.join(', ')}` : ''}.`,
    `${formatZAR(wheel.priceZAR)} per set of four.`,
    `In stock: ${sets} ${sets === 1 ? 'set' : 'sets'}.`,
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
      '@graph': [
        {
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
            // Only in-stock listings have a page, so every offer is in stock.
            availability: 'https://schema.org/InStock',
            url: path,
          },
        },
        // Where the page sits: the wheels in stock on the home page, then this wheel.
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Wheels in stock', item: CATALOGUE_PATH },
            { '@type': 'ListItem', position: 2, name: wheel.model, item: path },
          ],
        },
      ],
    },
  };
}

/**
 * Metadata for a site path. Unknown or sold wheels, removed pages and the unlisted admin and
 * preview pages are kept out of search results.
 */
export function metaForPath(rawPath: string): PageMeta {
  const path = normalizePath(rawPath);

  if (path === '/') return HOME;

  if (path.startsWith('/wheels/')) {
    const slug = path.slice('/wheels/'.length).split('/')[0];
    const wheel = findWheelBySlug(slug);
    // A sold or unknown wheel has no page; do not let the address be indexed.
    return wheel ? wheelMeta(wheel) : hidden(path);
  }

  switch (path) {
    case '/installs':
      return page(
        'Customer installs',
        'Customer cars on forged wheel sets, shown as studio re-shoots of each customer’s own photo.',
        path
      );
    case '/sixnine-wheels':
      return page(
        'Official Sixnine Wheels dealer',
        `${SITE_NAME} is an official dealer of Sixnine Wheels, the German wheel brand. See every forged Sixnine FF set in stock, with sizes and Rand prices.`,
        path
      );
    case '/contact':
      return page(
        'Contact us about forged wheels',
        'Ask about forged wheels for your BMW M car. Send your model and the wheels you like.',
        path
      );
    case '/privacy-policy':
      return page('Privacy notice', `How ${SITE_NAME} collects, uses and protects personal information.`, path);
    default:
      break;
  }

  // The blog: the hub, each content pillar and each article. An unknown blog address falls through to "not found".
  const blog = blogMetaForPath(path);
  if (blog) return blog;

  if (path.startsWith('/admin') || path.startsWith('/studio/')) {
    return hidden(path);
  }
  if (isHomePath(path)) return HOME;
  // Anything else is not a page on this site.
  return {
    title: `Page not found | ${SITE_NAME}`,
    description: `That page does not exist on ${SITE_NAME}. See the forged wheels in stock instead.`,
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

/** Copy of structured data with every site-relative `url`, `image`, `item` and `@id` made absolute. */
export function absolutiseJsonLd(
  jsonLd: Record<string, unknown>,
  origin: string = SITE_ORIGIN
): Record<string, unknown> {
  return JSON.parse(
    JSON.stringify(jsonLd, (key, value) =>
      (key === 'url' || key === 'image' || key === '@id' || key === 'item') && typeof value === 'string'
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

/** Every indexable page path: the home page, one page per in-stock wheel, the blog (hub, pillars, articles), installs, the Sixnine dealer page, contact and the privacy notice. */
export function sitemapPaths(): string[] {
  const candidates = [
    '/',
    ...getAllBrandWheels().map((w) => `/wheels/${w.slug}`),
    ...blogSitemapPaths(),
    '/installs',
    '/sixnine-wheels',
    '/contact',
    '/privacy-policy',
  ];
  // Keep only pages that are their own canonical URL and are allowed in search results.
  const paths = candidates.filter((path) => {
    const meta = metaForPath(path);
    return !meta.noindex && meta.canonicalPath === path;
  });
  return [...new Set(paths)];
}

/** sitemap.xml for the production host in config/site.ts. */
export function buildSitemapXml(origin: string = SITE_ORIGIN): string {
  const urls = sitemapPaths()
    .map((path) => {
      // Only blog pages carry a date: it is the date of the article, not the date of the build.
      const lastmod = blogLastmod(path);
      return `  <url><loc>${origin}${path === '/' ? '/' : path}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

/**
 * robots.txt: everything is open to crawlers except the two unlisted tools, and the sitemap is
 * named by its full address on the production host. Written to public/robots.txt by
 * scripts/generate-sitemap.ts so the host here and in the sitemap cannot differ.
 */
export function buildRobotsTxt(origin: string = SITE_ORIGIN): string {
  return `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /studio/\n\nSitemap: ${origin}/sitemap.xml\n`;
}

/**
 * The Google Search Console ownership tag for the token in config/site.ts, or '' when no token is
 * set. The token goes into an HTML attribute, so anything but the characters Google's tokens use
 * is refused rather than escaped.
 */
export function searchConsoleTag(token: string = SITE.searchConsoleToken): string {
  if (!/^[A-Za-z0-9_-]{16,128}$/.test(token)) return '';
  return `<meta name="google-site-verification" content="${token}" />`;
}

/**
 * Add the Search Console ownership tag to a built HTML shell, once: a shell that already carries
 * one, has no <head> to add it to, or has no valid token to add is returned unchanged.
 */
export function withSearchConsoleTag(shell: string, token: string = SITE.searchConsoleToken): string {
  const tag = searchConsoleTag(token);
  if (!tag || !shell.includes('</head>') || shell.includes('name="google-site-verification"')) return shell;
  return shell.replace('</head>', () => `    ${tag}\n  </head>`);
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
