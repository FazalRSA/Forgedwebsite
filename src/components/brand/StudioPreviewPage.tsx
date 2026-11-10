import React, { useState } from 'react';
import { BrandHeader } from './BrandHeader';
import { WheelStudio, type StudioToggles, type StudioViewId } from '../visuals/WheelStudio';
import { Wheel3DSceneErrorBoundary } from '../visuals/Wheel3DSceneErrorBoundary';
import { WHEEL_FINISHES, type WheelFinishId } from '../../data/catalogue';

/**
 * Unlisted preview of a wheel that is modelled in 3D but not yet in the catalogue.
 * It has no price, stock or enquiry details, and utils/seo.ts marks /studio pages noindex.
 * Once the wheel is added to customWheels.json with its modelUrl, its normal wheel page
 * shows the same studio and this preview can be removed.
 *
 * Optional query parameters set the opening state, for sharing a specific look:
 *   ?finish=dark-gunmetal&view=face&brakes=1&explode=1
 */
const PREVIEW_WHEELS: Record<
  string,
  { name: string; series: string; front: string; rear?: string; specFront?: string; specRear?: string }
> = {
  stf399: {
    name: 'STF399',
    series: '2-piece forged · Y-spoke · prototype model',
    front: '/models/wheels/stf399-front.glb',
    rear: '/models/wheels/stf399-rear.glb',
    specFront: '19 × 9.5 · ET 17 · 5×112 · CB 66.6',
    specRear: '20 × 11 · ET 15 · 5×112 · CB 66.6',
  },
};

const ALL_FINISHES = Object.keys(WHEEL_FINISHES) as WheelFinishId[];
const VIEW_IDS: StudioViewId[] = ['face', 'three', 'side', 'back', 'top'];

function readOpeningState(search: string): {
  finish: WheelFinishId;
  view: StudioViewId;
  toggles: Partial<StudioToggles>;
} {
  const q = new URLSearchParams(search);
  const finishParam = q.get('finish') as WheelFinishId | null;
  const viewParam = q.get('view') as StudioViewId | null;
  const toggles: Partial<StudioToggles> = {};
  if (q.get('brakes') === '1') toggles.brakes = true;
  if (q.get('explode') === '1') toggles.explode = true;
  if (q.get('orbit') === '0') toggles.orbit = false;
  return {
    finish: finishParam && ALL_FINISHES.includes(finishParam) ? finishParam : 'satin-black',
    view: viewParam && VIEW_IDS.includes(viewParam) ? viewParam : 'three',
    toggles,
  };
}

export const StudioPreviewPage: React.FC<{ slug: string }> = ({ slug }) => {
  const wheel = PREVIEW_WHEELS[slug];
  const [opening] = useState(() => readOpeningState(window.location.search));
  const [finish, setFinish] = useState<WheelFinishId>(opening.finish);


  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F7]">
      <BrandHeader />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {wheel ? (
          <>
            <p className="mb-4 text-xs font-mono uppercase tracking-[0.14em] text-neutral-400">
              3D studio preview · {wheel.name} · not yet listed for sale
            </p>
            <Wheel3DSceneErrorBoundary>
              <WheelStudio
                wheelModel={wheel.name}
                wheelSeries={wheel.series}
                advanced
                selectedFinish={finish}
                availableFinishes={ALL_FINISHES}
                onSelectFinish={setFinish}
                modelUrl={wheel.front}
                rearModelUrl={wheel.rear}
                specFront={wheel.specFront}
                specRear={wheel.specRear}
                initialView={opening.view}
                initialToggles={opening.toggles}
              />
            </Wheel3DSceneErrorBoundary>
          </>
        ) : (
          <p className="py-24 text-center text-sm text-neutral-400">No 3D preview exists for “{slug}”.</p>
        )}
      </main>
    </div>
  );
};
