import rangeJson from './sixnineRange.json';
import type { BrandWheelItem } from './catalogue';

/**
 * Sixnine Wheels' range, as Sixnine publishes it: every series, and every size of it with its
 * offset, bolt pattern, finishes and specifications. The sizes come from sixnineRange.json, written
 * by scripts/sixnine-range-from-sheet.py from the owner's "SIXNINE Wheels Catalogue" sheet (a scrape
 * of sixnine-wheels.com on 19 November 2026). Prices and stock are not in it: what this shop has in
 * stock, and at what price in Rand, is only ever the catalogue (getAllBrandWheels).
 */

export interface SixnineSize {
  /** As Sixnine writes it: "8.5x20", or "11x21 front + 11.5x22 rear" for a staggered set. */
  size: string | null;
  diameter: number | null;
  width: number | null;
  /** Null when Sixnine gives none (a vehicle-specific offset) or for a staggered set. */
  offset: number | null;
  /** One, or two for a wheel drilled for two bolt patterns ("5x112 / 5x120"). */
  boltPatterns: string[];
  /** Sixnine's edition or fitment note, e.g. "SDC", "Audi RS5 B10". */
  note: string | null;
  /** Sixnine's finish names, e.g. "HyperSilver". Empty for a set, whose finishes are in finishesText. */
  finishes: string[];
  finishesText: string | null;
  soldAs: 'wheel' | 'set';
  preOrder: boolean;
  loadKg: number | null;
  centreBoreMm: number | null;
  concavityMm: number | null;
  concavityNote: string | null;
  weightKg: number | null;
  construction: string | null;
  /** The sheet's note that Sixnine's own page is unclear or contradicts itself for this size. */
  flag: string | null;
}

interface RangeSeries {
  code: string;
  /** Said of the whole series only when most of its single-wheel sizes state it. */
  construction: string | null;
  sizes: SixnineSize[];
}

export interface SixnineSeries extends RangeSeries {
  /** The page address under /sixnine-wheels/. */
  slug: string;
  /** What sets the series apart, in this site's words, each traceable to the sheet. */
  features: string[];
}

const RANGE = rangeJson as { source: { title: string; scrapedFrom: string; scrapedOn: string }; series: RangeSeries[] };

/** Where the range data comes from, for the note on each series page. */
export const SIXNINE_RANGE_SOURCE = RANGE.source;

/**
 * Per-series facts the sheet states in words rather than numbers ("Series overview" tab, columns
 * "Design", "Swappable parts" and "Construction as stated on site"), written plainly. Facts that the
 * numbers already show, such as two bolt patterns on one wheel, are worked out in seriesFacts.
 */
const FEATURES: Record<string, string[]> = {
  'FF-ONE': ['Swap-in inlays (V-ONE, V-TWO, X-ONE) change its look after it is fitted.'],
  'FF-THREE': ['Takes the same swap-in inlays as the FF-ONE.'],
  'EVO-TWO': ['A one-piece wheel with a two-piece look: no bolted joint and no seals.'],
};

/** "FF-ONE" → "ff-one", "OEM+ONE" → "oem-plus-one". */
export const seriesSlug = (code: string): string => code.toLowerCase().replace(/\+/g, '-plus-');

/**
 * The owner confirmed on 2026-11-23 that every wheel the shop sells is forged. Sixnine's sheet calls most of
 * its range "flow forged" or "flow formed"; the site says what the shop supplies, so every series reads
 * "Forged", and a size keeps its own line only where it adds the piece count ("Forged, 2-piece").
 */
export const SHOP_CONSTRUCTION = 'Forged';
const sizeConstruction = (value: string | null): string | null => (value && /^forged,/i.test(value) ? value : null);

export const SIXNINE_SERIES: readonly SixnineSeries[] = RANGE.series.map((series) => ({
  ...series,
  construction: SHOP_CONSTRUCTION,
  sizes: series.sizes.map((size) => ({ ...size, construction: sizeConstruction(size.construction) })),
  slug: seriesSlug(series.code),
  features: FEATURES[series.code] ?? [],
}));

/** The base address of the Sixnine pages; each series page is under it. */
export const SIXNINE_PATH = '/sixnine-wheels';

export const seriesPath = (series: Pick<SixnineSeries, 'slug'>): string => `${SIXNINE_PATH}/${series.slug}`;

export function findSixnineSeries(slug: string): SixnineSeries | undefined {
  return SIXNINE_SERIES.find((series) => series.slug === slug.toLowerCase());
}

/**
 * The Sixnine series a catalogue listing belongs to. The stock sheet writes the design with a digit
 * ("FF-1", "FF-3"); Sixnine writes it in words ("FF-ONE", "FF-THREE").
 */
export function sixnineSeriesOfWheel(wheel: Pick<BrandWheelItem, 'modelCode'>): SixnineSeries | undefined {
  const code = (wheel.modelCode ?? '').trim().toUpperCase();
  const words = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE'];
  const spelled = code.replace(/^(FF|EVO)-(\d)$/, (_, family: string, n: string) => `${family}-${words[Number(n) - 1] ?? n}`);
  return SIXNINE_SERIES.find((series) => series.code === spelled);
}

/** Single wheels first by diameter, then width, then offset; staggered sets last. */
export function sortedSizes(series: Pick<SixnineSeries, 'sizes'>): SixnineSize[] {
  const key = (s: SixnineSize) => [s.soldAs === 'set' ? 1 : 0, s.diameter ?? 99, s.width ?? 99, s.offset ?? 999];
  return [...series.sizes].sort((a, b) => {
    const [ka, kb] = [key(a), key(b)];
    for (let i = 0; i < ka.length; i += 1) if (ka[i] !== kb[i]) return ka[i] - kb[i];
    return 0;
  });
}

const unique = <T,>(values: T[]): T[] => Array.from(new Set(values));

/** Bolt patterns in a sensible order: 5x100 before 5x112 before 5x114.3. */
const byPitch = (a: string, b: string) => a.localeCompare(b, 'en', { numeric: true });

export interface SeriesFacts {
  /** Every size Sixnine lists, sets included. */
  sizeCount: number;
  minDiameter: number | null;
  maxDiameter: number | null;
  boltPatterns: string[];
  finishes: string[];
  /** True when at least one size is drilled for two bolt patterns. */
  dualBoltPattern: boolean;
}

/** The numbers a series page and the mega menu show, all worked out from the sizes. */
export function seriesFacts(series: Pick<SixnineSeries, 'sizes'>): SeriesFacts {
  const diameters = series.sizes.map((s) => s.diameter).filter((d): d is number => d !== null);
  return {
    sizeCount: series.sizes.length,
    minDiameter: diameters.length ? Math.min(...diameters) : null,
    maxDiameter: diameters.length ? Math.max(...diameters) : null,
    boltPatterns: unique(series.sizes.flatMap((s) => s.boltPatterns)).sort(byPitch),
    finishes: unique(series.sizes.flatMap((s) => s.finishes)),
    dualBoltPattern: series.sizes.some((s) => s.boltPatterns.length > 1),
  };
}

/** `19″ to 22″`, or `21″` when there is one diameter. */
export function diameterRange(facts: Pick<SeriesFacts, 'minDiameter' | 'maxDiameter'>): string {
  if (facts.minDiameter === null || facts.maxDiameter === null) return '';
  return facts.minDiameter === facts.maxDiameter ? `${facts.minDiameter}″` : `${facts.minDiameter}″ to ${facts.maxDiameter}″`;
}

/** "8.5x20 ET35 · 5x120", Sixnine's way of writing a size. */
export function sizeLine(size: SixnineSize): string {
  const et = size.offset !== null ? ` ET${size.offset}` : '';
  return `${size.size ?? ''}${et}${size.boltPatterns.length ? ` · ${size.boltPatterns.join(' / ')}` : ''}`.trim();
}

/**
 * The on-screen swatch for each Sixnine finish, a 135° gradient, as the sixnine-website skill
 * measured it from Sixnine's shop. These are screen colours, not paint codes. PureWhite and
 * OEM-Silver have no swatch on Sixnine's site, so they get their own pair here rather than grey.
 */
export const SIXNINE_FINISH_SWATCH: Record<string, [string, string]> = {
  HyperSilver: ['#E4E4E4', '#A3A3A3'],
  GlossyBlack: ['#3A3A3A', '#050505'],
  LiquidMetal: ['#E2E6E9', '#79808A'],
  PureBronze: ['#B08452', '#6A4723'],
  ChampagneGold: ['#E6D3A8', '#A48655'],
  PureWhite: ['#FAFAFA', '#CFCFD2'],
  'OEM-Silver': ['#D9DCE0', '#6E7277'],
};

export const finishSwatch = (finish: string): string => {
  const [from, to] = SIXNINE_FINISH_SWATCH[finish] ?? ['#9A9A9A', '#5A5A5A'];
  return `linear-gradient(135deg, ${from}, ${to})`;
};
