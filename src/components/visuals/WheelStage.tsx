import React, { Suspense } from 'react';
import type { WheelFinishId } from '../../data/catalogue';
import { Wheel3DSceneSkeleton } from './Wheel3DSceneSkeleton';
import { Wheel3DSceneErrorBoundary } from './Wheel3DSceneErrorBoundary';
import { lazyWithRetry } from '../../utils/lazyWithRetry';

// three.js and the GLB are only downloaded once this stage is rendered, which the wheel page
// does only after the visitor taps "View in 3D".
const WheelStudio = lazyWithRetry(() =>
  import('./WheelStudio').then((m) => ({ default: m.WheelStudio }))
);

/** Stage size on the wheel page; the skeleton and error state use the same box so nothing jumps. */
export const STAGE_CLASS = 'h-[68svh] min-h-[420px] max-h-[720px]';

export interface WheelStageProps {
  wheelModel: string;
  selectedFinish: WheelFinishId;
  /** Paint choices on offer. Pass only the wheel's own finish: a single entry shows no finish row. */
  availableFinishes: WheelFinishId[];
  onSelectFinish: (finish: WheelFinishId) => void;
  /** The wheel's finish name, e.g. "Black Matte". */
  finishName?: string;
  /** The wheel's .glb. Without one there is no 3D stage and the page shows photography instead. */
  modelUrl?: string | null;
  rearModelUrl?: string | null;
  /** Leaves 3D: shown as a visible "Close 3D" button in every state (loading, error, ready). */
  onClose: () => void;
}

/**
 * The 3D stage on a wheel page: the wheel studio, for wheels that have a real model.
 * Renders nothing for a wheel without a model; the page shows the wheel's photography instead.
 */
export const WheelStage: React.FC<WheelStageProps> = ({ modelUrl, onClose, ...rest }) => {
  if (!modelUrl) return null;
  return (
    <Wheel3DSceneErrorBoundary className={STAGE_CLASS} onClose={onClose}>
      <Suspense fallback={<Wheel3DSceneSkeleton className={STAGE_CLASS} onClose={onClose} />}>
        <WheelStudio {...rest} modelUrl={modelUrl} onClose={onClose} className={STAGE_CLASS} />
      </Suspense>
    </Wheel3DSceneErrorBoundary>
  );
};
