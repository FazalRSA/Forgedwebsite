import React, { useMemo } from 'react';
import { BrandHeader } from './BrandHeader';
import { ContactCta, CTA_PRIMARY_CLASS, CTA_SECONDARY_CLASS } from './ContactCta';
import { WheelCard } from './WheelCatalogue';
import { formatZAR, getAllBrandWheels, isSixnineWheel } from '../../data/catalogue';
import { useForgedStore } from '../../store/useForgedStore';
import { Link } from '../../utils/router';

/** Where the facts about the brand below come from. */
const SIXNINE_SOURCE_URL = 'https://www.sixnine-wheels.com/pages/about';

/**
 * Sixnine's own range, as its website lists it (sixnine-wheels.com, read November 2026).
 * `code` is the design code our catalogue uses for it, so a design we stock is marked as such.
 */
const SIXNINE_RANGE: readonly { name: string; code: string; summary: string }[] = [
  { name: 'FF-ONE', code: 'FF-1', summary: 'Sixnine’s first design: a modular wheel whose swappable inlays give five styles in one wheel.' },
  { name: 'FF-TWO', code: 'FF-2', summary: 'A lightweight, timeless design.' },
  { name: 'FF-THREE', code: 'FF-3', summary: 'The next step in customisation, configurable like the FF-ONE.' },
  { name: 'EVO-ONE', code: 'EVO-1', summary: 'A light, classic five-spoke.' },
  { name: 'EVO-TWO', code: 'EVO-2', summary: 'The newest design: Y-spokes and a deep lip.' },
  { name: 'OEM+ONE', code: 'OEM+1', summary: 'A classic design, reimagined.' },
];

/** "FF-1", "FF-1 and FF-3", "FF-1, FF-2 and FF-3". */
function joinList(items: string[]): string {
  return items.length > 1 ? `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}` : items[0] ?? '';
}

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
      // Every Sixnine wheel in stock: all designs whose code starts with FF, in every finish.
      getAllBrandWheels(customBrandWheels).filter(isSixnineWheel),
    [customBrandWheels]
  );

  const designs = useMemo(
    () => Array.from(new Set(wheels.map((wheel) => wheel.modelCode).filter((code): code is string => Boolean(code)))),
    [wheels]
  );
  const designList = joinList(designs);
  const enquiryMessage = `Hi, I'd like to ask about the Sixnine wheels${designList ? ` (${designs.join(' / ')})` : ''}.`;

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
                We supply Sixnine Wheels for BMW M cars.
                {designList ? ` The ${designList} sets below are in stock now.` : ''}
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <ContactCta
                  message={enquiryMessage}
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
          aria-labelledby="sixnine-about-heading"
          className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-12 sm:py-16 border-t border-[#26262E]"
        >
          <p className="text-sm uppercase tracking-[0.14em] text-neutral-400">The brand</p>
          <h2
            id="sixnine-about-heading"
            className="mt-2 text-3xl sm:text-4xl font-light tracking-[-0.03em] leading-tight text-white"
          >
            What is Sixnine Wheels?
          </h2>
          <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <div className="max-w-2xl space-y-4 text-neutral-300">
              <p>
                SIXNINE Wheels is a German aftermarket wheel brand from Neumarkt, Germany. Its wheels are designed and
                developed in Germany, and made together with one of the largest alloy wheel manufacturers in the world.
              </p>
              <p>
                The company was started by a group of friends with years of experience in the car and aftermarket
                industry, to bring new ideas to wheels: custom wheels, new ways of making them and new combinations of
                materials.
              </p>
              <p>
                Its best-known idea is the FF-ONE: one wheel with swappable inlays, so the same wheel can take on five
                different looks.
              </p>
              <p className="text-sm text-neutral-500">
                Source:{' '}
                <a
                  href={SIXNINE_SOURCE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 hover:text-neutral-300"
                >
                  sixnine-wheels.com
                </a>
              </p>
            </div>

            <div>
              <h3 className="text-sm uppercase tracking-[0.14em] text-neutral-400">The Sixnine range</h3>
              <ul className="mt-3 divide-y divide-[#26262E] border-y border-[#26262E]">
                {SIXNINE_RANGE.map((design) => {
                  const stocked = designs.includes(design.code);
                  return (
                    <li key={design.name} className="py-3 flex items-start gap-4">
                      <span className="w-24 shrink-0 font-semibold text-white">{design.name}</span>
                      <span className="flex-1 text-sm text-neutral-300">{design.summary}</span>
                      {stocked && (
                        <a
                          href="#sixnine-stock"
                          className="shrink-0 rounded-full bg-[#EDEBE4] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#111111]"
                        >
                          In stock
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 text-sm text-neutral-400">
                Designs not marked in stock are not on our shelf. Message us if you want to ask about one.
              </p>
            </div>
          </div>
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

        <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-12 sm:py-16 border-t border-[#26262E]">
          <h2 className="text-2xl font-light tracking-[-0.02em] text-white">Ask us about Sixnine wheels</h2>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <ContactCta
              message={enquiryMessage}
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
