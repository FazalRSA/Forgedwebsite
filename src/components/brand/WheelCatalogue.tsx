import React, { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import {
  BrandWheelItem,
  getAllBrandWheels,
  getWheelImages,
  formatZAR,
} from '../../data/catalogue';
import { useForgedStore } from '../../store/useForgedStore';
import { Link } from '../../utils/router';
import {
  buildDesignCards,
  designCardWidths,
  designOf,
  formatSizes,
  isGeneratedPlaceholder,
  type DesignCard as DesignCardData,
  type DesignCardWidth,
} from '../../utils/designCards';
import { wheelImageSrcSet } from '../../utils/wheelImageSrcSet';
import { ContactCta, CTA_SECONDARY_CLASS } from './ContactCta';

export { designOf };

/**
 * How wide each wheel picture is drawn, so the browser can pick the smallest copy that fills it
 * (see wheelImageSrcSet). Measured in the built site at 390, 768 and 1440 px wide.
 */
// WheelCard: two columns on phones and tablets, three from 1024 px, inside the 1280 px container.
const WHEEL_CARD_SIZES = '(min-width:1280px) 384px, (min-width:1024px) 31vw, (min-width:640px) 45vw, 46vw';
// DesignCard: the wheel is 66-70% of the card's height; the card is one column on phones, two on tablets.
const DESIGN_CARD_SIZES = '(min-width:1280px) 350px, (min-width:1024px) 25vw, (min-width:640px) 37vw, 61vw';

/** A plain wheel outline, used wherever a listing has no real photo yet. */
const WheelOutline: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="50" cy="50" r="46" />
    <circle cx="50" cy="50" r="38" />
    <circle cx="50" cy="50" r="9" />
    {[0, 72, 144, 216, 288].map((angle) => (
      <line key={angle} x1="50" y1="41" x2="50" y2="12" transform={`rotate(${angle} 50 50)`} strokeWidth="5" strokeLinecap="round" />
    ))}
  </svg>
);

export const WheelCard: React.FC<{ wheel: BrandWheelItem; index: number }> = ({ wheel, index }) => {
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
              {...wheelImageSrcSet(photo, WHEEL_CARD_SIZES)}
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
              <WheelOutline className="w-1/2 h-1/2 text-[#33333E]" />
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


/** Grid classes per card width: one column on phones, two on tablets, rows of 3 and 2 on wide screens. */
const WIDTH_CLASSES: Record<DesignCardWidth, string> = {
  third: 'lg:col-span-2',
  half: 'lg:col-span-3',
  full: 'lg:col-span-6',
};

/** Card shape per width on wide screens. Half-width cards are the larger ones; a full-width card is a low banner. */
const SHAPE_CLASSES: Record<DesignCardWidth, string> = {
  third: 'lg:aspect-[4/5]',
  half: 'lg:aspect-[6/5]',
  full: 'lg:aspect-[16/5]',
};

/** Wheel size and position per width on wide screens. */
const WHEEL_CLASSES: Record<DesignCardWidth, string> = {
  third: 'lg:h-[68%]',
  half: 'lg:h-[70%]',
  full: 'lg:left-auto lg:right-[6%] lg:top-1/2 lg:h-[92%] lg:translate-x-0 lg:-translate-y-1/2',
};

/** One wheel design: its best photo floating on a dark card, the design name and what is in stock. */
const DesignCard: React.FC<{
  card: DesignCardData;
  width: DesignCardWidth;
  /** Odd number of cards: the last one fills the tablet row on its own. */
  fillTabletRow: boolean;
  index: number;
}> = ({ card, width, fillTabletRow, index }) => {
  const wide = width === 'full';
  const image = card.cutout ?? card.photo;
  const finishes = card.finishes.join(' · ');
  const sizes = card.sizes.join(' · ');

  return (
    <li className={`${WIDTH_CLASSES[width]} ${fillTabletRow ? 'sm:col-span-2' : ''}`}>
      <Link
        to={`/wheels/${card.representative.slug}`}
        // No aria-label: the link is named by its own text, in reading order (badge, design, price, finishes).
        className={`group relative block overflow-hidden rounded-3xl border border-[#26262E] bg-[#18181D] aspect-square ${fillTabletRow ? 'sm:aspect-[16/10]' : 'sm:aspect-[4/5]'} ${SHAPE_CLASSES[width]}`}
      >
        {/* A soft lighter glow behind the wheel. */}
        <div
          aria-hidden="true"
          className={`absolute inset-0 ${
            wide
              ? 'bg-[radial-gradient(ellipse_at_50%_40%,rgba(255,255,255,0.09),transparent_65%)] lg:bg-[radial-gradient(ellipse_at_72%_50%,rgba(255,255,255,0.09),transparent_55%)]'
              : 'bg-[radial-gradient(ellipse_at_50%_40%,rgba(255,255,255,0.09),transparent_65%)]'
          }`}
        />

        {/* The wheel, floating in the upper part of the card (on the right of a full-width card). Sized by the
            card's height so it never runs off the card or far into the text. */}
        <div
          aria-hidden="true"
          className={`absolute left-1/2 top-[4%] aspect-square max-w-[94%] -translate-x-1/2 h-[66%] sm:h-[68%] ${WHEEL_CLASSES[width]}`}
        >
          {image ? (
            <img
              {...wheelImageSrcSet(image, DESIGN_CARD_SIZES)}
              alt=""
              width={1000}
              height={1000}
              // The catalogue sits below the hero, so only the first card loads straight away and none
              // competes with the hero image for priority.
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
              className={`h-full w-full object-contain drop-shadow-[0_24px_40px_rgba(0,0,0,0.55)] transition-transform duration-500 ease-out group-hover:scale-[1.06] motion-reduce:transition-none ${
                card.cutout ? '' : 'rounded-2xl'
              }`}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <WheelOutline className="h-3/5 w-3/5 text-[#33333E]" />
            </div>
          )}
        </div>

        {/* Keeps the text readable where the wheel runs behind it. */}
        <div
          aria-hidden="true"
          className={`absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-[#111111]/95 via-[#111111]/60 to-transparent ${
            wide ? 'lg:inset-y-0 lg:right-auto lg:h-auto lg:w-3/5 lg:bg-gradient-to-r' : ''
          }`}
        />

        <span className="absolute left-4 top-4 sm:left-5 sm:top-5 rounded-full bg-[#EDEBE4] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#111111]">
          {card.badge}
        </span>

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-6 lg:p-7">
          <div className="min-w-0">
            <h3 className="font-[family-name:var(--font-display)] font-black uppercase text-3xl sm:text-4xl leading-none tracking-[-0.03em] text-white">
              {card.design}
            </h3>
            <p className="mt-2 text-sm font-medium text-neutral-200 tabular-nums">{card.priceLine}</p>
            {(finishes || sizes) && (
              <p className="mt-0.5 text-sm text-neutral-400">
                {finishes}
                {finishes && sizes && ' · '}
                {sizes && <span className="whitespace-nowrap">{sizes}</span>}
              </p>
            )}
          </div>
          <span
            aria-hidden="true"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-600/70 text-white backdrop-blur-sm transition-colors duration-500 group-hover:bg-[#EDEBE4] group-hover:text-[#111111]"
          >
            <ArrowRight className="h-5 w-5" />
          </span>
        </div>
      </Link>
    </li>
  );
};

export const WheelCatalogue: React.FC = () => {
  const customBrandWheels = useForgedStore((state) => state.customBrandWheels);

  // getAllBrandWheels returns only wheels that are in stock.
  const wheels = useMemo(() => getAllBrandWheels(customBrandWheels), [customBrandWheels]);
  const cards = useMemo(() => buildDesignCards(wheels), [wheels]);
  const widths = designCardWidths(cards.length);

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

      {cards.length === 0 ? (
        <div className="mt-8 space-y-5">
          <p className="text-neutral-300">No wheels are listed in stock right now.</p>
          <ContactCta
            message="Hi, what wheels do you have available?"
            enquirySubject="Which wheels are available?"
            label="Enquire on WhatsApp"
            fallbackLabel="Send an enquiry"
            className={CTA_SECONDARY_CLASS}
          />
        </div>
      ) : (
        <ul
          data-testid="brand-wheel-catalogue-grid"
          className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-5"
        >
          {cards.map((card, index) => (
            <DesignCard
              key={card.design}
              card={card}
              width={widths[index]}
              fillTabletRow={cards.length % 2 === 1 && index === cards.length - 1}
              index={index}
            />
          ))}
        </ul>
      )}
    </section>
  );
};
