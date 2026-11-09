import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Suspense fallback for the lazy-loaded WheelStudio chunk (three.js + addons).
 * Matches WheelStudio's own container sizing so there's no layout jump once
 * the real scene mounts.
 */
export const Wheel3DSceneSkeleton: React.FC = () => (
  <div className="relative w-full h-[76vh] min-h-[540px] max-h-[860px] bg-[#0A0A0A] border border-[#26262E] rounded-3xl overflow-hidden flex items-center justify-center">
    <div className="flex flex-col items-center gap-3 text-neutral-400">
      <Loader2 className="w-6 h-6 animate-spin text-[#FF5500]" />
      <span className="text-xs font-mono uppercase tracking-[0.14em]">Loading 3D Studio…</span>
    </div>
  </div>
);
