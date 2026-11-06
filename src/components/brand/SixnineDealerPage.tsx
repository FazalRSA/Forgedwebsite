import React, { useMemo, useState } from 'react';
import { ArrowUpRight, ShieldCheck, Layers, Gauge, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { BrandHeader } from './BrandHeader';
import { BRAND_WHEELS, BrandWheelItem } from '../../data/kahnData';
import { WheelLightboxModal } from './WheelLightboxModal';
import { useKahnStore } from '../../store/useKahnStore';
import { useRouter } from '../../utils/router';

type SixnineSeriesFilter = 'ALL' | 'FF-1' | 'FF-3';

const SIXNINE_PILLARS = [
  {
    index: '01',
    title: 'German Engineering & TÜV Certification',
    description:
      'Designed and developed in Germany, every Sixnine wheel undergoes stringent Finite Element Analysis (FEA) and impact testing. Each model carries official German TÜV verification for high-load performance saloons and coupes.',
  },
  {
    index: '02',
    title: 'Modular Interchangeable Architecture',
    description:
      'Sixnine pioneered a modular wheel concept across the FF-ONE (FF-1) and FF-THREE (FF-3) lineups. Interchangeable aerodynamic inlays and hardware components are cross-compatible, allowing owners to evolve their wheel aesthetic without replacing the barrel.',
  },
  {
    index: '03',
    title: 'Bespoke BMW G8X Staggered Concavity',
    description:
      'Machined to exact BMW M hub-centric tolerances (PCD 5×112 · CB 66.6mm) in staggered 20-inch front and 21-inch rear diameters. Aggressive ET15/17 and ET15/20 offsets sit flush with M3 (G80) arches while clearing M Compound and Carbon-Ceramic calipers.',
  },
];

const SIXNINE_SERIES_SPECS = [
  {
    series: 'SIXNINE FF-1 (FF-ONE)',
    geometry: '10-Spoke Directional Aero-Turbine',
    diameters: '20" Front / 21" Rear Staggered',
    boltPattern: 'PCD 5×112 · Center Bore 66.6mm',
    offsets: 'ET15 Front / ET17–ET20 Rear',
    finishes: 'Liquid Metal · Silver',
    modularity: 'Compatible with Sixnine Aero Rings & Inlays',
    priceRange: 'R 80,000 – R 95,000 / Set',
  },
  {
    series: 'SIXNINE FF-3 (FF-THREE)',
    geometry: 'Deep-Concave Split Y-Spoke',
    diameters: '20" Front / 21" Rear Staggered',
    boltPattern: 'PCD 5×112 · Center Bore 66.6mm',
    offsets: 'ET15 Front / ET17 Rear',
    finishes: 'Liquid Metal · Pure Bronze · Glossy Black',
    modularity: 'Full cross-compatibility with FF-1 inlays & hardware',
    priceRange: 'R 80,000 – R 95,000 / Set',
  },
];

const DEALER_ASSURANCES = [
  '100% Genuine German-developed Sixnine Wheels with serialized barrel authentication',
  'Physical in-stock sets ready for immediate inspection and dispatch',
  'Direct 66.6mm BMW M hub-centric bore — zero spigot rings or adapters required',
  'Full OEM BMW TPMS sensor and floating center-cap compatibility',
];

export const SixnineDealerPage: React.FC = () => {
  const { openEnquiryModal } = useKahnStore();
  const { navigate } = useRouter();

  const [seriesFilter, setSeriesFilter] = useState<SixnineSeriesFilter>('ALL');
  const [selectedWheel, setSelectedWheel] = useState<BrandWheelItem | null>(null);

  const sixnineWheels = useMemo(() => {
    return BRAND_WHEELS.filter(
      (wheel) => wheel.modelCode === 'FF-1' || wheel.modelCode === 'FF-3'
    );
  }, []);

  const filteredWheels = useMemo(() => {
    if (seriesFilter === 'ALL') return sixnineWheels;
    return sixnineWheels.filter((wheel) => wheel.modelCode === seriesFilter);
  }, [sixnineWheels, seriesFilter]);

  const totalSetsInStock = useMemo(() => {
    return sixnineWheels.reduce(
      (sum, item) => sum + (item.stockQuantitySets ?? 1),
      0
    );
  }, [sixnineWheels]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F7]">
      <BrandHeader forceLight={false} />

      {/* Editorial Hero Section */}
      <section className="border-b border-[#26262E] px-6 md:px-10 py-16 md:py-24 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
          <div className="lg:col-span-8 space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-tech-mono uppercase tracking-[0.18em] text-[#FF5500]">
              <span>AUTHORIZED RETAIL &amp; DISTRIBUTION PARTNER</span>
              <span aria-hidden="true">·</span>
              <span>GERMAN WHEEL ARCHITECTURE</span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-light tracking-[-0.03em] leading-[0.98] text-white text-balance">
              Official Dealer of{' '}
              <span className="font-editorial-serif italic font-normal text-[#FF5500]">
                Sixnine Wheels
              </span>
              .
            </h1>

            <p className="text-base sm:text-lg text-[#C2C2CC] max-w-2xl leading-relaxed pt-1">
              Developed in Germany for high-output European performance marques,{' '}
              <span className="text-white font-medium">SIXNINE WHEELS</span> combines
              TÜV-certified structural engineering with a patented modular spoke and inlay
              ecosystem. As an official dealer, we maintain physical stock of the flagship{' '}
              <span className="text-white font-medium">FF-1 (FF-ONE)</span> and{' '}
              <span className="text-white font-medium">FF-3 (FF-THREE)</span> series in
              dedicated 20&quot;/21&quot; staggered BMW M3 (G80) fitments.
            </p>

            <div className="pt-3 flex flex-wrap items-center gap-4">
              <a
                href="#sixnine-inventory"
                className="px-7 py-3.5 rounded-full bg-[#FF5500] hover:bg-[#FF6B1A] text-white text-xs font-tech-mono font-semibold uppercase tracking-[0.16em] transition-all shadow-[0_0_20px_rgba(255,85,0,0.3)] whitespace-nowrap shrink-0"
              >
                Explore In-Stock Sets ({totalSetsInStock})
              </a>

              <button
                type="button"
                onClick={() =>
                  openEnquiryModal({
                    subject: 'Sixnine Wheels — Official Dealer Allocation Enquiry',
                    domain: 'brand',
                  })
                }
                className="px-7 py-3.5 rounded-full border border-[#33333E] hover:border-[#FF5500] text-[#F5F5F7] hover:text-[#FF5500] text-xs font-tech-mono uppercase tracking-[0.16em] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                Request Custom Sixnine Spec
              </button>
            </div>
          </div>

          {/* Right Key Metrics Block */}
          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-[#26262E] pt-8 lg:pt-0 lg:pl-10 space-y-6">
            <div>
              <p className="text-xs font-tech-mono uppercase tracking-[0.14em] text-neutral-400">
                ORIGIN &amp; CERTIFICATION
              </p>
              <p className="text-xl font-light text-white mt-1 tabular-nums">
                Designed in Germany · TÜV Approved
              </p>
            </div>

            <div className="border-t border-[#26262E] pt-5">
              <p className="text-xs font-tech-mono uppercase tracking-[0.14em] text-neutral-400">
                IN-STOCK BMW M3 (G80) ALLOCATION
              </p>
              <p className="text-xl font-light text-white mt-1 tabular-nums">
                {totalSetsInStock} Complete Sets · 5 Finishes
              </p>
            </div>

            <div className="border-t border-[#26262E] pt-5">
              <p className="text-xs font-tech-mono uppercase tracking-[0.14em] text-neutral-400">
                DIRECT FITMENT SPECIFICATION
              </p>
              <p className="text-sm font-tech-mono text-[#FF5500] mt-1 tabular-nums">
                20&quot; / 21&quot; · PCD 5×112 · CB 66.6mm
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Engineering Pillars of Sixnine */}
      <section className="border-b border-[#26262E] px-6 md:px-10 py-16 md:py-20">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-tech-mono uppercase tracking-[0.18em] text-[#FF5500]">
              ABOUT SIXNINE WHEELS
            </p>
            <h2 className="text-2xl sm:text-4xl font-light tracking-tight text-white text-balance">
              Why Enthusiasts Specify Sixnine Architecture.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SIXNINE_PILLARS.map((pillar) => (
              <div
                key={pillar.index}
                className="bg-[#121215] border border-[#26262E] rounded-2xl p-7 flex flex-col justify-between space-y-5"
              >
                <span className="text-xs font-tech-mono text-[#FF5500] tracking-[0.18em]">
                  {pillar.index}.
                </span>
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-white tracking-tight">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-[#C2C2CC] leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live In-Stock Sixnine Wheel Catalogue (FF-1 & FF-3) */}
      <section
        id="sixnine-inventory"
        className="border-b border-[#26262E] px-6 md:px-10 py-16 md:py-20"
      >
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <p className="text-xs font-tech-mono uppercase tracking-[0.18em] text-[#FF5500]">
                VERIFIED DEALER STOCK · IMMEDIATE DISPATCH
              </p>
              <h2 className="text-2xl sm:text-4xl font-light tracking-tight text-white">
                Sixnine FF-1 &amp; FF-3 Collection.
              </h2>
            </div>

            {/* Clean Segmented Filter Control */}
            <div className="flex items-center gap-1.5 p-1 bg-[#121215] border border-[#26262E] rounded-full self-start">
              {(['ALL', 'FF-1', 'FF-3'] as const).map((tab) => {
                const active = seriesFilter === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setSeriesFilter(tab)}
                    className={`px-4 py-2 rounded-full text-xs font-tech-mono uppercase tracking-[0.14em] transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-[#FF5500] text-white font-semibold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {tab === 'ALL' ? `All Sixnine (${sixnineWheels.length})` : `${tab} Series`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Minimalist Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWheels.map((wheel) => {
              const primaryImage = wheel.images?.[0] || wheel.imageUrl;
              return (
                <article
                  key={wheel.id}
                  onClick={() => setSelectedWheel(wheel)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedWheel(wheel);
                    }
                  }}
                  className="group bg-[#121215] border border-[#26262E] hover:border-[#FF5500] rounded-2xl overflow-hidden transition-colors cursor-pointer flex flex-col justify-between focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF5500]"
                >
                  <div className="relative aspect-square w-full bg-[#0E0E12] overflow-hidden">
                    {primaryImage && (
                      <motion.img
                        src={primaryImage}
                        alt={`Sixnine ${wheel.model}`}
                        referrerPolicy="no-referrer"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2 text-xs font-tech-mono text-neutral-400 tabular-nums">
                        <span>SIXNINE {wheel.modelCode}</span>
                        <span>·</span>
                        <span>{wheel.sizesAvailable}</span>
                        <span className="ml-auto text-[#FF5500]">
                          {wheel.stockQuantitySets ?? 1}{' '}
                          {(wheel.stockQuantitySets ?? 1) === 1 ? 'SET' : 'SETS'} IN STOCK
                        </span>
                      </div>

                      <h3 className="text-lg font-medium text-white group-hover:text-[#FF5500] transition-colors">
                        Sixnine {wheel.model}
                      </h3>

                      <p className="text-xs text-neutral-400">
                        BMW {wheel.compatibleCars} · {wheel.technicalSpecSheet}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#26262E] flex items-center justify-between">
                      <span className="text-base font-medium text-white font-tech-mono tabular-nums">
                        {wheel.priceFormatted}
                      </span>

                      <span className="inline-flex items-center gap-1.5 text-xs font-tech-mono uppercase tracking-wider text-neutral-300 group-hover:text-[#FF5500] transition-colors">
                        <span>Inspect 3D &amp; Specs</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Series Technical Comparison: FF-1 vs FF-3 */}
      <section className="border-b border-[#26262E] px-6 md:px-10 py-16 md:py-20">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="space-y-2">
            <p className="text-xs font-tech-mono uppercase tracking-[0.18em] text-[#FF5500]">
              TECHNICAL COMPARISON
            </p>
            <h2 className="text-2xl sm:text-4xl font-light tracking-tight text-white">
              FF-1 (FF-ONE) vs. FF-3 (FF-THREE) Specifications.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {SIXNINE_SERIES_SPECS.map((spec) => (
              <div
                key={spec.series}
                className="bg-[#121215] border border-[#26262E] rounded-2xl p-7 space-y-6"
              >
                <div className="border-b border-[#26262E] pb-4 flex items-center justify-between gap-4">
                  <h3 className="text-xl font-medium text-white tracking-tight">
                    {spec.series}
                  </h3>
                  <span className="text-xs font-tech-mono text-[#FF5500] tabular-nums">
                    {spec.priceRange}
                  </span>
                </div>

                <dl className="space-y-3.5 text-sm">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b border-[#1E1E26] pb-3">
                    <dt className="text-neutral-400">Spoke Architecture</dt>
                    <dd className="text-white font-medium sm:text-right">{spec.geometry}</dd>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b border-[#1E1E26] pb-3">
                    <dt className="text-neutral-400">Staggered Sizing</dt>
                    <dd className="text-white font-tech-mono tabular-nums sm:text-right">
                      {spec.diameters}
                    </dd>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b border-[#1E1E26] pb-3">
                    <dt className="text-neutral-400">PCD &amp; Center Bore</dt>
                    <dd className="text-white font-tech-mono tabular-nums sm:text-right">
                      {spec.boltPattern}
                    </dd>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b border-[#1E1E26] pb-3">
                    <dt className="text-neutral-400">G80 M3 Offsets</dt>
                    <dd className="text-white font-tech-mono tabular-nums sm:text-right">
                      {spec.offsets}
                    </dd>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b border-[#1E1E26] pb-3">
                    <dt className="text-neutral-400">In-Stock Finishes</dt>
                    <dd className="text-white sm:text-right">{spec.finishes}</dd>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <dt className="text-neutral-400">Modular System</dt>
                    <dd className="text-[#C2C2CC] sm:text-right">{spec.modularity}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Official Dealer Assurance & Direct Consultation CTA */}
      <section className="px-6 md:px-10 py-16 md:py-24">
        <div className="max-w-7xl mx-auto bg-[#121215] border border-[#26262E] rounded-3xl p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center gap-2 text-xs font-tech-mono uppercase tracking-[0.18em] text-[#FF5500]">
              <ShieldCheck className="w-4 h-4" />
              <span>OFFICIAL DEALER AUTHENTICITY GUARANTEE</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-light tracking-tight text-white text-balance">
              Commission Your Sixnine Set Through an Authorized Specialist.
            </h2>

            <ul className="space-y-3 pt-2">
              {DEALER_ASSURANCES.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-[#C2C2CC]">
                  <Check className="w-4 h-4 text-[#FF5500] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-5 lg:border-l border-[#26262E] lg:pl-10 space-y-5">
            <div className="space-y-2">
              <p className="text-xs font-tech-mono uppercase tracking-[0.15em] text-neutral-400">
                READY FOR FITMENT OR NATIONWIDE DELIVERY
              </p>
              <p className="text-sm text-[#C2C2CC] leading-relaxed">
                Reserve any in-stock FF-1 or FF-3 set directly or speak with our fitment
                engineers regarding modular aero inlays and tyre packages for your BMW M.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
              <button
                type="button"
                onClick={() =>
                  openEnquiryModal({
                    subject: 'Reserve Sixnine FF-1 / FF-3 Wheel Set',
                    domain: 'brand',
                  })
                }
                className="w-full py-3.5 px-6 rounded-full bg-[#FF5500] hover:bg-[#FF6B1A] text-white text-xs font-tech-mono font-semibold uppercase tracking-[0.16em] transition-all shadow-[0_0_20px_rgba(255,85,0,0.25)] cursor-pointer text-center whitespace-nowrap"
              >
                Reserve a Sixnine Set
              </button>

              <button
                type="button"
                onClick={() => navigate('/client-fitments')}
                className="w-full py-3.5 px-6 rounded-full border border-[#33333E] hover:border-[#FF5500] text-[#F5F5F7] hover:text-[#FF5500] text-xs font-tech-mono uppercase tracking-[0.16em] transition-colors cursor-pointer text-center whitespace-nowrap"
              >
                View BMW Client Fitments
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive 2D / 360° 3D Wheel Lightbox Modal */}
      <WheelLightboxModal
        wheel={selectedWheel}
        onClose={() => setSelectedWheel(null)}
      />
    </div>
  );
};
