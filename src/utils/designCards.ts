import { type BrandWheelItem, type WheelFinishId, formatZAR, getWheelImages } from '../data/catalogue';
import { wheelImageSrcSet, type WheelImageSources } from './wheelImageSrcSet';

/**
 * The home page shows one card per wheel design. Everything a card says is worked out here from
 * the in-stock listings (pass the result of getAllBrandWheels), so nothing on it is typed by hand.
 */

/** The design a listing belongs to, e.g. "FSA002". Each listing is one design in one finish. */
export const designOf = (wheel: BrandWheelItem): string => wheel.modelCode || wheel.model;

/** "20 inch / 21 inch" becomes 20" / 21". */
export const formatSizes = (sizes?: string): string =>
  (sizes ?? '').replace(/\s*inch(?:es)?/gi, '"').trim();

/** A generated stand-in picture (no real photo yet) is never shown to visitors. */
export const isGeneratedPlaceholder = (src: string): boolean => src.startsWith('data:');

/** The listing's three-quarter photo, or undefined when it has no real photo yet. */
export const threeQuarterPhoto = (wheel: BrandWheelItem): string | undefined => {
  const photo = getWheelImages(wheel).images[1];
  return photo && !isGeneratedPlaceholder(photo) ? photo : undefined;
};

/**
 * The transparent cut-out made from a site photo by scripts/make-wheel-cutouts.py:
 * /images/wheels/<slug>/hero.webp becomes /images/wheels/<slug>/cutout.webp. Other photos (for
 * example one added from the admin page) have no cut-out, so this returns undefined for them.
 */
export const cutoutSrcFor = (photo: string | undefined): string | undefined =>
  photo && /^\/images\/wheels\/[^/]+\/hero\.webp$/.test(photo)
    ? photo.replace(/hero\.webp$/, 'cutout.webp')
    : undefined;

export interface DesignCard {
  design: string;
  /** The in-stock listings of this design, in catalogue order. */
  listings: BrandWheelItem[];
  /** The listing the card links to: the first with a real photo, else the first. */
  representative: BrandWheelItem;
  /** The representative's three-quarter photo, if it has one. */
  photo?: string;
  /** Its transparent cut-out, when the photo is one of the site's own. */
  cutout?: string;
  badge: string;
  /** "From R 70,000 per set of 4", or without "From" when every finish costs the same. */
  priceLine: string;
  finishes: string[];
  /** One swatch per finish in stock, in the order of `finishes`: the viewer's own paint for that finish. */
  swatches: { finishId: WheelFinishId; name: string }[];
  sizes: string[];
}

/** Group in-stock listings into one card per design, in the order the designs first appear. */
export function buildDesignCards(wheels: BrandWheelItem[]): DesignCard[] {
  const groups = new Map<string, BrandWheelItem[]>();
  for (const wheel of wheels) {
    const design = designOf(wheel);
    groups.set(design, [...(groups.get(design) ?? []), wheel]);
  }

  return Array.from(groups, ([design, listings]) => {
    const representative = listings.find((w) => threeQuarterPhoto(w)) ?? listings[0];
    const photo = threeQuarterPhoto(representative);
    const prices = listings.map((w) => w.priceZAR);
    const minPrice = Math.min(...prices);
    const samePrice = prices.every((p) => p === minPrice);
    const priceLine = `${samePrice ? '' : 'From '}${formatZAR(minPrice)} per set of 4`;
    const finishes = unique(listings.map((w) => w.finishName ?? '').filter(Boolean));
    const swatches: DesignCard['swatches'] = [];
    for (const w of listings) {
      if (w.finishName && !swatches.some((x) => x.name === w.finishName)) {
        swatches.push({ finishId: w.defaultFinish, name: w.finishName });
      }
    }
    const sizes = unique(listings.map((w) => formatSizes(w.sizesAvailable)).filter(Boolean));
    const badge = finishes.length > 1 ? `${finishes.length} finishes in stock` : 'In stock';

    return {
      design,
      listings,
      representative,
      photo,
      cutout: cutoutSrcFor(photo),
      badge,
      priceLine,
      finishes,
      swatches,
      sizes,
    };
  });
}

const unique = (values: string[]): string[] => Array.from(new Set(values));

/**
 * The home page hero shows the first design's cut-out, decoratively, on screens at least this wide
 * (Tailwind's lg). Narrower screens neither draw it nor download it. The same query gates the
 * <img> in HeroSection and the preload that scripts/prerender-meta.ts writes into dist/index.html.
 */
export const HERO_WHEEL_MEDIA = '(min-width: 1024px)';

/**
 * How wide the hero wheel is drawn, as a CSS sizes attribute. It is 82% of the hero's height, which
 * the two-line headline sets, so it was measured in the built site: 340 px at both 1024 and 1440 px.
 */
export const HERO_WHEEL_SIZES = '340px';

/**
 * The hero wheel's src, srcset and sizes: the first design card's cut-out, or undefined when no
 * in-stock design has one (then the hero shows no wheel and nothing is preloaded). HeroSection and
 * prerender-meta.ts both use this, so the preloaded file is exactly the one the <img> requests.
 */
export function heroWheelImage(wheels: BrandWheelItem[]): WheelImageSources | undefined {
  const cutout = buildDesignCards(wheels)[0]?.cutout;
  return cutout ? wheelImageSrcSet(cutout, HERO_WHEEL_SIZES) : undefined;
}

/**
 * How many cards go in each row on wide screens: rows of 3 and 2 alternate, starting with 3.
 * A last row that would hold a single card becomes one full-width card instead.
 * planDesignRows(6) is [3, 2, 1]; planDesignRows(5) is [3, 2]; planDesignRows(4) is [3, 1].
 */
export function planDesignRows(count: number): number[] {
  const rows: number[] = [];
  let left = Math.max(0, Math.floor(count));
  while (left > 0) {
    const size = Math.min(rows.length % 2 === 0 ? 3 : 2, left);
    rows.push(size);
    left -= size;
  }
  return rows;
}

/** The width of each card on wide screens: a third, a half, or the whole row. */
export type DesignCardWidth = 'third' | 'half' | 'full';

/** planDesignRows, as one width per card. */
export function designCardWidths(count: number): DesignCardWidth[] {
  return planDesignRows(count).flatMap((size) =>
    Array<DesignCardWidth>(size).fill(size === 3 ? 'third' : size === 2 ? 'half' : 'full')
  );
}
