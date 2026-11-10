/**
 * Single source of truth for who and where the business is.
 *
 * Every public contact detail on the site (footer address, WhatsApp, phone,
 * Instagram, trade and privacy emails) reads from here. Leave a value as an
 * empty string until it is confirmed: components hide the element or fall
 * back to the enquiry form when a channel is not configured, so nothing fake
 * is ever shown.
 */
export interface SiteConfig {
  name: string;
  country: string;
  domain: string;
  whatsappNumber: string;
  phoneDisplay: string;
  tradeEmail: string;
  privacyEmail: string;
  instagramUrl: string;
  facebookUrl: string;
  addressLine: string;
  serviceAreas: readonly string[];
}

export const SITE: SiteConfig = {
  name: 'FORGED Custom Wheels',
  country: 'South Africa',
  /** Primary web domain, used for fallback email addresses. */
  domain: 'forgedsa.co.za',

  /** WhatsApp Business number in E.164 digits only, e.g. '27820000000'. */
  whatsappNumber: '27834472654',
  /** Human-readable telephone, e.g. '+27 82 000 0000'. */
  phoneDisplay: '+27 83 447 2654',

  /** Trade / dealer desk email. Falls back to privacyEmail when empty. */
  tradeEmail: '',
  /** Information Officer / privacy contact (published in the privacy notice). */
  privacyEmail: 'privacy@forgedcustomwheels.com',

  instagramUrl: '',
  facebookUrl: '',

  /** One-line street address for the header/footer, e.g. 'UNIT 4 · 12 EXAMPLE ROAD · SANDTON · JOHANNESBURG'. */
  addressLine: "11 SAINT MARY'S AVENUE · WINDERMERE · BEREA · DURBAN · 4001",
  /** Cities used in copy and placeholders. */
  serviceAreas: [],
};

/** wa.me deep link with an optional prefilled message, or null when no number is configured. */
export function whatsappLink(message?: string): string | null {
  if (!SITE.whatsappNumber) return null;
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${SITE.whatsappNumber}${text}`;
}

/** tel: link derived from the display number, or null when none is configured. */
export function telLink(): string | null {
  if (!SITE.phoneDisplay) return null;
  const digits = SITE.phoneDisplay.replace(/[^\d+]/g, '');
  return `tel:${digits.startsWith('+') ? digits : `+${digits}`}`;
}

/** The address shown in header/footer: the street line if set, else the country. */
export function displayAddress(): string {
  return SITE.addressLine || SITE.country.toUpperCase();
}

/** Trade contact email with privacy email as fallback. */
export function tradeContactEmail(): string {
  return SITE.tradeEmail || SITE.privacyEmail;
}
