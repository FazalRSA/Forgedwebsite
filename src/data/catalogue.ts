import customWheelsJson from './customWheels.json';

export type MarqueFilter = 'ALL' | 'BMW';

export const MARQUE_FILTERS: MarqueFilter[] = ['ALL', 'BMW'];

export type WheelModelFilter =
  | 'ALL'
  | 'FSA001'
  | 'FSA002'
  | 'FSA003'
  | 'FSA004'
  | 'FF-1'
  | 'FF-3';

export const WHEEL_MODEL_FILTERS: WheelModelFilter[] = [
  'ALL',
  'FSA001',
  'FSA002',
  'FSA003',
  'FSA004',
  'FF-1',
  'FF-3',
];

export type WheelFinishId = 'silver' | 'satin-black' | 'champagne-bronze' | 'dark-gunmetal';

export interface WheelFinishOption {
  id: WheelFinishId;
  name: string;
  swatchHex: string;
  secondaryHex: string;
  rimAccentHex: string;
}

export const WHEEL_FINISHES: Record<WheelFinishId, WheelFinishOption> = {
  'silver': {
    id: 'silver',
    name: 'Silver / Liquid Metal',
    swatchHex: '#D8DCE0',
    secondaryHex: '#8E959E',
    rimAccentHex: '#F3F5F7',
  },
  'satin-black': {
    id: 'satin-black',
    name: 'Black Matte / Gloss Black',
    swatchHex: '#1B1C1E',
    secondaryHex: '#0D0E10',
    rimAccentHex: '#484B52',
  },
  'champagne-bronze': {
    id: 'champagne-bronze',
    name: 'Gold / Pure Bronze',
    swatchHex: '#C5A059',
    secondaryHex: '#6E552B',
    rimAccentHex: '#E5C888',
  },
  'dark-gunmetal': {
    id: 'dark-gunmetal',
    name: 'Hyper Black',
    swatchHex: '#4A4E54',
    secondaryHex: '#26292E',
    rimAccentHex: '#7A8088',
  },
};

export type SpokeGeometryType =
  | 'ten-spoke-ring'
  | 'y-spoke-forged'
  | 'split-five-rs'
  | 'aero-disc-f1'
  | 'multi-spoke-gt'
  | 'dish-beadlock'
  | 'directional-turbine'
  | 'classic-horseshoe';

export interface BrandWheelItem {
  id: string;
  slug: string;
  model: string;
  modelCode?: string;
  series: string;
  headline: string;
  editorialLead: string;
  editorialBody: string;
  marques: MarqueFilter[];
  geometry: SpokeGeometryType;
  spokeCount: number;
  defaultFinish: WheelFinishId;
  /**
   * Only this listing's own stocked finish. Every listing is one design in one finish;
   * the other finishes of a design are separate listings (see getSiblingListings).
   */
  availableFinishes: WheelFinishId[];
  /** Price for a complete set of 4, in South African Rand (whole Rand). */
  priceZAR: number;
  sizesAvailable?: string;
  finishName?: string;
  otherFinishes?: string;
  compatibleCars?: string;
  stockStatus?: string;
  stockQuantitySets?: number;
  technicalSpecSheet?: string;
  imageUrl?: string;
  galleryImages?: string[];
  /** Photoreal .glb rim model served from /public, e.g. "/models/wheels/fsa002-gold.glb". */
  modelUrl?: string;
  /** Second .glb for the rear axle of a staggered set; adds a Front / Rear switch in the 3D studio. */
  rearModelUrl?: string;
  images?: [string, string, string];
  imageLabels?: [string, string, string];
  specs: {
    product: string;
    material: string;
    diameters: string;
    finishOptions: string;
    testing: string;
    warranty: string;
  };
}

/**
 * Stand-in picture for a listing that has no photography yet: a plain drawn wheel with the
 * design and finish name. It carries no other wording, so nothing internal reaches a visitor.
 */
function createWheelPlaceholderDataUrl(
  modelName: string,
  finishLabel: string,
  spokeCount = 10,
  finishHex = '#D8DCE3'
): string {
  const spokes: string[] = [];
  for (let i = 0; i < spokeCount; i++) {
    const angle = (i * 360) / spokeCount;
    spokes.push(
      `<line x1="400" y1="220" x2="400" y2="352" stroke="${finishHex}" stroke-opacity="0.38" stroke-width="3" transform="rotate(${angle} 400 400)" />`
    );
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
    <defs>
      <radialGradient id="bg" cx="50%" cy="45%" r="60%">
        <stop offset="0%" stop-color="#1C1C24" />
        <stop offset="100%" stop-color="#0E0E12" />
      </radialGradient>
    </defs>
    <rect width="800" height="800" fill="url(#bg)" />
    <g>
      <circle cx="400" cy="340" r="190" fill="none" stroke="#2B2B36" stroke-width="2" />
      <circle cx="400" cy="340" r="172" fill="none" stroke="${finishHex}" stroke-opacity="0.55" stroke-width="4" />
      <circle cx="400" cy="340" r="145" fill="none" stroke="#26262E" stroke-width="1.5" stroke-dasharray="6 6" />
      <g transform="translate(0, -60)">
        ${spokes.join('')}
      </g>
      <circle cx="400" cy="340" r="48" fill="#121216" stroke="${finishHex}" stroke-opacity="0.6" stroke-width="2.5" />
      <circle cx="400" cy="340" r="18" fill="none" stroke="#1D4ED8" stroke-width="2" />
      <circle cx="400" cy="320" r="3.5" fill="#7C7C8A" />
      <circle cx="419" cy="334" r="3.5" fill="#7C7C8A" />
      <circle cx="412" cy="356" r="3.5" fill="#7C7C8A" />
      <circle cx="388" cy="356" r="3.5" fill="#7C7C8A" />
      <circle cx="381" cy="334" r="3.5" fill="#7C7C8A" />
    </g>
    <text x="400" y="620" text-anchor="middle" fill="#EDEBE4" font-family="sans-serif" font-size="26" font-weight="600" letter-spacing="1.5">${escapeXml(modelName.toUpperCase())}</text>
    <text x="400" y="656" text-anchor="middle" fill="#8E8E9E" font-family="sans-serif" font-size="18" letter-spacing="2">${escapeXml(finishLabel.toUpperCase())}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Captions for the three photos of a listing, in the order of `images`. */
const PHOTO_LABELS: [string, string, string] = ['Front face', 'Three-quarter view', 'Side profile'];

interface RawInventorySeed {
  id: string;
  slug: string;
  modelCode: 'FSA001' | 'FSA002' | 'FSA003' | 'FSA004' | 'FF-1' | 'FF-3';
  sizesAvailable: string;
  finishName: string;
  /** Extra build note from the stock sheet's "Other" column, e.g. "2 piece wheel". */
  otherFinishes?: string;
  compatibleCars: string;
  priceZAR: number;
  stockStatus: string;
  stockQuantitySets: number;
  technicalSpecSheet: string;
  /** Served .glb for the 3D studio (front axle); omit when the wheel has no model yet. */
  modelUrl?: string;
  /** Served .glb for the rear axle of a staggered set. */
  rearModelUrl?: string;
  defaultFinish: WheelFinishId;
  geometry: SpokeGeometryType;
  spokeCount: number;
  /** Colour of the drawn stand-in picture, used only when a listing has no photography. */
  swatchHex: string;
}

/**
 * One traced 3D model per wheel design; every finish of a design shares it and the
 * studio repaints it. FSA001 sets its own front/rear pair on the seed instead.
 */
export const MODEL_URL_BY_CODE: Partial<Record<RawInventorySeed['modelCode'], string>> = {
  FSA002: '/models/wheels/fsa002.glb',
  FSA003: '/models/wheels/fsa003.glb',
  FSA004: '/models/wheels/fsa004.glb',
  'FF-1': '/models/wheels/ff-1.glb',
  'FF-3': '/models/wheels/ff-3.glb',
};

const INVENTORY_SEEDS: RawInventorySeed[] = [
  {
    id: 'wheel-fsa001-black-matte',
    slug: 'fsa001-black-matte',
    modelCode: 'FSA001',
    sizesAvailable: '19 inch / 20 inch',
    finishName: 'Black Matte',
    otherFinishes: '2 piece wheel',
    compatibleCars: 'M3 Sedan (G80)',
    priceZAR: 90000,
    stockStatus: 'In Stock',
    stockQuantitySets: 1,
    technicalSpecSheet: 'PCD 5×112 · ET8/15 · CB66.6',
    modelUrl: '/models/wheels/stf399-front.glb',
    rearModelUrl: '/models/wheels/stf399-rear.glb',
    defaultFinish: 'satin-black',
    geometry: 'y-spoke-forged',
    spokeCount: 10,
    swatchHex: '#484B52',
  },
  {
    id: 'wheel-fsa002-gold',
    slug: 'fsa002-gold',
    modelCode: 'FSA002',
    sizesAvailable: '20 inch / 21 inch',
    finishName: 'Gold',
    compatibleCars: 'M3 Competition Sedan (G80)',
    priceZAR: 75000,
    stockStatus: 'In Stock',
    stockQuantitySets: 1,
    technicalSpecSheet: 'PCD 5×112 · ET8/15 · CB66.6',
    defaultFinish: 'champagne-bronze',
    geometry: 'multi-spoke-gt',
    spokeCount: 10,
    swatchHex: '#D4AF37',
  },
  {
    id: 'wheel-fsa002-hyper-black',
    slug: 'fsa002-hyper-black',
    modelCode: 'FSA002',
    sizesAvailable: '20 inch / 21 inch',
    finishName: 'Hyper Black',
    compatibleCars: 'M3 Competition Sedan (G80)',
    priceZAR: 75000,
    stockStatus: 'In Stock',
    stockQuantitySets: 1,
    technicalSpecSheet: 'PCD 5×112 · ET8/15 · CB66.6',
    defaultFinish: 'dark-gunmetal',
    geometry: 'multi-spoke-gt',
    spokeCount: 10,
    swatchHex: '#6E737B',
  },
  {
    id: 'wheel-fsa002-polished-face',
    slug: 'fsa002-polished-face',
    modelCode: 'FSA002',
    sizesAvailable: '20 inch / 21 inch',
    finishName: 'Polished Face',
    compatibleCars: 'M3 Competition Sedan (G80)',
    priceZAR: 85000,
    stockStatus: 'In Stock',
    stockQuantitySets: 1,
    technicalSpecSheet: 'PCD 5×112 · ET8/15 · CB66.6',
    defaultFinish: 'silver',
    geometry: 'multi-spoke-gt',
    spokeCount: 10,
    swatchHex: '#E8ECEF',
  },
  {
    id: 'wheel-fsa003-silver',
    slug: 'fsa003-silver',
    modelCode: 'FSA003',
    sizesAvailable: '20 inch / 21 inch',
    finishName: 'Silver',
    compatibleCars: 'M3 Sedan (G80)',
    priceZAR: 75000,
    stockStatus: 'In Stock',
    stockQuantitySets: 1,
    technicalSpecSheet: 'PCD 5×112 · ET8/15 · CB66.6',
    defaultFinish: 'silver',
    geometry: 'multi-spoke-gt',
    spokeCount: 10,
    swatchHex: '#D8DCE3',
  },
  {
    id: 'wheel-fsa003-hyper-black',
    slug: 'fsa003-hyper-black',
    modelCode: 'FSA003',
    sizesAvailable: '20 inch / 21 inch',
    finishName: 'Hyper Black',
    compatibleCars: 'M3 Sedan (G80)',
    priceZAR: 75000,
    stockStatus: 'In Stock',
    stockQuantitySets: 1,
    technicalSpecSheet: 'PCD 5×112 · ET8/15 · CB66.6',
    defaultFinish: 'dark-gunmetal',
    geometry: 'multi-spoke-gt',
    spokeCount: 10,
    swatchHex: '#6E737B',
  },
  {
    id: 'wheel-fsa004-silver',
    slug: 'fsa004-silver',
    modelCode: 'FSA004',
    sizesAvailable: '20 inch / 21 inch',
    finishName: 'Silver',
    compatibleCars: 'M3 Competition Sedan (G80)',
    priceZAR: 70000,
    stockStatus: 'In Stock',
    stockQuantitySets: 1,
    technicalSpecSheet: 'PCD 5×112 · ET8/15 · CB66.6',
    defaultFinish: 'silver',
    geometry: 'multi-spoke-gt',
    spokeCount: 12,
    swatchHex: '#D8DCE3',
  },
  {
    id: 'wheel-fsa004-hyper-black',
    slug: 'fsa004-hyper-black',
    modelCode: 'FSA004',
    sizesAvailable: '20 inch / 21 inch',
    finishName: 'Hyper Black',
    compatibleCars: 'M3 Sedan (G80)',
    priceZAR: 70000,
    stockStatus: 'In Stock',
    stockQuantitySets: 1,
    technicalSpecSheet: 'PCD 5×112 · ET8/15 · CB66.6',
    defaultFinish: 'dark-gunmetal',
    geometry: 'multi-spoke-gt',
    spokeCount: 12,
    swatchHex: '#6E737B',
  },
  {
    id: 'wheel-fsa004-gloss-black',
    slug: 'fsa004-gloss-black',
    modelCode: 'FSA004',
    sizesAvailable: '20 inch / 21 inch',
    finishName: 'Gloss Black',
    compatibleCars: 'M3 Sedan (G80)',
    priceZAR: 70000,
    stockStatus: 'In Stock',
    stockQuantitySets: 1,
    technicalSpecSheet: 'PCD 5×112 · ET8/15 · CB66.6',
    defaultFinish: 'satin-black',
    geometry: 'multi-spoke-gt',
    spokeCount: 12,
    swatchHex: '#3A3D45',
  },
  {
    id: 'wheel-ff1-silver',
    slug: 'ff-1-silver',
    modelCode: 'FF-1',
    sizesAvailable: '20 inch / 21 inch',
    finishName: 'Silver',
    compatibleCars: 'M3 Sedan (G80)',
    priceZAR: 80000,
    stockStatus: 'In Stock',
    stockQuantitySets: 1,
    technicalSpecSheet: 'PCD 5×112 · ET15/20 · CB66.6',
    defaultFinish: 'silver',
    geometry: 'y-spoke-forged',
    spokeCount: 10,
    swatchHex: '#D8DCE3',
  },
  {
    id: 'wheel-ff3-pure-bronze',
    slug: 'ff-3-pure-bronze',
    modelCode: 'FF-3',
    sizesAvailable: '20 inch / 21 inch',
    finishName: 'Pure Bronze',
    compatibleCars: 'M3 Competition Sedan (G80)',
    priceZAR: 80000,
    stockStatus: 'In Stock',
    stockQuantitySets: 1,
    technicalSpecSheet: 'PCD 5×112 · ET15/17 · CB66.6',
    defaultFinish: 'champagne-bronze',
    geometry: 'y-spoke-forged',
    spokeCount: 10,
    swatchHex: '#B8864D',
  },
  {
    id: 'wheel-ff3-glossy-black',
    slug: 'ff-3-glossy-black',
    modelCode: 'FF-3',
    sizesAvailable: '20 inch / 21 inch',
    finishName: 'Glossy Black',
    compatibleCars: 'M3 Competition Sedan (G80)',
    priceZAR: 80000,
    stockStatus: 'In Stock',
    stockQuantitySets: 1,
    technicalSpecSheet: 'PCD 5×112 · ET15/17 · CB66.6',
    defaultFinish: 'satin-black',
    geometry: 'y-spoke-forged',
    spokeCount: 10,
    swatchHex: '#3A3D45',
  },
  {
    id: 'wheel-ff3-liquid-metal',
    slug: 'ff-3-liquid-metal',
    modelCode: 'FF-3',
    sizesAvailable: '20 inch / 21 inch',
    finishName: 'Liquid Metal',
    compatibleCars: 'M3 Competition Sedan (G80)',
    priceZAR: 95000,
    stockStatus: 'In Stock',
    stockQuantitySets: 2,
    technicalSpecSheet: 'PCD 5×112 · ET15/17 · CB66.6',
    defaultFinish: 'silver',
    geometry: 'y-spoke-forged',
    spokeCount: 10,
    swatchHex: '#E2E6EC',
  },
  {
    id: 'wheel-ff1-liquid-metal',
    slug: 'ff-1-liquid-metal',
    modelCode: 'FF-1',
    sizesAvailable: '20 inch / 21 inch',
    finishName: 'Liquid Metal',
    compatibleCars: 'M3 Competition Sedan (G80)',
    priceZAR: 95000,
    stockStatus: 'In Stock',
    stockQuantitySets: 2,
    technicalSpecSheet: 'PCD 5×112 · ET15/17 · CB66.6',
    defaultFinish: 'silver',
    geometry: 'y-spoke-forged',
    spokeCount: 10,
    swatchHex: '#E2E6EC',
  },
];

export const BRAND_WHEELS: BrandWheelItem[] = INVENTORY_SEEDS.map((seed) => {
  const fullFinishLabel = seed.otherFinishes
    ? `${seed.finishName} · ${seed.otherFinishes}`
    : seed.finishName;
  const setsLabel = `${seed.stockQuantitySets} ${seed.stockQuantitySets === 1 ? 'set' : 'sets'}`;

  return {
    id: seed.id,
    slug: seed.slug,
    model: `${seed.modelCode} — ${seed.finishName}`,
    modelCode: seed.modelCode,
    series: `${seed.sizesAvailable.toUpperCase()} · ${seed.stockStatus.toUpperCase()} (${setsLabel.toUpperCase()})`,
    headline: `${seed.modelCode} (${fullFinishLabel}) for BMW ${seed.compatibleCars}.`,
    editorialLead: `${seed.sizesAvailable} for BMW ${seed.compatibleCars}. ${seed.technicalSpecSheet}.`,
    editorialBody: `${seed.stockStatus}: ${setsLabel}, finished in ${fullFinishLabel}. The price is for a complete set of four.`,
    marques: ['BMW'],
    geometry: seed.geometry,
    spokeCount: seed.spokeCount,
    defaultFinish: seed.defaultFinish,
    availableFinishes: [seed.defaultFinish],
    priceZAR: seed.priceZAR,
    sizesAvailable: seed.sizesAvailable,
    finishName: seed.finishName,
    otherFinishes: seed.otherFinishes,
    compatibleCars: seed.compatibleCars,
    stockStatus: seed.stockStatus,
    stockQuantitySets: seed.stockQuantitySets,
    technicalSpecSheet: seed.technicalSpecSheet,
    modelUrl: seed.modelUrl ?? MODEL_URL_BY_CODE[seed.modelCode],
    rearModelUrl: seed.rearModelUrl,
    // Listings with no photography yet get a plain drawn stand-in; customWheels.json supplies real photos.
    images: [
      createWheelPlaceholderDataUrl(seed.modelCode, fullFinishLabel, seed.spokeCount, seed.swatchHex),
      createWheelPlaceholderDataUrl(seed.modelCode, fullFinishLabel, seed.spokeCount, seed.swatchHex),
      createWheelPlaceholderDataUrl(seed.modelCode, fullFinishLabel, seed.spokeCount, seed.swatchHex),
    ],
    imageLabels: PHOTO_LABELS,
    specs: {
      product: `${seed.modelCode} (${fullFinishLabel}) — ${setsLabel} in stock`,
      // The sheet does not give an alloy grade, so none is stated.
      material: seed.otherFinishes ? `Forged aluminium (${seed.otherFinishes})` : 'Forged aluminium',
      diameters: `${seed.sizesAvailable} (${seed.compatibleCars})`,
      finishOptions: fullFinishLabel,
      testing: seed.technicalSpecSheet,
      // Left empty until the owner supplies written warranty terms; the spec table hides empty rows.
      warranty: '',
    },
  };
});

/**
 * The "Cars that this is available for" options, verbatim from pages 2–3 of the BMW M /
 * M Performance stock sheet. Every `BrandWheelItem.compatibleCars` value must be one of
 * these (checked in catalogue.test.ts); the admin page offers them in its car picker.
 */
export const BMW_M_MODEL_OPTIONS: readonly string[] = [
  'M135i xDrive / M135 xDrive (F40 / F70)',
  'M235i xDrive Gran Coupe (F44 / F74)',
  'M240i Coupe (G42)',
  'M240i xDrive Coupe (G42)',
  'M2 Coupe (G87)',
  'M2 CS (G87)',
  'M340i Sedan (G20)',
  'M340i xDrive Sedan (G20)',
  'M340i xDrive Touring (G21)',
  'M340d xDrive Sedan / Touring (G20 / G21)',
  'M3 Sedan (G80)',
  'M3 Competition Sedan (G80)',
  'M3 Competition M xDrive Sedan (G80)',
  'M3 Competition M xDrive Touring (G81)',
  'M3 CS (G80)',
  'M3 CS Touring (G81)',
  'M440i Coupe (G22)',
  'M440i xDrive Coupe (G22)',
  'M440i Convertible (G23)',
  'M440i xDrive Convertible (G23)',
  'M440i Gran Coupe (G26)',
  'M440i xDrive Gran Coupe (G26)',
  'M440d xDrive (G22 / G23 / G26)',
  'M4 Coupe (G82)',
  'M4 Competition Coupe (G82)',
  'M4 Competition M xDrive Coupe (G82)',
  'M4 Competition Convertible (G83)',
  'M4 Competition M xDrive Convertible (G83)',
  'M4 CS (G82)',
  'M4 CSL (G82)',
  'M550i xDrive Sedan (G30)',
  'M5 Sedan (G90)',
  'M5 Touring (G99)',
  'M760e xDrive (G70)',
  'M850i xDrive Coupe (G15)',
  'M850i xDrive Convertible (G14)',
  'M850i xDrive Gran Coupe (G16)',
  'M8 Competition Coupe (F92)',
  'M8 Competition Convertible (F91)',
  'M8 Competition Gran Coupe (F93)',
  'Z4 M40i Roadster (G29)',
  'X1 M35i xDrive (U11)',
  'X2 M35i xDrive (U10)',
  'X3 M40i / X3 M40d (G01)',
  'X3 M50 xDrive (G45)',
  'X3 M (F97)',
  'X3 M Competition (F97)',
  'X4 M40i / X4 M40d (G02)',
  'X4 M (F98)',
  'X4 M Competition (F98)',
  'X5 M50i / X5 M50d (G05)',
  'X5 M60i xDrive (G05)',
  'X5 M (F95)',
  'X5 M Competition (F95)',
  'X6 M50i / X6 M50d (G06)',
  'X6 M60i xDrive (G06)',
  'X6 M (F96)',
  'X6 M Competition (F96)',
  'X7 M50i / X7 M50d (G07)',
  'X7 M60i xDrive (G07)',
  'XM (G09)',
  'XM Label / Label Red (G09)',
  'XM 50e (G09)',
  'i4 M50 (G26)',
  'i4 M60 xDrive (G26)',
  'i5 M60 xDrive Sedan (G60)',
  'i5 M60 xDrive Touring (G61)',
  'i7 M70 xDrive (G70)',
  'iX M60 (I20)',
  'iX M70 xDrive (I20)',
];

/**
 * The stock rule: a listing is shown only when it is marked "In Stock" and at least one set is
 * available. Anything else is hidden everywhere, never greyed out or sold as made to order.
 */
export function isInStock(wheel: Pick<BrandWheelItem, 'stockStatus' | 'stockQuantitySets'>): boolean {
  return (
    (wheel.stockStatus ?? '').trim().toLowerCase() === 'in stock' &&
    (wheel.stockQuantitySets ?? 0) > 0
  );
}

/**
 * Entries in customWheels.json. One whose slug matches a stock-sheet listing only adds to it
 * (today: the photography), so the stock sheet stays the single source for names, sizes and prices.
 * Any other entry is a complete listing, as written by `npm run add-wheel`.
 */
type FileWheel = Partial<BrandWheelItem> & { slug: string };

const fileCustomBrandWheels = (
  Array.isArray(customWheelsJson?.brandWheels) ? customWheelsJson.brandWheels : []
) as FileWheel[];

function resolveFileWheel(entry: FileWheel): BrandWheelItem {
  const seed = BRAND_WHEELS.find((w) => w.slug.toLowerCase() === entry.slug.toLowerCase());
  return (seed ? { ...seed, ...entry } : entry) as BrandWheelItem;
}

/**
 * Every listing a visitor may see: in stock only, each one design in one finish.
 * `runtimeCustomWheels` are the wheels added in this browser from the admin page.
 */
export function getAllBrandWheels(runtimeCustomWheels: BrandWheelItem[] = []): BrandWheelItem[] {
  const combined = [
    ...runtimeCustomWheels,
    ...fileCustomBrandWheels.map(resolveFileWheel),
    ...BRAND_WHEELS,
  ];
  const seen = new Set<string>();
  return combined
    .filter((w) => {
      const key = w.slug.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .filter(isInStock)
    .map((w) => ({ ...w, availableFinishes: [w.defaultFinish] }));
}

/** The other in-stock listings of the same design (same model code), in catalogue order. */
export function getSiblingListings(
  wheel: BrandWheelItem,
  runtimeCustomWheels: BrandWheelItem[] = []
): BrandWheelItem[] {
  if (!wheel.modelCode) return [];
  return getAllBrandWheels(runtimeCustomWheels).filter(
    (w) => w.modelCode === wheel.modelCode && w.slug.toLowerCase() !== wheel.slug.toLowerCase()
  );
}

/** How long a colour that is not in stock takes to arrive, as told to customers. */
export const TO_ORDER_LEAD_TIME = '3 months';

/** The notice shown wherever a colour that is not in stock is offered. */
export const TO_ORDER_NOTICE = `Colours not in stock are made to order. A lead time of ${TO_ORDER_LEAD_TIME} applies.`;

/**
 * The colours of this wheel's design that are not in stock: every colour in WHEEL_FINISHES that
 * no in-stock listing of the same design has. They can be ordered, with TO_ORDER_LEAD_TIME.
 */
export function getToOrderFinishes(
  wheel: BrandWheelItem,
  runtimeCustomWheels: BrandWheelItem[] = []
): WheelFinishOption[] {
  const inStock = new Set<WheelFinishId>([
    wheel.defaultFinish,
    ...getSiblingListings(wheel, runtimeCustomWheels).map((w) => w.defaultFinish),
  ]);
  return Object.values(WHEEL_FINISHES).filter((finish) => !inStock.has(finish.id));
}

export function filterWheelsByMarque(
  marque: MarqueFilter,
  runtimeCustomWheels: BrandWheelItem[] = []
): BrandWheelItem[] {
  const allWheels = getAllBrandWheels(runtimeCustomWheels);
  if (marque === 'ALL') {
    return allWheels;
  }
  return allWheels.filter((wheel) => wheel.marques.includes(marque));
}

/** The in-stock listing for a slug (or a bare model code such as "FSA002"); undefined when sold or unknown. */
export function findWheelBySlug(
  slug: string,
  runtimeCustomWheels: BrandWheelItem[] = []
): BrandWheelItem | undefined {
  const normalized = slug.toLowerCase();
  return getAllBrandWheels(runtimeCustomWheels).find(
    (w) =>
      w.slug.toLowerCase() === normalized ||
      w.modelCode?.toLowerCase() === normalized
  );
}

export function getWheelBySlug(
  slug: string,
  runtimeCustomWheels: BrandWheelItem[] = []
): BrandWheelItem {
  return (
    findWheelBySlug(slug, runtimeCustomWheels) ?? getAllBrandWheels(runtimeCustomWheels)[0]
  );
}

/**
 * Format a Rand amount for display: "R 75,000" or "R 75,000.00".
 *
 * All prices on the site are South African Rand. This deliberately uses the
 * comma-thousands / point-decimal convention that SA retail sites and the
 * catalogue's existing copy use. (The SANS / Reserve Bank style is a space
 * separator and decimal comma, "R 75 000,00"; switch to Intl.NumberFormat with
 * the 'en-ZA' locale and currency 'ZAR' if that house style is preferred.)
 */
export function formatZAR(amountZAR: number, includeDecimals = false): string {
  const safe = Number.isFinite(amountZAR) ? amountZAR : 0;
  const digits = includeDecimals ? 2 : 0;
  const number = safe.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return `R ${number}`;
}

export function getWheelImages(wheel: BrandWheelItem): {
  images: [string, string, string];
  labels: [string, string, string];
} {
  if (wheel.images && wheel.images.length === 3) {
    return {
      images: wheel.images,
      labels: wheel.imageLabels && wheel.imageLabels.length === 3 ? wheel.imageLabels : PHOTO_LABELS,
    };
  }

  const finishText = wheel.finishName || 'Forged';
  const spokes = wheel.spokeCount || 10;
  const placeholder = () => createWheelPlaceholderDataUrl(wheel.model, finishText, spokes);
  const primary = wheel.imageUrl || placeholder();
  const second = wheel.galleryImages?.[0] || placeholder();
  const third = wheel.galleryImages?.[1] || placeholder();

  return { images: [primary, second, third], labels: PHOTO_LABELS };
}
