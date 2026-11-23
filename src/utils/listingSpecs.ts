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

/** "PCD 5×112 · ET15/20 · CB66.6" → { offsets: [15, 20], pcd: '5x112' }. */
export function listingFitment(sheet: string | undefined): { offsets: number[]; pcd?: string } {
  const text = sheet ?? '';
  const et = /ET\s*(-?\d+(?:\s*\/\s*-?\d+)*)/i.exec(text);
  const pcd = /(\d)\s*[x×]\s*(\d{3}(?:\.\d)?)/i.exec(text);
  return {
    offsets: et ? et[1].split('/').map((v) => Number(v.trim())) : [],
    pcd: pcd ? `${pcd[1]}x${pcd[2]}` : undefined,
  };
}

export function sixnineSizesForListing(
  wheel: Pick<BrandWheelItem, 'modelCode' | 'sizesAvailable' | 'technicalSpecSheet'> & { slug?: string }
): SixnineSize[] {
  const series = sixnineSeriesOfWheel(wheel);
  if (!series) return [];
  const { offsets, pcd } = listingFitment(wheel.technicalSpecSheet);
  if (!pcd || !offsets.length) {
    // The page hides what it cannot read (AGENTS.md rule 2), but says why in the console, so a
    // mistyped sheet on a listing added from the admin page is found. listingSpecs.test.ts catches
    // the catalogue's own listings before they ship.
    console.warn(
      `Technical data hidden for ${wheel.slug ?? wheel.modelCode}: no ${!pcd ? 'bolt pattern' : 'offset'} in spec sheet "${wheel.technicalSpecSheet ?? ''}".`
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
