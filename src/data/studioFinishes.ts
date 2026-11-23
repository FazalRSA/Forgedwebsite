import type { WheelFinishId } from './catalogue';

/**
 * Physically based paint settings for the 3D wheel studio, one per catalogue finish.
 * The catalogue's WHEEL_FINISHES holds the names and swatch dots; this table holds how
 * each finish is rendered (base colour, metalness, roughness, clear coat, reflection strength).
 * Values were tuned against the SIXNINE reference renders under the studio's lighting.
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
  // Silver / LiquidMetal: polished, bright metallic silver under a crisp clear coat.
  silver: {
    hex: '#e4e7ec',
    metalness: 1.0,
    roughness: 0.24,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.2,
  },
  // BlackMatte / GlossBlack: deep black paint under a full gloss coat. A matte listing name
  // ("BlackMatte") flattens this in the viewer, so the one row serves both.
  'satin-black': {
    hex: '#0a0a0c',
    metalness: 0.35,
    roughness: 0.3,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
    envMapIntensity: 1.3,
  },
  // Gold / PureBronze: warm metallic.
  'champagne-bronze': {
    hex: '#b98a52',
    metalness: 1.0,
    roughness: 0.3,
    clearcoat: 0.3,
    clearcoatRoughness: 0.06,
    envMapIntensity: 1.1,
  },
  // HyperBlack: dark chrome-like metallic under a full gloss coat.
  'dark-gunmetal': {
    hex: '#3d4148',
    metalness: 1.0,
    roughness: 0.07,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    envMapIntensity: 1.35,
  },
  // LiquidMetal: mirror-polished, chrome-like silver.
  'liquid-metal': {
    hex: '#eef0f3',
    metalness: 1.0,
    roughness: 0.11,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    envMapIntensity: 1.35,
  },
  // HyperSilver: bright metallic silver under a crisp clear coat (less mirror than LiquidMetal).
  'hyper-silver': {
    hex: '#d3d7dc',
    metalness: 1.0,
    roughness: 0.27,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.2,
  },
  // GlossyBlack: deep black paint under a full gloss coat.
  'glossy-black': {
    hex: '#0a0a0c',
    metalness: 0.35,
    roughness: 0.3,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
    envMapIntensity: 1.3,
  },
  // PureBronze: warm metallic bronze.
  'pure-bronze': {
    hex: '#b98a52',
    metalness: 1.0,
    roughness: 0.3,
    clearcoat: 0.3,
    clearcoatRoughness: 0.06,
    envMapIntensity: 1.1,
  },
};

/** Settings for a finish id, falling back to silver for an unknown id. */
export function getStudioFinish(finishId: WheelFinishId | string): StudioFinishPBR {
  return STUDIO_FINISH_PBR[finishId as WheelFinishId] ?? STUDIO_FINISH_PBR.silver;
}
