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
  basePriceGBP: number;
  priceZAR?: number;
  priceFormatted?: string;
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
  priceGBP: number;
  originalPriceGBP?: number;
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
  priceFormatted: string;
  stockStatus: string;
  stockQuantitySets: number;
  technicalSpecSheet: string;
  defaultFinish: WheelFinishId;
  availableFinishes: WheelFinishId[];
  geometry: SpokeGeometryType;
  spokeCount: number;
  swatchHex: string;
  compatibleStoreProductSlug: string;
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
    priceFormatted: 'R 90,000',
    stockStatus: 'In Stock',
    stockQuantitySets: 1,
    technicalSpecSheet: 'PCD 5×112 · ET8/15 · CB66.6',
    defaultFinish: 'satin-black',
    availableFinishes: ['satin-black'],
    geometry: 'y-spoke-forged',
    spokeCount: 10,
    swatchHex: '#484B52',
    compatibleStoreProductSlug: 'bmw-m3-type-52-forged',
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
    priceFormatted: 'R 75,000',
    stockStatus: 'In Stock',
    stockQuantitySets: 1,
    technicalSpecSheet: 'PCD 5×112 · ET8/15 · CB66.6',
    defaultFinish: 'champagne-bronze',
    availableFinishes: ['champagne-bronze', 'dark-gunmetal', 'silver'],
    geometry: 'ten-spoke-ring',
    spokeCount: 10,
    swatchHex: '#D4AF37',
    compatibleStoreProductSlug: 'bmw-m3-ld-rs-forged',
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
    priceFormatted: 'R 75,000',
    stockStatus: 'In Stock',
    stockQuantitySets: 1,
    technicalSpecSheet: 'PCD 5×112 · ET8/15 · CB66.6',
    defaultFinish: 'dark-gunmetal',
    availableFinishes: ['dark-gunmetal', 'champagne-bronze', 'silver'],
    geometry: 'ten-spoke-ring',
    spokeCount: 10,
    swatchHex: '#6E737B',
    compatibleStoreProductSlug: 'bmw-m3-ld-rs-forged',
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
    priceFormatted: 'R 85,000',
    stockStatus: 'In Stock',
    stockQuantitySets: 1,
    technicalSpecSheet: 'PCD 5×112 · ET8/15 · CB66.6',
    defaultFinish: 'silver',
    availableFinishes: ['silver', 'champagne-bronze', 'dark-gunmetal'],
    geometry: 'ten-spoke-ring',
    spokeCount: 10,
    swatchHex: '#E8ECEF',
    compatibleStoreProductSlug: 'bmw-m3-ld-rs-forged',
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
    priceFormatted: 'R 75,000',
    stockStatus: 'In Stock',
    stockQuantitySets: 1,
    technicalSpecSheet: 'PCD 5×112 · ET8/15 · CB66.6',
    defaultFinish: 'silver',
    availableFinishes: ['silver', 'dark-gunmetal'],
    geometry: 'split-five-rs',
    spokeCount: 10,
    swatchHex: '#D8DCE3',
    compatibleStoreProductSlug: 'bmw-m3-rs-3-0',
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
    priceFormatted: 'R 75,000',
    stockStatus: 'In Stock',
    stockQuantitySets: 1,
    technicalSpecSheet: 'PCD 5×112 · ET8/15 · CB66.6',
    defaultFinish: 'dark-gunmetal',
    availableFinishes: ['dark-gunmetal', 'silver'],
    geometry: 'split-five-rs',
    spokeCount: 10,
    swatchHex: '#6E737B',
    compatibleStoreProductSlug: 'bmw-m3-rs-3-0',
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
    priceFormatted: 'R 70,000',
    stockStatus: 'In Stock',
    stockQuantitySets: 1,
    technicalSpecSheet: 'PCD 5×112 · ET8/15 · CB66.6',
    defaultFinish: 'silver',
    availableFinishes: ['silver', 'dark-gunmetal', 'satin-black'],
    geometry: 'multi-spoke-gt',
    spokeCount: 12,
    swatchHex: '#D8DCE3',
    compatibleStoreProductSlug: 'bmw-m3-g06-aero-forged',
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
    priceFormatted: 'R 70,000',
    stockStatus: 'In Stock',
    stockQuantitySets: 1,
    technicalSpecSheet: 'PCD 5×112 · ET8/15 · CB66.6',
    defaultFinish: 'dark-gunmetal',
    availableFinishes: ['dark-gunmetal', 'silver', 'satin-black'],
    geometry: 'multi-spoke-gt',
    spokeCount: 12,
    swatchHex: '#6E737B',
    compatibleStoreProductSlug: 'bmw-m3-g06-aero-forged',
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
    priceFormatted: 'R 70,000',
    stockStatus: 'In Stock',
    stockQuantitySets: 1,
    technicalSpecSheet: 'PCD 5×112 · ET8/15 · CB66.6',
    defaultFinish: 'satin-black',
    availableFinishes: ['satin-black', 'silver', 'dark-gunmetal'],
    geometry: 'multi-spoke-gt',
    spokeCount: 12,
    swatchHex: '#3A3D45',
    compatibleStoreProductSlug: 'bmw-m3-g06-aero-forged',
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
    priceFormatted: 'R 80,000',
    stockStatus: 'In Stock',
    stockQuantitySets: 1,
    technicalSpecSheet: 'PCD 5×112 · ET15/20 · CB66.6',
    defaultFinish: 'silver',
    availableFinishes: ['silver'],
    geometry: 'directional-turbine',
    spokeCount: 10,
    swatchHex: '#D8DCE3',
    compatibleStoreProductSlug: 'bmw-m3-le-mans-gt-forged',
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
    priceFormatted: 'R 80,000',
    stockStatus: 'In Stock',
    stockQuantitySets: 1,
    technicalSpecSheet: 'PCD 5×112 · ET15/17 · CB66.6',
    defaultFinish: 'champagne-bronze',
    availableFinishes: ['champagne-bronze', 'satin-black', 'silver'],
    geometry: 'y-spoke-forged',
    spokeCount: 10,
    swatchHex: '#B8864D',
    compatibleStoreProductSlug: 'bmw-m4-defiant-forged',
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
    priceFormatted: 'R 80,000',
    stockStatus: 'In Stock',
    stockQuantitySets: 1,
    technicalSpecSheet: 'PCD 5×112 · ET15/17 · CB66.6',
    defaultFinish: 'satin-black',
    availableFinishes: ['satin-black', 'champagne-bronze', 'silver'],
    geometry: 'y-spoke-forged',
    spokeCount: 10,
    swatchHex: '#3A3D45',
    compatibleStoreProductSlug: 'bmw-m4-defiant-forged',
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
    priceFormatted: 'R 95,000',
    stockStatus: 'In Stock',
    stockQuantitySets: 2,
    technicalSpecSheet: 'PCD 5×112 · ET15/17 · CB66.6',
    defaultFinish: 'silver',
    availableFinishes: ['silver', 'champagne-bronze', 'satin-black'],
    geometry: 'y-spoke-forged',
    spokeCount: 10,
    swatchHex: '#E2E6EC',
    compatibleStoreProductSlug: 'bmw-m5-vengeance-forged',
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
    priceFormatted: 'R 95,000',
    stockStatus: 'In Stock',
    stockQuantitySets: 2,
    technicalSpecSheet: 'PCD 5×112 · ET15/17 · CB66.6',
    defaultFinish: 'silver',
    availableFinishes: ['silver'],
    geometry: 'directional-turbine',
    spokeCount: 10,
    swatchHex: '#E2E6EC',
    compatibleStoreProductSlug: 'bmw-m2-mondial-retro-forged',
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
    basePriceGBP: seed.priceZAR,
    priceZAR: seed.priceZAR,
    priceFormatted: seed.priceFormatted,
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
    compatibleStoreProductSlug: seed.compatibleStoreProductSlug,
  };
});

export const STORE_PRODUCTS: StoreProductItem[] = [
  {
    id: 'prod-bmw-m3-type-52',
    slug: 'bmw-m3-type-52-forged',
    wheelSlug: 'fsa001-black-matte',
    title: 'BMW M3 SEDAN (G80) — FSA001 BLACK MATTE (2 PIECE WHEEL)',
    shortModel: 'FSA001 · BLACK MATTE',
    make: 'BMW',
    model: 'M3',
    yearRange: '2024 ONWARDS',
    partCategory: 'ALLOY WHEELS',
    priceGBP: 90000,
    isLatest: true,
    isReserve: true,
    setLabel: 'IN STOCK · 1 SET',
    diameterBadge: '20-21"',
    geometry: 'y-spoke-forged',
    spokeCount: 10,
    defaultFinish: 'satin-black',
    availableFinishes: ['satin-black', 'silver', 'champagne-bronze', 'dark-gunmetal'],
    technicalSpecs: {
      productName: 'FSA001 — BLACK MATTE (2 PIECE WHEEL)',
      frontWheelSize: '19 INCH · ET8',
      rearWheelSize: '20 INCH · ET15',
      colour: 'BLACK MATTE',
      material: 'ALUMINIUM (6061-T6)',
      construction: '2 PIECE FORGED WHEEL',
      boltPattern: '5 X 112',
      partNo: 'WAKB9250B0F-2-KIT',
      loadRating: '850 KG PER WHEEL',
      centerBore: '66.6 MM (DIRECT HUB-CENTRIC)',
    },
    aboutBullets: [
      'Direct fitment for BMW M3 Sedan (G80) — 19 inch front / 20 inch rear 2-piece wheel.',
      'Technical specification: PCD 5x112 · ET8/15 · CB66.6.',
    ],
    importantInfoBullets: [
      'In Stock (1 Set available for immediate dispatch).',
    ],
  },
  {
    id: 'prod-bmw-m3-rs-3-0',
    slug: 'bmw-m3-rs-3-0',
    wheelSlug: 'fsa003-silver',
    title: 'BMW M3 SEDAN (G80) — FSA003 SILVER / HYPER BLACK',
    shortModel: 'WHEEL PLACEHOLDER 03',
    make: 'BMW',
    model: 'M3',
    yearRange: '2024 ONWARDS',
    partCategory: 'ALLOY WHEELS',
    priceGBP: 75000,
    isLatest: true,
    isReserve: true,
    setLabel: 'IN STOCK · 1 SET',
    diameterBadge: '20-21"',
    geometry: 'split-five-rs',
    spokeCount: 10,
    defaultFinish: 'silver',
    availableFinishes: ['silver', 'dark-gunmetal'],
    technicalSpecs: {
      productName: 'FSA003 — 20" / 21" FORGED',
      frontWheelSize: '20 INCH · ET8',
      rearWheelSize: '21 INCH · ET15',
      colour: 'SILVER / HYPER BLACK',
      material: 'ALUMINIUM',
      construction: 'FORGED',
      boltPattern: '5 X 112',
      partNo: 'WAKB9300S0F-2-KIT',
      loadRating: '850 KG PER WHEEL',
      centerBore: '66.6 MM',
    },
    aboutBullets: [
      'Engineered for BMW M3 Sedan (G80) in 20 inch / 21 inch staggered diameters.',
      'Technical specification: PCD 5x112 · ET8/15 · CB66.6.',
    ],
    importantInfoBullets: [
      'In Stock: 1 set in Silver and 1 set in Hyper Black.',
    ],
  },
  {
    id: 'prod-bmw-m3-ld-rs',
    slug: 'bmw-m3-ld-rs-forged',
    wheelSlug: 'fsa002-gold',
    title: 'BMW M3 COMPETITION SEDAN (G80) — FSA002 FORGED',
    shortModel: 'FSA002 · GOLD / HYPER BLACK / POLISHED',
    make: 'BMW',
    model: 'M3',
    yearRange: '2024 ONWARDS',
    partCategory: 'ALLOY WHEELS',
    priceGBP: 75000,
    isLatest: true,
    isReserve: false,
    setLabel: 'IN STOCK · 3 SETS',
    diameterBadge: '20"',
    geometry: 'ten-spoke-ring',
    spokeCount: 10,
    defaultFinish: 'champagne-bronze',
    availableFinishes: ['champagne-bronze', 'dark-gunmetal', 'silver'],
    technicalSpecs: {
      productName: 'FSA002 — M3 COMPETITION SEDAN (G80)',
      frontWheelSize: '20 INCH · ET8',
      rearWheelSize: '21 INCH · ET15',
      colour: 'GOLD / HYPER BLACK / POLISHED FACE',
      material: 'ALUMINIUM',
      construction: 'FORGED',
      boltPattern: '5 X 112',
      partNo: 'WAKB9100S0F-4-KIT',
      loadRating: '840 KG PER WHEEL',
      centerBore: '66.6 MM',
    },
    aboutBullets: [
      'Available in Gold (R 75,000), Hyper Black (R 75,000), and Polished Face (R 85,000).',
    ],
    importantInfoBullets: [
      'PCD 5x112 · ET8/15 · CB66.6 — In Stock.',
    ],
  },
  {
    id: 'prod-bmw-m3-g06-aero',
    slug: 'bmw-m3-g06-aero-forged',
    wheelSlug: 'fsa004-silver',
    title: 'BMW M3 SEDAN (G80) — FSA004 FORGED (20" / 21")',
    shortModel: 'FSA004 · SILVER / HYPER / GLOSS BLACK',
    make: 'BMW',
    model: 'M3',
    yearRange: '2024 ONWARDS',
    partCategory: 'ALLOY WHEELS',
    priceGBP: 70000,
    isLatest: true,
    isReserve: true,
    setLabel: 'IN STOCK · 3 SETS',
    diameterBadge: '20-21"',
    geometry: 'multi-spoke-gt',
    spokeCount: 12,
    defaultFinish: 'silver',
    availableFinishes: ['silver', 'dark-gunmetal', 'satin-black'],
    technicalSpecs: {
      productName: 'FSA004 — M3 (G80)',
      frontWheelSize: '20 INCH · ET8',
      rearWheelSize: '21 INCH · ET15',
      colour: 'SILVER / HYPER BLACK / GLOSS BLACK',
      material: 'ALUMINIUM',
      construction: 'FORGED',
      boltPattern: '5 X 112',
      partNo: 'WAKB9606G0F-2-KIT',
      loadRating: '860 KG PER WHEEL',
      centerBore: '66.6 MM',
    },
    aboutBullets: [
      'In stock in Silver, Hyper Black, and Gloss Black for BMW M3 (G80).',
    ],
    importantInfoBullets: [
      'PCD 5x112 · ET8/15 · CB66.6 — 1 set per finish in stock.',
    ],
  },
  {
    id: 'prod-bmw-m3-le-mans-gt',
    slug: 'bmw-m3-le-mans-gt-forged',
    wheelSlug: 'ff-1-silver',
    title: 'BMW M3 SEDAN (G80) — FF-1 SILVER / LIQUID METAL',
    shortModel: 'FF-1 · 20" / 21"',
    make: 'BMW',
    model: 'M3',
    yearRange: '2024 ONWARDS',
    partCategory: 'ALLOY WHEELS',
    priceGBP: 80000,
    originalPriceGBP: 95000,
    isSale: true,
    isLatest: false,
    isReserve: true,
    setLabel: 'IN STOCK · 3 SETS',
    diameterBadge: '20"',
    geometry: 'directional-turbine',
    spokeCount: 10,
    defaultFinish: 'silver',
    availableFinishes: ['silver'],
    technicalSpecs: {
      productName: 'FF-1 — M3 (G80)',
      frontWheelSize: '20 INCH · ET15',
      rearWheelSize: '21 INCH · ET20 / ET17',
      colour: 'SILVER / LIQUID METAL',
      material: 'ALUMINIUM',
      construction: 'FORGED',
      boltPattern: '5 X 112',
      partNo: 'WAKB9416C0F-2-KIT',
      loadRating: '850 KG PER WHEEL',
      centerBore: '66.6 MM',
    },
    aboutBullets: [
      'Available in Silver (ET15/20, 1 set) and Liquid Metal (ET15/17, 2 sets).',
    ],
    importantInfoBullets: [
      'Direct 5x112 CB66.6 fitment for BMW M3 Sedan & Competition (G80).',
    ],
  },
  {
    id: 'prod-bmw-m2-mondial',
    slug: 'bmw-m2-mondial-retro-forged',
    wheelSlug: 'ff-1-liquid-metal',
    title: 'BMW M3 COMPETITION (G80) — FF-1 LIQUID METAL',
    shortModel: 'FF-1 · LIQUID METAL',
    make: 'BMW',
    model: 'M2',
    yearRange: '2023 ONWARDS',
    partCategory: 'ALLOY WHEELS',
    priceGBP: 95000,
    originalPriceGBP: 98000,
    isSale: true,
    isLatest: true,
    isReserve: false,
    setLabel: 'IN STOCK · 2 SETS',
    diameterBadge: '20"',
    geometry: 'directional-turbine',
    spokeCount: 10,
    defaultFinish: 'silver',
    availableFinishes: ['silver'],
    technicalSpecs: {
      productName: 'FF-1 LIQUID METAL — 20" / 21"',
      frontWheelSize: '20 INCH · ET15',
      rearWheelSize: '21 INCH · ET17',
      colour: 'LIQUID METAL',
      material: 'ALUMINIUM',
      construction: 'FORGED',
      boltPattern: '5 X 112',
      partNo: 'WAKB8710G0F-4-KIT',
      loadRating: '850 KG PER WHEEL',
      centerBore: '66.6 MM',
    },
    aboutBullets: [
      '2 sets in stock in Liquid Metal finish (PCD 5x112 · ET15/17 · CB66.6).',
    ],
    importantInfoBullets: [
      'Staggered 20 inch / 21 inch set of 4 wheels.',
    ],
  },
  {
    id: 'prod-bmw-m4-defiant',
    slug: 'bmw-m4-defiant-forged',
    wheelSlug: 'ff-3-pure-bronze',
    title: 'BMW M3 COMPETITION (G80) — FF-3 PURE BRONZE / GLOSSY BLACK',
    shortModel: 'FF-3 · PURE BRONZE / GLOSSY BLACK',
    make: 'BMW',
    model: 'M4',
    yearRange: '2024 ONWARDS',
    partCategory: 'ALLOY WHEELS',
    priceGBP: 80000,
    originalPriceGBP: 85000,
    isSale: true,
    isLatest: true,
    isReserve: false,
    setLabel: 'IN STOCK · 2 SETS',
    diameterBadge: '20"',
    geometry: 'y-spoke-forged',
    spokeCount: 10,
    defaultFinish: 'champagne-bronze',
    availableFinishes: ['champagne-bronze', 'satin-black', 'silver'],
    technicalSpecs: {
      productName: 'FF-3 — 20" / 21" FORGED',
      frontWheelSize: '20 INCH · ET15',
      rearWheelSize: '21 INCH · ET17',
      colour: 'PURE BRONZE / GLOSSY BLACK',
      material: 'ALUMINIUM',
      construction: 'FORGED',
      boltPattern: '5 X 112',
      partNo: 'WAKB8200B0F-4-KIT',
      loadRating: '900 KG PER WHEEL',
      centerBore: '66.6 MM',
    },
    aboutBullets: [
      'In stock in Pure Bronze (1 set) and Glossy Black (1 set) for M3 Competition (G80).',
    ],
    importantInfoBullets: [
      'PCD 5x112 · ET15/17 · CB66.6.',
    ],
  },
  {
    id: 'prod-bmw-m5-vengeance',
    slug: 'bmw-m5-vengeance-forged',
    wheelSlug: 'ff-3-liquid-metal',
    title: 'BMW M3 COMPETITION (G80) — FF-3 LIQUID METAL',
    shortModel: 'FF-3 · LIQUID METAL',
    make: 'BMW',
    model: 'M5',
    yearRange: '2024 ONWARDS',
    partCategory: 'ALLOY WHEELS',
    priceGBP: 95000,
    isLatest: true,
    isReserve: true,
    setLabel: 'IN STOCK · 2 SETS',
    diameterBadge: '22"',
    geometry: 'y-spoke-forged',
    spokeCount: 10,
    defaultFinish: 'silver',
    availableFinishes: ['silver', 'champagne-bronze', 'satin-black'],
    technicalSpecs: {
      productName: 'FF-3 LIQUID METAL — 20" / 21"',
      frontWheelSize: '20 INCH · ET15',
      rearWheelSize: '21 INCH · ET17',
      colour: 'LIQUID METAL',
      material: 'ALUMINIUM',
      construction: 'FORGED',
      boltPattern: '5 X 112',
      partNo: 'WAKB9000S0F-4-KIT',
      loadRating: '980 KG PER WHEEL',
      centerBore: '66.6 MM',
    },
    aboutBullets: [
      '2 sets in stock in Liquid Metal finish (PCD 5x112 · ET15/17 · CB66.6).',
    ],
    importantInfoBullets: [
      'Immediate allocation available.',
    ],
  },
];

export interface FitmentModelNode {
  model: string;
  years: string[];
  parts: string[];
  collectionSlug: string;
  bannerColorHex: string;
  bannerAccentHex: string;
  vehicleLabel: string;
  seoDescriptionShort: string;
  seoDescriptionFull: string;
  productSlugs: string[];
}

export const VEHICLE_FITMENT_TREE: Record<string, FitmentModelNode[]> = {
  BMW: [
    {
      model: 'M3',
      years: ['2024 ONWARDS', '2020 - 2023'],
      parts: ['ALLOY WHEELS'],
      collectionSlug: 'bmw-m3-2024-onwards-alloy-wheels',
      bannerColorHex: '#0F4C35',
      bannerAccentHex: '#1B7A56',
      vehicleLabel: 'BMW M3 (G80) - IN-STOCK ALLOY WHEELS',
      seoDescriptionShort:
        'In-stock forged alloy wheel sets (FSA001, FSA002, FSA003, FSA004, FF-1, FF-3) engineered for the BMW M3 Sedan & M3 Competition Sedan (G80).',
      seoDescriptionFull:
        'Explore our in-stock inventory of forged alloy wheels for the BMW G80 M3 Sedan and M3 Competition Sedan. Every set features direct 5x112 PCD and 66.6mm hub-centric bore fitment.',
      productSlugs: [
        'bmw-m3-type-52-forged',
        'bmw-m3-rs-3-0',
        'bmw-m3-ld-rs-forged',
        'bmw-m3-g06-aero-forged',
        'bmw-m3-le-mans-gt-forged',
      ],
    },
    {
      model: 'M2',
      years: ['2023 ONWARDS'],
      parts: ['ALLOY WHEELS'],
      collectionSlug: 'bmw-m2-2023-onwards-alloy-wheels',
      bannerColorHex: '#1D3557',
      bannerAccentHex: '#457B9D',
      vehicleLabel: 'BMW M2 G87 (2023 ONWARDS) - ALLOY WHEELS',
      seoDescriptionShort:
        'Staggered 20"/21" 5x112 CB66.6 wheel sets compatible with G8x BMW M platforms.',
      seoDescriptionFull:
        'Shared G80 platform hub geometry (PCD 5x112, CB 66.6mm) ensures direct bolt-on fitment with factory BMW TPMS and floating center caps.',
      productSlugs: [
        'bmw-m2-mondial-retro-forged',
        'bmw-m3-type-52-forged',
        'bmw-m3-ld-rs-forged',
        'bmw-m3-g06-aero-forged',
      ],
    },
    {
      model: 'M4',
      years: ['2024 ONWARDS'],
      parts: ['ALLOY WHEELS'],
      collectionSlug: 'bmw-m4-2024-onwards-alloy-wheels',
      bannerColorHex: '#2B2D42',
      bannerAccentHex: '#5C6080',
      vehicleLabel: 'BMW M4 G82 (2024 ONWARDS) - ALLOY WHEELS',
      seoDescriptionShort:
        'Forged 5x112 CB66.6 wheel sets engineered for BMW M3/M4 Competition platforms.',
      seoDescriptionFull:
        'Forged wheel sets engineered for BMW G80/G82 M platforms with ET8/15 and ET15/17 staggered offsets.',
      productSlugs: [
        'bmw-m3-type-52-forged',
        'bmw-m3-rs-3-0',
        'bmw-m4-defiant-forged',
        'bmw-m3-le-mans-gt-forged',
        'bmw-m3-g06-aero-forged',
      ],
    },
    {
      model: 'M5',
      years: ['2024 ONWARDS'],
      parts: ['ALLOY WHEELS'],
      collectionSlug: 'bmw-m5-2024-onwards-alloy-wheels',
      bannerColorHex: '#1A1B1E',
      bannerAccentHex: '#3E4149',
      vehicleLabel: 'BMW M5 G90 (2024 ONWARDS) - ALLOY WHEELS',
      seoDescriptionShort:
        'Forged 5x112 CB66.6 wheel allocations for flagship BMW M saloons.',
      seoDescriptionFull:
        'High-load forged 5x112 CB66.6 wheel sets ready for immediate dispatch.',
      productSlugs: [
        'bmw-m5-vengeance-forged',
        'bmw-m3-rs-3-0',
        'bmw-m3-ld-rs-forged',
        'bmw-m3-type-52-forged',
      ],
    },
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
  for (const [make, nodes] of Object.entries(VEHICLE_FITMENT_TREE)) {
    for (const node of nodes) {
      if (
        node.collectionSlug === normalized ||
        (normalized.includes('bmw-m3') && node.model === 'M3') ||
        (normalized.includes('bmw-m2') && node.model === 'M2') ||
        (normalized.includes('bmw-m4') && node.model === 'M4') ||
        (normalized.includes('bmw-m5') && node.model === 'M5')
      ) {
        const products = getMatchingProductsForFitment(make, node.model, runtimeCustomProducts);
        return { node, make, products };
      }
    }
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
  const normalized = slug.toLowerCase();
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
    result.sort((a, b) => a.priceGBP - b.priceGBP);
  } else if (options.sortBy === 'price-desc') {
    result.sort((a, b) => b.priceGBP - a.priceGBP);
  } else if (options.sortBy === 'latest') {
    result.sort((a, b) => Number(Boolean(b.isLatest)) - Number(Boolean(a.isLatest)));
  }
  return result;
}

export type CurrencyCode = 'GBP' | 'USD' | 'EUR';

const CURRENCY_RATES: Record<CurrencyCode, { symbol: string; rate: number }> = {
  GBP: { symbol: '£', rate: 1 },
  USD: { symbol: '$', rate: 1.28 },
  EUR: { symbol: '€', rate: 1.18 },
};

export function formatCurrencyPrice(
  amountGBP: number,
  currency: CurrencyCode = 'GBP',
  includeDecimals = false
): string {
  const config = CURRENCY_RATES[currency] ?? CURRENCY_RATES.GBP;
  const converted = Math.round(amountGBP * config.rate);
  const formattedNumber = converted.toLocaleString('en-GB', {
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  });
  return `${config.symbol}${formattedNumber}`;
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
