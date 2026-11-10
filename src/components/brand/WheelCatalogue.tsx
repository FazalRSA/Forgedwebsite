import React, { useMemo, useState } from 'react';
import {
  BrandWheelItem,
  getAllBrandWheels,
  getWheelImages,
  formatZAR,
} from '../../data/catalogue';
import { useForgedStore } from '../../store/useForgedStore';
import { Link } from '../../utils/router';
import { ContactCta, CTA_SECONDARY_CLASS } from './ContactCta';

const ALL = 'All';

/** The design a listing belongs to, e.g. "FSA002". Each listing is one design in one finish. */
export const designOf = (wheel: BrandWheelItem): string => wheel.modelCode || wheel.model;

/** "20 inch / 21 inch" becomes 20" / 21". */
const formatSizes = (sizes?: string): string =>
  (sizes ?? '').replace(/\s*inch(?:es)?/gi, '"').trim();

/** A generated stand-in picture (no real photo yet) is never shown to visitors; a plain tile is used instead. */
const isGeneratedPlaceholder = (src: string): boolean => src.startsWith('data:');

const WheelCard: React.FC<{ wheel: BrandWheelItem; index: number }> = ({ wheel, index }) => {
  const design = designOf(wheel);
  const finish = wheel.finishName ?? '';
  const sizes = formatSizes(wheel.sizesAvailable);
  const photo = getWheelImages(wheel).images[0];
  const hasPhoto = Boolean(photo) && !isGeneratedPlaceholder(photo);

  return (
    <li>
      <Link to={`/wheels/${wheel.slug}`} className="group block">
        <div className="aspect-square overflow-hidden rounded-xl bg-[#F0F0F1]">
          {hasPhoto ? (
            <img
              src={photo}
              alt={`Forged wheel, ${design}${finish ? ` in ${finish}` : ''}`}
              width={800}
              height={800}
              // The first row is what a phone shows on arrival, so it must not wait to be scrolled to.
              loading={index < 2 ? 'eager' : 'lazy'}
              fetchPriority={index === 0 ? 'high' : undefined}
              decoding="async"
              className="w-full h-full object-cover"
            />
          ) : (
            // No photo yet: a plain wheel outline, with the name and finish in the text below it.
            <div aria-hidden="true" className="w-full h-full bg-[#121215] flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-1/2 h-1/2 text-[#33333E]" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="50" cy="50" r="46" />
                <circle cx="50" cy="50" r="38" />
                <circle cx="50" cy="50" r="9" />
                {[0, 72, 144, 216, 288].map((angle) => (
                  <line key={angle} x1="50" y1="41" x2="50" y2="12" transform={`rotate(${angle} 50 50)`} strokeWidth="5" strokeLinecap="round" />
                ))}
              </svg>
            </div>
          )}
        </div>

        <div className="mt-3 space-y-0.5">
          <h3 className="text-base font-medium text-white group-hover:underline underline-offset-4">
            {design}
          </h3>
          {finish && <p className="text-sm text-neutral-300">{finish}</p>}
          {sizes && <p className="text-sm text-neutral-400">{sizes}</p>}
          <p className="pt-1.5 text-lg font-medium text-white tabular-nums">
            {formatZAR(wheel.priceZAR)}
            <span className="block text-xs font-normal text-neutral-400">per set of 4</span>
          </p>
        </div>
      </Link>
    </li>
  );
};

export const WheelCatalogue: React.FC = () => {
  const customBrandWheels = useForgedStore((state) => state.customBrandWheels);
  const [selectedDesign, setSelectedDesign] = useState<string>(ALL);

  // getAllBrandWheels returns only wheels that are in stock.
  const wheels = useMemo(() => getAllBrandWheels(customBrandWheels), [customBrandWheels]);
  const designs = useMemo(() => Array.from(new Set(wheels.map(designOf))), [wheels]);

  const activeDesign = designs.includes(selectedDesign) ? selectedDesign : ALL;
  const visibleWheels =
    activeDesign === ALL ? wheels : wheels.filter((wheel) => designOf(wheel) === activeDesign);

  return (
    <section
      id="catalogue"
      aria-labelledby="catalogue-heading"
      className="scroll-mt-20 max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-12 sm:py-16 border-t border-[#26262E]"
    >
      <h2
        id="catalogue-heading"
        className="text-3xl sm:text-4xl font-light tracking-[-0.03em] leading-tight text-white"
      >
        Wheels in stock
      </h2>

      {wheels.length === 0 ? (
        <div className="mt-8 space-y-5">
          <p className="text-neutral-300">No wheels are listed in stock right now.</p>
          <ContactCta
            message="Hi, what wheels do you have available?"
            enquirySubject="Which wheels are available?"
            label="Ask on WhatsApp"
            fallbackLabel="Ask what is available"
            className={CTA_SECONDARY_CLASS}
          />
        </div>
      ) : (
        <>
          {designs.length > 1 && (
            <div role="group" aria-label="Filter by design" className="mt-6 flex flex-wrap gap-2">
              {[ALL, ...designs].map((design) => {
                const active = activeDesign === design;
                return (
                  <button
                    key={design}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSelectedDesign(design)}
                    className={`min-h-11 px-4 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#F5F5F7] text-[#0A0A0A]'
                        : 'border border-[#33333E] text-neutral-300 hover:border-neutral-500 hover:text-white'
                    }`}
                  >
                    {design}
                  </button>
                );
              })}
            </div>
          )}

          <ul
            data-testid="brand-wheel-catalogue-grid"
            className="mt-8 grid grid-cols-2 lg:grid-cols-3 gap-x-3 sm:gap-x-6 gap-y-9"
          >
            {visibleWheels.map((wheel, index) => (
              <WheelCard key={wheel.id} wheel={wheel} index={index} />
            ))}
          </ul>
        </>
      )}
    </section>
  );
};
