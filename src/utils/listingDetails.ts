import { WHEEL_BRANDS, WHEEL_FINISHES, designName, formatZAR, type BrandWheelItem } from '../data/catalogue';
import { SIXNINE_RANGE } from '../data/sixnineRange';
import { sixnineSeriesOfWheel, type SixnineSize } from '../data/sixnineSeries';
import { SITE } from '../config/site';
import { listingFitment, sixnineSizesForListing } from './listingSpecs';

/**
 * The "Details" write-up under a Sixnine wheel page's buy column, in the shape the
 * sixnine-product-listing skill gives a product description: a headline, a short intro, three short
 * feature notes, highlights at a glance and a note on the pictures.
 *
 * Every figure comes from the listing's own record (catalogue.ts) or from the Sixnine sizes it matches
 * (sixnineSizesForListing, figures from sixnineRange.json); the design text is this site's own summary
 * in sixnineRange.ts. A fact that is missing is left out, never guessed (AGENTS.md rule 2), and a
 * listing with no matched Sixnine size gets no write-up at all.
 */

export interface ListingFeature {
  heading: string;
  text: string;
}

export interface ListingDetails {
  headline: string;
  intro: string;
  features: ListingFeature[];
  highlights: string[];
  /** Shown in italics: the pictures stand in for the wheel itself. */
  pictureNote: string;
}

export const PICTURE_NOTE = 'Pictures are a guide: the finish can look slightly different on the real wheel.';

const unique = <T,>(values: T[]): T[] => Array.from(new Set(values));

/** "a", "a and b", "a, b and c". */
function joinWords(parts: string[]): string {
  if (parts.length <= 1) return parts[0] ?? '';
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}

/**
 * One figure across the matched sizes: "650 kg" when every size has the same value, otherwise
 * "105 mm on the 20″ and 120 mm on the 21″". Sizes without the figure are left out; null when none has it.
 */
export function perDiameter(sizes: SixnineSize[], value: (size: SixnineSize) => number | null, unit: string): string | null {
  const known = sizes.filter((size) => value(size) !== null && size.diameter !== null);
  if (!known.length) return null;
  const values = unique(known.map((size) => value(size)));
  if (values.length === 1 && known.length === sizes.length) return `${values[0]} ${unit}`;
  return joinWords(known.map((size) => `${value(size)} ${unit} on the ${size.diameter}″`));
}

/** "ET15 on the 20″ and ET17 on the 21″", or "ET15" when the offset is the same. */
function offsets(sizes: SixnineSize[]): string | null {
  const known = sizes.filter((size) => size.offset !== null);
  if (!known.length) return null;
  const values = unique(known.map((size) => size.offset));
  if (values.length === 1 && known.length === sizes.length) return `ET${values[0]}`;
  return joinWords(known.map((size) => `ET${size.offset} on the ${size.diameter}″`));
}

/** "10.5x20 ET15 and 11.5x21 ET17 · 5x112". */
export function sizesLine(sizes: SixnineSize[], pcd: string | undefined): string {
  const each = sizes.map((size) => `${size.size ?? ''}${size.offset !== null ? ` ET${size.offset}` : ''}`.trim());
  return `${joinWords(each)}${pcd ? ` · ${pcd}` : ''}`;
}

const lowerFirst = (text: string): string => text.charAt(0).toLowerCase() + text.slice(1);

export function listingDetails(wheel: BrandWheelItem): ListingDetails | null {
  const sizes = sixnineSizesForListing(wheel);
  if (!sizes.length) return null;

  const design = wheel.modelCode ? designName(wheel.modelCode) : wheel.model;
  const finish = wheel.finishName ?? WHEEL_FINISHES[wheel.defaultFinish]?.name ?? 'Standard';
  const { pcd } = listingFitment(wheel.technicalSpecSheet);
  const brand = WHEEL_BRANDS.sixnine.name;
  const rangeDesign = SIXNINE_RANGE.find((d) => d.stockedCode === wheel.modelCode);
  const series = sixnineSeriesOfWheel(wheel);

  // Said of this set only when every size it matches states the same build; otherwise the series' build,
  // which is "Forged" for every series (the owner confirmed every wheel the shop sells is forged).
  const builds = unique(sizes.map((size) => size.construction));
  const construction = builds.length === 1 && builds[0] ? builds[0] : series?.construction ?? null;
  const concaves = sizes.map((size) => size.concavityMm).filter((v): v is number => v !== null);
  const maxConcave = concaves.length ? Math.max(...concaves) : null;

  const promise = [construction && lowerFirst(construction), maxConcave !== null && `up to ${maxConcave} mm concave`].filter(
    (part): part is string => Boolean(part)
  );
  const headline = `${design} ${sizesLine(sizes, pcd)}${promise.length ? ` – ${promise.join(', ')}` : ''}`;

  const intro = [
    `The ${design} is ${construction ? `a ${lowerFirst(construction)} wheel` : 'a wheel'} by ${brand}, sold here as an official dealer.`,
    `This set is in ${finish}${wheel.compatibleCars ? ` and is listed for the BMW ${wheel.compatibleCars}` : ''}.`,
  ].join(' ');

  const features: ListingFeature[] = [];

  const designText = rangeDesign?.summary ?? series?.features.join(' ');
  if (designText) features.push({ heading: 'The design', text: designText });

  const concave = perDiameter(sizes, (size) => size.concavityMm, 'mm');
  const weight = perDiameter(sizes, (size) => size.weightKg, 'kg');
  const engineering = [
    concave && `${sizes.length > 1 ? 'Each size has its own concave' : 'Concave'}: ${concave}.`,
    weight && `${brand} gives the weight per wheel as about ${weight}.`,
  ].filter((line): line is string => Boolean(line));
  if (engineering.length) features.push({ heading: 'Concave and weight', text: engineering.join(' ') });

  const bore = perDiameter(sizes, (size) => size.centreBoreMm, 'mm');
  const load = perDiameter(sizes, (size) => size.loadKg, 'kg');
  const et = offsets(sizes);
  const fitParts = [pcd && `bolt pattern ${pcd}`, bore && `centre bore ${bore}`].filter((part): part is string => Boolean(part));
  const fitment = [
    fitParts.length ? `${joinWords(fitParts).replace(/^./, (c) => c.toUpperCase())}.` : '',
    et ? `Offset ${et}.` : '',
    load ? `Load rating per wheel: ${load}.` : '',
    'Send us your car and we confirm the fit before you order.',
  ].filter(Boolean);
  features.push({ heading: 'Fitment', text: fitment.join(' ') });

  const sets = wheel.stockQuantitySets ?? 0;
  const highlights = [
    construction && `${construction} by ${brand}`,
    maxConcave !== null && `Up to ${maxConcave} mm concave`,
    sizesLine(sizes, pcd),
    load && `Load rating per wheel: ${load}`,
    sets > 0 && `${sets} ${sets === 1 ? 'set' : 'sets'} in stock in ${SITE.country}, ${formatZAR(wheel.priceZAR)} per set of four`,
  ].filter((line): line is string => Boolean(line));

  return { headline, intro, features, highlights, pictureNote: PICTURE_NOTE };
}
