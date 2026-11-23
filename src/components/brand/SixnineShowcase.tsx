import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { BrandWheelItem } from '../../data/catalogue';
import { seriesPath, SIXNINE_SERIES, sixnineSeriesOfWheel, type SixnineSeries } from '../../data/sixnineSeries';
import { Link } from '../../utils/router';
import { showcasePicture, sixnineNews, type ShowcasePicture } from '../../utils/sixnineShowcase';
import { wheelImageSrcSet } from '../../utils/wheelImageSrcSet';
import { EYEBROW_CLASS } from './sectionStyles';

/**
 * The SIXNINE storefront's large feature card, as on its home page ("New at SIXNINE", "Find your
 * design"): a tall dark tile lit from the top, the wheel floating at three-quarters in its upper part,
 * a white pill badge at the top left, the name large at the bottom left over a fade, an optional line
 * under it, and a round arrow at the bottom right. The whole card is one link.
 */

// Drawn full width on phones, half on tablets, a third on wide screens.
const CARD_IMAGE_SIZES = '(min-width:1024px) 400px, (min-width:640px) 45vw, 90vw';

/**
 * A face-on picture turned to about three-quarters, the angle Sixnine shoots its renders at. The
 * shop's own cut-outs are already photographed at that angle and are drawn as they are.
 */
const TILT_CLASS = '[transform:perspective(900px)_rotateY(-42deg)_rotateX(10deg)_rotateZ(-6deg)]';

export const ShowcaseCard: React.FC<{
  to: string;
  title: string;
  /** The series name, outlined, stands in when there is no picture. */
  fallbackName: string;
  picture?: ShowcasePicture;
  badge?: string;
  description?: string;
  /** The heading level inside the section: h3 under the section's h2. */
  headingLevel?: 'h3' | 'h4' | 'h5';
  className?: string;
}> = ({ to, title, fallbackName, picture, badge, description, headingLevel = 'h3', className = '' }) => {
  const Heading = headingLevel;
  return (
    <Link
      to={to}
      className={`press-card group relative isolate flex aspect-[4/3.3] min-h-[280px] flex-col justify-end overflow-hidden rounded-[28px] border border-white/[0.07] bg-[radial-gradient(130%_95%_at_50%_0%,#2C2C33_0%,#1B1B20_48%,#121215_100%)] p-5 sm:p-7 transition-colors duration-200 hover:border-white/[0.16] ${className}`}
    >
      {badge && (
        <span className="absolute left-4 top-4 z-20 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[#111111] sm:left-5 sm:top-5">
          {badge}
        </span>
      )}

      <div aria-hidden="true" className="absolute inset-x-0 top-[3%] bottom-[19%] -z-10 flex items-center justify-center">
        {picture ? (
          <div className={`flex h-full w-full items-center justify-center ${picture.angled ? '' : TILT_CLASS}`}>
            <img
              {...wheelImageSrcSet(picture.src, CARD_IMAGE_SIZES)}
              alt=""
              width={600}
              height={600}
              loading="lazy"
              decoding="async"
              className={`w-auto max-w-[86%] object-contain drop-shadow-[0_28px_36px_rgba(0,0,0,0.65)] transition-transform duration-700 ease-[cubic-bezier(.23,1,.32,1)] group-hover:scale-[1.04] motion-reduce:transition-none ${
                picture.angled ? 'h-full' : 'h-[88%]'
              }`}
            />
          </div>
        ) : (
          <span className="font-[family-name:var(--font-display)] text-6xl font-black uppercase tracking-[-0.04em] text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,0.35)] sm:text-7xl">
            {fallbackName}
          </span>
        )}
      </div>

      {/* The fade under the text, so the name stays readable where the wheel runs behind it. */}
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-[#121215] via-[#121215]/75 to-transparent" />

      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <Heading className="font-[family-name:var(--font-display)] text-[28px] font-black leading-[1.05] tracking-[-0.02em] text-white sm:text-[32px]">
            {title}
          </Heading>
          {description && <p className="mt-2 max-w-[34ch] text-[15px] leading-snug text-neutral-300 sm:text-base">{description}</p>}
        </div>
        <span
          aria-hidden="true"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/[0.12] text-white backdrop-blur-sm transition-colors duration-200 group-hover:bg-white group-hover:text-[#111111] sm:h-14 sm:w-14"
        >
          <ArrowRight className="h-5 w-5" />
        </span>
      </div>
    </Link>
  );
};

const inStockOf = (series: SixnineSeries, wheels: BrandWheelItem[]) =>
  wheels.some((wheel) => sixnineSeriesOfWheel(wheel)?.code === series.code);

/** One series as a showcase card, badged "In stock" when the shop has a set of it. */
export const SeriesShowcaseCard: React.FC<{
  series: SixnineSeries;
  wheels: BrandWheelItem[];
  headingLevel?: 'h3' | 'h4' | 'h5';
  className?: string;
}> = ({ series, wheels, headingLevel, className }) => (
  <ShowcaseCard
    to={seriesPath(series)}
    title={series.code}
    fallbackName={series.code}
    picture={showcasePicture(series, wheels)}
    badge={inStockOf(series, wheels) ? 'In stock' : undefined}
    headingLevel={headingLevel}
    className={className}
  />
);

const WRAP = 'max-w-7xl mx-auto px-4 sm:px-6 md:px-10';
const H2 = 'mt-2 font-[family-name:var(--font-display)] text-[34px] font-black leading-[1.05] tracking-[-0.02em] text-white sm:text-5xl';
const GRID = 'mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3';

/** "New at Sixnine": what Sixnine has on pre-order, one card each. Hidden when there is none. */
export const SixnineNewSection: React.FC<{ wheels: BrandWheelItem[] }> = ({ wheels }) => {
  const items = sixnineNews();
  if (!items.length) return null;
  return (
    <section aria-labelledby="sixnine-new-heading" className="border-t border-[#26262E]">
      <div className={`${WRAP} py-12 sm:py-16`}>
        <span className={EYEBROW_CLASS}>New</span>
        <h2 id="sixnine-new-heading" className={H2}>New at Sixnine</h2>
        <ul className={GRID}>
          {items.map((item) => (
            <li key={item.key}>
              <ShowcaseCard
                to={item.to}
                title={item.title}
                fallbackName={item.series.code}
                picture={showcasePicture(item.series, wheels)}
                badge={item.badge}
                description={item.description}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

/** "Find your design": every Sixnine series as a showcase card, each linking to its series page. */
export const SixnineFindYourDesignSection: React.FC<{
  wheels: BrandWheelItem[];
  series?: readonly SixnineSeries[];
  eyebrow?: string;
  heading?: string;
  id?: string;
}> = ({ wheels, series = SIXNINE_SERIES, eyebrow = 'Series', heading = 'Find your design', id = 'sixnine-series' }) => (
  <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-24 border-t border-[#26262E]">
    <div className={`${WRAP} py-12 sm:py-16`}>
      <span className={EYEBROW_CLASS}>{eyebrow}</span>
      <h2 id={`${id}-heading`} className={H2}>{heading}</h2>
      <ul className={GRID}>
        {series.map((s) => (
          <li key={s.code}>
            <SeriesShowcaseCard series={s} wheels={wheels} />
          </li>
        ))}
      </ul>
    </div>
  </section>
);
