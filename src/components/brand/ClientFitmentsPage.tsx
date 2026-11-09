import React, { useEffect, useState } from 'react';
import {
  X,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Upload,
  Check,
} from 'lucide-react';
import { BrandHeader } from './BrandHeader';
import { useRouter } from '../../utils/router';
import { useKahnStore } from '../../store/useKahnStore';
import {
  CLIENT_FITMENTS,
  FITMENT_FAMILIES,
  type ClientFitment,
} from '../../data/clientFitments';

/** Kept for backwards compatibility with earlier imports; the data now lives in src/data/clientFitments.ts. */
export type ClientFitmentItem = ClientFitment;
export const CLIENT_FITMENT_ITEMS: ClientFitmentItem[] = CLIENT_FITMENTS;

/** Filter pill label for a model family, e.g. "BMW M3" or "AUDI RS3". */
const familyLabel = (family: string): string => {
  const make = CLIENT_FITMENTS.find((f) => f.family === family)?.make ?? '';
  return `${make.toUpperCase()} ${family}`.trim();
};

// The previous hardcoded placeholder list has been replaced by generated data (see src/data/clientFitments.ts).

export const ClientFitmentsPage: React.FC = () => {
  const { navigate } = useRouter();
  const { openEnquiryModal } = useKahnStore();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [modalPhotoIndex, setModalPhotoIndex] = useState<0 | 1>(0);
  const [cardPhotoIndices, setCardPhotoIndices] = useState<Record<string, 0 | 1>>({});
  const [filterModel, setFilterModel] = useState<string>('ALL');
  const [customImagesBySlot, setCustomImagesBySlot] = useState<Record<string, [string?, string?]>>({});

  const filterOptions: string[] = ['ALL', ...FITMENT_FAMILIES];

  const visibleItems =
    filterModel === 'ALL'
      ? CLIENT_FITMENT_ITEMS
      : CLIENT_FITMENT_ITEMS.filter((item) => item.family === filterModel);

  const activeItem =
    selectedIndex !== null ? visibleItems[selectedIndex] ?? null : null;

  // Handle keyboard navigation: Left/Right to toggle the 2 photos for that fitment
  useEffect(() => {
    if (selectedIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedIndex(null);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        // Toggle between photo 0 and photo 1 for the currently active fitment
        setModalPhotoIndex((prev) => (prev === 0 ? 1 : 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex]);

  // When opening a card, sync modal photo index to card's current photo index
  const handleOpenFitment = (idx: number, itemId: string) => {
    const currentCardPhoto = cardPhotoIndices[itemId] ?? 0;
    setModalPhotoIndex(currentCardPhoto);
    setSelectedIndex(idx);
  };

  const handleNextCardPhoto = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    setCardPhotoIndices((prev) => ({
      ...prev,
      [itemId]: prev[itemId] === 1 ? 0 : 1,
    }));
  };

  const handlePrevCardPhoto = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    setCardPhotoIndices((prev) => ({
      ...prev,
      [itemId]: prev[itemId] === 1 ? 0 : 1,
    }));
  };

  const handleUploadPhoto = (
    slotId: string,
    photoIdx: 0 | 1,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCustomImagesBySlot((prev) => {
          const current = prev[slotId] || [];
          const updated: [string?, string?] = [current[0], current[1]];
          updated[photoIdx] = reader.result as string;
          return {
            ...prev,
            [slotId]: updated,
          };
        });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F7] pb-24">
      <BrandHeader forceLight={false} />

      {/* Editorial Header */}
      <section className="bg-[#0A0A0A] text-[#F5F5F7] border-b border-[#26262E] px-6 md:px-10 py-14 md:py-20">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-3">
            <p className="text-xs font-tech-mono uppercase tracking-[0.18em] text-[#FF5500]">
              FORGED CUSTOM WHEELS · CLIENT FITMENT ARCHIVE
            </p>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-light tracking-[-0.03em] leading-none text-white">
              Client <span className="font-editorial-serif italic font-normal text-[#FF5500]">Fitments</span>.
            </h1>
          </div>

          {/* BMW Chassis Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {filterOptions.map((model) => {
              const active = filterModel === model;
              return (
                <button
                  key={model}
                  type="button"
                  onClick={() => {
                    setSelectedIndex(null);
                    setFilterModel(model);
                  }}
                  className={`rounded-full px-5 py-2 text-xs font-tech-mono uppercase tracking-[0.14em] transition-all cursor-pointer ${
                    active
                      ? 'bg-[#FF5500] text-white font-bold shadow-[0_0_12px_rgba(255,85,0,0.35)]'
                      : 'border border-[#33333E] text-neutral-300 hover:border-[#FF5500] hover:text-[#FF5500]'
                  }`}
                >
                  {model === 'ALL' ? `ALL (${CLIENT_FITMENT_ITEMS.length})` : familyLabel(model)}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Scrollable bento grid of client fitments (data: src/data/clientFitments.ts) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-12">
        <div
          data-testid="client-fitments-bento-grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {visibleItems.map((item, idx) => {
            const activePhotoIdx = cardPhotoIndices[item.id] ?? 0;
            const customUploaded = customImagesBySlot[item.id]?.[activePhotoIdx];
            const displayImg = customUploaded || item.images[activePhotoIdx];

            return (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                data-testid={`fitment-bento-card-${idx + 1}`}
                onClick={() => handleOpenFitment(idx, item.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOpenFitment(idx, item.id);
                  }
                }}
                className={`group relative w-full ${item.bentoClass} rounded-3xl bg-[#121215] border border-[#26262E] overflow-hidden text-left flex flex-col justify-between p-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-[#FF5500] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF5500] select-none`}
              >
                {/* Full-bleed Photography (Dual Photos) */}
                <img
                  src={displayImg}
                  alt={`${item.vehicleTitle} - Photo ${activePhotoIdx + 1}`}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Ambient dark gradient overlay to ensure perfect contrast */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/30 to-black/50 pointer-events-none"
                />

                {/* Left & Right Navigation Arrows on the Component for Dual Photos */}
                <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between z-20 pointer-events-none">
                  <button
                    type="button"
                    aria-label={`Previous photo for ${item.vehicleTitle}`}
                    onClick={(e) => handlePrevCardPhoto(e, item.id)}
                    className="pointer-events-auto w-8 h-8 rounded-full bg-black/70 border border-white/20 text-white hover:text-[#FF5500] hover:border-[#FF5500] flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 cursor-pointer shadow-lg"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    aria-label={`Next photo for ${item.vehicleTitle}`}
                    onClick={(e) => handleNextCardPhoto(e, item.id)}
                    className="pointer-events-auto w-8 h-8 rounded-full bg-black/70 border border-white/20 text-white hover:text-[#FF5500] hover:border-[#FF5500] flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 cursor-pointer shadow-lg"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Top Bar: Expand Icon Only */}
                <div className="relative z-10 flex items-center justify-end gap-2 w-full">
                  <span className="w-8 h-8 rounded-full bg-[#FF5500] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </span>
                </div>

                {/* Bottom Card Title Only — Text Placeholders Removed as Requested */}
                <div className="relative z-10 mt-auto pt-6">
                  <div className="rounded-2xl bg-[#0A0A0A]/90 backdrop-blur-md border border-[#26262E] px-4 py-3 transition-colors duration-300 group-hover:border-[#FF5500]">
                    <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-tight truncate text-white group-hover:text-[#FF5500] transition-colors">
                      {item.vehicleTitle}
                    </h2>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Centered Screen Lightbox Modal when any Fitment is clicked */}
      {activeItem && selectedIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Client Fitment Image Window - ${activeItem.vehicleTitle}`}
          data-testid="client-fitment-lightbox"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedIndex(null)}
        >
          <div
            className="relative w-full max-w-5xl bg-[#121215] text-[#F5F5F7] rounded-3xl border border-[#26262E] shadow-2xl overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Header */}
            <div className="px-6 py-4 bg-[#0A0A0A] text-white flex items-center justify-between gap-4 border-b border-[#26262E]">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 bg-[#FF5500] text-white text-[10px] font-tech-mono font-bold uppercase tracking-widest rounded-sm">
                  {activeItem.slotLabel}
                </span>
                <span className="text-xs font-tech-mono uppercase tracking-wider text-neutral-300">
                  {activeItem.vehicleTitle}
                </span>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedIndex(null)}
                aria-label="Close Fitment Image Window"
                className="w-8 h-8 rounded-full bg-[#1E1E24] border border-[#33333E] flex items-center justify-center text-neutral-300 hover:text-white hover:border-[#FF5500] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Main Stage: Left & Right Photo Navigation */}
            <div className="grid grid-cols-1 md:grid-cols-12">
              {/* Photo Display Stage with Prominent Left & Right Navigation Arrows */}
              <div className="md:col-span-8 relative bg-[#0A0A0A] min-h-[380px] sm:min-h-[480px] flex items-center justify-center border-b md:border-b-0 md:border-r border-[#26262E] overflow-hidden group select-none">
                {/* Active Photo */}
                <img
                  src={
                    customImagesBySlot[activeItem.id]?.[modalPhotoIndex] ||
                    activeItem.images[modalPhotoIndex]
                  }
                  alt={`${activeItem.vehicleTitle} - Angle ${modalPhotoIndex + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full max-h-[500px] object-cover transition-all duration-300"
                />

                {/* Left Navigation Arrow */}
                <button
                  type="button"
                  onClick={() => setModalPhotoIndex((prev) => (prev === 0 ? 1 : 0))}
                  aria-label="Previous photo for this fitment"
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#0A0A0A]/80 hover:bg-[#FF5500] border border-white/20 hover:border-[#FF5500] text-white flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer shadow-2xl z-20"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                {/* Right Navigation Arrow */}
                <button
                  type="button"
                  onClick={() => setModalPhotoIndex((prev) => (prev === 0 ? 1 : 0))}
                  aria-label="Next photo for this fitment"
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#0A0A0A]/80 hover:bg-[#FF5500] border border-white/20 hover:border-[#FF5500] text-white flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer shadow-2xl z-20"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Bottom Overlay: Photo Index & Perspective Label */}
                <div className="absolute bottom-4 inset-x-4 flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-none z-20">
                  <div className="pointer-events-auto bg-[#0A0A0A]/85 backdrop-blur-md border border-[#26262E] px-4 py-2 rounded-full flex items-center gap-3 text-xs font-tech-mono">
                    <span className="text-[#FF5500] font-bold">
                      PHOTO {modalPhotoIndex + 1} OF 2
                    </span>
                    <span className="text-neutral-400">·</span>
                    <span className="text-neutral-200">
                      {activeItem.imageLabels[modalPhotoIndex]}
                    </span>
                  </div>

                  {/* 2-Photo Direct Selector Pills */}
                  <div className="pointer-events-auto flex items-center gap-2 bg-[#0A0A0A]/85 backdrop-blur-md border border-[#26262E] p-1.5 rounded-full">
                    <button
                      type="button"
                      onClick={() => setModalPhotoIndex(0)}
                      className={`px-3 py-1 rounded-full text-[11px] font-tech-mono uppercase tracking-wider transition-all cursor-pointer ${
                        modalPhotoIndex === 0
                          ? 'bg-[#FF5500] text-white font-bold shadow-md'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Photo 1
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalPhotoIndex(1)}
                      className={`px-3 py-1 rounded-full text-[11px] font-tech-mono uppercase tracking-wider transition-all cursor-pointer ${
                        modalPhotoIndex === 1
                          ? 'bg-[#FF5500] text-white font-bold shadow-md'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Photo 2
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Clean Fitment Specifications & Actions */}
              <div className="md:col-span-4 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-[#121215]">
                <div className="space-y-5">
                  <div>
                    <p className="text-[11px] font-tech-mono uppercase tracking-[0.18em] text-[#FF5500]">
                      {activeItem.make.toUpperCase()} FITMENT SPECIFICATION
                    </p>
                    <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight mt-1 text-white">
                      {activeItem.vehicleTitle}
                    </h2>
                  </div>

                  <div className="divide-y divide-[#26262E] border-y border-[#26262E] text-xs font-tech-mono">
                    <div className="py-2.5 flex items-center justify-between gap-2">
                      <span className="text-neutral-400">VEHICLE</span>
                      <span className="font-semibold text-white uppercase text-right">
                        {activeItem.chassisCode.split(' · ')[0]} {activeItem.bodyStyle}
                      </span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between gap-2">
                      <span className="text-neutral-400">PAINT</span>
                      <span className="font-semibold text-white uppercase text-right">{activeItem.paint}</span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between gap-2">
                      <span className="text-neutral-400">WHEELS AS FITTED</span>
                      <span className="font-semibold text-[#FF5500] uppercase text-right">
                        {activeItem.wheelModel ?? activeItem.wheelLook}
                      </span>
                    </div>
                    {activeItem.staggeredSpec && (
                      <div className="py-2.5 flex items-center justify-between gap-2">
                        <span className="text-neutral-400">STAGGERED SPEC</span>
                        <span className="font-semibold text-white">{activeItem.staggeredSpec}</span>
                      </div>
                    )}
                    {activeItem.finishName && (
                      <div className="py-2.5 flex items-center justify-between gap-2">
                        <span className="text-neutral-400">FINISH</span>
                        <span className="font-semibold text-[#FF5500] uppercase">{activeItem.finishName}</span>
                      </div>
                    )}
                    {activeItem.make === 'BMW' && (
                      <>
                        <div className="py-2.5 flex items-center justify-between gap-2">
                          <span className="text-neutral-400">HUB BORE</span>
                          <span className="font-semibold text-white">66.6MM DIRECT HUB-CENTRIC</span>
                        </div>
                        <div className="py-2.5 flex items-center justify-between gap-2">
                          <span className="text-neutral-400">BOLT PATTERN</span>
                          <span className="font-semibold text-white">5 × 112 DIRECT BOLT-ON</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Upload custom replacement for active photo */}
                  <div>
                    <label className="w-full py-2.5 px-4 rounded-xl bg-[#18181D] border border-[#26262E] hover:border-[#FF5500] hover:text-[#FF5500] text-[11px] font-tech-mono uppercase tracking-wider inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap text-neutral-300 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-[#FF5500]" />
                      <span>Upload Custom Photo ({modalPhotoIndex === 0 ? 'Photo 1' : 'Photo 2'})</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleUploadPhoto(activeItem.id, modalPhotoIndex, e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2.5 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedIndex(null);
                      openEnquiryModal({
                        subject: `Fitment Specification: ${activeItem.vehicleTitle} (${activeItem.wheelModel ?? activeItem.wheelLook})`,
                        finish: activeItem.finishName,
                        domain: 'brand',
                      });
                    }}
                    className="w-full py-3.5 px-5 rounded-full bg-[#FF5500] text-white text-xs font-tech-mono font-bold uppercase tracking-[0.14em] hover:bg-[#FF6B1A] shadow-[0_0_15px_rgba(255,85,0,0.3)] inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap transition-all"
                  >
                    <span>Register Interest in Fitment</span>
                    <ArrowUpRight className="w-4 h-4 shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const target = activeItem.wheelSlug;
                      setSelectedIndex(null);
                      navigate(target ? `/wheels/${target}` : '/#catalogue');
                    }}
                    className="w-full py-3 px-5 rounded-full border border-[#33333E] text-[#F5F5F7] text-xs font-tech-mono font-bold uppercase tracking-[0.14em] hover:border-[#FF5500] hover:text-[#FF5500] inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap transition-colors"
                  >
                    <span>{activeItem.wheelSlug ? 'View This Wheel' : 'Browse the Wheel Catalogue'}</span>
                    <ArrowUpRight className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
