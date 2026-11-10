import {
  BrandWheelItem,
  MARQUE_FILTERS,
  MarqueFilter,
  SpokeGeometryType,
  StoreProductItem,
  WHEEL_FINISHES,
  WheelFinishId,
} from '../data/catalogue';

export interface NewWheelInput {
  name: string;
  series?: string;
  /** Price in Rand for a set of 4. */
  priceZAR: number;
  /** Previous Rand price; triggers the SALE badge when higher than priceZAR. */
  originalPriceZAR?: number;
  imageUrl?: string;
  galleryImages?: string[];
  /** Served path to a .glb rim model, e.g. "/models/wheels/type-60.glb". */
  modelUrl?: string;
  marques?: string[];
  make?: string;
  vehicleModel?: string;
  yearRange?: string;
  diameterBadge?: '20"' | '20-21"' | '22"' | '23"';
  geometry?: SpokeGeometryType;
  defaultFinish?: WheelFinishId;
  headline?: string;
  description?: string;
  frontWheelSize?: string;
  rearWheelSize?: string;
  boltPattern?: string;
  partNo?: string;
  isLatest?: boolean;
  isReserve?: boolean;
  isSale?: boolean;
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

/** Finish code used in FORGED part numbers. */
const FINISH_PART_CODES: Record<WheelFinishId, string> = {
  silver: 'SLV',
  'satin-black': 'BLK',
  'champagne-bronze': 'BRZ',
  'dark-gunmetal': 'GUN',
};

/**
 * Deterministic FORGED part number: FCW-<MODEL>-<FINISH>-<DIAMETERS>,
 * e.g. FCW-FSA002-GLD-2021 for a 20"/21" set. MODEL is the wheel name
 * reduced to letters and digits (max 8), DIAMETERS the badge digits.
 */
export function buildPartNumber(
  wheelName: string,
  finish: WheelFinishId,
  diameterBadge: string
): string {
  const model = wheelName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || 'WHEEL';
  const diameters = diameterBadge.replace(/[^0-9]/g, '') || '00';
  return `FCW-${model}-${FINISH_PART_CODES[finish] ?? 'STD'}-${diameters}`;
}

export function createWheelAndProductEntries(input: NewWheelInput): {
  brandWheel: BrandWheelItem;
  storeProduct: StoreProductItem;
} {
  const cleanName = input.name.trim().toUpperCase();
  if (!cleanName) {
    throw new Error('Wheel name is required');
  }
  const numericPrice = Number(input.priceZAR);
  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    throw new Error('Valid positive priceZAR is required');
  }

  const wheelSlug = slugifyWheelText(cleanName);
  const series = (input.series?.trim() || 'FORGED SERIES').toUpperCase();
  const make = (input.make?.trim() || 'BMW').toUpperCase();
  const vehicleModel = (input.vehicleModel?.trim() || 'M3').toUpperCase();
  const yearRange = (input.yearRange?.trim() || '2024 ONWARDS').toUpperCase();
  const diameterBadge = input.diameterBadge || '20-21"';
  const geometry: SpokeGeometryType = input.geometry || 'y-spoke-forged';
  const defaultFinish: WheelFinishId = input.defaultFinish || 'satin-black';
  const finishName = WHEEL_FINISHES[defaultFinish]?.name ?? 'Satin Black';

  const storeSlug = slugifyWheelText(`${make}-${vehicleModel}-${cleanName}-forged`);
  const marques = normalizeMarques(input.marques?.length ? input.marques : [make]);
  const partNo = input.partNo?.trim().toUpperCase() || buildPartNumber(cleanName, defaultFinish, diameterBadge);

  const brandWheel: BrandWheelItem = {
    id: `wheel-${wheelSlug}`,
    slug: wheelSlug,
    model: cleanName,
    series,
    headline: input.headline?.trim() || `${cleanName} — Bespoke Forged Architecture.`,
    editorialLead:
      'Precision CNC-machined from aerospace-grade 6061-T6 forged aluminium billet.',
    editorialBody:
      input.description?.trim() ||
      `Engineered for South African roads and circuits, the ${cleanName} combines high-load structural rigidity with reduced unsprung rotational mass and direct OEM hub-centric fitment.`,
    marques,
    geometry,
    spokeCount: 10,
    defaultFinish,
    availableFinishes: ['satin-black', 'silver', 'champagne-bronze', 'dark-gunmetal'],
    priceZAR: numericPrice,
    imageUrl: input.imageUrl?.trim() || undefined,
    galleryImages: input.galleryImages?.filter(Boolean),
    modelUrl: input.modelUrl?.trim() || undefined,
    specs: {
      product: `${cleanName} ${series} Monoblock Wheel Set`,
      material: '6061-T6 Aerospace Forged Aluminium',
      diameters: `${diameterBadge} Staggered & Square Fitments`,
      finishOptions: 'Satin Black · Liquid Silver · Champagne Bronze · Anthracite Gunmetal',
      testing: 'Load rating and fitment specification supplied with every set',
      // Left empty until the owner supplies written warranty terms; the spec table hides empty rows.
      warranty: '',
    },
    compatibleStoreProductSlug: storeSlug,
  };

  const storeProduct: StoreProductItem = {
    id: `prod-${storeSlug}`,
    slug: storeSlug,
    wheelSlug,
    title: `${make} ${vehicleModel} (${yearRange}) FORGED ALLOY WHEELS - ${cleanName}`,
    shortModel: `${cleanName} FORGED`,
    make,
    model: vehicleModel,
    yearRange,
    partCategory: 'ALLOY WHEELS',
    priceZAR: numericPrice,
    originalPriceZAR: input.originalPriceZAR,
    isSale: Boolean(input.isSale || (input.originalPriceZAR && input.originalPriceZAR > numericPrice)),
    isLatest: input.isLatest ?? true,
    isReserve: input.isReserve ?? true,
    setLabel: 'SET OF 4',
    diameterBadge,
    geometry,
    spokeCount: 10,
    defaultFinish,
    availableFinishes: ['satin-black', 'silver', 'champagne-bronze', 'dark-gunmetal'],
    imageUrl: input.imageUrl?.trim() || undefined,
    galleryImages: input.galleryImages?.filter(Boolean),
    modelUrl: input.modelUrl?.trim() || undefined,
    technicalSpecs: {
      productName: `${make} ${vehicleModel} (${yearRange}) FORGED ALLOY WHEELS - ${cleanName}`,
      frontWheelSize: input.frontWheelSize?.trim().toUpperCase() || '9.5 X 20 ET18',
      rearWheelSize: input.rearWheelSize?.trim().toUpperCase() || '10.5 X 21 ET20',
      colour: finishName.toUpperCase(),
      material: 'ALUMINIUM (6061-T6)',
      construction: 'FORGED',
      boltPattern: input.boltPattern?.trim().toUpperCase() || '5 X 112',
      partNo,
      // No default figure: a load rating must come from the manufacturer's documents for the exact wheel.
      loadRating: 'ON REQUEST',
      centerBore: '66.6 MM (DIRECT HUB-CENTRIC)',
    },
    aboutBullets: [
      input.description?.trim() ||
        `Direct bolt-on ${diameterBadge} forged wheel set engineered specifically for ${make} ${vehicleModel} (${yearRange}).`,
      'CNC-machined from 6061-T6 aerospace forged aluminium billets to reduce unsprung mass.',
      'Compatible with factory OEM center caps, performance brake calipers, and TPMS sensors.',
    ],
    importantInfoBullets: [
      'Price displayed is for a complete set of 4 forged alloy wheels.',
      'Delivery and fitting are arranged when you enquire.',
    ],
  };

  return { brandWheel, storeProduct };
}
