import React, { useEffect, useState } from 'react';
import {
  Bookmark,
  MessageCircle,
  Instagram,
  Phone,
  Shield,
  Check,
  FileText,
  RefreshCw,
} from 'lucide-react';
import {
  WHEEL_FINISHES,
  WheelFinishId,
  formatCurrencyPrice,
  getStoreProductBySlug,
  findWheelBySlug,
  getStoreProductImages,
} from '../../data/kahnData';
import { useKahnStore } from '../../store/useKahnStore';
import { useRouter } from '../../utils/router';
import { StoreHeader } from './StoreHeader';
import { WheelRenderSVG } from '../visuals/WheelRenderSVG';
import { Wheel3DScene } from '../visuals/Wheel3DScene';
import { TechnicalProductViewSkeleton } from '../shared/SkeletonLoaders';
import { LogoPlaceholder } from '../shared/LogoPlaceholder';

interface TechnicalProductViewProps {
  productSlug: string;
}

export const TechnicalProductView: React.FC<TechnicalProductViewProps> = ({
  productSlug,
}) => {
  const { navigate } = useRouter();
  const {
    currency,
    wishlistSlugs,
    toggleWishlist,
    openEnquiryModal,
    setChatOpen,
    sendChatMessage,
    customStoreProducts,
    customBrandWheels,
  } = useKahnStore();

  const product = getStoreProductBySlug(productSlug, customStoreProducts);
  // Photoreal 3D model: product-level override, else the linked brand wheel's model.
  const modelUrl =
    product.modelUrl ?? findWheelBySlug(product.wheelSlug, customBrandWheels)?.modelUrl;
  const productImages = getStoreProductImages(product, customBrandWheels);
  const [selectedFinish, setSelectedFinish] = useState<WheelFinishId>(
    product.defaultFinish
  );
  const [activeAngle, setActiveAngle] = useState<
    'front' | 'three-quarter' | 'concave-detail' | 'barrel-profile'
  >('front');
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'error' | 'subscribed'>('idle');
  const [contactActionFeedback, setContactActionFeedback] = useState<string | null>(null);

  useEffect(() => {
    setSelectedFinish(product.defaultFinish);
    setActiveAngle('front');
    setIsLoadingProduct(true);
    const timer = window.setTimeout(() => {
      setIsLoadingProduct(false);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [product]);

  const handleTriggerSkeletonPreview = () => {
    setIsLoadingProduct(true);
    window.setTimeout(() => {
      setIsLoadingProduct(false);
    }, 650);
  };

  const isBookmarked = wishlistSlugs.includes(product.slug);
  const finishObj = WHEEL_FINISHES[selectedFinish] ?? WHEEL_FINISHES['satin-black'];

  const specRows = [
    { label: 'PRODUCT NAME', value: product.technicalSpecs.productName },
    { label: 'FRONT WHEEL SIZE', value: product.technicalSpecs.frontWheelSize },
    { label: 'REAR WHEEL SIZE', value: product.technicalSpecs.rearWheelSize },
    { label: 'COLOUR', value: finishObj.name.toUpperCase() },
    { label: 'MATERIAL', value: product.technicalSpecs.material },
    { label: 'CONSTRUCTION', value: product.technicalSpecs.construction },
    { label: 'BOLT PATTERN', value: product.technicalSpecs.boltPattern },
    { label: 'PART NO', value: product.technicalSpecs.partNo },
    { label: 'LOAD RATING', value: product.technicalSpecs.loadRating },
    { label: 'CENTER BORE', value: product.technicalSpecs.centerBore },
  ];

  const galleryAngles: Array<{
    id: 'front' | 'three-quarter' | 'concave-detail' | 'barrel-profile';
    label: string;
  }> = [
    { id: 'front', label: '01 / FACE ELEVATION' },
    { id: 'three-quarter', label: '02 / 3/4 CONCAVE PROFILE' },
    { id: 'concave-detail', label: '03 / CNC SPOKE & HUB DETAIL' },
    { id: 'barrel-profile', label: '04 / FORGED BARREL & FLANGE' },
  ];

  // Front / 3/4 concave / barrel are real photographed angles; "concave-detail" reuses
  // the 3/4 shot (WheelRenderSVG already applies a 1.18x zoom for that viewAngle), since
  // no distinct detail angle is photographed yet — see UX roadmap Tier 1.
  const angleImageUrls: Record<(typeof galleryAngles)[number]['id'], string> = {
    front: productImages.images[0],
    'three-quarter': productImages.images[1],
    'concave-detail': productImages.images[1],
    'barrel-profile': productImages.images[2],
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.includes('@') || !newsletterEmail.includes('.')) {
      setNewsletterStatus('error');
      return;
    }
    setNewsletterStatus('subscribed');
    setNewsletterEmail('');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F7]">
      <StoreHeader />

      {isLoadingProduct ? (
        <TechnicalProductViewSkeleton />
      ) : (
        <>
          {/* Breadcrumb Bar */}
          <div className="border-b border-[#26262E] px-4 sm:px-8 py-3 bg-[#121215]">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs font-tech-mono uppercase tracking-wider text-[#C2C2CC]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/store')}
                  className="hover:text-[#FF5500] cursor-pointer"
                >
                  STORE
                </button>
                <span>/</span>
                <button
                  type="button"
                  onClick={() =>
                    navigate('/store/collections/bmw-m3-2024-onwards-alloy-wheels')
                  }
                  className="hover:text-[#FF5500] cursor-pointer"
                >
                  {product.make} {product.model} ({product.yearRange})
                </button>
                <span>/</span>
                <span className="text-[#FF5500] font-semibold">{product.shortModel}</span>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleTriggerSkeletonPreview}
                  className="inline-flex items-center gap-1 text-[#C2C2CC] hover:text-[#FF5500] cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reload Specs</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/wheels/${product.wheelSlug}`)}
                  className="text-[#FF5500] underline underline-offset-4 hover:text-[#FF6B1A] cursor-pointer font-bold"
                >
                  View in FORGED Custom wheels 360° Gallery →
                </button>
              </div>
            </div>
          </div>

          {/* Main Contiguous PDP Layout */}
          <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Left Column: Interactive 360° 3D Wheel Studio */}
              <div className="lg:col-span-7 space-y-4">
                <Wheel3DScene
                  wheelModel={product.shortModel}
                  wheelSeries={product.technicalSpecs.construction}
                  spokeStyle={product.geometry}
                  selectedFinish={selectedFinish}
                  availableFinishes={product.availableFinishes}
                  onSelectFinish={setSelectedFinish}
                  modelUrl={modelUrl}
                />

                {/* Finish Swatch Selector Bar */}
                <div className="p-4 border border-[#26262E] bg-[#121215] flex flex-wrap items-center justify-between gap-4">
                  <span className="text-xs font-tech-mono uppercase tracking-wider font-semibold text-[#F5F5F7]">
                    FINISH SELECTION:{' '}
                    <span className="text-[#FF5500]">{finishObj.name.toUpperCase()}</span>
                  </span>
                  <div className="flex items-center gap-2.5">
                    {product.availableFinishes.map((fId) => {
                      const f = WHEEL_FINISHES[fId];
                      const active = selectedFinish === fId;
                      return (
                        <button
                          key={fId}
                          type="button"
                          onClick={() => setSelectedFinish(fId)}
                          className={`px-3 py-1.5 text-xs font-tech-mono uppercase border transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#FF5500] text-white border-[#FF5500] font-bold'
                              : 'bg-[#18181D] text-[#C2C2CC] border-[#26262E] hover:border-[#FF5500] hover:text-white'
                          }`}
                        >
                          {f.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Contiguous Purchase & Technical Enquiry Module */}
              <div className="lg:col-span-5 space-y-6">
                {/* Title + Bookmark Ribbon Icon */}
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight leading-tight text-[#F5F5F7]">
                    {product.title}
                  </h1>
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product.slug)}
                    aria-label={isBookmarked ? 'Remove from Wishlist' : 'Save to Wishlist'}
                    aria-pressed={isBookmarked}
                    className={`w-11 h-11 border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                      isBookmarked
                        ? 'bg-[#18181D] text-[#FF5500] border-[#FF5500]'
                        : 'border-[#26262E] bg-[#121215] text-[#C2C2CC] hover:border-[#FF5500] hover:text-[#FF5500]'
                    }`}
                  >
                    <Bookmark className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} />
                  </button>
                </div>

                {/* Tags: LATEST / RESERVE / SET OF 4 */}
                <div className="flex flex-wrap items-center gap-2">
                  {product.isLatest && (
                    <span className="border border-[#FF5500] text-[#FF5500] text-xs font-tech-mono font-semibold uppercase px-3 py-1">
                      LATEST
                    </span>
                  )}
                  {product.isReserve && (
                    <span className="bg-[#18181D] text-[#F5F5F7] border border-[#26262E] text-xs font-tech-mono font-semibold uppercase px-3 py-1">
                      RESERVE
                    </span>
                  )}
                  <span className="text-xs font-tech-mono font-semibold uppercase text-[#C2C2CC] pl-1">
                    {product.setLabel} · {product.diameterBadge} STAGGERED
                  </span>
                </div>

                {/* Price £4,600.00 */}
                <div className="py-4 border-y border-[#26262E] flex items-baseline justify-between">
                  <div>
                    <p className="text-3xl sm:text-4xl font-extrabold font-tech-mono tabular-nums text-[#FF5500]">
                      {formatCurrencyPrice(product.priceGBP, currency, true)}
                    </p>
                    <p className="text-xs font-tech-mono text-neutral-400 mt-1">
                      INCL. UK VAT · WORLDWIDE EXPORT TAX-FREE AVAILABLE
                    </p>
                  </div>
                  <span className="text-xs font-tech-mono font-semibold uppercase text-emerald-400">
                    IN STOCK (UK DISPATCH)
                  </span>
                </div>

                {/* Primary CTA: Bespoke Interest Request Form (No e-commerce checkout) */}
                <div className="space-y-3">
                  <div className="relative group">
                    <div
                      aria-hidden="true"
                      className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-[#FF5500] via-[#FF6B1A] to-[#FF3300] opacity-75 blur-xs group-hover:opacity-100 transition duration-200"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        openEnquiryModal({
                          subject: `${product.title} (${finishObj.name})`,
                          partNo: product.technicalSpecs.partNo,
                          finish: finishObj.name,
                          priceGBP: product.priceGBP,
                          domain: 'store',
                        })
                      }
                      className="relative w-full bg-[#FF5500] text-white rounded-full py-4 px-6 text-sm font-bold font-tech-mono uppercase tracking-[0.18em] hover:bg-[#FF6B1A] transition-colors cursor-pointer shadow-lg inline-flex items-center justify-center gap-2.5"
                    >
                      <FileText className="w-4 h-4" />
                      <span>STATE INTEREST &amp; REQUEST SPECIFICATION</span>
                    </button>
                  </div>

                  {/* Secondary Direct Fitment Verification Form Action */}
                  <button
                    type="button"
                    onClick={() =>
                      openEnquiryModal({
                        subject: `Chassis Fitment Clearance Check: ${product.title}`,
                        partNo: product.technicalSpecs.partNo,
                        finish: finishObj.name,
                        domain: 'store',
                      })
                    }
                    className="w-full border border-[#26262E] bg-[#121215] text-[#F5F5F7] hover:border-[#FF5500] hover:text-[#FF5500] py-3.5 px-6 text-xs font-tech-mono font-bold uppercase tracking-[0.16em] inline-flex items-center justify-center gap-2 transition-colors cursor-pointer rounded-full"
                  >
                    <span>REQUEST FITMENT VERIFICATION DOSSIER</span>
                  </button>
                </div>

                {/* 3-Column Direct Social / Contact Bar (WhatsApp, IG, Phone) */}
                <div className="space-y-2">
                  <p className="text-[11px] font-tech-mono uppercase tracking-wider text-[#C2C2CC]">
                    DIRECT TECHNICAL FITMENT DESK:
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setContactActionFeedback(
                          `Connected to FORGED Custom wheels WhatsApp Specialist for Part ${product.technicalSpecs.partNo}`
                        );
                        setChatOpen(true);
                        sendChatMessage(
                          `WhatsApp Fitment Check: ${product.title} (${product.technicalSpecs.partNo})`
                        );
                      }}
                      aria-label="Enquire via WhatsApp"
                      className="bg-[#25D366] text-white py-3 px-3 flex items-center justify-center gap-2 text-xs font-tech-mono font-bold uppercase hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 shrink-0" />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setContactActionFeedback(
                          'FORGED Custom wheels Official Build Portfolio tagged for ' +
                            product.shortModel
                        )
                      }
                      aria-label="Connect via Instagram"
                      className="bg-[#E1306C] text-white py-3 px-3 flex items-center justify-center gap-2 text-xs font-tech-mono font-bold uppercase hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      <Instagram className="w-4 h-4 shrink-0" />
                      <span>Instagram</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openEnquiryModal({
                          subject: `Priority Telephone Fitment Order: ${product.shortModel}`,
                          partNo: product.technicalSpecs.partNo,
                          finish: finishObj.name,
                          priceGBP: product.priceGBP,
                          domain: 'store',
                        })
                      }
                      aria-label="Call FORGED Custom wheels Specialist"
                      className="bg-[#18181D] border border-[#26262E] text-white hover:border-[#FF5500] hover:text-[#FF5500] py-3 px-3 flex items-center justify-center gap-2 text-xs font-tech-mono font-bold uppercase transition-colors cursor-pointer"
                    >
                      <Phone className="w-4 h-4 shrink-0" />
                      <span>Phone</span>
                    </button>
                  </div>
                  {contactActionFeedback && (
                    <p className="text-xs font-tech-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-2">
                      {contactActionFeedback}
                    </p>
                  )}
                </div>

                {/* Zebra-Striped 2-Column Technical Specification Table */}
                <div className="pt-2">
                  <h2 className="text-xs font-tech-mono font-bold uppercase tracking-[0.16em] mb-3 text-[#F5F5F7]">
                    TECHNICAL FITMENT SPECIFICATIONS
                  </h2>
                  <div
                    className="border border-[#26262E] divide-y divide-[#26262E]"
                    data-testid="technical-spec-table"
                  >
                    {specRows.map((row, idx) => (
                      <div
                        key={row.label}
                        className={`grid grid-cols-12 text-xs font-tech-mono ${
                          idx % 2 === 0 ? 'bg-[#141418]' : 'bg-[#18181D]'
                        }`}
                      >
                        <div className="col-span-5 p-3 font-semibold text-[#C2C2CC] border-r border-[#26262E] uppercase">
                          {row.label}
                        </div>
                        <div className="col-span-7 p-3 font-bold text-[#F5F5F7] tabular-nums uppercase">
                          {row.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ABOUT & IMPORTANT INFORMATION Bulleted Lists */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 pt-10 border-t border-[#26262E]">
              <div className="border border-[#26262E] p-6 bg-[#121215]">
                <h3 className="text-sm font-tech-mono font-bold uppercase tracking-[0.16em] pb-3 mb-4 border-b border-[#26262E] text-[#F5F5F7]">
                  ABOUT
                </h3>
                <ul className="space-y-2.5 text-sm text-[#C2C2CC] list-disc pl-5">
                  {product.aboutBullets.map((bullet, i) => (
                    <li key={i} className="leading-relaxed">
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border border-[#26262E] p-6 bg-[#18181D]">
                <h3 className="text-sm font-tech-mono font-bold uppercase tracking-[0.16em] pb-3 mb-4 border-b border-[#26262E] text-[#F5F5F7]">
                  IMPORTANT INFORMATION
                </h3>
                <ul className="space-y-2.5 text-sm text-[#C2C2CC] list-disc pl-5">
                  {product.importantInfoBullets.map((bullet, i) => (
                    <li key={i} className="leading-relaxed">
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* 2x2 Angle Gallery Grid */}
            <section className="mt-12 pt-10 border-t border-[#26262E]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-tech-mono font-bold uppercase tracking-[0.16em] text-[#F5F5F7]">
                  MULTI-ANGLE METALLURGY &amp; CONCAVE INSPECTION (2X2 GALLERY)
                </h3>
                <span className="text-xs font-tech-mono text-[#C2C2CC]">
                  CLICK ANY QUADRANT TO FOCUS STAGE
                </span>
              </div>

              <div className="grid grid-cols-2 border-t border-l border-[#26262E]">
                {galleryAngles.map((angleItem) => (
                  <button
                    key={angleItem.id}
                    type="button"
                    onClick={() => {
                      setActiveAngle(angleItem.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`border-r border-b border-[#26262E] p-6 sm:p-10 flex flex-col items-center justify-between bg-[#121215] hover:bg-[#18181D] transition-colors cursor-pointer ${
                      activeAngle === angleItem.id ? 'ring-2 ring-inset ring-[#FF5500]' : ''
                    }`}
                  >
                    <div className="w-36 h-36 sm:w-56 sm:h-56">
                      <WheelRenderSVG
                        geometry={product.geometry}
                        finish={selectedFinish}
                        viewAngle={angleItem.id}
                        imageUrl={angleImageUrls[angleItem.id]}
                        label={product.shortModel}
                      />
                    </div>
                    <span className="mt-4 text-xs font-tech-mono font-semibold uppercase tracking-widest text-[#F5F5F7]">
                      {angleItem.label}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </main>
        </>
      )}

      {/* Onyx Newsletter Footer */}
      <footer className="bg-[#0A0A0A] text-[#F5F5F7] mt-16 border-t border-[#26262E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-14 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-6 space-y-3">
            <LogoPlaceholder label="IMAGE PLACEHOLDER · LOGO" variant="dark" />
            <p className="text-xs font-tech-mono uppercase tracking-[0.18em] text-[#FF5500] pt-1 font-bold">
              FORGED CUSTOM WHEELS · PRIVATE CLIENT DISPATCH
            </p>
            <h3 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-[#F5F5F7]">
              JOIN THE FORGED ALLOCATION LIST
            </h3>
            <p className="text-sm text-[#C2C2CC] max-w-md">
              Receive priority notice on limited-edition FORGED Custom wheels production runs and private BMW showroom events.
            </p>
          </div>

          <div className="lg:col-span-6 flex flex-col justify-center">
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => {
                  setNewsletterEmail(e.target.value);
                  if (newsletterStatus !== 'idle') setNewsletterStatus('idle');
                }}
                placeholder="ENTER YOUR EMAIL ADDRESS..."
                aria-label="Email address for FORGED Custom wheels allocation list"
                className="flex-1 h-12 px-4 bg-[#18181D] border border-[#26262E] text-xs font-tech-mono text-[#F5F5F7] placeholder-neutral-500 focus:outline-none focus:border-[#FF5500]"
              />
              <button
                type="submit"
                className="h-12 px-8 bg-[#FF5500] text-white font-tech-mono text-xs font-bold uppercase tracking-[0.16em] hover:bg-[#FF6B1A] transition-colors cursor-pointer whitespace-nowrap shadow-md"
              >
                SUBSCRIBE
              </button>
            </form>
            {newsletterStatus === 'error' && (
              <p className="text-xs font-tech-mono text-[#FF5500] mt-2">
                Please enter a valid email address.
              </p>
            )}
            {newsletterStatus === 'subscribed' && (
              <p className="text-xs font-tech-mono text-[#25D366] mt-2 inline-flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>You are registered for FORGED Custom wheels release alerts.</span>
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-[#26262E] px-4 sm:px-8 py-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-tech-mono text-[#C2C2CC]">
            <span>© 2026 FORGED CUSTOM WHEELS LTD. ALL RIGHTS RESERVED.</span>
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="hover:text-[#FF5500] cursor-pointer"
              >
                FORGED CUSTOM WHEELS PORTAL
              </button>
              <button
                type="button"
                onClick={() => navigate('/store')}
                className="hover:text-[#FF5500] cursor-pointer"
              >
                FORGED CUSTOM WHEELS STORE
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
