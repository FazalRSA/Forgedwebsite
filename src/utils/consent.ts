/**
 * Cookie consent for Google Analytics (opt-in), with Google Consent Mode v2.
 *
 * How the pieces fit:
 * - The Google Tag Manager snippet (src/utils/googleTagManager.ts) sets every consent type to
 *   "denied" before the container loads, then grants analytics_storage at once if this browser
 *   accepted earlier (read from CONSENT_STORAGE_KEY). So Google Analytics never sets or reads a
 *   cookie before the visitor has said yes.
 * - The banner (src/components/shared/ConsentBanner.tsx) asks visitors who have not chosen yet,
 *   saves the answer here and sends it to the container with a consent "update".
 * - While consent is denied, Google's tags still send cookieless pings ("advanced" consent mode).
 *   Advertising consent (ad_storage, ad_user_data, ad_personalization) is never granted: the site
 *   runs no advertising tags.
 *
 * Everything here is safe to call on any host and in tests: it does nothing where Google Tag
 * Manager is not running, and storage or cookie failures never reach the visitor.
 */

/** The localStorage key for the visitor's choice. Also read by the snippet in googleTagManager.ts. */
export const CONSENT_STORAGE_KEY = 'forged-analytics-consent';

/** Window event that reopens the banner ("Cookie settings" in the footer and the privacy notice). */
export const CONSENT_SETTINGS_EVENT = 'forged:cookie-settings';

export type ConsentChoice = 'granted' | 'denied';

function storageOf(win: Window | undefined): Storage | null {
  try {
    return win?.localStorage ?? null;
  } catch {
    return null;
  }
}

/** The choice saved in this browser, or null when the visitor has not chosen (or storage is blocked). */
export function readConsent(win: Window | undefined = typeof window === 'undefined' ? undefined : window): ConsentChoice | null {
  try {
    const value = storageOf(win)?.getItem(CONSENT_STORAGE_KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null;
  }
}

/** Remember the choice in this browser. A blocked storage only means the banner asks again next visit. */
export function saveConsent(choice: ConsentChoice, win: Window | undefined = typeof window === 'undefined' ? undefined : window): void {
  try {
    storageOf(win)?.setItem(CONSENT_STORAGE_KEY, choice);
  } catch {
    // Private mode or storage disabled: the choice still applies to this page.
  }
}

/**
 * Tell Google Tag Manager about a choice. Consent commands must reach the data layer as an
 * Arguments object, exactly as gtag() pushes them; a plain array or object is ignored. Does nothing
 * when the container is not running on this page.
 */
export function sendConsentUpdate(choice: ConsentChoice, win: Window | undefined = typeof window === 'undefined' ? undefined : window): void {
  const dataLayer = win?.dataLayer;
  if (!Array.isArray(dataLayer)) return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (function gtag(_command: string, _action: string, _state: Record<string, string>) {
      // eslint-disable-next-line prefer-rest-params
      dataLayer.push(arguments);
    })('consent', 'update', { analytics_storage: choice });
  } catch {
    // Statistics are optional; the page must work without them.
  }
}

/** Google Analytics cookie names: _ga and _ga_<property>. */
const ANALYTICS_COOKIE = /^_ga(_|$)/;

/**
 * Delete Google Analytics cookies left in this browser (from before the visitor declined, or from
 * before the banner existed). GA writes them on the top-level domain (.forgedsa.co.za), so each is
 * expired for the bare host, the host and every parent domain. Returns the names it removed.
 */
export function clearAnalyticsCookies(doc: Document | undefined = typeof document === 'undefined' ? undefined : document): string[] {
  if (!doc) return [];
  try {
    const names = doc.cookie
      .split(';')
      .map((part) => part.split('=')[0].trim())
      .filter((name) => ANALYTICS_COOKIE.test(name));
    const host = doc.location?.hostname ?? '';
    const labels = host.split('.');
    const domains = [''];
    for (let i = 0; i < labels.length - 1; i += 1) domains.push(`; domain=.${labels.slice(i).join('.')}`);
    for (const name of names) {
      for (const domain of domains) doc.cookie = `${name}=; Max-Age=0; path=/${domain}`;
    }
    return names;
  } catch {
    return [];
  }
}

/** Save a choice, apply it to the container, and remove the cookies when it is a no. */
export function chooseConsent(choice: ConsentChoice, win: Window | undefined = typeof window === 'undefined' ? undefined : window): void {
  saveConsent(choice, win);
  sendConsentUpdate(choice, win);
  if (choice === 'denied') clearAnalyticsCookies(win?.document);
}

/** Reopen the cookie banner so the visitor can change their choice. */
export function openCookieSettings(win: Window | undefined = typeof window === 'undefined' ? undefined : window): void {
  win?.dispatchEvent(new Event(CONSENT_SETTINGS_EVENT));
}
