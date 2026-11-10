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

export interface SouthAfricaCustomerFitment {
  id: string;
  vehicleTitle: string;
  chassisCode: string;
  wheelModel: string;
  staggeredSpec: string;
  frontSpec: string;
  rearSpec: string;
  finishName: string;
  city: string;
  province: string;
  trackVenue?: string;
  ownerName: string;
  quote: string;
  technicalHighlights: string[];
  images: [string, string];
  imageLabels: [string, string];
}

export const SOUTH_AFRICA_FITMENTS: SouthAfricaCustomerFitment[] = [
  {
    id: 'sa-01',
    vehicleTitle: 'BMW G80 M3 COMPETITION xDRIVE',
    chassisCode: 'G80 LCI · MINT GREEN INDIVIDUAL',
    wheelModel: 'BESPOKE FORGED COMMISSION',
    staggeredSpec: '20×9.5" ET18 (F) · 21×10.5" ET20 (R)',
    frontSpec: '20×9.5J ET18 · 275/30 R20 Michelin Pilot Sport 4S',
    rearSpec: '21×10.5J ET20 · 295/25 R21 Michelin Pilot Sport 4S',
    finishName: 'Brushed Liquid Silver',
    city: 'SANDTON, JOHANNESBURG',
    province: 'GAUTENG',
    trackVenue: 'KYALAMI GP & SANDTON STRIP',
    ownerName: 'Kavish N. · Sandton Collector',
    quote:
      '“At 1,750m altitude in Joburg, unsprung weight is everything. FORGED wheels shaved 15.2kg of rotating mass and the stance through Sandton and on the M1 highway is unmatched.”',
    technicalHighlights: [
      'Flush arch profile with zero chassis rubbing',
      'Engineered for Kyalami Grand Prix Circuit lateral Gs',
      'Direct 66.6mm hub-centric machining — zero spacers',
    ],
    images: [
      '/assets/aistudio/1792612987797_635e7cff.jpg',
      '/assets/aistudio/1792613009313_aeeb7665.jpg',
    ],
    imageLabels: ['Front 3/4 Studio Stance & Arch Clearance', 'Full Side Profile & Forged Spoke Milling'],
  },
  {
    id: 'sa-02',
    vehicleTitle: 'BMW G80 M3 COMPETITION SALOON',
    chassisCode: 'G80 M3 · DRAVIT GREY INDIVIDUAL',
    wheelModel: 'BESPOKE FORGED COMMISSION',
    staggeredSpec: '20×9.5" ET18 (F) · 21×10.5" ET20 (R)',
    frontSpec: '20×9.5J ET18 · 275/35 R20 Michelin Cup 2',
    rearSpec: '21×10.5J ET20 · 285/30 R21 Michelin Cup 2',
    finishName: 'Champagne Bronze Brushed',
    city: 'CAMPS BAY, CAPE TOWN',
    province: 'WESTERN CAPE',
    trackVenue: "CHAPMAN'S PEAK PASS",
    ownerName: 'Gerrit van der M. · Atlantic Seaboard',
    quote:
      '“Carving Chapman’s Peak Pass with the Atlantic below—the grip, turn-in precision, and steering feel are completely transformed. FORGED is the only bespoke wheel trusted on Cape Town’s premier M cars.”',
    technicalHighlights: [
      'Carbon-ceramic brake calliper clearance guaranteed',
      'TÜV Rheinland South Africa structural compliance',
      'Forged from aerospace-grade 6061-T6 billet alloy',
    ],
    images: [
      '/assets/aistudio/forged_past_install__6741d2d7.jpeg',
      '/assets/aistudio/m3_bronze_side.jpg',
    ],
    imageLabels: ['Front 3/4 Studio Stance & Caliper Clearance', 'Full Side 90° Profile & Bronze Forged Concavity'],
  },
  {
    id: 'sa-03',
    vehicleTitle: 'BMW G81 M3 TOURING COMPETITION',
    chassisCode: 'G81 TOURING · MINERAL GREY METALLIC',
    wheelModel: 'BESPOKE FORGED COMMISSION',
    staggeredSpec: '20×9.5" ET18 (F) · 20×10.5" ET20 (R)',
    frontSpec: '20×9.5J ET18 · 275/35 R20 Michelin PS4S',
    rearSpec: '20×10.5J ET20 · 285/30 R20 Michelin PS4S',
    finishName: 'Liquid Silver Diamond Cut',
    city: 'STELLENBOSCH, WINELANDS',
    province: 'WESTERN CAPE',
    trackVenue: 'FRANSCHHOEK PASS',
    ownerName: 'Pieter B. · Stellenbosch M Collector',
    quote:
      '“One of the first G81 M3 Tourings delivered in South Africa. FORGED calculated the rear wagon load index and flush clearances before the car even docked in Cape Town port.”',
    technicalHighlights: [
      'Tailored rear touring payload load index rating',
      'Direct hub-centric machining — zero spacers',
      'Custom mirror-cut silver stepped outer flange',
    ],
    images: [
      '/assets/aistudio/m3_touring_front.jpg',
      '/assets/aistudio/forged_customer__3198a902.jpeg',
    ],
    imageLabels: ['Front 3/4 Studio Stance & Muscular Haunches', 'Rear 3/4 Profile & Deep Concave Hub Detail'],
  },
  {
    id: 'sa-04',
    vehicleTitle: 'BMW G82 M4 COMPETITION COUPE',
    chassisCode: 'G82 M4 · FROZEN BROOKLYN GREY',
    wheelModel: 'BESPOKE FORGED COMMISSION',
    staggeredSpec: '20×9.5" ET16 (F) · 21×10.5" ET18 (R)',
    frontSpec: '20×9.5J ET16 · 275/35 R20 Pirelli Trofeo R',
    rearSpec: '21×10.5J ET18 · 295/30 R21 Pirelli Trofeo R',
    finishName: 'Satin Black Track Spec',
    city: 'MIDRAND · KYALAMI GP CIRCUIT',
    province: 'GAUTENG',
    trackVenue: 'KYALAMI MOTORSPORT CLUB',
    ownerName: 'David D. · Kyalami Cup Competitor',
    quote:
      '“Shaved 1.3 seconds off our best Kyalami lap. The scalloped spoke backs evacuate brake heat under heavy braking into Sunset Bend, keeping carbon pad temperatures optimal.”',
    technicalHighlights: [
      'Venturi aero perimeter brake thermal evacuation',
      'Extreme lateral cornering stiffness rating',
      'Ultralight 9.6kg per front wheel (20")',
    ],
    images: [
      '/assets/aistudio/m4_coupe_front.jpg',
      '/assets/aistudio/m4_coupe_side.jpg',
    ],
    imageLabels: ['Front 3/4 Studio Track Stance & Offset', 'Full Side 90° Profile & M4 Silhouette'],
  },
  {
    id: 'sa-05',
    vehicleTitle: 'BMW G87 M2 COUPE TRACK-SPEC',
    chassisCode: 'G87 M2 · ALPINE WHITE',
    wheelModel: 'BESPOKE FORGED COMMISSION',
    staggeredSpec: '20×9.5" ET18 (F) · 20×10.5" ET20 (R)',
    frontSpec: '20×9.5J ET18 · 275/35 R20 Michelin Cup 2',
    rearSpec: '20×10.5J ET20 · 295/30 R20 Michelin Cup 2',
    finishName: 'Anthracite Gunmetal Matte',
    city: 'WATERKLOOF, PRETORIA',
    province: 'GAUTENG',
    trackVenue: 'PRETORIA HIGHWAY CORRIDOR',
    ownerName: 'Dr. Jaco S. · Pretoria East',
    quote:
      '“The G87 M2 has wide boxy arches that look unfinished with factory offsets. FORGED flush fitment brings the wheel face completely flush with the fender lip.”',
    technicalHighlights: [
      'Tailored wide-arch offset eliminates fender gap',
      'Anti-deformation forged rim lip for uneven tarmac',
      'Custom concave 5-window face with milled pockets',
    ],
    images: [
      '/assets/aistudio/m2_coupe_front.jpg',
      '/assets/aistudio/m2_coupe_side.jpg',
    ],
    imageLabels: ['Front 3/4 Studio Flared Arch Stance', 'Full Side 90° Profile & Muscular Haunches'],
  },
  {
    id: 'sa-06',
    vehicleTitle: 'BMW G90 M5 HYBRID SALOON',
    chassisCode: 'G90 M5 · MARINA BAY BLUE METALLIC',
    wheelModel: 'BESPOKE FORGED COMMISSION',
    staggeredSpec: '22×10" ET20 (F) · 22×11.5" ET22 (R)',
    frontSpec: '22×10J ET20 · 285/35 R22 Continental SC7',
    rearSpec: '22×11.5J ET22 · 315/30 R22 Continental SC7',
    finishName: 'Liquid Silver Mirror Lustre',
    city: 'UMHLANGA ARCH, DURBAN',
    province: 'KWAZULU-NATAL',
    trackVenue: 'DOLPHIN COAST HIGHWAY',
    ownerName: 'Themba M. · Durban North',
    quote:
      '“Cruising the coastline from Ballito to Umhlanga Ridge, this stance commands absolute attention. The custom offset gives the heavy G90 a razor-sharp, athletic silhouette.”',
    technicalHighlights: [
      'Reinforced 1,050kg axle rating for hybrid curb weight',
      'High-torque knurled bead seat prevents tyre slip',
      'Ultra-deep concave spoke drop tailored to wide haunches',
    ],
    images: [
      '/assets/aistudio/m5_saloon_front.jpg',
      '/assets/aistudio/m5_saloon_side.jpg',
    ],
    imageLabels: ['Front 3/4 Studio Stance & Flush Fit', 'Full Side 90° Profile & Spoke Detail'],
  },
];

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
              <span>View 16-Grid Bento Gallery</span>
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
                <span className="text-neutral-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#FF5500]" />
                  {selectedFitment.city}, {selectedFitment.province}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-1">
                {selectedFitment.vehicleTitle}
              </h3>
              <p className="text-sm font-tech-mono text-[#FF5500] mb-6">
                {selectedFitment.chassisCode} · {selectedFitment.wheelModel}
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

              {/* Detailed Technical Specifications Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-[#18181D] border border-[#26262E] rounded-2xl p-4 space-y-2 text-xs font-tech-mono">
                  <p className="text-[#FF5500] font-semibold text-[11px] uppercase tracking-wider mb-2">
                    STAGGERED WHEEL SPECIFICATIONS
                  </p>
                  <div className="flex justify-between py-1 border-b border-[#26262E]">
                    <span className="text-neutral-400">Front Setup:</span>
                    <span className="text-white font-semibold">{selectedFitment.frontSpec}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#26262E]">
                    <span className="text-neutral-400">Rear Setup:</span>
                    <span className="text-white font-semibold">{selectedFitment.rearSpec}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#26262E]">
                    <span className="text-neutral-400">Bolt Pattern (PCD):</span>
                    <span className="text-white">5×112 (BMW Direct)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-neutral-400">Center Bore:</span>
                    <span className="text-white">66.6mm Hub-Centric</span>
                  </div>
                </div>

                <div className="bg-[#18181D] border border-[#26262E] rounded-2xl p-4 space-y-2 text-xs font-tech-mono">
                  <p className="text-[#FF5500] font-semibold text-[11px] uppercase tracking-wider mb-2">
                    SOUTH AFRICA BUILD HIGHLIGHTS
                  </p>
                  <ul className="space-y-1.5 text-neutral-300">
                    {selectedFitment.technicalHighlights.map((hl, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#FF5500] shrink-0" />
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2 border-t border-[#26262E] text-neutral-400 text-[11px]">
                    Verified by FORGED South Africa Technical Concierge
                  </div>
                </div>
              </div>

              {/* Owner Testimonial */}
              <blockquote className="bg-[#18181D] border-l-4 border-[#FF5500] p-4 rounded-r-2xl mb-6 text-sm text-[#C2C2CC] italic leading-relaxed">
                {selectedFitment.quote}
                <div className="mt-2 text-xs font-tech-mono not-italic text-[#FF5500] font-semibold">
                  — {selectedFitment.ownerName}
                </div>
              </blockquote>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-[#26262E]">
                <button
                  type="button"
                  onClick={() => {
                    const fit = selectedFitment;
                    setSelectedFitment(null);
                    openEnquiryModal({
                      subject: `Commission a bespoke forged set for ${fit.vehicleTitle} (${fit.city})`,
                      domain: 'brand',
                    });
                  }}
                  className="w-full sm:w-auto bg-[#FF5500] text-white hover:bg-[#FF6B1A] rounded-full px-6 py-3 text-xs font-tech-mono uppercase tracking-wider font-semibold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(255,85,0,0.35)] cursor-pointer"
                >
                  <span>I want to a custom set</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedFitment(null);
                    navigate('/store/collections/bmw-m3-2024-onwards-alloy-wheels');
                  }}
                  className="w-full sm:w-auto border border-[#33333E] text-neutral-300 hover:text-white hover:border-[#FF5500] rounded-full px-5 py-3 text-xs font-tech-mono uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Browse In-Stock Wheel Sets
                </button>

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
