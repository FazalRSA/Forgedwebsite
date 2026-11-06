import React, { useMemo, useState } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import {
  StoreSortOption,
  VEHICLE_FITMENT_TREE,
  filterAndSortStoreProducts,
  formatCurrencyPrice,
  resolveCollectionBySlug,
} from '../../data/kahnData';
import { useKahnStore } from '../../store/useKahnStore';
import { useRouter } from '../../utils/router';
import { StoreHeader } from './StoreHeader';
import { VehicleProfileRender } from '../visuals/VehicleProfileRender';
import { WheelRenderSVG } from '../visuals/WheelRenderSVG';

interface FitmentCollectionViewProps {
  fitmentSlug: string;
}

export const FitmentCollectionView: React.FC<FitmentCollectionViewProps> = ({
  fitmentSlug,
}) => {
  const { navigate } = useRouter();
  const { currency, saveVehicleSession, customStoreProducts, openEnquiryModal } = useKahnStore();

  const { node, make, products } = useMemo(
    () => resolveCollectionBySlug(fitmentSlug, customStoreProducts),
    [fitmentSlug, customStoreProducts]
  );

  const [isExpandedSeo, setIsExpandedSeo] = useState(false);
  const [saleOnly, setSaleOnly] = useState(false);
  const [selectedDiameter, setSelectedDiameter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<StoreSortOption>('featured');
  const [showVehicleSwitcher, setShowVehicleSwitcher] = useState(false);

  const filteredProducts = useMemo(
    () =>
      filterAndSortStoreProducts(products, {
        saleOnly,
        diameter: selectedDiameter,
        sortBy,
      }),
    [products, saleOnly, selectedDiameter, sortBy]
  );

  const handleQuickSwitchVehicle = (
    targetMake: string,
    targetModel: string,
    targetSlug: string,
    year: string
  ) => {
    saveVehicleSession({
      make: targetMake,
      model: targetModel,
      year,
      part: 'ALLOY WHEELS',
      collectionSlug: targetSlug,
      label: `${targetMake} ${targetModel} (${year})`,
    });
    setShowVehicleSwitcher(false);
    setSelectedDiameter(null);
    setSaleOnly(false);
    navigate(`/store/collections/${targetSlug}`);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F7]">
      <StoreHeader />

      {/* Top Vehicle Render Banner & Expandable SEO Copy */}
      <section className="bg-[#121215] border-b border-[#26262E] px-4 sm:px-8 py-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Side-profile PNG/SVG studio render of the selected car (e.g. Green BMW M3) */}
          <div className="lg:col-span-6 bg-[#18181D] border border-[#26262E] p-4 sm:p-6">
            <VehicleProfileRender
              make={make}
              model={node.model}
              primaryColorHex={node.bannerColorHex}
              accentColorHex={node.bannerAccentHex}
              wheelGeometry="y-spoke-forged"
              wheelFinish="satin-black"
            />
          </div>

          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-tech-mono uppercase tracking-[0.14em] text-[#C2C2CC]">
              <button
                type="button"
                onClick={() => navigate('/store')}
                className="hover:text-[#FF5500] underline underline-offset-4 cursor-pointer"
              >
                STORE
              </button>
              <span>/</span>
              <span>{make}</span>
              <span>/</span>
              <span className="text-[#FF5500] font-semibold">{node.model}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight leading-none text-[#F5F5F7]">
              {node.vehicleLabel}
            </h1>

            <p className="text-sm text-[#C2C2CC] leading-relaxed">
              {isExpandedSeo ? node.seoDescriptionFull : node.seoDescriptionShort}
            </p>

            <button
              type="button"
              onClick={() => setIsExpandedSeo((prev) => !prev)}
              aria-expanded={isExpandedSeo}
              className="text-xs font-tech-mono font-bold uppercase tracking-[0.15em] underline underline-offset-4 text-[#FF5500] hover:text-[#FF6B1A] cursor-pointer"
            >
              {isExpandedSeo ? 'COLLAPSE ▲' : 'EXPAND ▼'}
            </button>
          </div>
        </div>
      </section>

      {/* Sticky Horizontal Filter & Sort Bar */}
      <div className="sticky top-[84px] z-30 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#26262E] px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: MAKE / MODEL v, SORT BY v, SALE pill, Diameter pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {/* MAKE / MODEL v Quick Switcher */}
            <button
              type="button"
              onClick={() => setShowVehicleSwitcher((prev) => !prev)}
              className="px-3.5 py-2 border border-[#26262E] bg-[#18181D] hover:border-[#FF5500] text-[#F5F5F7] text-xs font-tech-mono font-semibold uppercase tracking-wider inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#FF5500]" />
              <span>
                MAKE / MODEL ({make} {node.model})
              </span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {/* SORT BY v */}
            <div className="relative shrink-0">
              <select
                aria-label="Sort Fitment Products"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as StoreSortOption)}
                className="px-3.5 py-2 border border-[#26262E] bg-[#18181D] text-[#F5F5F7] text-xs font-tech-mono font-semibold uppercase tracking-wider focus:outline-none focus:border-[#FF5500] cursor-pointer"
              >
                <option value="featured">SORT BY: FEATURED</option>
                <option value="latest">SORT BY: LATEST</option>
                <option value="price-asc">PRICE: LOW TO HIGH</option>
                <option value="price-desc">PRICE: HIGH TO LOW</option>
              </select>
            </div>

            {/* Electric Orange SALE Pill */}
            <button
              type="button"
              onClick={() => setSaleOnly((prev) => !prev)}
              aria-pressed={saleOnly}
              className={`px-3.5 py-2 text-xs font-tech-mono font-bold uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                saleOnly
                  ? 'bg-[#FF5500] text-white border border-[#FF5500]'
                  : 'bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/40 hover:bg-[#FF5500] hover:text-white'
              }`}
            >
              SALE
            </button>

            {/* Wheel Diameter Pills (20", 20-21", 22") */}
            {(['20"', '20-21"', '22"'] as const).map((diam) => {
              const active = selectedDiameter === diam;
              return (
                <button
                  key={diam}
                  type="button"
                  onClick={() =>
                    setSelectedDiameter((prev) => (prev === diam ? null : diam))
                  }
                  aria-pressed={active}
                  className={`px-3.5 py-2 border text-xs font-tech-mono font-semibold uppercase tracking-wider transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#FF5500] text-white border-[#FF5500]'
                      : 'border-[#26262E] bg-[#18181D] text-[#C2C2CC] hover:border-[#FF5500] hover:text-white'
                  }`}
                >
                  {diam}
                </button>
              );
            })}

            {(saleOnly || selectedDiameter) && (
              <button
                type="button"
                onClick={() => {
                  setSaleOnly(false);
                  setSelectedDiameter(null);
                }}
                className="px-3 py-2 text-xs font-tech-mono uppercase underline text-[#FF5500] hover:text-[#FF6B1A] whitespace-nowrap shrink-0 cursor-pointer"
              >
                RESET FILTERS
              </button>
            )}
          </div>

          <span className="text-xs font-tech-mono uppercase tracking-wider text-[#C2C2CC] tabular-nums">
            {filteredProducts.length} PRODUCTS
          </span>
        </div>

        {/* Quick Vehicle Switcher Panel */}
        {showVehicleSwitcher && (
          <div className="max-w-7xl mx-auto mt-3 p-4 bg-[#121215] text-[#F5F5F7] border border-[#26262E] grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-2 shadow-2xl">
            {Object.entries(VEHICLE_FITMENT_TREE).flatMap(([mKey, mNodes]) =>
              mNodes.map((n) => (
                <button
                  key={n.collectionSlug}
                  type="button"
                  onClick={() =>
                    handleQuickSwitchVehicle(mKey, n.model, n.collectionSlug, n.years[0])
                  }
                  className={`p-2.5 text-left border text-xs font-tech-mono uppercase transition-colors cursor-pointer ${
                    n.collectionSlug === node.collectionSlug
                      ? 'border-[#FF5500] bg-[#18181D] text-[#FF5500] font-bold'
                      : 'border-[#26262E] hover:border-neutral-500 text-[#C2C2CC]'
                  }`}
                >
                  <span className="block font-bold">{mKey} {n.model}</span>
                  <span className="text-[10px] text-neutral-400">{n.years[0]} · {n.productSlugs.length} SETS</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Brutalist 2-Column Product Grid (1px solid #26262E) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {filteredProducts.length === 0 ? (
          <div className="border border-[#26262E] p-12 text-center space-y-4 bg-[#121215]">
            <p className="text-base font-bold uppercase tracking-wider text-[#F5F5F7]">
              NO WHEELS MATCH THE SELECTED DIAMETER / SALE FILTER
            </p>
            <button
              type="button"
              onClick={() => {
                setSaleOnly(false);
                setSelectedDiameter(null);
              }}
              className="px-6 py-3 bg-[#FF5500] text-white text-xs font-tech-mono uppercase tracking-wider cursor-pointer hover:bg-[#FF6B1A]"
            >
              SHOW ALL {products.length} COMPATIBLE WHEELS
            </button>
          </div>
        ) : (
          <div
            className="grid grid-cols-2 border-t border-l border-[#26262E]"
            data-testid="fitment-plp-grid"
          >
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="border-r border-b border-[#26262E] p-4 sm:p-8 flex flex-col justify-between bg-[#121215] relative group hover:border-[#FF5500] transition-colors"
              >
                {/* Top Badges: Outlined LATEST and Solid RESERVE */}
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 mb-4">
                    {product.isLatest && (
                      <span className="border border-[#FF5500] text-[#FF5500] text-[10px] sm:text-[11px] font-tech-mono font-semibold uppercase px-2.5 py-0.5">
                        LATEST
                      </span>
                    )}
                    {product.isReserve && (
                      <span className="bg-[#18181D] text-[#F5F5F7] border border-[#26262E] text-[10px] sm:text-[11px] font-tech-mono font-semibold uppercase px-2.5 py-0.5">
                        RESERVE
                      </span>
                    )}
                    {product.isSale && (
                      <span className="bg-[#FF5500] text-white text-[10px] sm:text-[11px] font-tech-mono font-bold uppercase px-2.5 py-0.5">
                        SALE
                      </span>
                    )}
                  </div>

                  {/* Vertical Right-Edge Watermark: FORGED CUSTOM WHEELS rotated 90 degrees */}
                  <span
                    aria-hidden="true"
                    className="writing-vertical-rl absolute top-16 right-2 sm:right-4 text-[10px] sm:text-xs font-tech-mono font-semibold tracking-[0.22em] text-[#26262E] group-hover:text-neutral-700 select-none"
                  >
                    FORGED CUSTOM WHEELS
                  </span>

                  {/* Center Wheel Image with 20-21" Badge Below */}
                  <button
                    type="button"
                    onClick={() => navigate(`/store/products/${product.slug}`)}
                    className="w-full py-4 flex flex-col items-center justify-center cursor-pointer"
                  >
                    <div className="w-36 h-36 sm:w-56 sm:h-56 transition-transform duration-200 group-hover:scale-105">
                      <WheelRenderSVG
                        geometry={product.geometry}
                        finish={product.defaultFinish}
                        imageUrl={product.imageUrl}
                        label={product.shortModel}
                      />
                    </div>
                    <span className="mt-3 border border-[#26262E] bg-[#18181D] text-[#C2C2CC] px-3 py-0.5 text-[11px] font-tech-mono font-bold tracking-wider">
                      {product.diameterBadge}
                    </span>
                  </button>
                </div>

                {/* Title, Price (£4,600), Subtitle (SET OF 4), and Full-Width Outlined Button VIEW PRODUCT */}
                <div className="pt-4 space-y-3 border-t border-[#26262E]">
                  <h2 className="text-xs sm:text-base font-bold uppercase tracking-tight leading-snug text-[#F5F5F7]">
                    {product.title}
                  </h2>

                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg sm:text-xl font-extrabold font-tech-mono tabular-nums text-[#FF5500]">
                        {formatCurrencyPrice(product.priceGBP, currency, false)}
                      </span>
                      {product.originalPriceGBP && (
                        <span className="text-xs font-tech-mono text-neutral-500 line-through tabular-nums">
                          {formatCurrencyPrice(product.originalPriceGBP, currency, false)}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-tech-mono uppercase tracking-widest text-[#C2C2CC] font-semibold">
                      {product.setLabel}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => navigate(`/store/products/${product.slug}`)}
                      className="w-full py-2.5 border border-[#26262E] text-[11px] font-tech-mono font-bold uppercase tracking-[0.14em] text-[#F5F5F7] hover:border-[#FF5500] hover:text-[#FF5500] transition-colors cursor-pointer text-center"
                    >
                      SPECIFICATION
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        openEnquiryModal({
                          subject: `${product.title} (Part ${product.technicalSpecs.partNo})`,
                          partNo: product.technicalSpecs.partNo,
                          domain: 'store',
                        })
                      }
                      className="w-full py-2.5 bg-[#FF5500] text-white text-[11px] font-tech-mono font-bold uppercase tracking-[0.14em] hover:bg-[#FF6B1A] transition-colors cursor-pointer text-center"
                    >
                      ENQUIRE
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
