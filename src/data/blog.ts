/**
 * The blog: content pillars, the shape of a post, and the catalogue facts that posts quote.
 *
 * Structure (a "silo", so every article reinforces the topic it belongs to):
 *   /blog                       the hub: every pillar and the latest posts
 *   /blog/{pillar}              a pillar page: the topic, and every post under it
 *   /blog/{pillar}/{post}       one article
 *
 * The posts themselves live in blogPosts.ts. They never type a price, size, offset, bolt pattern,
 * lead time or stock count: text that needs one is written as a function of `CatalogueFacts`, which
 * is computed from the catalogue (AGENTS.md rule 4). src/data/blog.test.ts fails if a post hardcodes
 * one.
 */
import {
  TO_ORDER_LEAD_TIME,
  TO_ORDER_NOTICE,
  WHEEL_FINISHES,
  formatZAR,
  getAllBrandWheels,
  type BrandWheelItem,
} from './catalogue';

/* ------------------------------------------------------------------ pillars */

export type PillarId = 'basics' | 'fitment' | 'buying' | 'care';

export interface BlogPillar {
  id: PillarId;
  /** URL segment: /blog/{slug}. */
  slug: string;
  /** Short label for badges, navigation and breadcrumbs. */
  name: string;
  /** The pillar page's H1. */
  title: string;
  /** <title> without the site name (the site name is added when it fits). */
  metaTitle: string;
  description: string;
  /** The search phrase this pillar page is built to rank for. */
  keyword: string;
  /** Opening paragraphs of the pillar page. Plain text, inline links allowed. */
  intro: string[];
}

export const BLOG_PILLARS: readonly BlogPillar[] = [
  {
    id: 'basics',
    slug: 'forged-wheel-basics',
    name: 'Forged wheel basics',
    title: 'Forged wheel basics: how they are made and why they matter',
    metaTitle: 'Forged wheels explained: guides and basics',
    description:
      'Plain-English guides to forged wheels: how they differ from cast and flow-formed wheels, what unsprung weight is, and whether forged is worth it on a BMW M car.',
    keyword: 'forged wheels',
    intro: [
      'Everything starts with what a forged wheel actually is. These guides explain how forged, cast and flow-formed wheels are made, why weight at the wheel matters more than weight in the boot, and how to decide whether a forged set is worth the money for the way you drive.',
      'They are written for owners of BMW M cars in South Africa, but the reasoning applies to any performance car. Read them in order, or jump to the question you have.',
    ],
  },
  {
    id: 'fitment',
    slug: 'bmw-m-wheel-fitment',
    name: 'BMW M wheel fitment',
    title: 'BMW M wheel fitment: bolt pattern, offset, centre bore and sizes',
    metaTitle: 'BMW M wheel fitment guides',
    description:
      'BMW M wheel fitment explained: bolt pattern, offset, centre bore, staggered or square setups and what to check on a G80 M3 before you order forged wheels.',
    keyword: 'BMW M3 wheel fitment',
    intro: [
      'A wheel that looks right and does not fit is an expensive mistake. Fitment comes down to a handful of numbers: bolt pattern, offset, centre bore, width and diameter, plus clearance for your brakes. These guides explain each one and what it means on a BMW M car.',
      'The sets we list state their bolt pattern, offset and centre bore, and we confirm the fit for your exact car before anything is ordered.',
    ],
  },
  {
    id: 'buying',
    slug: 'buying-forged-wheels-south-africa',
    name: 'Buying forged wheels in South Africa',
    title: 'Buying forged wheels in South Africa: prices, stock and finishes',
    metaTitle: 'Buying forged wheels in South Africa',
    description:
      'What forged wheels cost in South Africa in Rand, the difference between in-stock and made-to-order sets, and how to choose a finish for your BMW M car.',
    keyword: 'forged wheels South Africa',
    intro: [
      'Buying wheels is a bigger decision than most modifications: a set of four is a large purchase, and the right choice depends on your car, your tyres and how you use it. These guides cover what forged wheels cost in Rand, how stock and made-to-order sets work, and how to choose a finish.',
      'Prices and stock on this site come straight from the live catalogue, so the figures in these guides are the ones on the wheel pages today.',
    ],
  },
  {
    id: 'care',
    slug: 'wheel-care',
    name: 'Wheel care and ownership',
    title: 'Wheel care: cleaning, torque and looking after forged wheels',
    metaTitle: 'Forged wheel care and ownership guides',
    description:
      'How to clean forged wheels safely, how to torque wheel bolts properly and how to protect wheels from South African road damage such as potholes.',
    keyword: 'how to clean forged wheels',
    intro: [
      'A good set of wheels lasts for years if it is cleaned correctly, fitted correctly and driven with a little care. These guides cover the routine jobs: cleaning without damaging the finish, tightening wheel bolts properly, and reducing the risk of damage on rough roads.',
    ],
  },
];

export function getPillar(slug: string): BlogPillar | undefined {
  return BLOG_PILLARS.find((pillar) => pillar.slug === slug.toLowerCase());
}

export function getPillarById(id: PillarId): BlogPillar {
  const pillar = BLOG_PILLARS.find((p) => p.id === id);
  if (!pillar) throw new Error(`Unknown blog pillar: ${id}`);
  return pillar;
}

/* --------------------------------------------------------------- post model */

/** Text that may be fixed, or worked out from the live catalogue. Empty text drops its block. */
export type Text = string | ((facts: CatalogueFacts) => string);

export type Block =
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'p'; text: Text }
  | { type: 'ul'; items: Text[] }
  | { type: 'ol'; items: Text[] }
  | { type: 'callout'; tone?: 'note' | 'tip' | 'warning'; title?: string; text: Text }
  | { type: 'table'; caption?: string; head: string[]; rows: Text[][] }
  /** One row per wheel design in stock: finishes, sizes, spec and the price from. */
  | { type: 'designTable'; caption?: string }
  /** Up to three in-stock listings, linked to their pages. Skipped when nothing is in stock. */
  | { type: 'stock'; heading: string; intro?: Text }
  | { type: 'cta'; heading: string; text: Text };

export interface BlogFaq {
  q: string;
  a: Text;
}

export interface BlogPost {
  slug: string;
  pillar: PillarId;
  /** The article's H1. */
  title: string;
  /** <title> without the site name; kept to 60 characters with the site name, or 60 without it. */
  metaTitle: string;
  description: string;
  /** Short card summary. */
  excerpt: string;
  /** The search phrase this article is written to rank for. */
  keyword: string;
  /** Related phrases the article answers (used as meta keywords in structured data and in the SEO plan). */
  related: string[];
  intent: 'informational' | 'commercial';
  /** ISO dates. */
  published: string;
  updated: string;
  body: Block[];
  faqs: BlogFaq[];
  /** Slugs of other posts to link at the end of this one. */
  more: string[];
}

/* -------------------------------------------------------- catalogue facts */

export interface CatalogueFacts {
  /** Listings in stock (each is one design in one finish). */
  listingCount: number;
  setCount: number;
  /** "R 70,000 to R 95,000", or '' when nothing is in stock. */
  priceRange: string;
  minPrice: string;
  maxPrice: string;
  designs: string[];
  /** "M3 Sedan (G80)" and "M3 Competition Sedan (G80)". */
  cars: string[];
  /** The chassis codes in brackets: "G80". */
  chassis: string[];
  /** "5×112". */
  pcd: string[];
  /** "66.6". */
  centreBore: string[];
  /** "ET8 to ET20", or '' when no set states offsets. */
  offsetRange: string;
  /** `20" / 21"` and `19" / 20"`. */
  sizes: string[];
  /** Finish names in stock: "Gold", "Silver", "Pure Bronze". */
  finishes: string[];
  /** Finish families a visitor can order: "Silver / Liquid Metal". */
  finishFamilies: string[];
  leadTime: string;
  toOrderNotice: string;
  /** The first listing in stock that states a spec, for worked examples. Undefined when nothing is in stock. */
  example?: { design: string; finish: string; spec: string };
}

const unique = <T>(values: (T | undefined | null | '')[]): T[] =>
  Array.from(new Set(values.filter((v): v is T => v !== undefined && v !== null && v !== '')));

/** The parts of "PCD 5×112 · ET8/15 · CB66.6", split on the dot. */
function specParts(spec: string | undefined): string[] {
  return (spec ?? '').split('·').map((part) => part.trim());
}

/** "20 inch / 21 inch" -> 20" / 21". */
const prettySizes = (sizes: string): string => sizes.replace(/\s*inch(?:es)?/gi, '"').trim();

/** Facts about the wheels in stock right now. Pass the listings to compute from (default: the live catalogue). */
export function catalogueFacts(wheels: BrandWheelItem[] = getAllBrandWheels()): CatalogueFacts {
  const prices = wheels.map((w) => w.priceZAR).filter((p) => Number.isFinite(p));
  const min = prices.length ? Math.min(...prices) : 0;
  const max = prices.length ? Math.max(...prices) : 0;

  const offsets = wheels.flatMap((w) =>
    specParts(w.technicalSpecSheet)
      .filter((part) => /^ET/i.test(part))
      .flatMap((part) => part.replace(/^ET/i, '').split('/'))
      .map(Number)
      .filter((n) => Number.isFinite(n))
  );

  const cars = unique(wheels.map((w) => w.compatibleCars));
  return {
    listingCount: wheels.length,
    setCount: wheels.reduce((sum, w) => sum + (w.stockQuantitySets ?? 0), 0),
    priceRange: prices.length ? (min === max ? formatZAR(min) : `${formatZAR(min)} to ${formatZAR(max)}`) : '',
    minPrice: prices.length ? formatZAR(min) : '',
    maxPrice: prices.length ? formatZAR(max) : '',
    designs: unique(wheels.map((w) => w.modelCode || w.model)),
    cars,
    chassis: unique(cars.flatMap((car) => Array.from(car.matchAll(/\b([EFG]\d{2})\b/g), (m) => m[1]))),
    pcd: unique(
      wheels.map((w) => specParts(w.technicalSpecSheet).find((p) => /^PCD/i.test(p))?.replace(/^PCD\s*/i, ''))
    ),
    centreBore: unique(
      wheels.map((w) => specParts(w.technicalSpecSheet).find((p) => /^CB/i.test(p))?.replace(/^CB\s*/i, ''))
    ),
    offsetRange: offsets.length ? `ET${Math.min(...offsets)} to ET${Math.max(...offsets)}` : '',
    sizes: unique(wheels.map((w) => (w.sizesAvailable ? prettySizes(w.sizesAvailable) : undefined))),
    finishes: unique(wheels.map((w) => w.finishName)),
    finishFamilies: Object.values(WHEEL_FINISHES).map((finish) => finish.name),
    leadTime: TO_ORDER_LEAD_TIME,
    toOrderNotice: TO_ORDER_NOTICE,
    example: (() => {
      const wheel = wheels.find((w) => w.technicalSpecSheet && w.finishName);
      return wheel
        ? { design: wheel.modelCode || wheel.model, finish: wheel.finishName as string, spec: wheel.technicalSpecSheet as string }
        : undefined;
    })(),
  };
}

/** "a", "a and b", "a, b and c". */
export function joinList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

export function resolveText(text: Text, facts: CatalogueFacts): string {
  return (typeof text === 'function' ? text(facts) : text).trim();
}

/** The rows of the "wheels in stock" design table: one per design. */
export interface DesignRow {
  design: string;
  finishes: string[];
  sizes: string[];
  spec: string;
  from: string;
  slug: string;
}

export function designRows(wheels: BrandWheelItem[] = getAllBrandWheels()): DesignRow[] {
  const byDesign = new Map<string, BrandWheelItem[]>();
  for (const wheel of wheels) {
    const key = wheel.modelCode || wheel.model;
    byDesign.set(key, [...(byDesign.get(key) ?? []), wheel]);
  }
  return Array.from(byDesign, ([design, listings]) => {
    const cheapest = listings.reduce((a, b) => (b.priceZAR < a.priceZAR ? b : a));
    return {
      design,
      finishes: unique(listings.map((w) => w.finishName)),
      sizes: unique(listings.map((w) => (w.sizesAvailable ? prettySizes(w.sizesAvailable) : undefined))),
      spec: unique(listings.map((w) => w.technicalSpecSheet)).join('; '),
      from: formatZAR(cheapest.priceZAR),
      slug: cheapest.slug,
    };
  });
}

/* ------------------------------------------------------------------ helpers */

/** The words in a post (headings and body, with every dynamic text resolved), for reading time. */
export function postWordCount(post: BlogPost, facts: CatalogueFacts = catalogueFacts()): number {
  const texts: string[] = [];
  for (const block of post.body) {
    switch (block.type) {
      case 'h2':
      case 'h3':
        texts.push(block.text);
        break;
      case 'p':
      case 'callout':
      case 'cta':
        texts.push(resolveText(block.text, facts));
        break;
      case 'ul':
      case 'ol':
        block.items.forEach((item) => texts.push(resolveText(item, facts)));
        break;
      case 'table':
        block.rows.forEach((row) => row.forEach((cell) => texts.push(resolveText(cell, facts))));
        break;
      default:
        break;
    }
  }
  post.faqs.forEach((faq) => texts.push(faq.q, resolveText(faq.a, facts)));
  return texts.join(' ').split(/\s+/).filter(Boolean).length;
}

/** Minutes to read, at an ordinary 220 words a minute, never less than one. */
export function readingMinutes(post: BlogPost, facts?: CatalogueFacts): number {
  return Math.max(1, Math.round(postWordCount(post, facts) / 220));
}

/** URL slug for a heading: used for in-page links and the contents list. */
export function headingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function blogPostPath(post: Pick<BlogPost, 'slug' | 'pillar'>): string {
  return `/blog/${getPillarById(post.pillar).slug}/${post.slug}`;
}

export function blogPillarPath(pillar: Pick<BlogPillar, 'slug'>): string {
  return `/blog/${pillar.slug}`;
}

/** Strip the inline link and bold markup used in post text, leaving the words. */
export function plainText(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1');
}

/** "17 November 2026". */
export function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  return date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}
