import {
  findWheelBySlug,
  formatZAR,
  getAllStoreProducts,
  getWheelImages,
  resolveCollectionBySlug,
  type BrandWheelItem,
} from '../data/kahnData';

/**
 * Per-page metadata for search engines and link previews.
 *
 * The site is a single-page app, so every route would otherwise share the one <title> and
 * description in index.html. `metaForPath` works out the right ones for a path from the
 * catalogue data, and `applyPageMeta` writes them into <head>.
 */

export const SITE_NAME = 'FORGED Custom Wheels';

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
  title: `${SITE_NAME} | Forged wheels for BMW M cars in South Africa`,
  description:
    'Forged alloy wheel sets for BMW M cars, supplied in South Africa. Browse in-stock designs, see client fitments and request a fitment quote.',
  canonicalPath: '/',
  noindex: false,
};

function page(title: string, description: string, canonicalPath: string, noindex = false): PageMeta {
  return { title: `${title} | ${SITE_NAME}`, description, canonicalPath, noindex };
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
    return wheel ? wheelMeta(wheel) : { ...HOME, canonicalPath: path, noindex: true };
  }

  if (path.startsWith('/store/products/')) {
    const slug = path.slice('/store/products/'.length).split('/')[0].toLowerCase();
    const product = getAllStoreProducts().find((p) => p.slug.toLowerCase() === slug);
    if (!product) return { ...HOME, canonicalPath: path, noindex: true };
    return page(
      product.title,
      `${product.title}. ${product.technicalSpecs.frontWheelSize} front, ${product.technicalSpecs.rearWheelSize} rear, ${product.technicalSpecs.boltPattern}. ${formatZAR(product.priceZAR)} per set of four.`,
      `/store/products/${product.slug}`
    );
  }

  if (path.startsWith('/store/collections/')) {
    const slug = path.slice('/store/collections/'.length).split('/')[0];
    const { node, make } = resolveCollectionBySlug(slug);
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
        'Photos of forged wheel sets fitted to South African clients’ BMW M cars.',
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
    return { ...HOME, canonicalPath: path, noindex: true };
  }
  // Any other path renders the home page.
  return HOME;
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
export function applyPageMeta(meta: PageMeta, origin: string = window.location.origin): void {
  const absolute = (value: string) => (value.startsWith('/') ? `${origin}${value}` : value);
  const canonicalUrl = absolute(meta.canonicalPath);

  document.title = meta.title;
  setMeta('name', 'description', meta.description);
  setMeta('name', 'robots', meta.noindex ? 'noindex, nofollow' : null);
  setMeta('property', 'og:title', meta.title);
  setMeta('property', 'og:description', meta.description);
  setMeta('property', 'og:url', canonicalUrl);
  setMeta('property', 'og:site_name', SITE_NAME);
  setMeta('property', 'og:image', meta.image ? absolute(meta.image) : null);

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
  const absolutised = JSON.parse(
    JSON.stringify(meta.jsonLd, (key, value) =>
      (key === 'url' || key === 'image') && typeof value === 'string' ? absolute(value) : value
    )
  );
  const script = existing ?? document.createElement('script');
  script.id = 'page-jsonld';
  script.setAttribute('type', 'application/ld+json');
  script.textContent = JSON.stringify(absolutised);
  if (!existing) document.head.appendChild(script);
}
