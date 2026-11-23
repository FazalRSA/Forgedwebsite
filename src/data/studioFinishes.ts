import type { WheelFinishId } from './catalogue';

/**
 * Physically based paint settings for the 3D wheel studio, one per catalogue finish.
 * The catalogue's WHEEL_FINISHES holds the names and swatch dots; this table holds how
 * each finish is rendered (base colour, metalness, roughness, clear coat, reflection strength).
 * Values are fitted: each finish was rendered in Cycles under the viewer's studio and the base colour, roughness and coat
 * adjusted until the render's median colour and light/dark spread matched the real photo of that wheel (scripts/render-finish-stills.py).
 */
export interface StudioFinishPBR {
  /** Base colour as sRGB hex. */
  hex: string;
  metalness: number;
  roughness: number;
  clearcoat: number;
  clearcoatRoughness: number;
  envMapIntensity: number;
}

export const STUDIO_FINISH_PBR: Record<WheelFinishId, StudioFinishPBR> = {
  // Silver: polished metal, fitted to the FSA004 Silver photo.
  silver: {
    hex: '#d1d1d1',
    metalness: 1.0,
    roughness: 0.401,
    clearcoat: 0.204,
    clearcoatRoughness: 0.06,
    envMapIntensity: 1.2,
  },
  // Black Matte / Gloss Black: black paint under a gloss coat (a matte name flattens it in the viewer); fitted to the FSA004 Gloss Black photo.
  'satin-black': {
    hex: '#3b3b3b',
    metalness: 0.0,
    roughness: 0.249,
    clearcoat: 0.906,
    clearcoatRoughness: 0.04,
    envMapIntensity: 1.2,
  },
  // Gold: warm metallic, fitted to the FSA003 Gold photo.
  'champagne-bronze': {
    hex: '#e8d6b6',
    metalness: 1.0,
    roughness: 0.437,
    clearcoat: 0.198,
    clearcoatRoughness: 0.06,
    envMapIntensity: 1.2,
  },
  // Hyper Black: grey metal under a coat, fitted to the FSA003 Hyper Black photo.
  'dark-gunmetal': {
    hex: '#a0a0a0',
    metalness: 1.0,
    roughness: 0.256,
    clearcoat: 0.449,
    clearcoatRoughness: 0.06,
    envMapIntensity: 1.2,
  },
  // Liquid Metal: bright mirror-polished metal, fitted to the FF-3 Liquid Metal photo.
  'liquid-metal': {
    hex: '#ababab',
    metalness: 1.0,
    roughness: 0.137,
    clearcoat: 0.521,
    clearcoatRoughness: 0.04,
    envMapIntensity: 1.2,
  },
  // Hyper Silver: bright metallic silver, fitted to the FF-1 Silver photo.
  'hyper-silver': {
    hex: '#dcdcdc',
    metalness: 1.0,
    roughness: 0.312,
    clearcoat: 0.452,
    clearcoatRoughness: 0.06,
    envMapIntensity: 1.2,
  },
  // Glossy Black: black paint under a gloss coat, fitted to the FF-3 Glossy Black photo.
  'glossy-black': {
    hex: '#202020',
    metalness: 0.0,
    roughness: 0.52,
    clearcoat: 0.815,
    clearcoatRoughness: 0.04,
    envMapIntensity: 1.2,
  },
  // Pure Bronze: dark warm metallic, fitted to the FF-3 Pure Bronze photo.
  'pure-bronze': {
    hex: '#7d7067',
    metalness: 1.0,
    roughness: 0.128,
    clearcoat: 0.52,
    clearcoatRoughness: 0.06,
    envMapIntensity: 1.2,
  },
};

/**
 * A few designs look different enough in their real photos that one paint per finish cannot match both. These rows
 * replace the finish's paint for that design only, keyed "DESIGN:finish-id".
 */
export const DESIGN_FINISH_PBR: Record<string, StudioFinishPBR> = {
  'FF-1:liquid-metal': {
    hex: '#b1b1b1',
    metalness: 1.0,
    roughness: 0.652,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.2,
  },
  'FSA002:dark-gunmetal': {
    hex: '#858585',
    metalness: 1.0,
    roughness: 0.273,
    clearcoat: 0.506,
    clearcoatRoughness: 0.06,
    envMapIntensity: 1.2,
  },
};

/** Settings for a finish id (and, when given, the design it is on), falling back to silver for an unknown id. */
export function getStudioFinish(finishId: WheelFinishId | string, design?: string): StudioFinishPBR {
  if (design) {
    const own = DESIGN_FINISH_PBR[`${design.trim().toUpperCase()}:${finishId}`];
    if (own) return own;
  }
  return STUDIO_FINISH_PBR[finishId as WheelFinishId] ?? STUDIO_FINISH_PBR.silver;
}
