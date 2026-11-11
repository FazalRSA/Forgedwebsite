import React, { useMemo } from 'react';
import { BrandHeader } from './BrandHeader';
import { ContactCta, CTA_PRIMARY_CLASS, CTA_SECONDARY_CLASS } from './ContactCta';
import { WheelCard } from './WheelCatalogue';
import { formatZAR, getAllBrandWheels } from '../../data/catalogue';
import { useForgedStore } from '../../store/useForgedStore';
import { Link } from '../../utils/router';

/** The Sixnine designs the shop stocks, as the catalogue names them. */
const SIXNINE_DESIGNS = new Set(['FF-1', 'FF-3']);

const ENQUIRY_MESSAGE = "Hi, I'd like to ask about the Sixnine wheels (FF-1 / FF-3).";

/** The one value every row agrees on, or null when the rows differ or have none. */
function sharedValue(values: (string | undefined)[]): string | null {
  const unique = Array.from(new Set(values.filter((value): value is string => Boolean(value))));
  return unique.length === 1 ? unique[0] : null;
}

/** Picks one part out of "PCD 5×112 · ET15/20 · CB66.6", e.g. the part that starts with "PCD". */
function specPart(spec: string | undefined, prefix: string): string | undefined {
  return spec?.split('·').map((part) => part.trim()).find((part) => part.startsWith(prefix));
}

/** "20 inch / 21 inch" becomes 20" / 21". */
const formatSizes = (sizes?: string): string | undefined =>
  sizes ? sizes.replace(/\s*inch(?:es)?/gi, '"').trim() : undefined;

/**
 * /sixnine-wheels. The shop's page as an official Sixnine Wheels dealer. Everything about stock, sizes
 * and prices is read from the live catalogue, so it cannot drift from the wheels page.
 */
export const SixnineDealerPage: React.FC = () => {
  const customBrandWheels = useForgedStore((state) => state.customBrandWheels);

  const wheels = useMemo(
    () =>
      getAllBrandWheels(customBrandWheels).filter(
        (wheel) => wheel.modelCode !== undefined && SIXNINE_DESIGNS.has(wheel.modelCode)
      ),
    [customBrandWheels]
  );

  const stats = useMemo(() => {
    const sets = wheels.reduce((sum, wheel) => sum + (wheel.stockQuantitySets ?? 1), 0);
    const finishes = new Set(wheels.map((wheel) => wheel.finishName).filter(Boolean)).size;
    const fromPrice = wheels.length > 0 ? Math.min(...wheels.map((wheel) => wheel.priceZAR)) : null;
    return { sets, finishes, fromPrice };
  }, [wheels]);

  // Fitment facts are shown only where every listed set agrees, so a mixed row is never papered over.
  const fitment = useMemo(() => {
    const rows: { label: string; value: string }[] = [];
    const cars = Array.from(new Set(wheels.map((wheel) => wheel.compatibleCars).filter(Boolean)));
    if (cars.length > 0) rows.push({ label: 'Fits', value: cars.join(', ') });
    const sizes = sharedValue(wheels.map((wheel) => formatSizes(wheel.sizesAvailable)));
    if (sizes) rows.push({ label: 'Wheel sizes', value: sizes });
    const pcd = sharedValue(wheels.map((wheel) => specPart(wheel.technicalSpecSheet, 'PCD')));
    if (pcd) rows.push({ label: 'Bolt pattern', value: pcd.replace(/^PCD\s*/, '') });
    const bore = sharedValue(wheels.map((wheel) => specPart(wheel.technicalSpecSheet, 'CB')));
    if (bore) rows.push({ label: 'Centre bore', value: `${bore.replace(/^CB\s*/, '')} mm` });
    return rows;
  }, [wheels]);

  return (
    <div className="min-h-screen bg-[#111111] text-[#EDEBE4]">
      <BrandHeader />

      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10">
            <img
              src="/images/partners/sixnine.webp"
              alt="SIXNINE Wheels logo"
              width={144}
              height={144}
              className="w-28 h-28 sm:w-36 sm:h-36 shrink-0 object-contain"
            />
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.14em] text-[#F43F5E]">Official dealer</p>
              <h1 className="mt-2 text-4xl sm:text-5xl font-light tracking-[-0.03em] leading-tight text-white">
                Sixnine Wheels dealer in Durban
              </h1>
              <p className="mt-4 text-lg text-neutral-300">
                We supply Sixnine forged wheels for BMW M cars. The FF-1 and FF-3 sets below are in stock now.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <ContactCta
                  message={ENQUIRY_MESSAGE}
                  enquirySubject="Sixnine wheels enquiry"
                  label="Ask about Sixnine wheels"
                  fallbackLabel="Ask about Sixnine wheels"
                  className={CTA_PRIMARY_CLASS}
                />
                <a href="#sixnine-stock" className={CTA_SECONDARY_CLASS}>
                  See the sets in stock
                </a>
              </div>
            </div>
          </div>

          {wheels.length > 0 && (
            <dl className="mt-10 grid grid-cols-3 gap-4 border-y border-[#26262E] py-5 text-center sm:text-left">
              <div>
                <dt className="text-sm text-neutral-400">Sets in stock</dt>
                <dd className="mt-1 text-2xl font-light text-white tabular-nums">{stats.sets}</dd>
              </div>
              <div>
                <dt className="text-sm text-neutral-400">Finishes</dt>
                <dd className="mt-1 text-2xl font-light text-white tabular-nums">{stats.finishes}</dd>
              </div>
              {stats.fromPrice !== null && (
                <div>
                  <dt className="text-sm text-neutral-400">From</dt>
                  <dd className="mt-1 text-2xl font-light text-white tabular-nums">
                    {formatZAR(stats.fromPrice)}
                    <span className="block text-xs font-normal text-neutral-400">per set of 4</span>
                  </dd>
                </div>
              )}
            </dl>
          )}
        </section>

        <section
          id="sixnine-stock"
          aria-labelledby="sixnine-stock-heading"
          className="scroll-mt-20 max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-12 sm:py-16 border-t border-[#26262E]"
        >
          <h2
            id="sixnine-stock-heading"
            className="text-3xl sm:text-4xl font-light tracking-[-0.03em] leading-tight text-white"
          >
            Sixnine sets in stock
          </h2>
          {wheels.length === 0 ? (
            <p className="mt-6 text-neutral-300">
              No Sixnine sets are listed in stock right now. Message us to ask about availability.
            </p>
          ) : (
            <ul className="mt-8 grid grid-cols-2 lg:grid-cols-3 gap-x-3 sm:gap-x-6 gap-y-9">
              {wheels.map((wheel, index) => (
                <WheelCard key={wheel.id} wheel={wheel} index={index} />
              ))}
            </ul>
          )}
        </section>

        {fitment.length > 0 && (
          <section
            aria-labelledby="sixnine-fitment-heading"
            className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-12 sm:py-16 border-t border-[#26262E]"
          >
            <h2 id="sixnine-fitment-heading" className="text-2xl font-light tracking-[-0.02em] text-white">
              Fitment at a glance
            </h2>
            <dl className="mt-6 max-w-2xl divide-y divide-[#26262E] border-y border-[#26262E]">
              {fitment.map((row) => (
                <div key={row.label} className="py-3 sm:flex sm:gap-6">
                  <dt className="text-sm text-neutral-400 sm:w-40 sm:shrink-0">{row.label}</dt>
                  <dd className="mt-0.5 sm:mt-0 text-white">{row.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 max-w-2xl text-sm text-neutral-400">
              Offsets differ by set and are on each wheel page. Message us with your car and we will confirm the fit.
            </p>
          </section>
        )}

        <section
          aria-labelledby="sixnine-about-heading"
          className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-12 sm:py-16 border-t border-[#26262E]"
        >
          <h2 id="sixnine-about-heading" className="text-2xl font-light tracking-[-0.02em] text-white">
            About Sixnine Wheels
          </h2>
          <p className="mt-4 max-w-2xl text-neutral-300">
            SIXNINE Wheels is a German wheel maker based in Neumarkt, known for the modular FF-ONE design.
            As an official dealer we can tell you what is in stock.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <ContactCta
              message={ENQUIRY_MESSAGE}
              enquirySubject="Sixnine wheels enquiry"
              label="Message us on WhatsApp"
              fallbackLabel="Send an enquiry"
              className={CTA_PRIMARY_CLASS}
            />
            <Link to="/installs" className={CTA_SECONDARY_CLASS}>
              See cars we have fitted
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};
