import React, { useMemo } from 'react';
import { BrandHeader } from './BrandHeader';
import { BrandEnquirySection, BrandPageHero, BrandStockSection } from './BrandSections';
import { SixnineRangeSection } from './SixnineRange';
import { SixnineAboutSection } from './SixnineAbout';
import { getAllBrandWheels, isSixnineWheel, WHEEL_BRANDS } from '../../data/catalogue';
import { useForgedStore } from '../../store/useForgedStore';
import { designCodes, joinList } from '../../utils/brandFitment';

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

        <SixnineAboutSection />

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
