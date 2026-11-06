import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Maximize2,
  X,
  Disc3,
  Camera,
  Car,
} from 'lucide-react';
import {
  WHEEL_FINISHES,
  WheelFinishId,
  getAllBrandWheels,
  getWheelBySlug,
  getWheelImages,
} from '../../data/kahnData';
import { useRouter } from '../../utils/router';
import { useKahnStore } from '../../store/useKahnStore';
import { useFirebaseAuth } from '../../context/FirebaseContext';
import { BrandHeader } from './BrandHeader';
import { Wheel3DScene } from '../visuals/Wheel3DScene';
import { WheelLightboxModal } from './WheelLightboxModal';

interface WheelShowcasePDPProps {
  slug: string;
}

export const WheelShowcasePDP: React.FC<WheelShowcasePDPProps> = ({ slug }) => {
  const { navigate } = useRouter();
  const { openEnquiryModal, customBrandWheels } = useKahnStore();
  const { user, profile } = useFirebaseAuth();

  const allWheels = getAllBrandWheels(customBrandWheels);
  const wheel = getWheelBySlug(slug, customBrandWheels);

  const [selectedFinish, setSelectedFinish] = useState<WheelFinishId>(
    wheel.defaultFinish
  );
  const [viewMode, setViewMode] = useState<'3d' | 'photos'>('3d');
  const [activePhotoIdx, setActivePhotoIdx] = useState<0 | 1 | 2>(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (
      profile?.preferredFinish &&
      wheel.availableFinishes.includes(profile.preferredFinish)
    ) {
      setSelectedFinish(profile.preferredFinish);
    } else {
      setSelectedFinish(wheel.defaultFinish);
    }
    setActivePhotoIdx(0);
    setLightboxOpen(false);
    setViewMode('3d');
  }, [wheel, profile?.preferredFinish]);

  // Keyboard navigation for Left/Right arrow photo cycling when in photo mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode === 'photos' || lightboxOpen) {
        if (e.key === 'ArrowRight') {
          setActivePhotoIdx((prev) => ((prev + 1) % 3) as 0 | 1 | 2);
        } else if (e.key === 'ArrowLeft') {
          setActivePhotoIdx((prev) => ((prev - 1 + 3) % 3) as 0 | 1 | 2);
        }
      }
      if (e.key === 'Escape' && lightboxOpen) {
        setLightboxOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, lightboxOpen]);

  const finishObj = WHEEL_FINISHES[selectedFinish] ?? WHEEL_FINISHES.silver;
  const wheelGallery = getWheelImages(wheel);

  const userVehicleLabel = profile
    ? `${profile.primaryYear} ${profile.primaryMake} ${profile.primaryModel} (${profile.brakeSystem})`
    : null;

  const handleEnquireWheel = () => {
    const carContext = profile
      ? ` for ${profile.primaryYear} ${profile.primaryMake} ${profile.primaryModel}`
      : '';
    openEnquiryModal({
      subject: `FORGED ${wheel.model} (${finishObj.name}) Specification Request${carContext}`,
      finish: finishObj.name,
      priceGBP: wheel.basePriceGBP,
      domain: 'brand',
    });
  };

  const handleNextPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActivePhotoIdx((prev) => ((prev + 1) % 3) as 0 | 1 | 2);
  };

  const handlePrevPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActivePhotoIdx((prev) => ((prev - 1 + 3) % 3) as 0 | 1 | 2);
  };

  const specRows = [
    { label: 'PRODUCT', value: wheel.specs.product },
    { label: 'MATERIAL', value: wheel.specs.material },
    { label: 'DIAMETERS', value: wheel.specs.diameters },
    { label: 'FINISH OPTIONS', value: wheel.specs.finishOptions },
    { label: 'TESTING', value: wheel.specs.testing },
    { label: 'WARRANTY', value: wheel.specs.warranty },
  ];

  return (
    <div className="bg-[#0A0A0A] text-[#F5F5F7] pb-28">
      <BrandHeader forceLight={false} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 pt-6">
        {/* Top Bar: Breadcrumbs + 3D Studio / Photography Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.14em] text-neutral-400"
          >
            <button
              type="button"
              onClick={() => navigate('/')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Home
            </button>
            <span>/</span>
            <button
              type="button"
              onClick={() => navigate('/#catalogue')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Wheels
            </button>
            <span>/</span>
            <span className="text-white font-semibold">{wheel.model}</span>
          </nav>

          {/* Segmented Mode Toggle: 360° 3D Studio vs Photography */}
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#121216] border border-[#26262E] self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('3d')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-2 transition-colors cursor-pointer ${
                viewMode === '3d'
                  ? 'bg-[#FF5500] text-white font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Disc3 className="w-3.5 h-3.5" />
              <span>360° 3D Wheel Studio</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('photos')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-2 transition-colors cursor-pointer ${
                viewMode === 'photos'
                  ? 'bg-[#22222A] text-white font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Fitment Photography (3)</span>
            </button>
          </div>
        </div>

        {/* Title & Garage Pairing Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#FF5500] mb-1.5">
              FORGED CUSTOM WHEELS · {wheel.series}
            </p>
            <h1 className="text-3xl sm:text-5xl font-semibold tracking-[-0.03em] text-white">
              {wheel.model}
            </h1>
          </div>

          <button
            type="button"
            onClick={() => navigate('/account')}
            className="self-start md:self-auto px-3.5 py-2 rounded-xl bg-[#121216] border border-[#26262E] hover:border-[#FF5500] text-xs font-mono text-neutral-300 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Car className="w-3.5 h-3.5 text-[#FF5500]" />
            <span>
              {user && profile
                ? `Garage: ${profile.primaryYear} ${profile.primaryMake} ${profile.primaryModel}`
                : 'Pair with My Car in Account Garage →'}
            </span>
          </button>
        </div>

        {/* Main Interactive Stage: 360° 3D Three.js Scene OR 3-Angle Photography */}
        <section className="mb-14">
          {viewMode === '3d' ? (
            <Wheel3DScene
              wheelModel={wheel.model}
              wheelSeries={wheel.series}
              spokeStyle={wheel.geometry}
              selectedFinish={selectedFinish}
              availableFinishes={wheel.availableFinishes}
              onSelectFinish={setSelectedFinish}
              onEnquire={handleEnquireWheel}
              userVehicleLabel={userVehicleLabel}
            />
          ) : (
            <div className="flex flex-col items-center">
              <div
                role="region"
                aria-label={`${wheel.model} 3-Image Gallery Stage`}
                className="relative w-full max-w-4xl aspect-[16/10] bg-[#121215] border border-[#26262E] rounded-3xl overflow-hidden select-none shadow-2xl"
              >
                <img
                  src={wheelGallery.images[activePhotoIdx]}
                  alt={`${wheel.model} - ${wheelGallery.labels[activePhotoIdx]}`}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onClick={() => setLightboxOpen(true)}
                  className="w-full h-full object-cover transition-all duration-500 cursor-zoom-in"
                />

                <button
                  type="button"
                  onClick={handlePrevPhoto}
                  aria-label="Previous wheel image"
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#0A0A0A]/80 hover:bg-[#FF5500] border border-white/20 text-white flex items-center justify-center transition-colors cursor-pointer z-20"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={handleNextPhoto}
                  aria-label="Next wheel image"
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#0A0A0A]/80 hover:bg-[#FF5500] border border-white/20 text-white flex items-center justify-center transition-colors cursor-pointer z-20"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  aria-label="Open Fullscreen Lightbox Window"
                  className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-[#0A0A0A]/85 border border-[#33333E] hover:border-[#FF5500] text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                <div className="absolute bottom-4 inset-x-4 flex items-center justify-between gap-2.5 z-20">
                  <div className="bg-[#0A0A0A]/90 border border-[#26262E] px-3.5 py-1.5 rounded-full text-xs font-mono text-neutral-200">
                    {wheelGallery.labels[activePhotoIdx]}
                  </div>

                  <div className="flex items-center gap-1.5 bg-[#0A0A0A]/90 border border-[#26262E] p-1 rounded-full">
                    {[0, 1, 2].map((idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActivePhotoIdx(idx as 0 | 1 | 2)}
                        className={`px-3 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer ${
                          activePhotoIdx === idx
                            ? 'bg-[#FF5500] text-white font-bold'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        Photo {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Editorial Copy & Structured Specifications List */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-8 border-t border-[#26262E]">
          <div className="lg:col-span-5 space-y-4">
            <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#FF5500]">
              DESIGN MONOGRAPH
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] leading-tight text-white">
              {wheel.headline}
            </h2>
            <p className="text-base text-neutral-300">{wheel.editorialLead}</p>
            <p className="text-sm text-neutral-400 leading-relaxed">
              {wheel.editorialBody}
            </p>

            <div className="pt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  navigate(`/store/products/${wheel.compatibleStoreProductSlug}`)
                }
                className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.12em] font-semibold border border-[#33333E] text-[#F5F5F7] rounded-xl px-5 py-3 hover:border-[#FF5500] hover:text-[#FF5500] transition-colors cursor-pointer"
              >
                <span>Technical Fitment Dossier</span>
                <ArrowUpRight className="w-4 h-4 text-[#FF5500]" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-7">
            <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#FF5500] mb-2">
              TECHNICAL ARCHITECTURE
            </p>
            <div className="border-t border-[#26262E]">
              {specRows.map((row) => (
                <div
                  key={row.label}
                  className="border-b border-[#26262E] py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <span className="text-xs font-mono uppercase tracking-[0.12em] text-neutral-400 shrink-0">
                    {row.label}
                  </span>
                  <span className="text-sm font-medium text-white sm:text-right">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Other Wheels in the Collection */}
        <section className="mt-16 pt-12 border-t border-[#26262E]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold tracking-tight text-white">
              Explore Peer Forged Designs in 360° 3D
            </h3>
            <button
              type="button"
              onClick={() => navigate('/#catalogue')}
              className="text-xs font-mono uppercase tracking-[0.12em] text-[#FF5500] hover:underline underline-offset-4 cursor-pointer"
            >
              View All ({allWheels.length})
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {allWheels
              .filter((w) => w.slug !== wheel.slug)
              .slice(0, 4)
              .map((peer) => {
                const peerData = getWheelImages(peer);
                return (
                  <button
                    key={peer.id}
                    type="button"
                    onClick={() => navigate(`/wheels/${peer.slug}`)}
                    className="text-left group cursor-pointer"
                  >
                    <div className="bg-[#121215] border border-[#26262E] group-hover:border-[#FF5500] rounded-2xl aspect-square overflow-hidden relative transition-colors">
                      <img
                        src={peerData.images[0]}
                        alt={peer.model}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-[9px] font-mono text-neutral-300">
                        360° 3D
                      </div>
                    </div>
                    <p className="text-xs font-mono uppercase tracking-widest mt-2 font-semibold text-[#F5F5F7] group-hover:text-[#FF5500] transition-colors truncate">
                      {peer.model}
                    </p>
                  </button>
                );
              })}
          </div>
        </section>
      </main>

      {/* Fullscreen High-Resolution Lightbox Gallery */}
      {lightboxOpen && (
        <WheelLightboxModal
          wheel={wheel}
          initialAngleIdx={activePhotoIdx}
          initialFinish={selectedFinish}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
};
