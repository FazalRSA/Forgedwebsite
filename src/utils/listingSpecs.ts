import type { BrandWheelItem } from '../data/catalogue';
import { sixnineSeriesOfWheel, type SixnineSize } from '../data/sixnineSeries';

/**
 * The Sixnine sizes a listing in stock is, worked out from its own record: for each diameter it lists,
 * the one Sixnine size of its series with that diameter, one of its offsets and its bolt pattern.
 * A diameter with no match, or with more than one, is left out, so a figure is shown only when it can
 * belong to this set and no other. The figures (load rating, concavity, weight) are Sixnine's own,
 * from sixnineRange.json; nothing is typed by hand.
 */

/** "20 inch / 21 inch" → [20, 21]. */
export function listingDiameters(sizes: string | undefined): number[] {
  return Array.from((sizes ?? '').matchAll(/(\d{2})(?:\.\d)?\s*(?:inch|″|")/gi), (m) => Number(m[1]));
}

export interface ListingFitment {
  offsets: number[];
  pcd?: string;
  /** Why the sheet could not be read, when it could not: what is missing, in plain words. */
  problem?: 'no spec sheet' | 'no bolt pattern' | 'no offset';
}

/**
 * "PCD 5×112 · ET15/20 · CB66.6" → { offsets: [15, 20], pcd: '5x112' }. A sheet it cannot read is not
 * an exception: it returns what it found and names what is missing in `problem`, so the caller decides
 * (the wheel page hides the technical data and logs the problem; listingSpecs.test.ts fails on it).
 */
export function listingFitment(sheet: string | undefined): ListingFitment {
  const text = sheet?.trim() ?? '';
  if (!text) return { offsets: [], problem: 'no spec sheet' };
  const et = /ET\s*(-?\d+(?:\s*\/\s*-?\d+)*)/i.exec(text);
  const pcd = /(\d)\s*[x×]\s*(\d{3}(?:\.\d)?)/i.exec(text);
  const offsets = et ? et[1].split('/').map((v) => Number(v.trim())).filter(Number.isFinite) : [];
  const fitment: ListingFitment = { offsets, pcd: pcd ? `${pcd[1]}x${pcd[2]}` : undefined };
  if (!fitment.pcd) fitment.problem = 'no bolt pattern';
  else if (!offsets.length) fitment.problem = 'no offset';
  return fitment;
}

export function sixnineSizesForListing(
  wheel: Pick<BrandWheelItem, 'modelCode' | 'sizesAvailable' | 'technicalSpecSheet'> & { slug?: string }
): SixnineSize[] {
  const series = sixnineSeriesOfWheel(wheel);
  if (!series) return [];
  const { offsets, pcd, problem } = listingFitment(wheel.technicalSpecSheet);
  if (problem || !pcd) {
    // The page hides what it cannot read (AGENTS.md rule 2), but says why in the console, so a
    // mistyped sheet on a listing added from the admin page is found. listingSpecs.test.ts catches
    // the catalogue's own listings before they ship.
    console.warn(
      `Technical data hidden for ${wheel.slug ?? wheel.modelCode}: ${problem ?? 'no bolt pattern'} in spec sheet "${wheel.technicalSpecSheet ?? ''}".`
    );
    return [];
  }
  return listingDiameters(wheel.sizesAvailable).flatMap((diameter) => {
    const matches = series.sizes.filter(
      (size) =>
        size.soldAs === 'wheel' &&
        size.diameter === diameter &&
        size.offset !== null &&
        offsets.includes(size.offset) &&
        size.boltPatterns.includes(pcd)
    );
    return matches.length === 1 ? matches : [];
  });
}
