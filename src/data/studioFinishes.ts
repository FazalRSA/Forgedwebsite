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
  // Silver / Liquid Metal: bright metallic silver under a light clear coat.
  silver: {
    hex: '#d9dce1',
    metalness: 1.0,
    roughness: 0.2,
    clearcoat: 0.6,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.1,
  },
  // Black Matte / Gloss Black: near-black paint with a soft clear coat.
  'satin-black': {
    hex: '#08080a',
    metalness: 0.3,
    roughness: 0.22,
    clearcoat: 0.8,
    clearcoatRoughness: 0.12,
    envMapIntensity: 1.1,
  },
  // Gold / Pure Bronze: warm metallic.
  'champagne-bronze': {
    hex: '#b98a52',
    metalness: 1.0,
    roughness: 0.3,
    clearcoat: 0.3,
    clearcoatRoughness: 0.06,
    envMapIntensity: 1.1,
  },
  // Hyper Black: dark chrome-like metallic under a full gloss coat.
  'dark-gunmetal': {
    hex: '#3d4148',
    metalness: 1.0,
    roughness: 0.07,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    envMapIntensity: 1.35,
  },
};

/** Settings for a finish id, falling back to silver for an unknown id. */
export function getStudioFinish(finishId: WheelFinishId | string): StudioFinishPBR {
  return STUDIO_FINISH_PBR[finishId as WheelFinishId] ?? STUDIO_FINISH_PBR.silver;
}
