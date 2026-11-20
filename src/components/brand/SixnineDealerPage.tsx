import React, { useMemo } from 'react';
import { BrandHeader } from './BrandHeader';
import { BrandEnquirySection, BrandFitmentSection, BrandPageHero, BrandStockSection } from './BrandSections';
import { getAllBrandWheels, isSixnineWheel, WHEEL_BRANDS } from '../../data/catalogue';
import { useForgedStore } from '../../store/useForgedStore';
import { designCodes, fitmentAtAGlance, joinList } from '../../utils/brandFitment';
import { findSixnineSeries, seriesPath, seriesSlug } from '../../data/sixnineSeries';
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

  const designs = useMemo(() => designCodes(wheels), [wheels]);
  const designList = joinList(designs);
  const enquiryMessage = `Hi, I'd like to ask about the Sixnine wheels${designList ? ` (${designs.join(' / ')})` : ''}.`;
  // Fitment facts are shown only where every listed set agrees, so a mixed row is never papered over.
  const fitment = useMemo(() => fitmentAtAGlance(wheels), [wheels]);

  return (
    <div className="min-h-screen bg-[#111111] text-[#EDEBE4]">
      <BrandHeader />

      <main>
        <BrandPageHero
          brand={WHEEL_BRANDS.sixnine}
          heading="Official Sixnine Wheels dealer"
          enquiryMessage={enquiryMessage}
          enquirySubject="Sixnine wheels enquiry"
          stockAnchor="sixnine-stock"
          eyebrowClassName="text-[#F43F5E]"
        >
          <p>
            We supply forged Sixnine wheels for BMW M cars.
            {designList ? ` The ${designList} sets below are in stock now.` : ''}
          </p>
        </BrandPageHero>

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
                Sixnine Wheels is a German aftermarket wheel brand from Neumarkt, Germany. Its wheels are designed and
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
              <p className="text-sm text-neutral-400">
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
                  // Each series has its own page with every size Sixnine lists.
                  const series = findSixnineSeries(seriesSlug(design.name));
                  return (
                    <li key={design.name} className="py-3 flex items-start gap-4">
                      {series ? (
                        <Link to={seriesPath(series)} className="w-24 shrink-0 font-semibold text-white underline underline-offset-4 decoration-white/30 hover:decoration-white">
                          {design.name}
                        </Link>
                      ) : (
                        <span className="w-24 shrink-0 font-semibold text-white">{design.name}</span>
                      )}
                      <span className="flex-1 text-sm text-neutral-300">{design.summary}</span>
                      {stocked && (
                        <a
                          href="#sixnine-stock"
                          className="inline-flex min-h-9 shrink-0 items-center rounded-full bg-[#EDEBE4] px-2.5 text-[11px] font-semibold uppercase tracking-wide text-[#111111]"
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

        <BrandStockSection
          id="sixnine-stock"
          heading="Sixnine sets in stock"
          wheels={wheels}
          emptyText="No Sixnine sets are listed in stock right now. Message us to ask about availability."
        />

        <BrandFitmentSection id="sixnine-fitment" rows={fitment} />

        <BrandEnquirySection
          heading="Ask us about Sixnine wheels"
          enquiryMessage={enquiryMessage}
          enquirySubject="Sixnine wheels enquiry"
        />
      </main>
    </div>
  );
};
