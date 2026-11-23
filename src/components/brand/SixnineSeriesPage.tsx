import React, { useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { getAllBrandWheels, WHEEL_BRANDS } from '../../data/catalogue';
import {
  diameterRange,
  finishSwatch,
  seriesFacts,
  sizeLine,
  sortedSizes,
  SIXNINE_PATH,
  SIXNINE_RANGE_SOURCE,
  SIXNINE_SERIES,
  type SixnineSeries,
  type SixnineSize,
} from '../../data/sixnineSeries';
import { useForgedStore } from '../../store/useForgedStore';
import { Link } from '../../utils/router';
import { BrandEnquirySection } from './BrandSections';
import { BrandHeader } from './BrandHeader';
import { ContactCta, CTA_PRIMARY_CLASS, CTA_SECONDARY_CLASS } from './ContactCta';
import { PRODUCT_GRID_CLASS, ProductCard } from './ProductCard';
import { EYEBROW_CLASS } from './sectionStyles';
import { seriesImage, stockOfSeries } from './SixnineSeriesTile';
import { SeriesShowcaseCard } from './SixnineShowcase';

const WRAP = 'max-w-7xl mx-auto px-4 sm:px-6 md:px-10';
const H2 = 'mt-2 text-3xl sm:text-4xl font-light tracking-[-0.03em] leading-tight text-white';

/**
 * Sixnine's depth figure: "Deep lip" or "Concavity" as the label, the millimetres as the value, and any
 * extra words of Sixnine's after them ("63 mm, super deep concave", "43 mm, with over 50 mm brake clearance").
 */
function depth(size: SixnineSize): { label: string; value: string } {
  const note = (size.concavityNote ?? '').trim();
  const label = /deep lip/i.test(note) ? 'Deep lip' : 'Concavity';
  const extra = note.replace(/^(concavity|deep lip)\b,?\s*/i, '').trim();
  const mm = size.concavityMm !== null ? `${size.concavityMm} mm` : '';
  return { label, value: [mm, extra.toLowerCase()].filter(Boolean).join(', ') };
}

/** A finish as Sixnine names it, with its on-screen swatch. */
const FinishDot: React.FC<{ finish: string; size?: number }> = ({ finish, size = 16 }) => (
  <span
    aria-hidden="true"
    className="inline-block shrink-0 rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]"
    style={{ width: size, height: size, background: finishSwatch(finish) }}
  />
);

/** One size as a card: the size line, its notes, the specifications Sixnine lists, and an Ask button. */
const SizeCard: React.FC<{ series: SixnineSeries; size: SixnineSize }> = ({ series, size }) => {
  const line = sizeLine(size);
  const specs = [
    { label: 'Load rating', value: size.loadKg !== null ? `${size.loadKg} kg` : '' },
    { label: 'Centre bore', value: size.centreBoreMm !== null ? `${size.centreBoreMm} mm` : '' },
    depth(size),
    { label: 'Weight', value: size.weightKg !== null ? `≈ ${size.weightKg} kg` : '' },
    // Shown per size only where it differs from what the series as a whole is.
    { label: 'Construction', value: size.construction && size.construction !== series.construction ? size.construction : '' },
  ].filter((spec) => spec.value);
  const tags = [
    size.soldAs === 'set' ? 'Set of 4, made to order' : '',
    size.note ?? '',
    size.preOrder ? 'Pre-order at Sixnine' : '',
    size.offset === null && size.soldAs === 'wheel' ? 'Offset per vehicle' : '',
  ].filter(Boolean);

  return (
    <li className="glass flex flex-col gap-4 rounded-[22px] p-5">
      <div>
        <h3 className="text-lg font-semibold tracking-[-0.01em] text-white tabular-nums">{line}</h3>
        {tags.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <li key={tag} className="rounded-full border border-white/[0.12] px-2.5 py-0.5 text-xs font-medium text-neutral-300">
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>
      {specs.length > 0 && (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          {specs.map((spec) => (
            <div key={spec.label}>
              <dt className="text-xs text-neutral-400">{spec.label}</dt>
              <dd className="text-white tabular-nums">{spec.value}</dd>
            </div>
          ))}
        </dl>
      )}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
        {size.finishes.length > 0 ? (
          <span className="flex items-center gap-1.5" title={size.finishes.join(', ')}>
            {size.finishes.map((finish) => (
              <FinishDot key={finish} finish={finish} />
            ))}
            <span className="sr-only">Finishes: {size.finishes.join(', ')}</span>
          </span>
        ) : (
          <span className="text-xs text-neutral-400">{size.finishesText}</span>
        )}
        <ContactCta
          message={`Hi, I'd like to ask about the Sixnine ${series.code} ${line}.`}
          enquirySubject={`Sixnine ${series.code} ${line}`}
          label="Ask about this size"
          fallbackLabel="Ask about this size"
          showIcon={false}
          className={`${CTA_SECONDARY_CLASS} !min-h-10 !px-4 !text-sm`}
        />
      </div>
      {size.flag?.startsWith('Site inconsistency') && (
        <p className="text-xs text-neutral-400">Sixnine's own listing disagrees with itself here; we confirm the offset before you order.</p>
      )}
    </li>
  );
};

/**
 * /sixnine-wheels/:series. One Sixnine series, built like a SIXNINE series landing page: hero with
 * the facts, the finishes, what the shop has in stock in Rand, every size Sixnine lists (filterable by
 * bolt pattern), the other series and an enquiry row. Sizes and specifications come from
 * src/data/sixnineRange.json; stock and prices only from the catalogue.
 */
export const SixnineSeriesPage: React.FC<{ series: SixnineSeries }> = ({ series }) => {
  const customBrandWheels = useForgedStore((state) => state.customBrandWheels);
  const wheels = useMemo(() => getAllBrandWheels(customBrandWheels), [customBrandWheels]);
  const stock = useMemo(() => stockOfSeries(series, wheels), [series, wheels]);
  const image = useMemo(() => seriesImage(series, wheels), [series, wheels]);
  const facts = useMemo(() => seriesFacts(series), [series]);
  const sizes = useMemo(() => sortedSizes(series), [series]);
  const [pcd, setPcd] = useState<string>('all');
  const shown = pcd === 'all' ? sizes : sizes.filter((size) => size.boltPatterns.includes(pcd));
  const range = diameterRange(facts);
  const enquiry = `Hi, I'd like to ask about the Sixnine ${series.code}.`;
  const others = SIXNINE_SERIES.filter((other) => other.code !== series.code);

  return (
    <div className="min-h-screen bg-[#111111] text-[#EDEBE4]">
      <BrandHeader />
      <main>
        {/* Hero, centred with a stage: the SIXNINE series landing opening. */}
        <section className="relative overflow-hidden pt-6 pb-12 sm:pb-16 text-center">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(29,78,216,0.18)_0%,transparent_70%)]" />
          <div className={`relative ${WRAP}`}>
            <nav aria-label="Breadcrumb" className="flex justify-center">
              <ol className="flex items-center gap-1.5 text-[13px] text-neutral-400">
                <li>
                  <Link to="/" className="hover:text-white">Home</Link>
                </li>
                <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
                <li>
                  <Link to={SIXNINE_PATH} className="hover:text-white">{WHEEL_BRANDS.sixnine.name}</Link>
                </li>
                <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" />
                <li aria-current="page" className="text-neutral-200">{series.code}</li>
              </ol>
            </nav>
            <div className="mt-8 grid justify-items-center gap-5">
              <span className="glass rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-neutral-200">
                Sixnine Wheels · {WHEEL_BRANDS.sixnine.relation}
              </span>
              <h1 className="text-balance text-5xl sm:text-7xl tracking-[-0.04em] leading-[0.98] text-white">
                {series.code}.{' '}
                <span className="text-neutral-300">
                  {[series.construction, range].filter(Boolean).map((part) => `${part}.`).join(' ')}
                </span>
              </h1>
              <p className="max-w-[46ch] text-pretty text-lg text-neutral-300">
                {series.features[0] ?? 'Every size Sixnine lists, with its offset, load rating and finishes.'}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <ContactCta
                  message={enquiry}
                  enquirySubject={`Sixnine ${series.code} enquiry`}
                  label={`Ask about the ${series.code}`}
                  fallbackLabel={`Ask about the ${series.code}`}
                  className={CTA_PRIMARY_CLASS}
                />
                <a href="#sizes" className={CTA_SECONDARY_CLASS}>
                  All sizes
                </a>
              </div>
              <ul className="mt-1 flex flex-wrap justify-center gap-x-7 gap-y-2 text-sm text-neutral-400">
                <li><b className="font-semibold text-white">{facts.sizeCount}</b> {facts.sizeCount === 1 ? 'size' : 'sizes'}</li>
                {range && <li><b className="font-semibold text-white">{range}</b></li>}
                <li><b className="font-semibold text-white">{facts.boltPatterns.join(', ')}</b></li>
                <li><b className="font-semibold text-white">{facts.finishes.length}</b> {facts.finishes.length === 1 ? 'finish' : 'finishes'}</li>
                {stock.length > 0 && (
                  <li><b className="font-semibold text-white">{stock.reduce((n, w) => n + (w.stockQuantitySets ?? 0), 0)}</b> sets in stock here</li>
                )}
              </ul>
            </div>
            <div className="relative mx-auto mt-10 aspect-[4/3] sm:aspect-[16/8] max-w-5xl overflow-hidden rounded-[28px] border border-white/[0.09] bg-[radial-gradient(90%_90%_at_50%_35%,rgba(255,255,255,0.075)_0%,rgba(255,255,255,0.02)_70%)]">
              {image ? (
                <img src={image} alt={`Sixnine ${series.code}`} width={1000} height={1000} fetchPriority="high" className="absolute inset-0 h-full w-full object-contain p-[6%] drop-shadow-[0_24px_40px_rgba(0,0,0,0.55)]" />
              ) : (
                <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center font-[family-name:var(--font-display)] font-black uppercase text-transparent text-6xl sm:text-9xl tracking-[-0.04em] [-webkit-text-stroke:1.5px_rgba(255,255,255,0.4)]">
                  {series.code}
                </span>
              )}
            </div>
          </div>
        </section>

        {(series.features.length > 1 || facts.dualBoltPattern || facts.finishes.length > 0) && (
          <section aria-labelledby="finishes-heading" className="border-t border-[#26262E] bg-[#141418]">
            <div className={`${WRAP} py-12 sm:py-16`}>
              <span className={EYEBROW_CLASS}>Finishes</span>
              <h2 id="finishes-heading" className={H2}>
                {facts.finishes.length} {facts.finishes.length === 1 ? 'finish' : 'finishes'}
              </h2>
              <ul className="mt-6 flex flex-wrap gap-2">
                {facts.finishes.map((finish) => (
                  <li key={finish} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/[0.18] px-4 text-sm font-semibold text-neutral-200">
                    <FinishDot finish={finish} size={18} />
                    {finish}
                  </li>
                ))}
              </ul>
              {(series.features.slice(1).length > 0 || facts.dualBoltPattern) && (
                <ul className="mt-6 grid gap-2 text-neutral-300">
                  {series.features.slice(1).map((feature) => <li key={feature}>{feature}</li>)}
                  {facts.dualBoltPattern && <li>Some sizes are drilled for two bolt patterns, so one wheel fits more cars.</li>}
                </ul>
              )}
              <p className="mt-4 text-xs text-neutral-500">Finish names as Sixnine writes them. Swatches are screen colours, not paint references.</p>
            </div>
          </section>
        )}

        {stock.length > 0 && (
          <section id="stock" aria-labelledby="stock-heading" className="scroll-mt-24 border-t border-[#26262E]">
            <div className={`${WRAP} py-12 sm:py-16`}>
              <span className={EYEBROW_CLASS}>In stock in South Africa</span>
              <h2 id="stock-heading" className={H2}>{series.code} sets in stock</h2>
              <ul className={`mt-8 ${PRODUCT_GRID_CLASS}`}>
                {stock.map((wheel, index) => (
                  <ProductCard key={wheel.id} wheel={wheel} index={index} />
                ))}
              </ul>
            </div>
          </section>
        )}

        <section id="sizes" aria-labelledby="sizes-heading" className="scroll-mt-24 border-t border-[#26262E]">
          <div className={`${WRAP} py-12 sm:py-16`}>
            <span className={EYEBROW_CLASS}>Sizes</span>
            <h2 id="sizes-heading" className={H2}>All {series.code} sizes</h2>
            <p className="mt-3 max-w-2xl text-neutral-300">
              {stock.length > 0
                ? 'Every size Sixnine lists. For one we do not have in stock, ask us about it. We confirm the fit for your car.'
                : `We have no ${series.code} sets in stock right now. Ask us about any size and we confirm the fit for your car.`}
            </p>
            {/* Pills only when a bolt pattern narrows the list (every EVO-TWO size takes both, for one). */}
            {facts.boltPatterns.some((value) => sizes.some((size) => !size.boltPatterns.includes(value))) && (
              <div role="group" aria-label="Filter by bolt pattern" className="mt-6 flex flex-wrap gap-1.5">
                {['all', ...facts.boltPatterns].map((value) => {
                  const count = value === 'all' ? sizes.length : sizes.filter((size) => size.boltPatterns.includes(value)).length;
                  const on = pcd === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setPcd(value)}
                      className={`press inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-[13px] font-semibold tabular-nums ${
                        on ? 'border-white bg-white text-[#111111]' : 'border-white/[0.18] text-neutral-300 hover:text-white'
                      }`}
                    >
                      {value === 'all' ? 'All' : value}
                      <span className={on ? 'text-[#111111]/60' : 'text-neutral-500'}>{count}</span>
                    </button>
                  );
                })}
              </div>
            )}
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((size) => (
                <SizeCard key={`${size.size}-${size.offset}-${size.boltPatterns.join('/')}-${size.note}`} series={series} size={size} />
              ))}
            </ul>
            <p className="mt-6 max-w-3xl text-xs text-neutral-500">
              Sizes and specifications as Sixnine Wheels lists them on sixnine-wheels.com ({new Date(SIXNINE_RANGE_SOURCE.scrapedOn).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}). Prices in Rand on request.
            </p>
          </div>
        </section>

        <section aria-labelledby="more-heading" className="border-t border-[#26262E] bg-[#141418]">
          <div className={`${WRAP} py-12 sm:py-16`}>
            <span className={EYEBROW_CLASS}>Sixnine range</span>
            <h2 id="more-heading" className={H2}>More Sixnine series</h2>
            <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((other) => (
                <li key={other.code}>
                  <SeriesShowcaseCard series={other} wheels={wheels} />
                </li>
              ))}
            </ul>
          </div>
        </section>

        <BrandEnquirySection
          heading={`Ask us about the ${series.code}`}
          enquiryMessage={enquiry}
          enquirySubject={`Sixnine ${series.code} enquiry`}
        />
      </main>
    </div>
  );
};
