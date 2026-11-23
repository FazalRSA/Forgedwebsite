import React, { useMemo } from 'react';
import { SixnineRangeStrip } from './SixnineRange';
import { ArrowRight } from 'lucide-react';
import {
  BrandWheelItem,
  brandOfWheel,
  getAllBrandWheels,
  WHEEL_BRAND_ORDER,
  WHEEL_BRANDS,
  type WheelBrand,
} from '../../data/catalogue';
import { useForgedStore } from '../../store/useForgedStore';
import { Link } from '../../utils/router';
import {
  buildDesignCards,
  designCardWidths,
  designOf,
  type DesignCard as DesignCardData,
  type DesignCardWidth,
} from '../../utils/designCards';
import { wheelImageSrcSet } from '../../utils/wheelImageSrcSet';
import { ContactCta, CTA_SECONDARY_CLASS } from './ContactCta';
import { CatalogueSwatch } from './ColourSwatches';
import { EYEBROW_CLASS } from './sectionStyles';

export { designOf };

/**
 * How wide each wheel picture is drawn, so the browser can pick the smallest copy that fills it
 * (see wheelImageSrcSet). Measured in the built site at 390, 768 and 1440 px wide.
 */
// DesignCard: the wheel is 66-70% of the card's height; the card is one column on phones, two on tablets.
const DESIGN_CARD_SIZES = '(min-width:1280px) 350px, (min-width:1024px) 25vw, (min-width:640px) 37vw, 61vw';

/** A plain wheel outline, used wherever a listing has no real photo yet. */
export const WheelOutline: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="50" cy="50" r="46" />
    <circle cx="50" cy="50" r="38" />
    <circle cx="50" cy="50" r="9" />
    {[0, 72, 144, 216, 288].map((angle) => (
      <line key={angle} x1="50" y1="41" x2="50" y2="12" transform={`rotate(${angle} 50 50)`} strokeWidth="5" strokeLinecap="round" />
    ))}
  </svg>
);

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
  third: 'lg:h-[58%]',
  half: 'lg:h-[60%]',
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
        className={`press-card group relative block overflow-hidden rounded-3xl border border-[#26262E] hover:border-white/[0.18] bg-[#18181D] aspect-[4/5] ${fillTabletRow ? 'sm:aspect-[16/10]' : 'sm:aspect-[4/5]'} ${SHAPE_CLASSES[width]}`}
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
          className={`absolute left-1/2 top-[12%] aspect-square max-w-[90%] -translate-x-1/2 h-[52%] sm:top-[10%] sm:h-[56%] ${WHEEL_CLASSES[width]}`}
        >
          {image ? (
            <img
              {...wheelImageSrcSet(image, DESIGN_CARD_SIZES)}
              alt=""
              width={1000}
              height={1000}
              // The catalogue sits just below the hero, so the first card is on the first screen of a
              // phone: it loads straight away and first. The rest wait to be scrolled to.
              loading={index === 0 ? 'eager' : 'lazy'}
              fetchPriority={index === 0 ? 'high' : undefined}
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
            <h4 className="font-[family-name:var(--font-display)] font-black uppercase text-2xl sm:text-4xl leading-none tracking-[-0.03em] text-white">
              {card.design}
            </h4>
            <p className="mt-2 text-sm font-medium text-neutral-200 tabular-nums">{card.priceLine}</p>
            {card.swatches.length > 0 && (
              // decorative: the finish names are in the text below; the swatches are the viewer's own paint
              <span aria-hidden="true" className="mt-2 flex items-center gap-1.5">
                {card.swatches.map((sw) => (
                  <CatalogueSwatch key={sw.name} finishId={sw.finishId} name={sw.name} size={22} />
                ))}
              </span>
            )}
            {/* The swatches show the colours; their names are read aloud, and the sizes are shown. */}
            {finishes && <span className="sr-only">{finishes}</span>}
            {sizes && <p className="mt-1 text-sm text-neutral-400">{sizes}</p>}
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

/** "1 set", "9 sets"; "1 design", "4 designs". */
const count = (n: number, one: string) => `${n} ${one}${n === 1 ? '' : 's'}`;

/**
 * One brand's designs: its mark, name and what the shop is to it, how much is in stock, a link to the
 * brand's own page, and its design cards. With no brand (a design code that is neither FSA nor FF, which
 * a test rules out today) the cards are still listed, under no heading, so stock is never hidden.
 */
const BrandGroup: React.FC<{
  brand?: WheelBrand;
  wheels: BrandWheelItem[];
  /** Cards before this group, so only the very first card on the page loads eagerly. */
  firstIndex: number;
}> = ({ brand, wheels, firstIndex }) => {
  const cards = buildDesignCards(wheels);
  const widths = designCardWidths(cards.length);
  const sets = wheels.reduce((sum, wheel) => sum + (wheel.stockQuantitySets ?? 0), 0);
  const headingId = brand ? `catalogue-${brand.id}-heading` : undefined;

  return (
    <section id={brand ? `catalogue-${brand.id}` : undefined} aria-labelledby={headingId} className="scroll-mt-20 mt-10 first:mt-8">
      {brand && (
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <div className="flex items-center gap-4">
            <img
              src={brand.logo.url}
              alt=""
              aria-hidden="true"
              width={48}
              height={48}
              className="h-11 w-11 sm:h-12 sm:w-12 shrink-0 object-contain"
            />
            <div>
              <h3 id={headingId} className="text-2xl sm:text-3xl font-light tracking-[-0.02em] leading-tight text-white">
                {brand.name}
              </h3>
              <p className="mt-0.5 text-sm text-neutral-400">
                {brand.relation} · {count(cards.length, 'design')}, {count(sets, 'set')} in stock
              </p>
            </div>
          </div>
          <Link
            to={brand.path}
            className="group/link inline-flex min-h-11 items-center gap-2 text-sm font-medium text-neutral-200 hover:text-white"
          >
            All {brand.shortName} sets
            <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover/link:translate-x-0.5" />
          </Link>
        </div>
      )}
      <ul
        data-testid={`brand-wheel-catalogue-grid${brand ? `-${brand.id}` : ''}`}
        className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-5"
      >
        {cards.map((card, index) => (
          <DesignCard
            key={card.design}
            card={card}
            width={widths[index]}
            fillTabletRow={cards.length % 2 === 1 && index === cards.length - 1}
            index={firstIndex + index}
          />
        ))}
      </ul>
      {brand?.id === 'sixnine' && <SixnineRangeStrip inStock={wheels} brandPath={brand.path} />}
    </section>
  );
};

export const WheelCatalogue: React.FC = () => {
  const customBrandWheels = useForgedStore((state) => state.customBrandWheels);

  // getAllBrandWheels returns only wheels that are in stock.
  const wheels = useMemo(() => getAllBrandWheels(customBrandWheels), [customBrandWheels]);
  // Grouped by brand, the shop's own first; a group with nothing in stock is left out.
  const groups = useMemo(() => {
    const byBrand = WHEEL_BRAND_ORDER.map((id) => ({
      brand: WHEEL_BRANDS[id] as WheelBrand | undefined,
      wheels: wheels.filter((wheel) => brandOfWheel(wheel) === id),
    }));
    const unbranded = wheels.filter((wheel) => !brandOfWheel(wheel));
    return [...byBrand, { brand: undefined, wheels: unbranded }].filter((group) => group.wheels.length > 0);
  }, [wheels]);
  // Where each group's cards start, counted in design cards.
  const firstIndexes = groups.reduce<number[]>(
    (starts, group, i) => [...starts, i === 0 ? 0 : starts[i - 1] + buildDesignCards(groups[i - 1].wheels).length],
    []
  );

  return (
    <section
      id="catalogue"
      aria-labelledby="catalogue-heading"
      className="scroll-mt-20 max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-12 sm:py-16 border-t border-[#26262E]"
    >
      <span className={EYEBROW_CLASS}>Catalogue</span>
      <h2
        id="catalogue-heading"
        className="mt-2 text-3xl sm:text-4xl font-light tracking-[-0.03em] leading-tight text-white"
      >
        Wheels in stock
      </h2>

      {groups.length === 0 ? (
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
        groups.map((group, i) => (
          <BrandGroup key={group.brand?.id ?? 'other'} brand={group.brand} wheels={group.wheels} firstIndex={firstIndexes[i]} />
        ))
      )}
    </section>
  );
};
