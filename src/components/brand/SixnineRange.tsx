import React from 'react';
import { ArrowRight, ExternalLink } from 'lucide-react';
import type { BrandWheelItem } from '../../data/catalogue';
import { SIXNINE_RANGE, stockedSets, type SixnineDesign } from '../../data/sixnineRange';
import { Link } from '../../utils/router';
import { ContactCta, CTA_SECONDARY_CLASS } from './ContactCta';

/** "In stock · 3 sets", "Pre-order with Sixnine" or "Ask us": what the shop can say about a design. */
function availability(design: SixnineDesign, sets: number): { label: string; tone: 'stock' | 'plain' } {
  if (sets > 0) return { label: `In stock with us · ${sets} set${sets === 1 ? '' : 's'}`, tone: 'stock' };
  if (design.preOrder) return { label: 'Pre-order at Sixnine', tone: 'plain' };
  return { label: 'Ask us about this design', tone: 'plain' };
}

const Badge: React.FC<{ design: SixnineDesign; sets: number }> = ({ design, sets }) => {
  const { label, tone } = availability(design, sets);
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs ${
        tone === 'stock' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/5 text-neutral-300'
      }`}
    >
      {label}
    </span>
  );
};

const anchor = (design: SixnineDesign) => `sixnine-${design.id}`;

/**
 * The full Sixnine range on /sixnine-wheels: one card per design with Sixnine's picture, its line,
 * sizes, bolt patterns, finishes and published figures, and whether the shop has it in stock.
 */
export const SixnineRangeSection: React.FC<{ inStock: BrandWheelItem[] }> = ({ inStock }) => (
  <section
    id="sixnine-range"
    aria-labelledby="sixnine-range-heading"
    className="scroll-mt-20 max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-12 sm:py-16 border-t border-[#26262E]"
  >
    <p className="text-sm uppercase tracking-[0.14em] text-neutral-400">{SIXNINE_RANGE.length} designs</p>
    <h2 id="sixnine-range-heading" className="mt-2 text-3xl sm:text-4xl font-light tracking-[-0.03em] leading-tight text-white">
      The Sixnine range
    </h2>
    <p className="mt-4 max-w-2xl text-neutral-300">
      Every design Sixnine makes. Sizes, finishes and figures are Sixnine's own and vary by size. Message us about any
      design and we will confirm what fits your car.
    </p>

    <ul className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {SIXNINE_RANGE.map((design) => {
        const sets = stockedSets(design, inStock);
        return (
          <li
            key={design.id}
            id={anchor(design)}
            className="scroll-mt-20 flex flex-col rounded-2xl border border-[#26262E] bg-[#16161A] p-5"
          >
            <div className="flex aspect-square items-center justify-center rounded-xl bg-[#0E0E11]">
              <img
                src={design.image}
                alt={`SIXNINE ${design.name} wheel in ${design.finishes[0]}`}
                width={720}
                height={720}
                loading="lazy"
                decoding="async"
                className="h-[86%] w-[86%] object-contain"
              />
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <h3 className="text-2xl font-light tracking-[-0.02em] text-white">{design.name}</h3>
              <Badge design={design} sets={sets} />
            </div>
            <p className="mt-1 text-sm uppercase tracking-[0.12em] text-[#F43F5E]">{design.tagline}</p>
            <p className="mt-3 text-neutral-300">{design.summary}</p>

            <dl className="mt-5 divide-y divide-[#26262E] border-y border-[#26262E] text-sm">
              {[
                ...(design.construction ? [{ label: 'Construction', value: design.construction }] : []),
                { label: 'Sizes', value: `${design.diameters} · ${design.widths}` },
                { label: 'Bolt patterns', value: design.boltPatterns.join(', ') },
                ...design.figures,
              ].map((row) => (
                <div key={row.label} className="flex gap-4 py-2">
                  <dt className="w-28 shrink-0 text-neutral-400">{row.label}</dt>
                  <dd className="text-white">{row.value}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-4 text-sm text-neutral-400">Finishes</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {design.finishes.map((finish) => (
                <li key={finish} className="rounded-full border border-[#2E2E36] px-3 py-1 text-xs text-neutral-200">
                  {finish}
                </li>
              ))}
            </ul>

            {design.editions && (
              <ul className="mt-4 space-y-1 text-sm text-neutral-400">
                {design.editions.map((edition) => (
                  <li key={edition}>Special edition: {edition}</li>
                ))}
              </ul>
            )}

            <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row sm:items-center">
              {sets > 0 ? (
                <a href="#sixnine-stock" className={CTA_SECONDARY_CLASS}>
                  See the sets in stock
                </a>
              ) : (
                <ContactCta
                  message={`Hi, I'd like to ask about the Sixnine ${design.name}.`}
                  enquirySubject={`Sixnine ${design.name} enquiry`}
                  label={`Ask about the ${design.name}`}
                  fallbackLabel={`Ask about the ${design.name}`}
                  className={CTA_SECONDARY_CLASS}
                />
              )}
              <a
                href={design.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-1.5 text-sm text-neutral-400 underline-offset-4 hover:text-neutral-200 hover:underline"
              >
                On sixnine-wheels.com
                <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
              </a>
            </div>
          </li>
        );
      })}
    </ul>
  </section>
);

/**
 * A row of every Sixnine design, shown under the Sixnine heading in the wheels catalogue. Each tile
 * links to that design's card on /sixnine-wheels; designs the shop has in stock say so.
 */
export const SixnineRangeStrip: React.FC<{ inStock: BrandWheelItem[]; brandPath: string }> = ({ inStock, brandPath }) => (
  <div className="mt-6">
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
      <h4 className="text-sm uppercase tracking-[0.14em] text-neutral-400">The full Sixnine range</h4>
      <Link
        to={`${brandPath}#sixnine-range`}
        className="group/link inline-flex min-h-11 items-center gap-2 text-sm text-neutral-300 hover:text-white"
      >
        Sizes and finishes
        <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover/link:translate-x-0.5" />
      </Link>
    </div>
    <ul className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {SIXNINE_RANGE.map((design) => {
        const sets = stockedSets(design, inStock);
        return (
          <li key={design.id}>
            <Link
              to={`${brandPath}#${anchor(design)}`}
              className="group/tile flex h-full flex-col rounded-xl border border-[#26262E] bg-[#16161A] p-3 hover:border-[#3A3A44]"
            >
              <img
                src={design.image}
                alt=""
                aria-hidden="true"
                width={720}
                height={720}
                loading="lazy"
                decoding="async"
                className="aspect-square w-full object-contain transition-transform duration-300 group-hover/tile:scale-[1.03]"
              />
              <span className="mt-2 text-base text-white">{design.name}</span>
              <span className="text-xs text-neutral-400">{design.tagline}</span>
              <span className={`mt-1 text-xs ${sets > 0 ? 'text-emerald-300' : 'text-neutral-500'}`}>
                {sets > 0 ? 'In stock with us' : design.preOrder ? 'Pre-order' : 'Ask us'}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  </div>
);
