import React, { Suspense } from 'react';
import type { WheelFinishId } from '../../data/kahnData';
import { Wheel3DSceneSkeleton } from './Wheel3DSceneSkeleton';
import { Wheel3DSceneErrorBoundary } from './Wheel3DSceneErrorBoundary';
import { lazyWithRetry } from '../../utils/lazyWithRetry';

// three.js is only downloaded when a page actually shows a 3D model.
const WheelStudio = lazyWithRetry(() =>
  import('./WheelStudio').then((m) => ({ default: m.WheelStudio }))
);

export interface WheelStageProps {
  wheelModel: string;
  wheelSeries: string;
  selectedFinish: WheelFinishId;
  availableFinishes: WheelFinishId[];
  onSelectFinish: (finish: WheelFinishId) => void;
  onEnquire?: () => void;
  userVehicleLabel?: string | null;
  /** The wheel's .glb. Without one there is no 3D stage and the page shows photography instead. */
  modelUrl?: string | null;
  rearModelUrl?: string | null;
  specFront?: string;
  specRear?: string;
}

/**
 * The 3D stage on wheel and product pages: the wheel studio, for wheels that have a real model.
 * Renders nothing for a wheel without a model; callers show the wheel's photography in that case.
 */
export const WheelStage: React.FC<WheelStageProps> = ({ modelUrl, ...rest }) => {
  if (!modelUrl) return null;
  return (
    <Wheel3DSceneErrorBoundary>
      <Suspense fallback={<Wheel3DSceneSkeleton />}>
        <WheelStudio {...rest} modelUrl={modelUrl} />
      </Suspense>
    </Wheel3DSceneErrorBoundary>
  );
};
