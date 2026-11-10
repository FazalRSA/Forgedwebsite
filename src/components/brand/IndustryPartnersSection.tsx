import React from 'react';
import { PARTNERS, Partner } from '../../data/partners';
import { Link } from '../../utils/router';

const LOGO_CLASS = 'w-24 h-24 sm:w-28 sm:h-28 object-contain';

const PartnerLogo: React.FC<{ partner: Partner }> = ({ partner }) => {
  const logo = (
    <img
      src={partner.logo}
      alt={`${partner.name} logo`}
      width={112}
      height={112}
      loading="lazy"
      decoding="async"
      className={LOGO_CLASS}
    />
  );
  const caption = partner.caption ? (
    <span className="block text-sm text-neutral-300">{partner.caption}</span>
  ) : null;

  return (
    <li className="flex flex-col items-center gap-2 text-center">
      {partner.href ? (
        <Link
          to={partner.href}
          aria-label={`${partner.name}${partner.caption ? `, ${partner.caption}` : ''}`}
          className="flex flex-col items-center gap-2 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF5500]"
        >
          {logo}
          {caption && <span className="text-sm text-neutral-300 underline underline-offset-4">{partner.caption}</span>}
        </Link>
      ) : (
        <>
          {logo}
          {caption}
        </>
      )}
    </li>
  );
};

/** The partners strip on the home page. It renders nothing when src/data/partners.ts is empty. */
export const IndustryPartnersSection: React.FC = () => {
  if (PARTNERS.length === 0) return null;

  return (
    <section
      id="partners"
      data-testid="industry-partners-section"
      aria-labelledby="partners-heading"
      className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-12 sm:py-16 border-t border-[#26262E]"
    >
      <h2
        id="partners-heading"
        className="text-3xl sm:text-4xl font-light tracking-[-0.03em] leading-tight text-white"
      >
        Our industry partners
      </h2>
      <ul className="mt-8 flex flex-wrap items-start gap-x-10 gap-y-8">
        {PARTNERS.map((partner) => (
          <PartnerLogo key={partner.id} partner={partner} />
        ))}
      </ul>
    </section>
  );
};
