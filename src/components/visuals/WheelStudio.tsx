import React, { useMemo } from 'react';
import { WHEEL_FINISHES, type WheelFinishId } from '../../data/catalogue';
import { getStudioFinish } from '../../data/studioFinishes';
import {
  WheelStudio as SharedWheelStudio,
  DEFAULT_STUDIO_TOGGLES,
  type StudioFinish,
  type StudioToggles,
  type StudioViewId,
} from '../../wheel-viewer';

/**
 * The website's face on the shared wheel viewer (src/wheel-viewer/, also used by the BMW configurator).
 * All this file does is turn the catalogue's finish ids into the viewer's finish rows; the stage, the
 * controls and the paint are the shared viewer's. Change the viewer there, not here.
 */

export { DEFAULT_STUDIO_TOGGLES };
export type { StudioToggles, StudioViewId };

export interface WheelStudioProps {
  wheelModel: string;
  /** Shown under the name on the advanced stage only. */
  wheelSeries?: string;
  selectedFinish: WheelFinishId;
  /**
   * The paint choices offered. A single entry shows no finish row, which is how the wheel pages
   * keep the stage to the finish that is actually in stock.
   */
  availableFinishes: WheelFinishId[];
  onSelectFinish: (finish: WheelFinishId) => void;
  /** The wheel's own finish name, e.g. "Black Matte"; a matte name gives the paint a matte sheen. */
  finishName?: string;
  /** Served path to the wheel's .glb, e.g. "/models/wheels/stf399-front.glb". */
  modelUrl: string;
  /** Optional second model for the rear axle of a staggered set. */
  rearModelUrl?: string | null;
  /** One-line spec shown in the badge on the advanced stage, e.g. "19 × 9.5 · ET 17 · 5×112". */
  specFront?: string;
  specRear?: string;
  initialView?: StudioViewId;
  initialToggles?: Partial<StudioToggles>;
  /** Shows a visible "Close 3D" button (and closes on Escape) when given. */
  onClose?: () => void;
  /** Adds the wireframe, brake and other toggles (the exploded view is on both stages). */
  advanced?: boolean;
  /** Tailwind sizing for the stage. */
  className?: string;
}

/** A catalogue finish as the viewer's row. `nameOverride` names the paint (a matte name flattens it). */
function toStudioFinish(id: WheelFinishId, nameOverride?: string): StudioFinish | null {
  const option = WHEEL_FINISHES[id];
  if (!option) return null;
  const { hex, metalness, roughness, clearcoat, clearcoatRoughness, envMapIntensity } = getStudioFinish(id);
  return {
    id,
    name: nameOverride ?? option.name,
    swatchHex: option.swatchHex,
    paint: { hex, metalness, roughness, clearcoat, clearcoatRoughness, envMapIntensity },
  };
}

export const WheelStudio: React.FC<WheelStudioProps> = ({
  selectedFinish,
  availableFinishes,
  onSelectFinish,
  finishName,
  ...rest
}) => {
  const finishes = useMemo(
    () => availableFinishes.map((id) => toStudioFinish(id)).filter((f): f is StudioFinish => !!f),
    [availableFinishes]
  );
  // The selected finish carries the wheel's own name for the matte reading ("Black Matte"); the row
  // keeps the catalogue's chip names.
  const selected = toStudioFinish(selectedFinish, finishName) ?? undefined;
  return (
    <SharedWheelStudio
      {...rest}
      finishes={finishes}
      selectedFinish={selected}
      onSelectFinish={(f) => onSelectFinish(f.id as WheelFinishId)}
    />
  );
};
