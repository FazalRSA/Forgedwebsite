import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { SITE, telLink, whatsappLink } from '../../config/site';
import { Link } from '../../utils/router';
import { WORDMARK_HEIGHT, WORDMARK_WIDTH } from '../shared/BrandLogo';

const FOOTER_LINKS = [
  { label: 'Wheels', to: '/#catalogue' },
  { label: 'Installs', to: '/installs' },
  { label: 'Contact', to: '/contact' },
  { label: 'Privacy policy', to: '/privacy-policy' },
] as const;

interface ContactColumn {
  key: string;
  label: string;
  links: { text: string; href: string; external?: boolean }[];
  /** Plain text under the label when the column is not a link. */
  text?: string;
  /** Classes that place the column in the phone grid. */
  phoneClass?: string;
}

/** A Google Maps search for the street address, so "Visit" opens directions. */
function mapsLink(address: string): string {
  const query = address.split('·').map((part) => part.trim()).join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Only the channels filled in src/config/site.ts become columns; an empty value hides its column. */
function contactColumns(): ContactColumn[] {
  const columns: ContactColumn[] = [];
  const whatsappHref = whatsappLink("Hi, I'd like to ask about your wheels.");
  if (whatsappHref) {
    columns.push({ key: 'whatsapp', label: 'WhatsApp', links: [{ text: 'Message us', href: whatsappHref, external: true }] });
  }
  if (SITE.tradeEmail) {
    columns.push({ key: 'email', label: 'Email', links: [{ text: SITE.tradeEmail, href: `mailto:${SITE.tradeEmail}` }] });
  }
  if (SITE.addressLine) {
    columns.push({
      key: 'visit',
      label: 'Visit',
      links: [{ text: SITE.addressLine, href: mapsLink(SITE.addressLine), external: true }],
      // Full width and last on a phone: the address is the longest line.
      phoneClass: 'col-span-2 order-last md:order-none',
    });
  }
  const social = [
    SITE.instagramUrl && { text: 'Instagram', href: SITE.instagramUrl, external: true },
    SITE.facebookUrl && { text: 'Facebook', href: SITE.facebookUrl, external: true },
  ].filter(Boolean) as ContactColumn['links'];
  if (social.length > 0) columns.push({ key: 'social', label: 'Follow us', links: social });
  const phoneHref = telLink();
  if (phoneHref && SITE.phoneDisplay) {
    columns.push({ key: 'phone', label: 'Phone', links: [{ text: SITE.phoneDisplay, href: phoneHref }] });
  }
  return columns;
}

const columnLinkClass =
  'group inline-flex items-start gap-1 min-h-11 py-2.5 text-sm text-neutral-200 hover:text-white transition-colors';

/**
 * The footer on every page: the FORGED SA wordmark across the full width, a row of contact
 * details, then the page links and copyright.
 */
export const SiteFooter: React.FC = () => {
  const columns = contactColumns();

  return (
    <footer className="bg-[#0A0A0A] text-[#F5F5F7] border-t border-[#26262E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 pt-14 md:pt-20">
        <Link to="/" aria-label="FORGED Custom Wheels, home" className="block">
          <img
            src="/brand/forged-wordmark.svg"
            alt=""
            width={WORDMARK_WIDTH}
            height={WORDMARK_HEIGHT}
            loading="lazy"
            className="w-full h-auto"
          />
        </Link>

        {columns.length > 0 && (
          <div className="mt-12 md:mt-16 border-t border-[#1E1E26] pt-6 grid grid-cols-2 gap-x-6 gap-y-4 md:flex md:justify-between md:gap-10">
            {columns.map((column) => (
              <div key={column.key} className={`min-w-0 ${column.phoneClass ?? ''}`}>
                <p className="text-[11px] font-tech-mono font-semibold tracking-[0.18em] uppercase text-neutral-500">
                  {column.label}
                </p>
                <ul>
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        className={columnLinkClass}
                      >
                        <span className="max-w-xs">{link.text}</span>
                        <ArrowUpRight
                          aria-hidden="true"
                          className="w-3.5 h-3.5 mt-0.5 shrink-0 text-neutral-500 group-hover:text-[#FF5500] transition-colors"
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 border-t border-[#1E1E26] py-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-6">
              {FOOTER_LINKS.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="inline-flex items-center min-h-11 text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <p className="flex items-center gap-2.5 text-xs text-neutral-500">
            <img src="/brand/forged-monogram.svg" alt="" width={20} height={20} loading="lazy" className="h-5 w-5" />
            <span>
              © {new Date().getFullYear()} {SITE.name} · {SITE.country}
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};
