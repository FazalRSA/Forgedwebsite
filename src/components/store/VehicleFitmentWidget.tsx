import React from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import {
  formatCurrencyPrice,
  getAllStoreProducts,
  getAvailableMakes,
  getFitmentNode,
  getMatchingProductsForFitment,
  getModelsForMake,
} from '../../data/kahnData';
import { useKahnStore } from '../../store/useKahnStore';
import { useRouter } from '../../utils/router';
import { StoreHeader } from './StoreHeader';
import { VehicleProfileRender } from '../visuals/VehicleProfileRender';
import { WheelRenderSVG } from '../visuals/WheelRenderSVG';

export const VehicleFitmentWidget: React.FC = () => {
  const { navigate } = useRouter();
  const {
    selectedMake,
    selectedModel,
    selectedYear,
    selectedPart,
    setSelectedMake,
    setSelectedModel,
    setSelectedYear,
    setSelectedPart,
    savedVehicle,
    saveVehicleSession,
    currency,
    customStoreProducts,
  } = useKahnStore();

  const allStoreProducts = getAllStoreProducts(customStoreProducts);
  const makes = getAvailableMakes();
  const models = selectedMake ? getModelsForMake(selectedMake) : [];
  const activeNode =
    selectedMake && selectedModel ? getFitmentNode(selectedMake, selectedModel) : undefined;
  const years = activeNode ? activeNode.years : [];
  const parts = activeNode ? activeNode.parts : ['ALLOY WHEELS'];

  const matchingProducts =
    selectedMake && selectedModel
      ? getMatchingProductsForFitment(selectedMake, selectedModel, customStoreProducts)
      : [];

  const isSelectionValid = Boolean(selectedMake && selectedModel && activeNode);

  const handleFitmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSelectionValid || !activeNode) return;

    const yearLabel = selectedYear || activeNode.years[0];
    saveVehicleSession({
      make: selectedMake,
      model: selectedModel,
      year: yearLabel,
      part: selectedPart || 'ALLOY WHEELS',
      collectionSlug: activeNode.collectionSlug,
      label: `${selectedMake} ${selectedModel} (${yearLabel})`,
    });

    navigate(`/store/collections/${activeNode.collectionSlug}`);
  };

  const handleContinueSavedVehicle = () => {
    navigate(`/store/collections/${savedVehicle.collectionSlug}`);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F7]">
      <StoreHeader />

      {/* Full-Bleed Hero & Vehicle Fitment Engine */}
      <section className="relative bg-[#0A0A0A] text-[#F5F5F7] overflow-hidden border-b border-[#26262E]">
        {/* Background Studio Vehicle Silhouette with Measured Scrim */}
        <div className="absolute inset-0 opacity-30 pointer-events-none flex items-center justify-end pr-4">
          <div className="w-full max-w-5xl">
            <VehicleProfileRender
              make={selectedMake || 'BMW'}
              model={selectedModel || 'M3'}
              primaryColorHex={activeNode?.bannerColorHex || '#0F4C35'}
              accentColorHex={activeNode?.bannerAccentHex || '#1B7A56'}
              wheelGeometry="y-spoke-forged"
              wheelFinish="satin-black"
            />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-[#0A0A0A]/60 pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-12 md:py-20">
          {/* Headline */}
          <div className="max-w-3xl mb-8">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-light tracking-[-0.03em] leading-tight text-white">
              The world&apos;s leading automotive fashion house.
            </h1>
          </div>

          {/* Vehicle Fitment Box */}
          <div
            className="bg-[#121215]/95 backdrop-blur-md p-5 sm:p-8 border border-[#26262E] rounded-2xl max-w-4xl shadow-2xl"
            data-testid="vehicle-fitment-widget"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-5 border-b border-[#26262E]">
              <h2 className="text-base sm:text-lg font-medium tracking-tight text-white">
                Select your vehicle
              </h2>
            </div>

            <form onSubmit={handleFitmentSubmit} className="space-y-5">
              {/* 2x2 Grid of Cascading Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Step 1: MAKE */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="fitment-make"
                    className="text-[11px] font-tech-mono uppercase tracking-[0.14em] text-[#C2C2CC]"
                  >
                    1. MAKE
                  </label>
                  <select
                    id="fitment-make"
                    value={selectedMake}
                    onChange={(e) => setSelectedMake(e.target.value)}
                    className="w-full h-12 px-4 bg-[#18181D] border border-[#26262E] text-[#F5F5F7] text-xs font-tech-mono uppercase tracking-wider focus:border-[#FF5500] focus:outline-none cursor-pointer"
                  >
                    <option value="">SELECT MAKE...</option>
                    {makes.map((make) => (
                      <option key={make} value={make}>
                        {make}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Step 2: MODEL */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="fitment-model"
                    className="text-[11px] font-tech-mono uppercase tracking-[0.14em] text-[#C2C2CC]"
                  >
                    2. MODEL
                  </label>
                  <select
                    id="fitment-model"
                    value={selectedModel}
                    disabled={!selectedMake}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full h-12 px-4 bg-[#18181D] border border-[#26262E] text-[#F5F5F7] text-xs font-tech-mono uppercase tracking-wider disabled:opacity-45 disabled:cursor-not-allowed focus:border-[#FF5500] focus:outline-none cursor-pointer"
                  >
                    <option value="">
                      {selectedMake ? 'SELECT MODEL...' : 'SELECT MAKE FIRST'}
                    </option>
                    {models.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Step 3: YEAR */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="fitment-year"
                    className="text-[11px] font-tech-mono uppercase tracking-[0.14em] text-[#C2C2CC]"
                  >
                    3. YEAR
                  </label>
                  <select
                    id="fitment-year"
                    value={selectedYear}
                    disabled={!selectedModel}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full h-12 px-4 bg-[#18181D] border border-[#26262E] text-[#F5F5F7] text-xs font-tech-mono uppercase tracking-wider disabled:opacity-45 disabled:cursor-not-allowed focus:border-[#FF5500] focus:outline-none cursor-pointer"
                  >
                    <option value="">
                      {selectedModel ? 'SELECT YEAR...' : 'SELECT MODEL FIRST'}
                    </option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Step 4: PART (OPTIONAL) */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="fitment-part"
                    className="text-[11px] font-tech-mono uppercase tracking-[0.14em] text-[#C2C2CC]"
                  >
                    4. PART (OPTIONAL)
                  </label>
                  <select
                    id="fitment-part"
                    value={selectedPart}
                    disabled={!selectedModel}
                    onChange={(e) => setSelectedPart(e.target.value)}
                    className="w-full h-12 px-4 bg-[#18181D] border border-[#26262E] text-[#F5F5F7] text-xs font-tech-mono uppercase tracking-wider disabled:opacity-45 disabled:cursor-not-allowed focus:border-[#FF5500] focus:outline-none cursor-pointer"
                  >
                    <option value="">ALL PARTS</option>
                    {parts.map((part) => (
                      <option key={part} value={part}>
                        {part}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic Count CTA Button */}
              <button
                type="submit"
                disabled={!isSelectionValid}
                className={`w-full py-4 px-6 text-xs sm:text-sm font-bold uppercase tracking-[0.16em] transition-colors ${
                  isSelectionValid
                    ? 'bg-[#FF5500] text-white hover:bg-[#FF6B1A] shadow-[0_0_24px_rgba(255,85,0,0.35)] cursor-pointer'
                    : 'bg-[#18181D] text-neutral-500 border border-[#26262E] cursor-not-allowed'
                }`}
              >
                {isSelectionValid
                  ? `SHOW ${matchingProducts.length} ${selectedPart || 'ALLOY WHEELS'}`
                  : 'SELECT A MAKE TO BEGIN'}
              </button>
            </form>

            {/* Persisted Session Recall Link */}
            <div className="mt-4 pt-4 border-t border-[#26262E] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleContinueSavedVehicle}
                className="text-xs font-tech-mono uppercase tracking-wider text-[#C2C2CC] hover:text-[#FF5500] underline underline-offset-4 text-left cursor-pointer"
              >
                CONTINUE WITH YOUR {savedVehicle.label}
              </button>

              {/* Popular Categories Horizontal Pill Tags */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() =>
                    navigate('/store/collections/bmw-m3-2024-onwards-alloy-wheels')
                  }
                  className="px-3 py-1 border border-[#26262E] hover:border-[#FF5500] text-[11px] font-tech-mono uppercase tracking-wider text-[#C2C2CC] hover:text-white whitespace-nowrap shrink-0 cursor-pointer bg-[#18181D]"
                >
                  BMW M3 (2024+)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    navigate('/store/collections/bmw-m4-2024-onwards-alloy-wheels')
                  }
                  className="px-3 py-1 border border-[#26262E] hover:border-[#FF5500] text-[11px] font-tech-mono uppercase tracking-wider text-[#C2C2CC] hover:text-white whitespace-nowrap shrink-0 cursor-pointer bg-[#18181D]"
                >
                  BMW M4 G82
                </button>
                <button
                  type="button"
                  onClick={() =>
                    navigate('/store/collections/bmw-m5-2024-onwards-alloy-wheels')
                  }
                  className="px-3 py-1 border border-[#26262E] hover:border-[#FF5500] text-[11px] font-tech-mono uppercase tracking-wider text-[#C2C2CC] hover:text-white whitespace-nowrap shrink-0 cursor-pointer bg-[#18181D]"
                >
                  BMW M5 G90
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Technical Storefront Grid below the hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-tech-mono uppercase tracking-[0.15em] text-[#FF5500] mb-1 font-bold">
              DIRECT DISPATCH · UK &amp; GLOBAL FREIGHT
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#F5F5F7]">
              FEATURED FORGED FITMENT PACKAGES
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate('/store/collections/bmw-m3-2024-onwards-alloy-wheels')}
            className="text-xs font-tech-mono font-bold uppercase tracking-wider underline underline-offset-4 text-[#C2C2CC] hover:text-[#FF5500] cursor-pointer inline-flex items-center gap-1"
          >
            <span>VIEW BMW M3 (2024+) COLLECTION</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#FF5500]" />
          </button>
        </div>

        {/* Brutalist 2-Column / 4-Column Store Preview Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 border-t border-l border-[#26262E]">
          {allStoreProducts.slice(0, 4).map((product) => (
            <article
              key={product.id}
              className="border-r border-b border-[#26262E] p-4 sm:p-6 flex flex-col justify-between bg-[#121215] relative group hover:border-[#FF5500] transition-colors"
            >
              <div>
                <div className="flex items-center gap-1.5 mb-3">
                  {product.isLatest && (
                    <span className="border border-[#FF5500] text-[#FF5500] text-[10px] font-tech-mono font-semibold uppercase px-2 py-0.5">
                      LATEST
                    </span>
                  )}
                  {product.isReserve && (
                    <span className="bg-[#18181D] text-[#F5F5F7] border border-[#26262E] text-[10px] font-tech-mono font-semibold uppercase px-2 py-0.5">
                      RESERVE
                    </span>
                  )}
                </div>

                {/* Vertical Right-Edge Watermark */}
                <span
                  aria-hidden="true"
                  className="writing-vertical-rl absolute top-14 right-2 text-[10px] font-tech-mono tracking-[0.2em] text-[#26262E] group-hover:text-neutral-700 select-none"
                >
                  FORGED CUSTOM WHEELS
                </span>

                <button
                  type="button"
                  onClick={() => navigate(`/store/products/${product.slug}`)}
                  className="w-full aspect-square p-4 flex flex-col items-center justify-center cursor-pointer"
                >
                  <div className="w-4/5 h-4/5 transition-transform duration-200 group-hover:scale-105">
                    <WheelRenderSVG
                      geometry={product.geometry}
                      finish={product.defaultFinish}
                      imageUrl={product.imageUrl}
                      label={product.shortModel}
                    />
                  </div>
                  <span className="mt-2 border border-[#26262E] bg-[#18181D] text-[#C2C2CC] px-2.5 py-0.5 text-[11px] font-tech-mono font-semibold">
                    {product.diameterBadge}
                  </span>
                </button>
              </div>

              <div className="pt-3 space-y-2">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-tight leading-snug line-clamp-2 text-[#F5F5F7]">
                  {product.title}
                </h3>
                <div className="flex items-baseline justify-between">
                  <span className="text-base font-bold font-tech-mono tabular-nums text-[#FF5500]">
                    {formatCurrencyPrice(product.priceGBP, currency)}
                  </span>
                  <span className="text-[11px] font-tech-mono uppercase text-[#C2C2CC]">
                    {product.setLabel}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/store/products/${product.slug}`)}
                  className="w-full py-2.5 border border-[#26262E] text-xs font-tech-mono font-bold uppercase tracking-wider text-[#F5F5F7] hover:bg-[#FF5500] hover:text-white hover:border-[#FF5500] transition-colors cursor-pointer"
                >
                  VIEW PRODUCT
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Technical Trust Strip */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 border border-[#26262E] divide-y md:divide-y-0 md:divide-x divide-[#26262E] bg-[#121215]">
          <div className="p-5 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-[#FF5500]" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#F5F5F7]">
                GERMAN TÜV &amp; JWL HOMOLOGATED
              </h4>
              <p className="text-xs text-[#C2C2CC] mt-1 leading-relaxed">
                Every forged wheel set undergoes finite element radial fatigue and kerb impact testing.
              </p>
            </div>
          </div>
          <div className="p-5 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-[#FF5500]" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#F5F5F7]">
                DIRECT OEM CENTER CAP &amp; TPMS FITMENT
              </h4>
              <p className="text-xs text-[#C2C2CC] mt-1 leading-relaxed">
                Machined to exact factory center-bore tolerances—no hub rings or spacers required.
              </p>
            </div>
          </div>
          <div className="p-5 flex items-start gap-3">
            <ArrowRight className="w-5 h-5 shrink-0 mt-0.5 text-[#FF5500]" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#F5F5F7]">
                BRADFORD &amp; CHELSEA SHOWROOM FITTING
              </h4>
              <p className="text-xs text-[#C2C2CC] mt-1 leading-relaxed">
                Book turnkey wheel, Michelin Pilot Sport 4S tyre, and laser alignment installation.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
