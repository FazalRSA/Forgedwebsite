/**
 * Visit statistics with Umami Cloud (see README → Search and visit statistics).
 *
 * Nothing is loaded until config/site.ts has both the tracker address and the website ID, so a
 * site without them collects nothing and the privacy notice says so (it reads the same check).
 * Umami's tracker sets no cookies and does not store visitors' IP addresses in its statistics.
 *
 * The tracker is told to count only the production host (so a preview on the Render address or a
 * developer's localhost never counts) and to respect a browser's Do Not Track setting. It is added
 * after the page has loaded, so it never competes with the first paint.
 */
import { SITE, type SiteConfig } from '../config/site';

type AnalyticsConfig = Pick<SiteConfig, 'analyticsScriptUrl' | 'analyticsWebsiteId' | 'host'>;

export interface AnalyticsScript {
  /** The tracker's address, always https. */
  src: string;
  websiteId: string;
  /** Hostnames the tracker may count; a page served from any other host is ignored. */
  domains: string;
}

/** The tracker's data for a configuration, or null when statistics are not set up (or the values are not valid). */
export function analyticsScript(config: AnalyticsConfig = SITE): AnalyticsScript | null {
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  let url: URL;
  try {
    url = new URL(config.analyticsScriptUrl);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' || !uuid.test(config.analyticsWebsiteId)) return null;
  return { src: url.href, websiteId: config.analyticsWebsiteId, domains: config.host };
}

/** Add the tracker to the page, once. Returns the script element, or null when statistics are not set up. */
export function loadAnalytics(doc: Document = document, config: AnalyticsConfig = SITE): HTMLScriptElement | null {
  const script = analyticsScript(config);
  if (!script) return null;
  const existing = doc.querySelector<HTMLScriptElement>('script[data-website-id]');
  if (existing) return existing;

  const el = doc.createElement('script');
  el.defer = true;
  el.src = script.src;
  el.dataset.websiteId = script.websiteId;
  el.dataset.domains = script.domains;
  el.dataset.doNotTrack = 'true';
  doc.head.appendChild(el);
  return el;
}

/** Start the statistics once the page has finished loading. Safe to call when they are not set up. */
export function startAnalytics(win: Window = window): void {
  if (win.document.readyState === 'complete') {
    loadAnalytics(win.document);
  } else {
    win.addEventListener('load', () => loadAnalytics(win.document), { once: true });
  }
}

type EventData = Record<string, string | number>;

declare global {
  interface Window {
    umami?: { track: (name: string, data?: EventData) => void };
    /** Google Tag Manager's data layer; present only while the container snippet runs (src/utils/googleTagManager.ts). */
    dataLayer?: unknown[];
  }
}

/**
 * Count something that happened, such as the enquiry form being opened. The page address is added
 * to every event; pass only anonymous values in `data` (never a name, number, email or message).
 *
 * The event goes to Umami when it runs, and to Google Tag Manager's data layer as
 * `{ event: name, page, ...data }` when the container runs, where a Custom Event trigger can pass it
 * on to Google Analytics. Does nothing when neither is running, and a failure here never reaches
 * the visitor.
 */
export function trackEvent(
  name: string,
  data: EventData = {},
  win: Window | undefined = typeof window === 'undefined' ? undefined : window
): void {
  let payload: EventData;
  try {
    if (!win) return;
    payload = { page: win.location.pathname, ...data };
  } catch {
    return;
  }
  try {
    win.umami?.track(name, payload);
  } catch {
    // Statistics are optional; the page must work without them.
  }
  try {
    if (Array.isArray(win.dataLayer)) win.dataLayer.push({ event: name, ...payload });
  } catch {
    // Same for Google Tag Manager.
  }
}
