import React, { useRef, useState } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MapPin,
  X,
  Maximize2,
  CheckCircle2,
} from 'lucide-react';
import { useKahnStore } from '../../store/useKahnStore';
import { useRouter } from '../../utils/router';
import { WheelRenderSVG } from '../visuals/WheelRenderSVG';
import { LogoPlaceholder } from '../shared/LogoPlaceholder';
import { CLIENT_FITMENTS } from '../../data/clientFitments';

export interface SouthAfricaCustomerFitment {
  id: string;
  vehicleTitle: string;
  chassisCode: string;
  make: string;
  /** What the wheels look like in the customer's photo (used when no catalogue model is recorded). */
  wheelLook: string;
  wheelModel?: string;
  wheelSlug?: string;
  storeProductSlug?: string;
  staggeredSpec?: string;
  frontSpec?: string;
  rearSpec?: string;
  finishName?: string;
  city?: string;
  province?: string;
  trackVenue?: string;
  ownerName?: string;
  quote?: string;
  technicalHighlights?: string[];
  images: [string, string];
  imageLabels: [string, string];
}

/** How many real fitments the home carousel shows; the full set lives at /client-fitments. */
const HOME_CAROUSEL_COUNT = 10;

// Real customer fitments, generated from the shop's Drive photos (see src/data/clientFitments.ts).
export const SOUTH_AFRICA_FITMENTS: SouthAfricaCustomerFitment[] = CLIENT_FITMENTS.slice(
  0,
  HOME_CAROUSEL_COUNT,
).map((f) => ({
  id: `sa-${f.id}`,
  vehicleTitle: f.vehicleTitle,
  chassisCode: f.chassisCode,
  make: f.make,
  wheelLook: f.wheelLook,
  wheelModel: f.wheelModel,
  wheelSlug: f.wheelSlug,
  storeProductSlug: f.storeProductSlug,
  staggeredSpec: f.staggeredSpec,
  finishName: f.finishName,
  city: f.clientCity,
  images: f.images,
  imageLabels: f.imageLabels,
}));

export const EditorialFlow: React.FC = () => {
  const { openEnquiryModal } = useKahnStore();
  const { navigate } = useRouter();
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [selectedFitment, setSelectedFitment] = useState<SouthAfricaCustomerFitment | null>(null);
  const [modalPhotoIndex, setModalPhotoIndex] = useState<0 | 1>(0);
  const [cardPhotoIndices, setCardPhotoIndices] = useState<Record<string, 0 | 1>>({});

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const offset = direction === 'left' ? -420 : 420;
    carouselRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };


  return (
    <div id="heritage" className="scroll-mt-20 max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-10 space-y-12">
      {/* Customer Fitments Carousel — Market Leader in South Africa */}
      <section className="py-6 space-y-6">
        {/* Section Header: South Africa Market Leadership Positioning */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-normal tracking-[-0.03em] leading-tight text-white">
              Customer fitments{' '}
              <span className="font-editorial-serif italic font-normal text-[#FF5500]">
                across South Africa.
              </span>
            </h3>
          </div>

          {/* Carousel Navigation Buttons & Gallery Link */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/client-fitments')}
              className="text-xs font-tech-mono uppercase tracking-[0.14em] text-[#FF5500] hover:text-[#FF6B1A] flex items-center gap-1.5 py-2 transition-colors cursor-pointer"
            >
              <span>View all {CLIENT_FITMENTS.length} fitments in the gallery</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollCarousel('left')}
                aria-label="Scroll Customer Fitments Left"
                className="w-11 h-11 rounded-full border border-[#33333E] text-white flex items-center justify-center hover:bg-[#FF5500] hover:border-[#FF5500] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollCarousel('right')}
                aria-label="Scroll Customer Fitments Right"
                className="w-11 h-11 rounded-full border border-[#33333E] text-white flex items-center justify-center hover:bg-[#FF5500] hover:border-[#FF5500] transition-colors cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>



        {/* Customer Fitments Carousel */}
        <div
          ref={carouselRef}
          className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4 pt-1"
        >
          {SOUTH_AFRICA_FITMENTS.map((fitment, idx) => (
            <article
              key={fitment.id}
              onClick={() => setSelectedFitment(fitment)}
              className="min-w-[85vw] sm:min-w-[420px] md:min-w-[460px] snap-start bg-[#121215] rounded-3xl p-6 flex flex-col justify-between border border-[#26262E] text-[#F5F5F7] group hover:border-[#FF5500] hover:shadow-[0_12px_40px_rgba(255,85,0,0.15)] transition-all cursor-pointer relative overflow-hidden"
            >
              {/* Full Photography Stage with Dual Photos & Left/Right Arrows */}
              <div className="relative aspect-[16/10] bg-[#0A0A0A] border border-[#26262E] rounded-2xl overflow-hidden mb-4 group-hover:border-[#FF5500]/50 transition-colors">
                <img
                  src={fitment.images[cardPhotoIndices[fitment.id] ?? 0]}
                  alt={`${fitment.vehicleTitle} - Photo ${(cardPhotoIndices[fitment.id] ?? 0) + 1}`}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Ambient dark gradient */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-black/40 pointer-events-none"
                />

                {/* Left & Right Navigation Arrows on the card */}
                <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between z-20 pointer-events-none">
                  <button
                    type="button"
                    aria-label={`Previous photo for ${fitment.vehicleTitle}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCardPhotoIndices((prev) => ({
                        ...prev,
                        [fitment.id]: prev[fitment.id] === 1 ? 0 : 1,
                      }));
                    }}
                    className="pointer-events-auto w-8 h-8 rounded-full bg-black/70 border border-white/20 text-white hover:text-[#FF5500] hover:border-[#FF5500] flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 cursor-pointer shadow-lg"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    aria-label={`Next photo for ${fitment.vehicleTitle}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCardPhotoIndices((prev) => ({
                        ...prev,
                        [fitment.id]: prev[fitment.id] === 1 ? 0 : 1,
                      }));
                    }}
                    className="pointer-events-auto w-8 h-8 rounded-full bg-black/70 border border-white/20 text-white hover:text-[#FF5500] hover:border-[#FF5500] flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 cursor-pointer shadow-lg"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Top Overlay: Photo Indicator */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#0A0A0A]/80 backdrop-blur-xs border border-[#33333E] text-[10px] font-tech-mono font-semibold text-white">
                    PHOTO {(cardPhotoIndices[fitment.id] ?? 0) + 1} / 2
                  </span>
                </div>
              </div>

              {/* Footer Action */}
              <div className="pt-2 flex items-center justify-between text-xs font-tech-mono">
                <div className="w-8 h-8 rounded-full bg-[#18181D] text-white group-hover:bg-[#FF5500] flex items-center justify-center transition-colors shrink-0">
                  <Maximize2 className="w-4 h-4" />
                </div>
                <span className="text-[#FF5500] font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  Inspect Fitment <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </article>
          ))}
        </div>

        {/* Modal Window: Center Lightbox for Clicked South African Fitment */}
        {selectedFitment && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
            onClick={() => setSelectedFitment(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-[#121215] border border-[#26262E] rounded-3xl p-6 sm:p-8 text-[#F5F5F7] shadow-[0_25px_60px_rgba(0,0,0,0.9)] max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedFitment(null)}
                aria-label="Close fitment dossier"
                className="absolute top-6 right-6 w-10 h-10 rounded-full bg-[#18181D] border border-[#26262E] text-neutral-400 hover:text-white hover:border-[#FF5500] flex items-center justify-center transition-colors cursor-pointer z-30"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header Badges */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-tech-mono mb-3">
                <span className="px-3 py-1 rounded-full bg-[#FF5500]/15 border border-[#FF5500] text-[#FF5500] font-semibold">
                  SOUTH AFRICA FITMENT DOSSIER
                </span>
                {selectedFitment.city && (
                  <span className="text-neutral-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#FF5500]" />
                    {selectedFitment.city}
                    {selectedFitment.province ? `, ${selectedFitment.province}` : ''}
                  </span>
                )}
              </div>

              <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-1">
                {selectedFitment.vehicleTitle}
              </h3>
              <p className="text-sm font-tech-mono text-[#FF5500] mb-6">
                {selectedFitment.chassisCode} · {selectedFitment.wheelModel ?? selectedFitment.wheelLook}
              </p>

              {/* Large Photography Stage with Left & Right Arrows (2 Images per fitment) */}
              <div className="relative aspect-[16/9] w-full bg-[#0A0A0A] border border-[#26262E] rounded-2xl flex items-center justify-center mb-6 overflow-hidden select-none">
                <img
                  src={selectedFitment.images[modalPhotoIndex]}
                  alt={`${selectedFitment.vehicleTitle} - Angle ${modalPhotoIndex + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-all duration-300"
                />

                {/* Left Arrow Button */}
                <button
                  type="button"
                  onClick={() => setModalPhotoIndex((prev) => (prev === 0 ? 1 : 0))}
                  aria-label="Previous Photo"
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#0A0A0A]/80 hover:bg-[#FF5500] border border-white/20 hover:border-[#FF5500] text-white flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer shadow-2xl z-20"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                {/* Right Arrow Button */}
                <button
                  type="button"
                  onClick={() => setModalPhotoIndex((prev) => (prev === 0 ? 1 : 0))}
                  aria-label="Next Photo"
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#0A0A0A]/80 hover:bg-[#FF5500] border border-white/20 hover:border-[#FF5500] text-white flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer shadow-2xl z-20"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Bottom Overlay: Photo Indicator & Label */}
                <div className="absolute bottom-4 inset-x-4 flex items-center justify-between gap-3 pointer-events-none z-20">
                  <div className="pointer-events-auto bg-[#0A0A0A]/85 backdrop-blur-md border border-[#26262E] px-4 py-1.5 rounded-full flex items-center gap-2 text-xs font-tech-mono">
                    <span className="text-[#FF5500] font-bold">
                      PHOTO {modalPhotoIndex + 1} OF 2
                    </span>
                    <span className="text-neutral-400">·</span>
                    <span className="text-neutral-200">
                      {selectedFitment.imageLabels[modalPhotoIndex]}
                    </span>
                  </div>

                  <div className="pointer-events-auto flex items-center gap-1.5 bg-[#0A0A0A]/85 backdrop-blur-md border border-[#26262E] p-1 rounded-full">
                    <button
                      type="button"
                      onClick={() => setModalPhotoIndex(0)}
                      className={`px-3 py-1 rounded-full text-[11px] font-tech-mono uppercase tracking-wider transition-all cursor-pointer ${
                        modalPhotoIndex === 0
                          ? 'bg-[#FF5500] text-white font-bold'
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
                          ? 'bg-[#FF5500] text-white font-bold'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Photo 2
                    </button>
                  </div>
                </div>
              </div>

              {/* Detailed Technical Specifications Grid (rows appear as the shop fills them in) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-[#18181D] border border-[#26262E] rounded-2xl p-4 space-y-2 text-xs font-tech-mono">
                  <p className="text-[#FF5500] font-semibold text-[11px] uppercase tracking-wider mb-2">
                    WHEEL SPECIFICATIONS
                  </p>
                  <div className="flex justify-between py-1 border-b border-[#26262E] gap-3">
                    <span className="text-neutral-400">Wheels as fitted:</span>
                    <span className="text-white font-semibold text-right">
                      {selectedFitment.wheelModel ?? selectedFitment.wheelLook}
                    </span>
                  </div>
                  {selectedFitment.staggeredSpec && (
                    <div className="flex justify-between py-1 border-b border-[#26262E] gap-3">
                      <span className="text-neutral-400">Staggered spec:</span>
                      <span className="text-white font-semibold text-right">{selectedFitment.staggeredSpec}</span>
                    </div>
                  )}
                  {selectedFitment.frontSpec && (
                    <div className="flex justify-between py-1 border-b border-[#26262E] gap-3">
                      <span className="text-neutral-400">Front Setup:</span>
                      <span className="text-white font-semibold text-right">{selectedFitment.frontSpec}</span>
                    </div>
                  )}
                  {selectedFitment.rearSpec && (
                    <div className="flex justify-between py-1 border-b border-[#26262E] gap-3">
                      <span className="text-neutral-400">Rear Setup:</span>
                      <span className="text-white font-semibold text-right">{selectedFitment.rearSpec}</span>
                    </div>
                  )}
                  {selectedFitment.finishName && (
                    <div className="flex justify-between py-1 border-b border-[#26262E] gap-3">
                      <span className="text-neutral-400">Finish:</span>
                      <span className="text-white font-semibold text-right">{selectedFitment.finishName}</span>
                    </div>
                  )}
                  {selectedFitment.make === 'BMW' && (
                    <>
                      <div className="flex justify-between py-1 border-b border-[#26262E]">
                        <span className="text-neutral-400">Bolt Pattern (PCD):</span>
                        <span className="text-white">5×112 (BMW Direct)</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-neutral-400">Center Bore:</span>
                        <span className="text-white">66.6mm Hub-Centric</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="bg-[#18181D] border border-[#26262E] rounded-2xl p-4 space-y-2 text-xs font-tech-mono">
                  <p className="text-[#FF5500] font-semibold text-[11px] uppercase tracking-wider mb-2">
                    ABOUT THESE PHOTOS
                  </p>
                  {selectedFitment.technicalHighlights && selectedFitment.technicalHighlights.length > 0 ? (
                    <ul className="space-y-1.5 text-neutral-300">
                      {selectedFitment.technicalHighlights.map((hl, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#FF5500] shrink-0" />
                          <span>{hl}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-neutral-300 leading-relaxed">
                      A real customer car fitted by FORGED. The studio images are re-shoots of the customer's
                      own photo: same car, same wheels, same finish, photographed again on a clean studio set.
                    </p>
                  )}
                </div>
              </div>

              {/* Owner Testimonial (only when one has been recorded) */}
              {selectedFitment.quote && (
                <blockquote className="bg-[#18181D] border-l-4 border-[#FF5500] p-4 rounded-r-2xl mb-6 text-sm text-[#C2C2CC] italic leading-relaxed">
                  {selectedFitment.quote}
                  {selectedFitment.ownerName && (
                    <div className="mt-2 text-xs font-tech-mono not-italic text-[#FF5500] font-semibold">
                      — {selectedFitment.ownerName}
                    </div>
                  )}
                </blockquote>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-[#26262E]">
                <button
                  type="button"
                  onClick={() => {
                    const fit = selectedFitment;
                    setSelectedFitment(null);
                    openEnquiryModal({
                      subject: `Commission ${fit.wheelModel ?? fit.wheelLook} for ${fit.vehicleTitle}${fit.city ? ` (${fit.city})` : ''}`,
                      domain: 'brand',
                    });
                  }}
                  className="w-full sm:w-auto bg-[#FF5500] text-white hover:bg-[#FF6B1A] rounded-full px-6 py-3 text-xs font-tech-mono uppercase tracking-wider font-semibold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(255,85,0,0.35)] cursor-pointer"
                >
                  <span>I want a custom set</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {selectedFitment.wheelSlug && (
                  <button
                    type="button"
                    onClick={() => {
                      const slug = selectedFitment.wheelSlug;
                      setSelectedFitment(null);
                      navigate(`/wheels/${slug}`);
                    }}
                    className="w-full sm:w-auto border border-[#33333E] text-neutral-300 hover:text-white hover:border-[#FF5500] rounded-full px-5 py-3 text-xs font-tech-mono uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    View This Wheel
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedFitment(null)}
                  className="w-full sm:w-auto bg-[#18181D] text-neutral-400 hover:text-white rounded-full px-4 py-3 text-xs font-tech-mono uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
