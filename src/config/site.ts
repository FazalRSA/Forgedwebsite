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
  tiktokUrl: string;
  youtubeUrl: string;
  /** Public Google Business Profile reviews page (the "See all reviews" link). Empty hides the reviews section. */
  googleReviewsUrl: string;
  /** Google's "write a review" link for the profile. Empty hides the "Leave a review" button. */
  googleWriteReviewUrl: string;
  /** The profile's star rating exactly as Google shows it (0 to 5). Null hides the rating. */
  googleRating: number | null;
  /** The number of Google reviews, exactly as Google shows it. Null hides the rating. */
  googleReviewCount: number | null;
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

  instagramUrl: 'https://www.instagram.com/forged_sa1/',
  facebookUrl: '',
  tiktokUrl: '',
  youtubeUrl: '',

  /** Google reviews. Fill from the Google Business Profile; never type a rating that Google does not show. */
  googleReviewsUrl: '',
  googleWriteReviewUrl: '',
  googleRating: 5,
  googleReviewCount: 8,

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

export interface SocialLink {
  key: 'instagram' | 'facebook' | 'tiktok' | 'youtube';
  label: string;
  href: string;
}

/** Social profiles that are filled in above, in a fixed order. Empty values are left out. */
export function socialLinks(): SocialLink[] {
  const all: SocialLink[] = [
    { key: 'instagram', label: 'Instagram', href: SITE.instagramUrl },
    { key: 'facebook', label: 'Facebook', href: SITE.facebookUrl },
    { key: 'tiktok', label: 'TikTok', href: SITE.tiktokUrl },
    { key: 'youtube', label: 'YouTube', href: SITE.youtubeUrl },
  ];
  return all.filter((link) => link.href);
}
