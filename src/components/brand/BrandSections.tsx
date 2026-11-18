import React from 'react';
import type { BrandWheelItem, WheelBrand } from '../../data/catalogue';
import type { FitmentRow } from '../../utils/brandFitment';
import { Link } from '../../utils/router';
import { ContactCta, CTA_PRIMARY_CLASS, CTA_SECONDARY_CLASS } from './ContactCta';
import { WheelCard } from './WheelCatalogue';

/**
 * The sections the two brand pages (/forged-sa-wheels and /sixnine-wheels) share, so the pages stay
 * alike: the opening with the brand's mark, the sets in stock, fitment at a glance and an enquiry row.
 */

const SECTION_CLASS = 'max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-12 sm:py-16';

/** The brand's mark, name and what the shop is to it, a sentence, and the enquiry and stock buttons. */
export const BrandPageHero: React.FC<{
  brand: WheelBrand;
  heading: string;
  children: React.ReactNode;
  enquiryMessage: string;
  enquirySubject: string;
  stockAnchor: string;
  /** The colour of the small label above the heading. */
  eyebrowClassName?: string;
}> = ({ brand, heading, children, enquiryMessage, enquirySubject, stockAnchor, eyebrowClassName = 'text-neutral-400' }) => (
  <section className={SECTION_CLASS}>
    <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10">
      <img
        src={brand.logo.url}
        alt={brand.logo.alt}
        width={144}
        height={144}
        className="w-28 h-28 sm:w-36 sm:h-36 shrink-0 object-contain"
      />
      <div className="max-w-2xl">
        <p className={`text-sm uppercase tracking-[0.14em] ${eyebrowClassName}`}>{brand.relation}</p>
        <h1 className="mt-2 text-4xl sm:text-5xl font-light tracking-[-0.03em] leading-tight text-white">{heading}</h1>
        <div className="mt-4 space-y-3 text-lg text-neutral-300">{children}</div>
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <ContactCta
            message={enquiryMessage}
            enquirySubject={enquirySubject}
            label="Enquire on WhatsApp"
            fallbackLabel="Send an enquiry"
            className={CTA_PRIMARY_CLASS}
          />
          <a href={`#${stockAnchor}`} className={CTA_SECONDARY_CLASS}>
            See the sets in stock
          </a>
        </div>
      </div>
    </div>
  </section>
);

/** Every set of the brand in stock, one card per listing, or a line saying there are none. */
export const BrandStockSection: React.FC<{
  id: string;
  heading: string;
  wheels: BrandWheelItem[];
  emptyText: string;
}> = ({ id, heading, wheels, emptyText }) => (
  <section id={id} aria-labelledby={`${id}-heading`} className={`scroll-mt-20 ${SECTION_CLASS} border-t border-[#26262E]`}>
    <h2 id={`${id}-heading`} className="text-3xl sm:text-4xl font-light tracking-[-0.03em] leading-tight text-white">
      {heading}
    </h2>
    {wheels.length === 0 ? (
      <p className="mt-6 text-neutral-300">{emptyText}</p>
    ) : (
      <ul className="mt-8 grid grid-cols-2 lg:grid-cols-3 gap-x-3 sm:gap-x-6 gap-y-9">
        {wheels.map((wheel, index) => (
          <WheelCard key={wheel.id} wheel={wheel} index={index} />
        ))}
      </ul>
    )}
  </section>
);

/** Fitment at a glance (see fitmentAtAGlance); nothing when the sets share no facts. */
export const BrandFitmentSection: React.FC<{ id: string; rows: FitmentRow[] }> = ({ id, rows }) =>
  rows.length === 0 ? null : (
    <section aria-labelledby={`${id}-heading`} className={`${SECTION_CLASS} border-t border-[#26262E]`}>
      <h2 id={`${id}-heading`} className="text-2xl font-light tracking-[-0.02em] text-white">
        Fitment at a glance
      </h2>
      <dl className="mt-6 max-w-2xl divide-y divide-[#26262E] border-y border-[#26262E]">
        {rows.map((row) => (
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
  );

/** The closing row: ask about the brand, or see cars the shop has fitted. */
export const BrandEnquirySection: React.FC<{ heading: string; enquiryMessage: string; enquirySubject: string }> = ({
  heading,
  enquiryMessage,
  enquirySubject,
}) => (
  <section className={`${SECTION_CLASS} border-t border-[#26262E]`}>
    <h2 className="text-2xl font-light tracking-[-0.02em] text-white">{heading}</h2>
    <div className="mt-6 flex flex-col sm:flex-row gap-3">
      <ContactCta
        message={enquiryMessage}
        enquirySubject={enquirySubject}
        label="Enquire on WhatsApp"
        fallbackLabel="Send an enquiry"
        className={CTA_PRIMARY_CLASS}
      />
      <Link to="/installs" className={CTA_SECONDARY_CLASS}>
        See cars we have fitted
      </Link>
    </div>
  </section>
);
