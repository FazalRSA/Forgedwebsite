import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BrandWheelItem,
  WHEEL_MODEL_FILTERS,
  WheelModelFilter,
  getAllBrandWheels,
  getWheelImages,
  formatZAR,
  WheelFinishId,
} from '../../data/catalogue';
import { useForgedStore } from '../../store/useForgedStore';
import { WheelLightboxModal } from './WheelLightboxModal';

export const WheelCatalogue: React.FC = () => {
  const { customBrandWheels } = useForgedStore();
  const [activeModelFilter, setActiveModelFilter] = useState<WheelModelFilter>('ALL');

  const [selectedWheel, setSelectedWheel] = useState<BrandWheelItem | null>(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState<0 | 1 | 2>(0);
  const [selectedFinish, setSelectedFinish] = useState<WheelFinishId>('silver');

  const allWheels = useMemo(
    () => getAllBrandWheels(customBrandWheels),
    [customBrandWheels]
  );

  const filteredWheels = useMemo(() => {
    if (activeModelFilter === 'ALL') return allWheels;
    return allWheels.filter(
      (wheel) =>
        wheel.modelCode?.toUpperCase() === activeModelFilter ||
        wheel.model.toUpperCase().startsWith(activeModelFilter)
    );
  }, [activeModelFilter, allWheels]);

  const handleOpenWheelModal = (wheel: BrandWheelItem) => {
    setSelectedWheel(wheel);
    setActivePhotoIdx(0);
    setSelectedFinish(wheel.defaultFinish);
  };

  return (
    <section
      id="catalogue"
      className="scroll-mt-20 max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-14 border-t border-[#26262E]"
    >
      {/* Catalogue Header & Model Filter */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
        <h2 className="text-3xl sm:text-5xl font-light tracking-[-0.03em] leading-tight text-white">
          The Collection
        </h2>

        {/* Minimalist Segmented Model Filter */}
        <div
          role="tablist"
          aria-label="Filter wheels by model"
          className="flex flex-wrap items-center gap-1 p-1 bg-[#121215] border border-[#26262E] rounded-xl self-start lg:self-auto"
        >
          {WHEEL_MODEL_FILTERS.map((modelKey) => {
            const isActive = activeModelFilter === modelKey;
            return (
              <button
                key={modelKey}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveModelFilter(modelKey)}
                className={`px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#1E1E24] text-white font-medium'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {modelKey}
              </button>
            );
          })}
        </div>
      </div>

      {/* Minimalist 2-Column Grid of Wheel Cards */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10"
        data-testid="brand-wheel-catalogue-grid"
      >
        <AnimatePresence mode="popLayout">
          {filteredWheels.map((wheel) => {
            const wheelData = getWheelImages(wheel);
            const cardImage = wheelData.images[0];
            const displayPrice =
              formatZAR(wheel.priceZAR);

            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                key={wheel.id}
                role="button"
                tabIndex={0}
                onClick={() => handleOpenWheelModal(wheel)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOpenWheelModal(wheel);
                  }
                }}
                className="group text-left flex flex-col focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white cursor-pointer select-none"
              >
                {/* Clean Uncluttered Image Stage */}
                <div className="w-full bg-[#121215] border border-[#222228] group-hover:border-neutral-600 rounded-2xl aspect-square relative overflow-hidden transition-colors duration-300">
                  <motion.img
                    src={cardImage}
                    alt={`${wheel.model} forged wheel`}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full h-full object-cover will-change-transform"
                  />
                </div>

                {/* Minimalist 2-Line Typography Below Card */}
                <div className="mt-3.5 px-0.5 space-y-1">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="text-base font-medium tracking-tight text-white truncate">
                      {/* A real link to the wheel's page for search engines and "open in new tab";
                          a normal click still opens the quick-view through the card's handler. */}
                      <a
                        href={`/wheels/${wheel.slug}`}
                        tabIndex={-1}
                        onClick={(e) => {
                          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
                            e.stopPropagation();
                            return;
                          }
                          e.preventDefault();
                        }}
                      >
                        {wheel.model}
                      </a>
                    </h3>
                    <span className="text-sm font-mono text-neutral-200 tabular-nums shrink-0">
                      {displayPrice}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-500 truncate">
                    {[
                      wheel.sizesAvailable,
                      wheel.compatibleCars,
                      wheel.otherFinishes,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Minimalist Lightbox Gallery */}
      {selectedWheel && (
        <WheelLightboxModal
          wheel={selectedWheel}
          initialAngleIdx={activePhotoIdx}
          initialFinish={selectedFinish}
          onClose={() => setSelectedWheel(null)}
        />
      )}
    </section>
  );
};
