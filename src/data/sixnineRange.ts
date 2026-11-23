/**
 * Sixnine Wheels' full range, design by design, for the "The Sixnine range" section on /sixnine-wheels.
 *
 * Pulled on 2026-11-23 from Sixnine's own shop feed (sixnine-wheels.com/products.json: 70 wheel
 * listings over six designs) and the product descriptions in it. Sizes, bolt patterns, finishes and
 * the measured figures are taken from those listings; each range runs from the smallest to the largest
 * value Sixnine lists for that design. Sixnine's own prices are in euros for the German market, so
 * they are not shown here: the shop quotes in rand.
 *
 * `stockedCode` is the design code this shop's catalogue uses for the design (FF-1, FF-3). A design
 * with one is matched to the sets in stock; the others are offered to order.
 */

import type { BrandWheelItem } from './catalogue';

export type SixnineDesignId = 'ff-one' | 'ff-two' | 'ff-three' | 'evo-one' | 'evo-two' | 'oem-one';

export interface SixnineDesign {
  id: SixnineDesignId;
  /** The name as Sixnine writes it. */
  name: string;
  /** Sixnine's own short line for the design. */
  tagline: string;
  /** A sentence or two on what sets the design apart, in our words, from Sixnine's description. */
  summary: string;
  /** How the wheel is made, where Sixnine says so. */
  construction?: string;
  diameters: string;
  widths: string;
  boltPatterns: string[];
  /** Sixnine's finish names for the design, written out. */
  finishes: string[];
  /** Figures Sixnine publishes, as ranges over the sizes it lists. */
  figures: { label: string; value: string }[];
  /** Limited or special editions of the design. */
  editions?: string[];
  /** Sixnine lists the design as a pre-order. */
  preOrder?: boolean;
  /** This shop's design code, when it stocks the design. */
  stockedCode?: string;
  /** A face-on studio picture from Sixnine, saved in public/images/sixnine. */
  image: string;
  /**
   * Sixnine's own three-quarter render of the series, from sixnine-wheels.com, saved in
   * public/images/sixnine/renders (a 600 px copy beside it). The owner confirmed on 23 November 2026
   * that the shop, as an official dealer, may use Sixnine's renders.
   */
  render: string;
  /** The design's page on sixnine-wheels.com. */
  sourceUrl: string;
}

const SIXNINE = 'https://sixnine-wheels.com/en/collections';

export const SIXNINE_RANGE: readonly SixnineDesign[] = [
  {
    id: 'ff-one',
    name: 'FF-ONE',
    tagline: 'One wheel, five designs',
    summary:
      "Sixnine's first design. Run it plain, or fit one of three inlays (V-ONE, V-TWO, X-ONE) or the AeroRing to change its look. Chrome-look stainless bolts on the lip give it the look of a two-piece wheel.",
    construction: 'Flow-formed one-piece, two-piece look',
    diameters: '19–22"',
    widths: '8.5–11.5J',
    boltPatterns: ['5x112', '5x114.3', '5x120'],
    finishes: ['Hyper Silver', 'Liquid Metal', 'Glossy Black'],
    figures: [
      { label: 'Concave', value: 'up to 120 mm' },
      { label: 'Weight', value: 'about 10–12.4 kg' },
      { label: 'Load rating', value: '650–910 kg' },
    ],
    editions: ['BMW M5 G90/G99 two-piece forged set (11x21 front, 11.5x22 rear, 5x132)'],
    stockedCode: 'FF-1',
    image: '/images/sixnine/ff-one.webp',
    render: '/images/sixnine/renders/ff-one.webp',
    sourceUrl: `${SIXNINE}/ff-one`,
  },
  {
    id: 'ff-two',
    name: 'FF-TWO',
    tagline: 'Lightweight and timeless',
    summary:
      'A clean ten-spoke with a deep concave. A one-piece forged Forged Series version is also made to order for the Audi RS4/RS5 B9.',
    construction: 'Flow-formed; Forged Series is one-piece forged',
    diameters: '21"',
    widths: '10–10.5J',
    boltPatterns: ['5x112'],
    finishes: ['Hyper Silver', 'Glossy Black'],
    figures: [
      { label: 'Weight', value: 'about 11.6–11.8 kg' },
      { label: 'Load rating', value: '620–725 kg' },
    ],
    editions: ['Audi RS4/RS5 B9 one-piece forged Forged Series (10.5x21 ET25), made to order in 8–10 weeks'],
    image: '/images/sixnine/ff-two.webp',
    render: '/images/sixnine/renders/ff-two.webp',
    sourceUrl: `${SIXNINE}/ff-two`,
  },
  {
    id: 'ff-three',
    name: 'FF-THREE',
    tagline: 'Modular design, maximum concave',
    summary:
      'Built on the FF-ONE idea: three optional inlay designs and coloured bolts, with each size drawn for the deepest concave it can take.',
    diameters: '20–22"',
    widths: '8.5–11.5J',
    boltPatterns: ['5x112', '5x114.3', '5x120', '5x132'],
    finishes: ['Liquid Metal', 'Glossy Black', 'Hyper Silver', 'Pure Bronze'],
    figures: [
      { label: 'Concave', value: 'up to 120 mm' },
      { label: 'Weight', value: 'about 11.1–14.8 kg' },
      { label: 'Load rating', value: '650–960 kg' },
    ],
    editions: ['Audi RS5 B10 (10.5x21), on pre-order for delivery in March 2027'],
    stockedCode: 'FF-3',
    image: '/images/sixnine/ff-three.webp',
    render: '/images/sixnine/renders/ff-three.webp',
    sourceUrl: `${SIXNINE}/ff-three`,
  },
  {
    id: 'evo-one',
    name: 'EVO-ONE',
    tagline: 'Iconic five-spoke',
    summary:
      'The classic JDM five-spoke drawn again for today, with the deepest concave each size allows and room for big brakes. Most sizes are drilled for two bolt patterns.',
    diameters: '18–20"',
    widths: '8.5–11J',
    boltPatterns: ['5x100', '5x110', '5x112', '5x114.3', '5x120'],
    finishes: ['Hyper Silver', 'Glossy Black', 'Pure White', 'Liquid Metal'],
    figures: [
      { label: 'Concave', value: 'up to 105 mm' },
      { label: 'Weight', value: 'about 10.2–12.7 kg' },
      { label: 'Load rating', value: '650–690 kg' },
    ],
    image: '/images/sixnine/evo-one.webp',
    render: '/images/sixnine/renders/evo-one.webp',
    sourceUrl: `${SIXNINE}/evo-one-wheel`,
  },
  {
    id: 'evo-two',
    name: 'EVO-TWO',
    tagline: 'New Y-spokes, maximum lip depth',
    summary:
      'Newly drawn Y-spokes that run out to a lip as deep as a multi-piece wheel, made possible by flow-forming the barrel. All sizes are drilled for both 5x112 and 5x120.',
    construction: 'Flow-formed one-piece, two-piece look',
    diameters: '20–21"',
    widths: '9–11.5J',
    boltPatterns: ['5x112', '5x120'],
    finishes: ['Hyper Silver', 'Glossy Black', 'Champagne Gold', 'Liquid Metal'],
    figures: [{ label: 'Load rating', value: '650–865 kg' }],
    preOrder: true,
    image: '/images/sixnine/evo-two.webp',
    render: '/images/sixnine/renders/evo-two.webp',
    sourceUrl: `${SIXNINE}/evo-two`,
  },
  {
    id: 'oem-one',
    name: 'OEM+ONE',
    tagline: 'Classic reimagined',
    summary:
      'A clean, factory-style multi-spoke with more depth than an original wheel and over 50 mm of brake clearance.',
    diameters: '19"',
    widths: '8.5J',
    boltPatterns: ['5x100', '5x112'],
    finishes: ['OEM Silver'],
    figures: [
      { label: 'Concave', value: '43 mm' },
      { label: 'Weight', value: 'about 11.4 kg' },
      { label: 'Load rating', value: '600 kg' },
    ],
    image: '/images/sixnine/oem-one.webp',
    render: '/images/sixnine/renders/oem-one.webp',
    sourceUrl: `${SIXNINE}/oem-one`,
  },
];

/** Sets of a design in stock with us: the in-stock listings whose code is the design's. */
export function stockedSets(design: SixnineDesign, inStock: Pick<BrandWheelItem, 'modelCode' | 'stockQuantitySets'>[]): number {
  if (!design.stockedCode) return 0;
  const code = design.stockedCode.toUpperCase();
  return inStock
    .filter((wheel) => (wheel.modelCode ?? '').trim().toUpperCase() === code)
    .reduce((sum, wheel) => sum + (wheel.stockQuantitySets ?? 0), 0);
}
