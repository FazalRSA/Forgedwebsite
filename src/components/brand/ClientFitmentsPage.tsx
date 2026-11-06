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

export interface ClientFitmentItem {
  id: string;
  slotLabel: string;
  vehicleTitle: string;
  chassisCode: string;
  wheelModel: string;
  wheelSlug: string;
  storeProductSlug: string;
  staggeredSpec: string;
  finishName: string;
  clientCity: string;
  bentoClass: string;
  accentHex: string;
  images: [string, string];
  imageLabels: [string, string];
}

export const CLIENT_FITMENT_ITEMS: ClientFitmentItem[] = [
  // 1. BMW G80 M3 Competition (Mint / Tiffany Blue)
  {
    id: 'fitment-01',
    slotLabel: '01 / 08',
    vehicleTitle: 'BMW G80 M3 COMPETITION — MINT INDIVIDUAL',
    chassisCode: 'G80 · MINT GREEN / CYAN INDIVIDUAL',
    wheelModel: 'TYPE 52 FORGED',
    wheelSlug: 'type-52',
    storeProductSlug: 'bmw-m3-type-52-forged',
    staggeredSpec: '20x9.5" ET18 / 21x10.5" ET20',
    finishName: 'Brushed Liquid Silver',
    clientCity: 'SANDTON, JOHANNESBURG',
    bentoClass: 'min-h-[300px] sm:min-h-[340px]',
    accentHex: '#43C59E',
    images: [
      '/assets/aistudio/1792612987797_635e7cff.jpg',
      '/assets/aistudio/1792613009313_aeeb7665.jpg',
    ],
    imageLabels: ['Front 3/4 Studio Stance & Arch Clearance', 'Full Side 90° Profile & Forged Monoblock Detail'],
  },
  // 2. BMW G80 M3 Competition (Dravit Grey) — User Uploaded Commission
  {
    id: 'fitment-02',
    slotLabel: '02 / 08',
    vehicleTitle: 'BMW G80 M3 COMPETITION — DRAVIT GREY',
    chassisCode: 'G80 · DRAVIT GREY METALLIC',
    wheelModel: 'RS 3.0 HERITAGE FORGED',
    wheelSlug: 'rs-3-0',
    storeProductSlug: 'bmw-m3-rs-3-0',
    staggeredSpec: '20x9.5" ET18 / 21x10.5" ET20',
    finishName: 'Champagne Bronze Brushed',
    clientCity: 'CAMPS BAY, CAPE TOWN',
    bentoClass: 'min-h-[300px] sm:min-h-[340px]',
    accentHex: '#C5B095',
    images: [
      '/assets/aistudio/forged_past_install__6741d2d7.jpeg',
      '/assets/aistudio/m3_bronze_side.jpg',
    ],
    imageLabels: ['Front 3/4 Studio Stance & Carbon Caliper Clearance', 'Full Side 90° Profile & Flush Stance'],
  },
  // 3. BMW G81 M3 Touring Competition (Mineral Grey) — User Uploaded Commission
  {
    id: 'fitment-03',
    slotLabel: '03 / 08',
    vehicleTitle: 'BMW G81 M3 TOURING COMPETITION',
    chassisCode: 'G81 · MINERAL GREY METALLIC',
    wheelModel: 'LD RS MONOBLOCK FORGED',
    wheelSlug: 'ld-rs',
    storeProductSlug: 'bmw-m3-ld-rs-forged',
    staggeredSpec: '20x9.5" ET18 / 20x10.5" ET20',
    finishName: 'Liquid Silver Diamond Cut',
    clientCity: 'STELLENBOSCH, WINELANDS',
    bentoClass: 'min-h-[300px] sm:min-h-[340px]',
    accentHex: '#8E959E',
    images: [
      '/assets/aistudio/m3_touring_front.jpg',
      '/assets/aistudio/forged_customer__3198a902.jpeg',
    ],
    imageLabels: ['Front 3/4 Studio Stance & Touring Haunches', 'Rear 3/4 Profile & Deep Concave Hub Detail'],
  },
  // 4. BMW G82 M4 Competition Coupe (Frozen Brooklyn Grey)
  {
    id: 'fitment-04',
    slotLabel: '04 / 08',
    vehicleTitle: 'BMW G82 M4 COMPETITION COUPE',
    chassisCode: 'G82 · FROZEN BROOKLYN GREY',
    wheelModel: 'TYPE 52 COMPETITION FORGED',
    wheelSlug: 'type-52',
    storeProductSlug: 'bmw-m3-type-52-forged',
    staggeredSpec: '20x9.5" ET16 / 21x10.5" ET18',
    finishName: 'Satin Black',
    clientCity: 'MUNICH, GERMANY',
    bentoClass: 'min-h-[300px] sm:min-h-[340px]',
    accentHex: '#2B2D42',
    images: [
      '/assets/aistudio/m4_coupe_front.jpg',
      '/assets/aistudio/m4_coupe_side.jpg',
    ],
    imageLabels: ['Front 3/4 Studio Track Stance & Offset', 'Full Side 90° Profile & M4 Coupe Silhouette'],
  },
  // 5. BMW G87 M2 Coupe Track-Spec (Alpine White)
  {
    id: 'fitment-05',
    slotLabel: '05 / 08',
    vehicleTitle: 'BMW G87 M2 COUPE TRACK-SPEC',
    chassisCode: 'G87 · ALPINE WHITE',
    wheelModel: 'MONDIAL RETRO MONOBLOCK',
    wheelSlug: 'mondial-retro',
    storeProductSlug: 'bmw-m2-mondial-retro-forged',
    staggeredSpec: '20x9.5" ET18 / 20x10.5" ET20',
    finishName: 'Anthracite Gunmetal Matte',
    clientCity: 'KYALAMI GP CIRCUIT, MIDRAND',
    bentoClass: 'min-h-[320px] sm:min-h-[360px]',
    accentHex: '#4A4E54',
    images: [
      '/assets/aistudio/m2_coupe_front.jpg',
      '/assets/aistudio/m2_coupe_side.jpg',
    ],
    imageLabels: ['Front 3/4 Studio Flared Arch Stance', 'Full Side 90° Profile & Muscular Silhouette'],
  },
  // 6. BMW G90 M5 Hybrid Saloon (Marina Bay Blue)
  {
    id: 'fitment-06',
    slotLabel: '06 / 08',
    vehicleTitle: 'BMW G90 M5 HYBRID SALOON',
    chassisCode: 'G90 · MARINA BAY BLUE METALLIC',
    wheelModel: 'VENGEANCE DIRECTIONAL TURBINE',
    wheelSlug: 'vengeance-wb',
    storeProductSlug: 'bmw-m5-vengeance-forged',
    staggeredSpec: '22x10.0" ET20 / 22x11.5" ET22',
    finishName: 'Liquid Silver Mirror Lustre',
    clientCity: 'UMHLANGA ARCH, DURBAN',
    bentoClass: 'min-h-[320px] sm:min-h-[360px]',
    accentHex: '#1D3557',
    images: [
      '/assets/aistudio/m5_saloon_front.jpg',
      '/assets/aistudio/m5_saloon_side.jpg',
    ],
    imageLabels: ['Front 3/4 Studio Stance & 22" Monoblock Fit', 'Full Side 90° Profile & Directional Turbine Blades'],
  },
  // 7. BMW G80 M3 Competition — Champagne Bronze Staggered
  {
    id: 'fitment-07',
    slotLabel: '07 / 08',
    vehicleTitle: 'BMW G80 M3 CS COMPETITION',
    chassisCode: 'G80 · DRAVIT GREY CARBON ARCH',
    wheelModel: 'RS 3.0 HERITAGE FORGED',
    wheelSlug: 'rs-3-0',
    storeProductSlug: 'bmw-m3-rs-3-0',
    staggeredSpec: '20x9.5" ET18 / 21x10.5" ET20',
    finishName: 'Champagne Bronze Brushed',
    clientCity: 'SILVERSTONE, UK',
    bentoClass: 'min-h-[320px] sm:min-h-[360px]',
    accentHex: '#C5B095',
    images: [
      '/assets/aistudio/forged_past_install__6741d2d7.jpeg',
      '/assets/aistudio/m3_bronze_side.jpg',
    ],
    imageLabels: ['Front 3/4 Studio Stance & Track Offset', 'Full Side 90° Profile & Spoke Detailing'],
  },
  // 8. BMW G81 M3 Touring Edition — Liquid Silver Staggered
  {
    id: 'fitment-08',
    slotLabel: '08 / 08',
    vehicleTitle: 'BMW G81 M3 TOURING ATELIER SPEC',
    chassisCode: 'G81 · MINERAL GREY INDIVIDUAL',
    wheelModel: 'LD RS MONOBLOCK FORGED',
    wheelSlug: 'ld-rs',
    storeProductSlug: 'bmw-m3-ld-rs-forged',
    staggeredSpec: '20x9.5" ET18 / 20x10.5" ET20',
    finishName: 'Liquid Silver Diamond Cut',
    clientCity: 'ZURICH, SWITZERLAND',
    bentoClass: 'min-h-[320px] sm:min-h-[360px]',
    accentHex: '#8E959E',
    images: [
      '/assets/aistudio/m3_touring_front.jpg',
      '/assets/aistudio/forged_customer__3198a902.jpeg',
    ],
    imageLabels: ['Front 3/4 Studio Stance & Touring Haunches', 'Rear 3/4 Profile & Deep Concave Hub Detail'],
  },
];

export const ClientFitmentsPage: React.FC = () => {
  const { navigate } = useRouter();
  const { openEnquiryModal } = useKahnStore();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [modalPhotoIndex, setModalPhotoIndex] = useState<0 | 1>(0);
  const [cardPhotoIndices, setCardPhotoIndices] = useState<Record<string, 0 | 1>>({});
  const [filterModel, setFilterModel] = useState<'ALL' | 'M3' | 'M4' | 'M2' | 'M5'>('ALL');
  const [customImagesBySlot, setCustomImagesBySlot] = useState<Record<string, [string?, string?]>>({});

  const visibleItems =
    filterModel === 'ALL'
      ? CLIENT_FITMENT_ITEMS
      : CLIENT_FITMENT_ITEMS.filter((item) => item.vehicleTitle.includes(filterModel));

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
            {(['ALL', 'M3', 'M4', 'M2', 'M5'] as const).map((model) => {
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
                  {model === 'ALL' ? 'ALL BMW (16)' : `BMW ${model}`}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Scrollable 4x4 Bento Grid of 16 Clean Fitments */}
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
                      BMW FITMENT SPECIFICATION
                    </p>
                    <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight mt-1 text-white">
                      {activeItem.vehicleTitle}
                    </h2>
                  </div>

                  <div className="divide-y divide-[#26262E] border-y border-[#26262E] text-xs font-tech-mono">
                    <div className="py-2.5 flex items-center justify-between gap-2">
                      <span className="text-neutral-400">WHEEL MODEL</span>
                      <span className="font-semibold text-white">{activeItem.wheelModel}</span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between gap-2">
                      <span className="text-neutral-400">STAGGERED SPEC</span>
                      <span className="font-semibold text-white">{activeItem.staggeredSpec}</span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between gap-2">
                      <span className="text-neutral-400">FINISH</span>
                      <span className="font-semibold text-[#FF5500] uppercase">{activeItem.finishName}</span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between gap-2">
                      <span className="text-neutral-400">HUB BORE</span>
                      <span className="font-semibold text-white">66.6MM DIRECT HUB-CENTRIC</span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between gap-2">
                      <span className="text-neutral-400">BOLT PATTERN</span>
                      <span className="font-semibold text-white">5 × 112 DIRECT BOLT-ON</span>
                    </div>
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
                        subject: `Fitment Specification: ${activeItem.vehicleTitle} (${activeItem.wheelModel})`,
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
                      navigate(`/wheels/${target}`);
                    }}
                    className="w-full py-3 px-5 rounded-full border border-[#33333E] text-[#F5F5F7] text-xs font-tech-mono font-bold uppercase tracking-[0.14em] hover:border-[#FF5500] hover:text-[#FF5500] inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap transition-colors"
                  >
                    <span>Open 360° Wheel Showcase</span>
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
