import React, { useEffect, useState } from 'react';
import { Link } from '../../utils/router';
import { googleTagManagerId } from '../../utils/googleTagManager';
import {
  CONSENT_SETTINGS_EVENT,
  chooseConsent,
  clearAnalyticsCookies,
  readConsent,
  type ConsentChoice,
} from '../../utils/consent';
import { CTA_PRIMARY_CLASS, CTA_SECONDARY_CLASS } from '../brand/ContactCta';

/** Google Tag Manager is set up in config/site.ts, so there are Google Analytics cookies to ask about. */
const ENABLED = googleTagManagerId() !== null;

/**
 * The cookie banner: Google Analytics cookies stay off until the visitor taps Accept (see
 * src/utils/consent.ts). Shown to visitors who have not chosen yet, and again whenever "Cookie
 * settings" is used. Decline is as easy as Accept, and the choice is remembered in this browser.
 *
 * It sits above the floating WhatsApp button (z-40) and below the enquiry and car-preview dialogs
 * (z-50), and does not block the page: a visitor can ignore it, and analytics simply stay off.
 */
export const ConsentBanner: React.FC = () => {
  const [open, setOpen] = useState(() => ENABLED && readConsent() === null);

  useEffect(() => {
    if (!ENABLED) return;
    // Cookies from before a "Decline", or from before the banner existed, are removed until a "yes".
    if (readConsent() !== 'granted') clearAnalyticsCookies();
    const reopen = () => setOpen(true);
    window.addEventListener(CONSENT_SETTINGS_EVENT, reopen);
    return () => window.removeEventListener(CONSENT_SETTINGS_EVENT, reopen);
  }, []);

  if (!open) return null;

  const choose = (choice: ConsentChoice) => {
    chooseConsent(choice);
    setOpen(false);
  };

  return (
    <section
      role="region"
      aria-label="Cookie choice"
      className="fixed z-[45] inset-x-3 bottom-3 sm:inset-x-auto sm:left-6 sm:bottom-6 sm:max-w-md pb-[env(safe-area-inset-bottom)]"
    >
      <div className="rounded-2xl border border-[#26262E] bg-[#121215] p-4 sm:p-5 shadow-2xl shadow-black/60">
        <p className="text-sm leading-relaxed text-[#C2C2CC]">
          May we use Google Analytics cookies to see which pages are used and how visitors find us? They
          stay off unless you accept.{' '}
          <Link to="/privacy-policy#s-06" className="text-white underline underline-offset-4 hover:text-[#F43F5E]">
            Privacy notice
          </Link>
        </p>
        <div className="mt-4 flex gap-3">
          <button type="button" onClick={() => choose('denied')} className={`${CTA_SECONDARY_CLASS} flex-1`}>
            Decline
          </button>
          <button type="button" onClick={() => choose('granted')} className={`${CTA_PRIMARY_CLASS} flex-1`}>
            Accept
          </button>
        </div>
      </div>
    </section>
  );
};
