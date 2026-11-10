import {
  BrandWheelItem,
  MARQUE_FILTERS,
  MarqueFilter,
  SpokeGeometryType,
  WHEEL_FINISHES,
  WheelFinishId,
} from '../data/catalogue';

export interface NewWheelInput {
  name: string;
  series?: string;
  /** Price in Rand for a set of 4. */
  priceZAR: number;
  imageUrl?: string;
  galleryImages?: string[];
  /** Served path to a .glb rim model, e.g. "/models/wheels/type-60.glb". */
  modelUrl?: string;
  marques?: string[];
  /** Car the set fits, e.g. "M3 Competition Sedan (G80)". */
  compatibleCars?: string;
  /** Diameters on offer, e.g. "20 inch / 21 inch". */
  sizesAvailable?: string;
  /** Bolt pattern, offsets and centre bore, e.g. "PCD 5×112 · ET8/15 · CB66.6". */
  technicalSpecSheet?: string;
  geometry?: SpokeGeometryType;
  defaultFinish?: WheelFinishId;
  headline?: string;
  description?: string;
  /** Complete sets in stock. The wheel is listed only while this is above zero. Default 1. */
  stockQuantitySets?: number;
}

export function slugifyWheelText(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizeMarques(rawMarques?: string[]): MarqueFilter[] {
  if (!rawMarques || rawMarques.length === 0) {
    return ['BMW'];
  }
  const matched: MarqueFilter[] = [];
  for (const item of rawMarques) {
    const upper = item.trim().toUpperCase() as MarqueFilter;
    if (MARQUE_FILTERS.includes(upper) && upper !== 'ALL' && !matched.includes(upper)) {
      matched.push(upper);
    }
  }
  return matched.length > 0 ? matched : ['BMW'];
}

/**
 * Builds one stock listing: one design in one finish, with its own stock count.
 * It appears on the site only while `stockQuantitySets` is above zero.
 */
export function createWheelEntry(input: NewWheelInput): BrandWheelItem {
  const cleanName = input.name.trim().toUpperCase();
  if (!cleanName) {
    throw new Error('Wheel name is required');
  }
  const numericPrice = Number(input.priceZAR);
  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    throw new Error('Valid positive priceZAR is required');
  }
  const sets = input.stockQuantitySets === undefined ? 1 : Math.floor(Number(input.stockQuantitySets));
  if (!Number.isFinite(sets) || sets < 0) {
    throw new Error('Sets in stock must be zero or more');
  }

  const wheelSlug = slugifyWheelText(cleanName);
  const series = (input.series?.trim() || 'FORGED SERIES').toUpperCase();
  const geometry: SpokeGeometryType = input.geometry || 'y-spoke-forged';
  const defaultFinish: WheelFinishId = input.defaultFinish || 'satin-black';
  const finishName = WHEEL_FINISHES[defaultFinish]?.name ?? 'Satin Black';
  const sizesAvailable = input.sizesAvailable?.trim() || undefined;
  const compatibleCars = input.compatibleCars?.trim() || undefined;
  const technicalSpecSheet = input.technicalSpecSheet?.trim() || undefined;
  const marques = normalizeMarques(input.marques);
  const setsLabel = `${sets} ${sets === 1 ? 'set' : 'sets'}`;

  return {
    id: `wheel-${wheelSlug}`,
    slug: wheelSlug,
    model: cleanName,
    series,
    headline: input.headline?.trim() || cleanName,
    editorialLead: [sizesAvailable, compatibleCars ? `for BMW ${compatibleCars}` : '', technicalSpecSheet]
      .filter(Boolean)
      .join('. '),
    editorialBody: input.description?.trim() || `In stock: ${setsLabel}. The price is for a complete set of four.`,
    marques,
    geometry,
    spokeCount: 10,
    defaultFinish,
    availableFinishes: [defaultFinish],
    priceZAR: numericPrice,
    sizesAvailable,
    finishName,
    compatibleCars,
    stockStatus: sets > 0 ? 'In Stock' : 'Out of stock',
    stockQuantitySets: sets,
    technicalSpecSheet,
    imageUrl: input.imageUrl?.trim() || undefined,
    galleryImages: input.galleryImages?.filter(Boolean),
    modelUrl: input.modelUrl?.trim() || undefined,
    specs: {
      product: `${cleanName} — ${setsLabel} in stock`,
      material: 'Forged aluminium',
      diameters: sizesAvailable ?? '',
      finishOptions: finishName,
      testing: technicalSpecSheet ?? '',
      // Left empty until the owner supplies written warranty terms; the spec table hides empty rows.
      warranty: '',
    },
  };
}
