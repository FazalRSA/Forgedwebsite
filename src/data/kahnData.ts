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
  compatibleStoreProductSlug: string;
}

export interface StoreProductItem {
  id: string;
  slug: string;
  wheelSlug: string;
  title: string;
  shortModel: string;
  make: string;
  model: string;
  yearRange: string;
  partCategory: 'ALLOY WHEELS' | 'CARBON AERODYNAMICS' | 'EXHAUST SYSTEMS' | 'SUSPENSION';
  /** Price for a complete set of 4, in South African Rand (whole Rand). */
  priceZAR: number;
  /** Previous Rand price; when higher than priceZAR the product is shown on sale. */
  originalPriceZAR?: number;
  isSale?: boolean;
  isLatest?: boolean;
  isReserve?: boolean;
  setLabel: string;
  diameterBadge: '19-20"' | '20"' | '20-21"' | '22"' | '23"';
  geometry: SpokeGeometryType;
  spokeCount: number;
  defaultFinish: WheelFinishId;
  availableFinishes: WheelFinishId[];
  imageUrl?: string;
  galleryImages?: string[];
  /** Photoreal .glb rim model; falls back to the linked brand wheel's modelUrl when absent. */
  modelUrl?: string;
  technicalSpecs: {
    productName: string;
    frontWheelSize: string;
    rearWheelSize: string;
    colour: string;
    material: string;
    construction: string;
    boltPattern: string;
    partNo: string;
    loadRating: string;
    centerBore: string;
  };
  aboutBullets: string[];
  importantInfoBullets: string[];
}

function createWheelPlaceholderDataUrl(
  slotNumber: number,
  modelName: string,
  finishLabel: string,
  angleLabel: string,
  spokeCount = 10,
  finishHex = '#D8DCE3'
): string {
  const numStr = String(slotNumber).padStart(2, '0');
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
    <g stroke="#26262E" stroke-width="1" opacity="0.55">
      <line x1="0" y1="400" x2="800" y2="400" stroke-dasharray="4 6" />
      <line x1="400" y1="0" x2="400" y2="800" stroke-dasharray="4 6" />
    </g>
    <g stroke="#33333E" stroke-width="2" fill="none">
      <path d="M 48 76 L 48 48 L 76 48" />
      <path d="M 724 48 L 752 48 L 752 76" />
      <path d="M 48 724 L 48 752 L 76 752" />
      <path d="M 724 752 L 752 752 L 752 724" />
    </g>
    <g>
      <circle cx="400" cy="340" r="190" fill="none" stroke="#2B2B36" stroke-width="2" />
      <circle cx="400" cy="340" r="172" fill="none" stroke="${finishHex}" stroke-opacity="0.55" stroke-width="4" />
      <circle cx="400" cy="340" r="145" fill="none" stroke="#26262E" stroke-width="1.5" stroke-dasharray="6 6" />
      <g transform="translate(0, -60)">
        ${spokes.join('')}
      </g>
      <circle cx="400" cy="340" r="48" fill="#121216" stroke="${finishHex}" stroke-opacity="0.6" stroke-width="2.5" />
      <circle cx="400" cy="340" r="18" fill="none" stroke="#FF5500" stroke-width="2" />
      <circle cx="400" cy="320" r="3.5" fill="#7C7C8A" />
      <circle cx="419" cy="334" r="3.5" fill="#7C7C8A" />
      <circle cx="412" cy="356" r="3.5" fill="#7C7C8A" />
      <circle cx="388" cy="356" r="3.5" fill="#7C7C8A" />
      <circle cx="381" cy="334" r="3.5" fill="#7C7C8A" />
    </g>
    <rect x="235" y="575" width="330" height="32" rx="16" fill="#16161D" stroke="#2B2B36" stroke-width="1" />
    <text x="400" y="596" text-anchor="middle" fill="#FF5500" font-family="monospace" font-size="13" font-weight="700" letter-spacing="3">WHEEL PLACEHOLDER ${numStr}</text>
    <text x="400" y="642" text-anchor="middle" fill="#F5F5F7" font-family="sans-serif" font-size="22" font-weight="600" letter-spacing="1.5">${modelName.toUpperCase()} · ${finishLabel.toUpperCase()}</text>
    <text x="400" y="672" text-anchor="middle" fill="#8E8E9E" font-family="monospace" font-size="12" letter-spacing="2.5">${angleLabel.toUpperCase()}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

interface RawInventorySeed {
  slot: number;
  id: string;
  slug: string;
  modelCode: 'FSA001' | 'FSA002' | 'FSA003' | 'FSA004' | 'FF-1' | 'FF-3';
  sizesAvailable: string;
  finishName: string;
  otherFinishes?: string;
  compatibleCars: string;
  priceZAR: number;
  stockStatus: string;
  stockQuantitySets: number;
  technicalSpecSheet: string;
  defaultFinish: WheelFinishId;
  availableFinishes: WheelFinishId[];
  geometry: SpokeGeometryType;
  spokeCount: number;
  swatchHex: string;
}

const INVENTORY_SEEDS: RawInventorySeed[] = [
  {
    slot: 1,
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
    defaultFinish: 'satin-black',
    availableFinishes: ['satin-black'],
    geometry: 'y-spoke-forged',
    spokeCount: 10,
    swatchHex: '#484B52',
  },
  {
    slot: 2,
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
    availableFinishes: ['champagne-bronze', 'dark-gunmetal', 'silver'],
    geometry: 'ten-spoke-ring',
    spokeCount: 10,
    swatchHex: '#D4AF37',
  },
  {
    slot: 3,
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
    availableFinishes: ['dark-gunmetal', 'champagne-bronze', 'silver'],
    geometry: 'ten-spoke-ring',
    spokeCount: 10,
    swatchHex: '#6E737B',
  },
  {
    slot: 4,
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
    availableFinishes: ['silver', 'champagne-bronze', 'dark-gunmetal'],
    geometry: 'ten-spoke-ring',
    spokeCount: 10,
    swatchHex: '#E8ECEF',
  },
  {
    slot: 5,
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
    availableFinishes: ['silver', 'dark-gunmetal'],
    geometry: 'split-five-rs',
    spokeCount: 10,
    swatchHex: '#D8DCE3',
  },
  {
    slot: 6,
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
    availableFinishes: ['dark-gunmetal', 'silver'],
    geometry: 'split-five-rs',
    spokeCount: 10,
    swatchHex: '#6E737B',
  },
  {
    slot: 7,
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
    availableFinishes: ['silver', 'dark-gunmetal', 'satin-black'],
    geometry: 'multi-spoke-gt',
    spokeCount: 12,
    swatchHex: '#D8DCE3',
  },
  {
    slot: 8,
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
    availableFinishes: ['dark-gunmetal', 'silver', 'satin-black'],
    geometry: 'multi-spoke-gt',
    spokeCount: 12,
    swatchHex: '#6E737B',
  },
  {
    slot: 9,
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
    availableFinishes: ['satin-black', 'silver', 'dark-gunmetal'],
    geometry: 'multi-spoke-gt',
    spokeCount: 12,
    swatchHex: '#3A3D45',
  },
  {
    slot: 10,
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
    availableFinishes: ['silver'],
    geometry: 'directional-turbine',
    spokeCount: 10,
    swatchHex: '#D8DCE3',
  },
  {
    slot: 11,
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
    availableFinishes: ['champagne-bronze', 'satin-black', 'silver'],
    geometry: 'y-spoke-forged',
    spokeCount: 10,
    swatchHex: '#B8864D',
  },
  {
    slot: 12,
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
    availableFinishes: ['satin-black', 'champagne-bronze', 'silver'],
    geometry: 'y-spoke-forged',
    spokeCount: 10,
    swatchHex: '#3A3D45',
  },
  {
    slot: 13,
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
    availableFinishes: ['silver', 'champagne-bronze', 'satin-black'],
    geometry: 'y-spoke-forged',
    spokeCount: 10,
    swatchHex: '#E2E6EC',
  },
  {
    slot: 14,
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
    availableFinishes: ['silver'],
    geometry: 'directional-turbine',
    spokeCount: 10,
    swatchHex: '#E2E6EC',
  },
];

export const BRAND_WHEELS: BrandWheelItem[] = INVENTORY_SEEDS.map((seed) => {
  const fullFinishLabel = seed.otherFinishes
    ? `${seed.finishName} · ${seed.otherFinishes}`
    : seed.finishName;

  return {
    id: seed.id,
    slug: seed.slug,
    model: `${seed.modelCode} — ${seed.finishName}`,
    modelCode: seed.modelCode,
    series: `${seed.sizesAvailable.toUpperCase()} · ${seed.stockStatus.toUpperCase()} (${seed.stockQuantitySets} ${
      seed.stockQuantitySets === 1 ? 'SET' : 'SETS'
    })`,
    headline: `${seed.modelCode} (${fullFinishLabel}) for BMW ${seed.compatibleCars}.`,
    editorialLead: `${seed.sizesAvailable} staggered fitment engineered specifically for BMW ${seed.compatibleCars} (${seed.technicalSpecSheet}).`,
    editorialBody: `Direct bolt-on specification (${seed.technicalSpecSheet}) finished in ${fullFinishLabel}. Currently ${seed.stockStatus.toLowerCase()} with ${seed.stockQuantitySets} complete ${
      seed.stockQuantitySets === 1 ? 'set' : 'sets'
    } ready for immediate dispatch.`,
    marques: ['BMW'],
    geometry: seed.geometry,
    spokeCount: seed.spokeCount,
    defaultFinish: seed.defaultFinish,
    availableFinishes: seed.availableFinishes,
    priceZAR: seed.priceZAR,
    sizesAvailable: seed.sizesAvailable,
    finishName: seed.finishName,
    otherFinishes: seed.otherFinishes,
    compatibleCars: seed.compatibleCars,
    stockStatus: seed.stockStatus,
    stockQuantitySets: seed.stockQuantitySets,
    technicalSpecSheet: seed.technicalSpecSheet,
    images: [
      createWheelPlaceholderDataUrl(
        seed.slot,
        seed.modelCode,
        fullFinishLabel,
        'Picture One · Front Face Placeholder',
        seed.spokeCount,
        seed.swatchHex
      ),
      createWheelPlaceholderDataUrl(
        seed.slot,
        seed.modelCode,
        fullFinishLabel,
        'Picture Two · 3/4 Concave Placeholder',
        seed.spokeCount,
        seed.swatchHex
      ),
      createWheelPlaceholderDataUrl(
        seed.slot,
        seed.modelCode,
        fullFinishLabel,
        'Picture Three · Rim Barrel Placeholder',
        seed.spokeCount,
        seed.swatchHex
      ),
    ],
    imageLabels: [
      `Picture 1 · ${seed.modelCode} ${seed.finishName}`,
      `Picture 2 · ${seed.sizesAvailable} Profile`,
      `Picture 3 · ${seed.technicalSpecSheet}`,
    ],
    specs: {
      product: `${seed.modelCode} (${fullFinishLabel}) — ${seed.stockQuantitySets} ${
        seed.stockQuantitySets === 1 ? 'Set' : 'Sets'
      } In Stock`,
      material: seed.otherFinishes
        ? `6061-T6 Forged Aluminium (${seed.otherFinishes})`
        : '6061-T6 Aerospace Forged Aluminium',
      diameters: `${seed.sizesAvailable} (${seed.compatibleCars})`,
      finishOptions: fullFinishLabel,
      testing: seed.technicalSpecSheet,
      warranty: '3-Year Structural & Finish Guarantee',
    },
    compatibleStoreProductSlug: storeProductSlugForWheel(seed.slug),
  };
});

/** Store product slug for a stock-sheet wheel: exactly one sellable set per sheet row. */
export function storeProductSlugForWheel(wheelSlug: string): string {
  return `bmw-m3-${wheelSlug}`;
}

/**
 * Hand-written store product slugs that shipped before the store was tied 1:1 to the stock
 * sheet. Old links and saved wishlists resolve to the sheet row they used to represent.
 */
const LEGACY_STORE_PRODUCT_SLUGS: Record<string, string> = {
  'bmw-m3-type-52-forged': storeProductSlugForWheel('fsa001-black-matte'),
  'bmw-m3-rs-3-0': storeProductSlugForWheel('fsa003-silver'),
  'bmw-m3-ld-rs-forged': storeProductSlugForWheel('fsa002-gold'),
  'bmw-m3-g06-aero-forged': storeProductSlugForWheel('fsa004-silver'),
  'bmw-m3-le-mans-gt-forged': storeProductSlugForWheel('ff-1-silver'),
  'bmw-m2-mondial-retro-forged': storeProductSlugForWheel('ff-1-liquid-metal'),
  'bmw-m4-defiant-forged': storeProductSlugForWheel('ff-3-pure-bronze'),
  'bmw-m5-vengeance-forged': storeProductSlugForWheel('ff-3-liquid-metal'),
};

function slugifyLabel(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** "PCD 5×112 · ET8/15 · CB66.6" → bolt pattern, front/rear offsets and centre bore. */
function parseTechnicalSpecSheet(spec: string): {
  boltPattern: string;
  etFront: string;
  etRear: string;
  centerBore: string;
} {
  const pcd = /PCD\s*(\d)\s*[×x]\s*(\d+)/i.exec(spec);
  const et = /ET\s*(\d+)\s*\/\s*(\d+)/i.exec(spec);
  const cb = /CB\s*([\d.]+)/i.exec(spec);
  return {
    boltPattern: pcd ? `${pcd[1]} X ${pcd[2]}` : '5 X 112',
    etFront: et?.[1] ?? '',
    etRear: et?.[2] ?? '',
    centerBore: cb?.[1] ?? '66.6',
  };
}

/** "19 inch / 20 inch" → front and rear diameters plus the collection filter badge. */
function parseSizesAvailable(sizes: string): {
  front: string;
  rear: string;
  badge: StoreProductItem['diameterBadge'];
} {
  const m = /(\d+)\s*inch\s*\/\s*(\d+)\s*inch/i.exec(sizes);
  const front = m?.[1] ?? '20';
  const rear = m?.[2] ?? '21';
  return { front, rear, badge: `${front}-${rear}"` as StoreProductItem['diameterBadge'] };
}

/**
 * Builds the sellable store product for one stock-sheet row. Every value comes from the sheet
 * (model code, finish, sizes, spec string, price, stock, compatible car); nothing the sheet does
 * not state is invented, so load rating is "on request" and construction is only "2 piece" where
 * the sheet says so.
 */
function buildStoreProductFromSeed(seed: RawInventorySeed): StoreProductItem {
  const slug = storeProductSlugForWheel(seed.slug);
  const finishUpper = seed.finishName.toUpperCase();
  const { front, rear, badge } = parseSizesAvailable(seed.sizesAvailable);
  const { boltPattern, etFront, etRear, centerBore } = parseTechnicalSpecSheet(
    seed.technicalSpecSheet
  );
  const sets = seed.stockQuantitySets;
  const setsWord = sets === 1 ? 'SET' : 'SETS';
  const isTwoPiece = /2\s*piece/i.test(seed.otherFinishes ?? '');
  const otherSuffix = seed.otherFinishes ? ` (${seed.otherFinishes.toUpperCase()})` : '';

  return {
    id: `prod-${slug}`,
    slug,
    wheelSlug: seed.slug,
    title: `BMW ${seed.compatibleCars.toUpperCase()} — ${seed.modelCode} ${finishUpper}${otherSuffix}`,
    shortModel: `${seed.modelCode} · ${finishUpper}`,
    make: 'BMW',
    model: 'M3',
    yearRange: '2024 ONWARDS',
    partCategory: 'ALLOY WHEELS',
    priceZAR: seed.priceZAR,
    isLatest: false,
    isReserve: seed.stockStatus.toLowerCase() === 'in stock',
    setLabel: `${seed.stockStatus.toUpperCase()} · ${sets} ${setsWord}`,
    diameterBadge: badge,
    geometry: seed.geometry,
    spokeCount: seed.spokeCount,
    defaultFinish: seed.defaultFinish,
    availableFinishes: seed.availableFinishes,
    technicalSpecs: {
      productName: `${seed.modelCode} — ${finishUpper}${otherSuffix}`,
      frontWheelSize: `${front} INCH · ET${etFront}`,
      rearWheelSize: `${rear} INCH · ET${etRear}`,
      colour: finishUpper,
      material: 'FORGED ALUMINIUM',
      construction: isTwoPiece ? '2 PIECE FORGED WHEEL' : 'FORGED',
      boltPattern,
      partNo: `${seed.modelCode}-${slugifyLabel(seed.finishName).toUpperCase()}`,
      loadRating: 'ON REQUEST',
      centerBore: `${centerBore} MM`,
    },
    aboutBullets: [
      `${seed.modelCode} in ${seed.finishName} for the BMW ${seed.compatibleCars}: ${seed.sizesAvailable} staggered set of four.`,
      `Technical specification: ${seed.technicalSpecSheet}.`,
    ],
    importantInfoBullets: [
      `${seed.stockStatus}: ${sets} complete ${sets === 1 ? 'set' : 'sets'} available for immediate dispatch.`,
      'Price shown is for a complete set of four wheels in South African Rand.',
    ],
  };
}

/** One store product per stock-sheet row, in sheet order. */
export const STORE_PRODUCTS: StoreProductItem[] = INVENTORY_SEEDS.map(buildStoreProductFromSeed);

export interface FitmentModelNode {
  model: string;
  years: string[];
  parts: string[];
  collectionSlug: string;
  bannerColorHex: string;
  bannerAccentHex: string;
  vehicleLabel: string;
  /** Stock-sheet "Cars that this is available for" names grouped under this model line. */
  variants: string[];
  seoDescriptionShort: string;
  seoDescriptionFull: string;
  productSlugs: string[];
}

/**
 * The "Cars that this is available for" options, verbatim from pages 2–3 of the BMW M /
 * M Performance stock sheet. Every `BrandWheelItem.compatibleCars` value must be one of
 * these, and every entry belongs to exactly one fitment node below (via `variants`).
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

interface SheetModelFamily {
  /** Short model-line name shown in the fitment finder's MODEL step. */
  model: string;
  /** Production windows offered in the YEAR step, newest first. */
  years: string[];
  /** Human label used in the collection banner, e.g. "M340i / M340d (G20 / G21)". */
  vehicleLabel: string;
  /** Entries from BMW_M_MODEL_OPTIONS that belong to this model line. */
  variants: string[];
}

/**
 * Stock-sheet model lines with no in-stock allocation yet. Each resolves to an enquiry-only
 * collection so the fitment finder knows every car on the sheet. Move a line into a
 * hand-written node above (with `productSlugs`) once sets are allocated to it.
 */
const SHEET_ENQUIRY_FAMILIES: SheetModelFamily[] = [
  {
    model: 'M135',
    years: ['2024 ONWARDS', '2019 - 2024'],
    vehicleLabel: 'M135 (F40 / F70)',
    variants: ['M135i xDrive / M135 xDrive (F40 / F70)'],
  },
  {
    model: 'M235',
    years: ['2024 ONWARDS', '2020 - 2024'],
    vehicleLabel: 'M235 GRAN COUPE (F44 / F74)',
    variants: ['M235i xDrive Gran Coupe (F44 / F74)'],
  },
  {
    model: 'M240',
    years: ['2021 ONWARDS'],
    vehicleLabel: 'M240i COUPE (G42)',
    variants: ['M240i Coupe (G42)', 'M240i xDrive Coupe (G42)'],
  },
  {
    model: 'M2',
    years: ['2023 ONWARDS'],
    vehicleLabel: 'M2 (G87)',
    variants: ['M2 Coupe (G87)', 'M2 CS (G87)'],
  },
  {
    model: 'M340',
    years: ['2019 ONWARDS'],
    vehicleLabel: 'M340i / M340d (G20 / G21)',
    variants: [
      'M340i Sedan (G20)',
      'M340i xDrive Sedan (G20)',
      'M340i xDrive Touring (G21)',
      'M340d xDrive Sedan / Touring (G20 / G21)',
    ],
  },
  {
    model: 'M440',
    years: ['2020 ONWARDS'],
    vehicleLabel: 'M440i / M440d (G22 / G23 / G26)',
    variants: [
      'M440i Coupe (G22)',
      'M440i xDrive Coupe (G22)',
      'M440i Convertible (G23)',
      'M440i xDrive Convertible (G23)',
      'M440i Gran Coupe (G26)',
      'M440i xDrive Gran Coupe (G26)',
      'M440d xDrive (G22 / G23 / G26)',
    ],
  },
  {
    model: 'M4',
    years: ['2024 ONWARDS'],
    vehicleLabel: 'M4 (G82 / G83)',
    variants: [
      'M4 Coupe (G82)',
      'M4 Competition Coupe (G82)',
      'M4 Competition M xDrive Coupe (G82)',
      'M4 Competition Convertible (G83)',
      'M4 Competition M xDrive Convertible (G83)',
      'M4 CS (G82)',
      'M4 CSL (G82)',
    ],
  },
  {
    model: 'M550',
    years: ['2017 - 2023'],
    vehicleLabel: 'M550i xDRIVE (G30)',
    variants: ['M550i xDrive Sedan (G30)'],
  },
  {
    model: 'M5',
    years: ['2024 ONWARDS'],
    vehicleLabel: 'M5 (G90 / G99)',
    variants: ['M5 Sedan (G90)', 'M5 Touring (G99)'],
  },
  {
    model: 'M760',
    years: ['2023 ONWARDS'],
    vehicleLabel: 'M760e xDRIVE (G70)',
    variants: ['M760e xDrive (G70)'],
  },
  {
    model: 'M850',
    years: ['2019 ONWARDS'],
    vehicleLabel: 'M850i xDRIVE (G14 / G15 / G16)',
    variants: [
      'M850i xDrive Coupe (G15)',
      'M850i xDrive Convertible (G14)',
      'M850i xDrive Gran Coupe (G16)',
    ],
  },
  {
    model: 'M8',
    years: ['2019 ONWARDS'],
    vehicleLabel: 'M8 COMPETITION (F91 / F92 / F93)',
    variants: [
      'M8 Competition Coupe (F92)',
      'M8 Competition Convertible (F91)',
      'M8 Competition Gran Coupe (F93)',
    ],
  },
  {
    model: 'Z4 M40i',
    years: ['2019 ONWARDS'],
    vehicleLabel: 'Z4 M40i (G29)',
    variants: ['Z4 M40i Roadster (G29)'],
  },
  {
    model: 'X1 M35i',
    years: ['2023 ONWARDS'],
    vehicleLabel: 'X1 M35i (U11)',
    variants: ['X1 M35i xDrive (U11)'],
  },
  {
    model: 'X2 M35i',
    years: ['2024 ONWARDS'],
    vehicleLabel: 'X2 M35i (U10)',
    variants: ['X2 M35i xDrive (U10)'],
  },
  {
    model: 'X3 M',
    years: ['2024 ONWARDS', '2018 - 2024'],
    vehicleLabel: 'X3 M40i / M50 / X3 M (G01 / G45 / F97)',
    variants: [
      'X3 M40i / X3 M40d (G01)',
      'X3 M50 xDrive (G45)',
      'X3 M (F97)',
      'X3 M Competition (F97)',
    ],
  },
  {
    model: 'X4 M',
    years: ['2018 - 2025'],
    vehicleLabel: 'X4 M40i / X4 M (G02 / F98)',
    variants: ['X4 M40i / X4 M40d (G02)', 'X4 M (F98)', 'X4 M Competition (F98)'],
  },
  {
    model: 'X5 M',
    years: ['2019 ONWARDS'],
    vehicleLabel: 'X5 M50i / M60i / X5 M (G05 / F95)',
    variants: [
      'X5 M50i / X5 M50d (G05)',
      'X5 M60i xDrive (G05)',
      'X5 M (F95)',
      'X5 M Competition (F95)',
    ],
  },
  {
    model: 'X6 M',
    years: ['2020 ONWARDS'],
    vehicleLabel: 'X6 M50i / M60i / X6 M (G06 / F96)',
    variants: [
      'X6 M50i / X6 M50d (G06)',
      'X6 M60i xDrive (G06)',
      'X6 M (F96)',
      'X6 M Competition (F96)',
    ],
  },
  {
    model: 'X7 M',
    years: ['2019 ONWARDS'],
    vehicleLabel: 'X7 M50i / M60i (G07)',
    variants: ['X7 M50i / X7 M50d (G07)', 'X7 M60i xDrive (G07)'],
  },
  {
    model: 'XM',
    years: ['2023 ONWARDS'],
    vehicleLabel: 'XM (G09)',
    variants: ['XM (G09)', 'XM Label / Label Red (G09)', 'XM 50e (G09)'],
  },
  {
    model: 'i4 M',
    years: ['2022 ONWARDS'],
    vehicleLabel: 'i4 M50 / M60 (G26)',
    variants: ['i4 M50 (G26)', 'i4 M60 xDrive (G26)'],
  },
  {
    model: 'i5 M',
    years: ['2023 ONWARDS'],
    vehicleLabel: 'i5 M60 (G60 / G61)',
    variants: ['i5 M60 xDrive Sedan (G60)', 'i5 M60 xDrive Touring (G61)'],
  },
  {
    model: 'i7 M',
    years: ['2023 ONWARDS'],
    vehicleLabel: 'i7 M70 (G70)',
    variants: ['i7 M70 xDrive (G70)'],
  },
  {
    model: 'iX M',
    years: ['2022 ONWARDS'],
    vehicleLabel: 'iX M60 / M70 (I20)',
    variants: ['iX M60 (I20)', 'iX M70 xDrive (I20)'],
  },
];

const ENQUIRY_BANNER_PALETTE: Array<[string, string]> = [
  ['#1F2A44', '#3D5A99'],
  ['#3A1F1F', '#8A3B3B'],
  ['#1E3A2F', '#3C7A5E'],
  ['#2E2A1E', '#7A6A3C'],
  ['#26262E', '#5C6080'],
];

function slugifyFitmentModel(model: string): string {
  return model
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildEnquiryFitmentNode(family: SheetModelFamily, index: number): FitmentModelNode {
  const [bannerColorHex, bannerAccentHex] =
    ENQUIRY_BANNER_PALETTE[index % ENQUIRY_BANNER_PALETTE.length];
  return {
    model: family.model,
    years: family.years,
    parts: ['ALLOY WHEELS'],
    collectionSlug: `bmw-${slugifyFitmentModel(family.model)}-alloy-wheels`,
    bannerColorHex,
    bannerAccentHex,
    vehicleLabel: `BMW ${family.vehicleLabel} - ALLOY WHEELS`,
    variants: family.variants,
    seoDescriptionShort: `Forged alloy wheel fitment for the BMW ${family.vehicleLabel}. No in-stock sets are allocated to this model yet; enquire for availability.`,
    seoDescriptionFull: `FORGED Custom Wheels lists the BMW ${family.vehicleLabel} as a supported fitment (${family.variants.join(
      ', '
    )}). No complete sets are currently allocated to this model in stock. Send an enquiry with your chassis code and we will confirm sizing, offsets, centre bore and lead time.`,
    productSlugs: [],
  };
}

const SHEET_ENQUIRY_NODES: FitmentModelNode[] = SHEET_ENQUIRY_FAMILIES.map(buildEnquiryFitmentNode);

export const VEHICLE_FITMENT_TREE: Record<string, FitmentModelNode[]> = {
  BMW: [
    {
      model: 'M3',
      years: ['2024 ONWARDS', '2020 - 2023'],
      variants: [
        'M3 Sedan (G80)',
        'M3 Competition Sedan (G80)',
        'M3 Competition M xDrive Sedan (G80)',
        'M3 Competition M xDrive Touring (G81)',
        'M3 CS (G80)',
        'M3 CS Touring (G81)',
      ],
      parts: ['ALLOY WHEELS'],
      collectionSlug: 'bmw-m3-2024-onwards-alloy-wheels',
      bannerColorHex: '#0F4C35',
      bannerAccentHex: '#1B7A56',
      vehicleLabel: 'BMW M3 (G80) - IN-STOCK ALLOY WHEELS',
      seoDescriptionShort:
        'In-stock forged alloy wheel sets (FSA001, FSA002, FSA003, FSA004, FF-1, FF-3) engineered for the BMW M3 Sedan & M3 Competition Sedan (G80).',
      seoDescriptionFull:
        'Explore our in-stock inventory of forged alloy wheels for the BMW G80 M3 Sedan and M3 Competition Sedan. Every set features direct 5x112 PCD and 66.6mm hub-centric bore fitment.',
      productSlugs: STORE_PRODUCTS.map((product) => product.slug),
    },
    ...SHEET_ENQUIRY_NODES,
  ],
};

const fileCustomBrandWheels = (
  Array.isArray(customWheelsJson?.brandWheels) ? customWheelsJson.brandWheels : []
) as BrandWheelItem[];

const fileCustomStoreProducts = (
  Array.isArray(customWheelsJson?.storeProducts) ? customWheelsJson.storeProducts : []
) as StoreProductItem[];

export function getAllBrandWheels(runtimeCustomWheels: BrandWheelItem[] = []): BrandWheelItem[] {
  const combined = [...runtimeCustomWheels, ...fileCustomBrandWheels, ...BRAND_WHEELS];
  const seen = new Set<string>();
  return combined.filter((w) => {
    const key = w.slug.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getAllStoreProducts(
  runtimeCustomProducts: StoreProductItem[] = []
): StoreProductItem[] {
  const combined = [...runtimeCustomProducts, ...fileCustomStoreProducts, ...STORE_PRODUCTS];
  const seen = new Set<string>();
  return combined.filter((p) => {
    const key = p.slug.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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

export function getAvailableMakes(): string[] {
  return Object.keys(VEHICLE_FITMENT_TREE);
}

export function getModelsForMake(make: string): string[] {
  const nodes = VEHICLE_FITMENT_TREE[make];
  if (!nodes) return [];
  return nodes.map((n) => n.model);
}

export function getFitmentNode(make: string, model: string): FitmentModelNode | undefined {
  const nodes = VEHICLE_FITMENT_TREE[make];
  if (!nodes) return undefined;
  return nodes.find((n) => n.model === model);
}

export function getMatchingProductsForFitment(
  make: string,
  model: string,
  runtimeCustomProducts: StoreProductItem[] = []
): StoreProductItem[] {
  const node = getFitmentNode(make, model);
  if (!node) return [];
  const allProducts = getAllStoreProducts(runtimeCustomProducts);
  const dynamicMatches = [...runtimeCustomProducts, ...fileCustomStoreProducts].filter(
    (p) => p.make.toUpperCase() === make.toUpperCase() && p.model.toUpperCase() === model.toUpperCase()
  );
  const staticMatches = node.productSlugs
    .map((slug) => allProducts.find((p) => p.slug === slug))
    .filter((p): p is StoreProductItem => Boolean(p));

  const seen = new Set<string>();
  return [...dynamicMatches, ...staticMatches].filter((p) => {
    if (seen.has(p.slug)) return false;
    seen.add(p.slug);
    return true;
  });
}

export function resolveCollectionBySlug(
  slug: string,
  runtimeCustomProducts: StoreProductItem[] = []
): {
  node: FitmentModelNode;
  make: string;
  products: StoreProductItem[];
} {
  const normalized = slug.toLowerCase();
  const allNodes = Object.entries(VEHICLE_FITMENT_TREE).flatMap(([make, nodes]) =>
    nodes.map((node) => ({ make, node }))
  );
  // 1. Exact collection slug. 2. Legacy shorthand such as "bmw-m3-2024-alloy-wheels": the
  // slug must start with "<make>-<model>-" as a whole segment, so "bmw-m340-…" can never
  // resolve to the M3 node.
  const match =
    allNodes.find(({ node }) => node.collectionSlug === normalized) ||
    allNodes.find(({ make, node }) =>
      normalized.startsWith(`${make.toLowerCase()}-${slugifyFitmentModel(node.model)}-`)
    );
  if (match) {
    const products = getMatchingProductsForFitment(
      match.make,
      match.node.model,
      runtimeCustomProducts
    );
    return { node: match.node, make: match.make, products };
  }
  const fallbackNode = VEHICLE_FITMENT_TREE.BMW[0];
  const fallbackProducts = getMatchingProductsForFitment(
    'BMW',
    fallbackNode.model,
    runtimeCustomProducts
  );
  return { node: fallbackNode, make: 'BMW', products: fallbackProducts };
}

export function getStoreProductBySlug(
  slug: string,
  runtimeCustomProducts: StoreProductItem[] = []
): StoreProductItem {
  const requested = slug.toLowerCase();
  const normalized = LEGACY_STORE_PRODUCT_SLUGS[requested] ?? requested;
  const allProducts = getAllStoreProducts(runtimeCustomProducts);
  const found = allProducts.find(
    (p) => p.slug.toLowerCase() === normalized || p.wheelSlug.toLowerCase() === normalized
  );
  return found ?? allProducts[0];
}

export type StoreSortOption = 'featured' | 'price-asc' | 'price-desc' | 'latest';

export function filterAndSortStoreProducts(
  products: StoreProductItem[],
  options: {
    saleOnly?: boolean;
    diameter?: string | null;
    sortBy?: StoreSortOption;
  }
): StoreProductItem[] {
  let result = [...products];
  if (options.saleOnly) {
    result = result.filter((p) => Boolean(p.isSale));
  }
  if (options.diameter) {
    result = result.filter((p) => p.diameterBadge === options.diameter);
  }
  if (options.sortBy === 'price-asc') {
    result.sort((a, b) => a.priceZAR - b.priceZAR);
  } else if (options.sortBy === 'price-desc') {
    result.sort((a, b) => b.priceZAR - a.priceZAR);
  } else if (options.sortBy === 'latest') {
    result.sort((a, b) => Number(Boolean(b.isLatest)) - Number(Boolean(a.isLatest)));
  }
  return result;
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
      labels:
        wheel.imageLabels && wheel.imageLabels.length === 3
          ? wheel.imageLabels
          : ['Picture 1 · Front Face', 'Picture 2 · 3/4 Concave', 'Picture 3 · Rim Barrel'],
    };
  }

  const finishText = wheel.finishName || 'Forged';
  const primary =
    wheel.imageUrl ||
    createWheelPlaceholderDataUrl(1, wheel.model, finishText, 'Picture One · Front Face', wheel.spokeCount || 10);
  const second =
    wheel.galleryImages?.[0] ||
    createWheelPlaceholderDataUrl(2, wheel.model, finishText, 'Picture Two · 3/4 Concave', wheel.spokeCount || 10);
  const third =
    wheel.galleryImages?.[1] ||
    createWheelPlaceholderDataUrl(3, wheel.model, finishText, 'Picture Three · Rim Barrel', wheel.spokeCount || 10);

  return {
    images: [primary, second, third],
    labels: ['Picture 1 · Front Face', 'Picture 2 · 3/4 Concave', 'Picture 3 · Rim Barrel'],
  };
}

/**
 * Resolves the 3 real studio-photo slots for a Store PDP.
 * StoreProductItem.imageUrl/galleryImages are seeded empty for most products, even when
 * real photography already exists for the matching wheel on the Brand Showcase
 * (linked via wheelSlug === BrandWheelItem.slug). Falls back to that wheel's images
 * before generating a placeholder, so real renders reach the page closest to the sale.
 */
export function getStoreProductImages(
  product: StoreProductItem,
  runtimeCustomWheels: BrandWheelItem[] = []
): { images: [string, string, string]; labels: [string, string, string] } {
  const matchedWheel = getAllBrandWheels(runtimeCustomWheels).find(
    (w) => w.slug.toLowerCase() === product.wheelSlug.toLowerCase()
  );
  const wheelImages = matchedWheel ? getWheelImages(matchedWheel) : undefined;
  const finishText = WHEEL_FINISHES[product.defaultFinish]?.name || 'Forged';

  const primary =
    product.imageUrl ||
    wheelImages?.images[0] ||
    createWheelPlaceholderDataUrl(1, product.shortModel, finishText, 'Picture One · Front Face', product.spokeCount);
  const second =
    product.galleryImages?.[0] ||
    wheelImages?.images[1] ||
    createWheelPlaceholderDataUrl(2, product.shortModel, finishText, 'Picture Two · 3/4 Concave', product.spokeCount);
  const third =
    product.galleryImages?.[1] ||
    wheelImages?.images[2] ||
    createWheelPlaceholderDataUrl(3, product.shortModel, finishText, 'Picture Three · Rim Barrel', product.spokeCount);

  return {
    images: [primary, second, third],
    labels: ['Picture 1 · Front Face', 'Picture 2 · 3/4 Concave', 'Picture 3 · Rim Barrel'],
  };
}
