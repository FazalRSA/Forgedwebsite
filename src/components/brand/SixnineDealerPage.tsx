import React, { useMemo } from 'react';
import { BrandHeader } from './BrandHeader';
import { BrandEnquirySection, BrandPageHero, BrandStockSection } from './BrandSections';
import { SixnineRangeSection } from './SixnineRange';
import { getAllBrandWheels, isSixnineWheel, WHEEL_BRANDS } from '../../data/catalogue';
import { useForgedStore } from '../../store/useForgedStore';
import { designCodes, joinList } from '../../utils/brandFitment';

/** Where the facts about the brand below come from. */
const SIXNINE_SOURCE_URL = 'https://www.sixnine-wheels.com/pages/about';

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

          </div>
        </section>

        <BrandStockSection
          id="sixnine-stock"
          heading="Sixnine sets in stock"
          wheels={wheels}
          emptyText="No Sixnine sets are listed in stock right now. Message us to ask about availability."
        />

        <SixnineRangeSection inStock={wheels} />


        <BrandEnquirySection
          heading="Ask us about Sixnine wheels"
          enquiryMessage={enquiryMessage}
          enquirySubject="Sixnine wheels enquiry"
        />
      </main>
    </div>
  );
};
