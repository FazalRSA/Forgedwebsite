import React from 'react';
import { Loader2, X } from 'lucide-react';

interface Props {
  className?: string;
  onClose?: () => void;
}

/**
 * Suspense fallback while the 3D chunk (three.js) downloads after the visitor taps "View in 3D".
 * Same box as the studio so nothing jumps, and the visitor can still back out with Close 3D.
 */
export const Wheel3DSceneSkeleton: React.FC<Props> = ({
  className = 'h-[76vh] min-h-[540px] max-h-[860px]',
  onClose,
}) => (
  <div
    className={`relative w-full overflow-hidden rounded-2xl border border-[#26262E] text-[#14161a] flex items-center justify-center ${className}`}
    style={{ background: 'radial-gradient(120% 90% at 50% 35%, #f6f7f9 0%, #e3e6eb 60%, #cfd3da 100%)' }}
  >
    {onClose && (
      <button
        type="button"
        onClick={onClose}
        className="absolute top-3 right-3 inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-[#14161a] px-4 text-sm font-semibold text-white shadow-md cursor-pointer hover:bg-black"
      >
        <X className="w-4 h-4" aria-hidden="true" />
        Close 3D
      </button>
    )}
    <div role="status" className="flex items-center gap-2 text-sm font-semibold text-neutral-600">
      <Loader2 className="w-4 h-4 animate-spin motion-reduce:animate-none text-[#FF5500]" />
      Loading 3D…
    </div>
  </div>
);
