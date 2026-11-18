import React, { useMemo } from 'react';
import { BrandHeader } from './BrandHeader';
import { BrandEnquirySection, BrandFitmentSection, BrandPageHero, BrandStockSection } from './BrandSections';
import { getAllBrandWheels, isForgedSaWheel, WHEEL_BRANDS } from '../../data/catalogue';
import { useForgedStore } from '../../store/useForgedStore';
import { designCodes, fitmentAtAGlance, joinList } from '../../utils/brandFitment';

/**
 * /forged-sa-wheels. The shop's own brand: every FSA design in stock. Like the Sixnine page, everything
 * about designs, stock, sizes and prices is read from the live catalogue, and the page says nothing
 * about the brand that the owner has not confirmed: that the FSA designs are Forged SA's own, and that
 * they are forged (the home page says the same: "Forged, not cast. Pressed from solid aluminium.").
 */
export const ForgedSaPage: React.FC = () => {
  const customBrandWheels = useForgedStore((state) => state.customBrandWheels);
  const wheels = useMemo(() => getAllBrandWheels(customBrandWheels).filter(isForgedSaWheel), [customBrandWheels]);
  const designs = useMemo(() => designCodes(wheels), [wheels]);
  const designList = joinList(designs);
  const enquiryMessage = `Hi, I'd like to ask about the Forged SA wheels${designList ? ` (${designs.join(' / ')})` : ''}.`;
  const fitment = useMemo(() => fitmentAtAGlance(wheels), [wheels]);

  return (
    <div className="min-h-screen bg-[#111111] text-[#EDEBE4]">
      <BrandHeader />

      <main>
        <BrandPageHero
          brand={WHEEL_BRANDS['forged-sa']}
          heading="Forged SA wheels"
          enquiryMessage={enquiryMessage}
          enquirySubject="Forged SA wheels enquiry"
          stockAnchor="forged-sa-stock"
        >
          <p>
            Forged SA is our own range of forged wheels for BMW M cars.
            {designList ? ` The ${designList} sets below are in stock now.` : ''}
          </p>
          <p className="text-base text-neutral-400">Forged, not cast: pressed from solid aluminium.</p>
        </BrandPageHero>

        <BrandStockSection
          id="forged-sa-stock"
          heading="Forged SA sets in stock"
          wheels={wheels}
          emptyText="No Forged SA sets are listed in stock right now. Message us to ask about availability."
        />

        <BrandFitmentSection id="forged-sa-fitment" rows={fitment} />

        <BrandEnquirySection
          heading="Ask us about Forged SA wheels"
          enquiryMessage={enquiryMessage}
          enquirySubject="Forged SA wheels enquiry"
        />
      </main>
    </div>
  );
};
