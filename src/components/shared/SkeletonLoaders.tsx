import React from 'react';

interface WheelCatalogueSkeletonProps {
  count?: number;
}

export const WheelCatalogueSkeleton: React.FC<WheelCatalogueSkeletonProps> = ({
  count = 4,
}) => {
  return (
    <div
      data-testid="wheel-catalogue-skeleton"
      aria-busy="true"
      aria-label="Loading FORGED Custom wheels catalogue"
      className="grid grid-cols-2 gap-4 sm:gap-8 animate-pulse"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="flex flex-col">
          {/* Square Wheel Card Skeleton */}
          <div className="w-full bg-[#121215] rounded-2xl aspect-square p-6 sm:p-12 flex flex-col items-center justify-center relative overflow-hidden border border-[#26262E]">
            {/* Simulated Circular Wheel Rim & Hub Skeleton */}
            <div className="w-4/5 h-4/5 max-w-[260px] max-h-[260px] rounded-full border-8 border-[#26262E] bg-[#18181D] flex items-center justify-center">
              <div className="w-2/3 h-2/3 rounded-full border-4 border-dashed border-[#33333E] flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-[#26262E]" />
              </div>
            </div>
            <span className="mt-4 h-2.5 w-28 bg-[#26262E] rounded-full" />
          </div>

          {/* Caption & Price Row Skeleton */}
          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="h-3.5 w-36 sm:w-48 bg-[#26262E] rounded-md" />
            <div className="h-3.5 w-20 bg-[#26262E] rounded-md hidden sm:block" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const TechnicalProductViewSkeleton: React.FC = () => {
  return (
    <div
      data-testid="technical-product-view-skeleton"
      aria-busy="true"
      aria-label="Loading technical product specifications"
      className="animate-pulse bg-[#0A0A0A]"
    >
      {/* Breadcrumb Bar Skeleton */}
      <div className="border-b border-[#26262E] px-4 sm:px-8 py-3 bg-[#121215]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3.5 w-14 bg-[#26262E] rounded-xs" />
            <span className="text-[#26262E]">/</span>
            <div className="h-3.5 w-36 bg-[#26262E] rounded-xs" />
            <span className="text-[#26262E]">/</span>
            <div className="h-3.5 w-24 bg-[#26262E] rounded-xs" />
          </div>
          <div className="h-3.5 w-44 bg-[#26262E] rounded-xs hidden sm:block" />
        </div>
      </div>

      {/* Main Contiguous PDP Skeleton Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Image Stage + Finish Bar Skeleton */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative bg-[#121215] border border-[#26262E] aspect-square p-8 sm:p-14 flex items-center justify-center">
              <div className="absolute top-4 left-4 h-6 w-56 bg-[#18181D] border border-[#26262E]" />
              <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-full border-8 border-[#26262E] bg-[#18181D] flex items-center justify-center">
                <div className="w-48 h-48 rounded-full border-4 border-dashed border-[#33333E] flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-[#26262E]" />
                </div>
              </div>
              <div className="absolute bottom-4 left-4 h-4 w-40 bg-[#18181D]" />
            </div>

            {/* Finish Swatch Selector Bar Skeleton */}
            <div className="p-4 border border-[#26262E] bg-[#121215] flex flex-wrap items-center justify-between gap-4">
              <div className="h-4 w-48 bg-[#18181D]" />
              <div className="flex items-center gap-2">
                <div className="h-8 w-24 bg-[#18181D]" />
                <div className="h-8 w-24 bg-[#18181D]" />
                <div className="h-8 w-28 bg-[#18181D]" />
                <div className="h-8 w-28 bg-[#18181D]" />
              </div>
            </div>
          </div>

          {/* Right Column: Title, Price, CTAs, Zebra Spec Table Skeleton */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="h-7 w-full bg-[#18181D]" />
                <div className="h-7 w-3/4 bg-[#18181D]" />
              </div>
              <div className="w-11 h-11 bg-[#18181D] shrink-0" />
            </div>

            {/* Badges Skeleton */}
            <div className="flex items-center gap-2">
              <div className="h-6 w-16 bg-[#18181D]" />
              <div className="h-6 w-20 bg-[#18181D]" />
              <div className="h-4 w-36 bg-[#18181D]" />
            </div>

            {/* Price Block Skeleton */}
            <div className="py-4 border-y border-[#26262E] flex items-baseline justify-between">
              <div className="space-y-2">
                <div className="h-9 w-36 bg-[#18181D]" />
                <div className="h-3.5 w-56 bg-[#18181D]" />
              </div>
              <div className="h-4 w-28 bg-[#18181D]" />
            </div>

            {/* Primary CTA Buttons Skeleton */}
            <div className="space-y-3">
              <div className="h-13 w-full rounded-full bg-[#FF5500]/40" />
              <div className="h-12 w-full bg-[#18181D] border border-[#26262E]" />
            </div>

            {/* 3-Column Direct Contact Bar Skeleton */}
            <div className="space-y-2">
              <div className="h-3 w-44 bg-[#18181D]" />
              <div className="grid grid-cols-3 gap-2">
                <div className="h-11 bg-[#18181D]" />
                <div className="h-11 bg-[#18181D]" />
                <div className="h-11 bg-[#18181D]" />
              </div>
            </div>

            {/* Zebra-Striped 2-Column Technical Spec Table Skeleton */}
            <div className="pt-2">
              <div className="h-4 w-56 bg-[#18181D] mb-3" />
              <div className="border border-[#26262E] divide-y divide-[#26262E]">
                {Array.from({ length: 10 }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`grid grid-cols-12 ${
                      idx % 2 === 0 ? 'bg-[#141418]' : 'bg-[#18181D]'
                    }`}
                  >
                    <div className="col-span-5 p-3 border-r border-[#26262E]">
                      <div className="h-3.5 w-24 bg-[#26262E]" />
                    </div>
                    <div className="col-span-7 p-3">
                      <div className="h-3.5 w-40 bg-[#26262E]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2x2 Gallery Grid Skeleton */}
        <div className="mt-12 pt-10 border-t border-[#26262E]">
          <div className="flex items-center justify-between mb-6">
            <div className="h-4 w-72 bg-[#18181D]" />
            <div className="h-3.5 w-44 bg-[#18181D]" />
          </div>
          <div className="grid grid-cols-2 border-t border-l border-[#26262E]">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="border-r border-b border-[#26262E] p-6 sm:p-10 flex flex-col items-center justify-between bg-[#121215]"
              >
                <div className="w-36 h-36 sm:w-52 sm:h-52 rounded-full bg-[#18181D]" />
                <div className="mt-4 h-3.5 w-36 bg-[#26262E]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
