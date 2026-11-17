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
  host: string;
  whatsappNumber: string;
  phoneDisplay: string;
  tradeEmail: string;
  privacyEmail: string;
  instagramUrl: string;
  facebookUrl: string;
  addressLine: string;
  serviceAreas: readonly string[];
  /** n8n webhook that receives every website enquiry (see README → Lead delivery). */
  leadsWebhookUrl: string;
  /** Visit statistics (Umami Cloud): the tracker script's address. Empty means no statistics are collected. */
  analyticsScriptUrl: string;
  /** Visit statistics: the website ID (a UUID) from Umami's tracking-code page. Empty means no statistics. */
  analyticsWebsiteId: string;
  /** Google Search Console ownership tag: the `content` of the HTML-tag verification. Empty adds no tag. */
  searchConsoleToken: string;
  /**
   * "See it on my car": the address of the Cloudflare Worker that makes the preview (see
   * worker/car-preview/README.md). Empty hides the button on every wheel page; a value must be https.
   */
  carPreviewUrl: string;
}

export const SITE: SiteConfig = {
  name: 'FORGED Custom Wheels',
  country: 'South Africa',
  /** Primary web domain, used for fallback email addresses. */
  domain: 'forgedsa.co.za',
  /**
   * The host the site is actually served from. Canonical URLs, the sitemap, robots.txt and llms.txt
   * all use it. The bare `domain` redirects here, so it must never be what the pages point to: a
   * canonical address that redirects back to the page confuses search engines.
   */
  host: 'www.forgedsa.co.za',

  /** WhatsApp Business number in E.164 digits only, e.g. '27820000000'. */
  whatsappNumber: '27834472654',
  /** Human-readable telephone, e.g. '+27 82 000 0000'. */
  phoneDisplay: '+27 83 447 2654',

  /** Trade / dealer desk email. Falls back to privacyEmail when empty. Must be on `domain`. */
  tradeEmail: '',
  /** Privacy contact email, shown in the privacy notice when set. Must be on `domain`; leave empty until the mailbox exists. */
  privacyEmail: '',

  instagramUrl: '',
  facebookUrl: '',

  /** One-line street address for the header/footer, e.g. 'UNIT 4 · 12 EXAMPLE ROAD · SANDTON · JOHANNESBURG'. */
  addressLine: "11 SAINT MARY'S AVENUE · WINDERMERE · BEREA · DURBAN · 4001",
  /** Cities used in copy and placeholders. */
  serviceAreas: [],

  /** Production URL of the "FORGED · Website Leads" n8n workflow. Override per deployment with VITE_LEADS_WEBHOOK_URL. */
  leadsWebhookUrl: 'https://novahavensai.app.n8n.cloud/webhook/forged-website-lead',

  /** Umami Cloud tracker, from its tracking-code page. Leave both empty until the Umami website exists (see README → Search and visit statistics). */
  analyticsScriptUrl: '',
  analyticsWebsiteId: '',

  /** Google Search Console HTML-tag token (not needed when the domain is verified with a DNS record). */
  searchConsoleToken: '',

  /**
   * Address of the car-preview Worker, e.g. 'https://forged-car-preview.<account>.workers.dev/'.
   * Leave empty until the Worker is deployed: the "See it on my car" button and the matching
   * privacy-notice text stay off until this is set (see worker/car-preview/README.md).
   */
  carPreviewUrl: '',
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
