import React from 'react';
import { MessageCircle } from 'lucide-react';
import { whatsappLink } from '../../config/site';
import { useForgedStore } from '../../store/useForgedStore';

interface ContactCtaProps {
  /** Text WhatsApp opens with, already typed. Also the enquiry subject when WhatsApp is not set up. */
  message: string;
  /** Overrides the enquiry subject used when WhatsApp is not configured. */
  enquirySubject?: string;
  /** Button text when WhatsApp is configured. */
  label?: string;
  /** Button text when it opens the enquiry form instead. */
  fallbackLabel?: string;
  className?: string;
  /** Runs when the button is activated, e.g. to close a menu or a lightbox. */
  onActivate?: () => void;
  showIcon?: boolean;
}

/**
 * The one "talk to us" button for the whole site. It opens the enquiry form with the message
 * already typed; the form posts the enquiry to the n8n lead workflow (so it is logged and emailed)
 * and, when a WhatsApp number is set in src/config/site.ts, then opens WhatsApp with the same
 * message. Callers only choose the wording and the styling.
 */
export const ContactCta: React.FC<ContactCtaProps> = ({
  message,
  enquirySubject,
  label = 'WhatsApp',
  fallbackLabel = 'Enquire',
  className = '',
  onActivate,
  showIcon = true,
}) => {
  const openEnquiryModal = useForgedStore((state) => state.openEnquiryModal);
  const waConfigured = whatsappLink(message) !== null;

  return (
    <button
      type="button"
      onClick={() => {
        onActivate?.();
        openEnquiryModal({ subject: enquirySubject ?? message, domain: 'brand' });
      }}
      className={className}
    >
      {waConfigured && showIcon && <MessageCircle aria-hidden="true" className="w-4 h-4 shrink-0" />}
      <span>{waConfigured ? label : fallbackLabel}</span>
    </button>
  );
};

/*
 * The site's buttons, in the SIXNINE build language: every control is a pill, primary actions are
 * solid white with dark text, secondary ones are glass, and they shrink a touch when pressed. FORGED
 * blue is the one accent: the header's Enquire button (CTA_ACCENT_CLASS). Use it once per view.
 */

/** The main button on a page: white, dark text. */
export const CTA_PRIMARY_CLASS =
  'press inline-flex items-center justify-center gap-2 min-h-12 px-6 rounded-full bg-white text-[#111111] text-[15px] font-semibold hover:bg-white/90 cursor-pointer whitespace-nowrap';

/** The quieter button beside it: glass with a hairline. */
export const CTA_SECONDARY_CLASS =
  'press glass inline-flex items-center justify-center gap-2 min-h-12 px-6 rounded-full border-white/[0.18] text-[#EDEBE4] text-[15px] font-semibold hover:bg-white/10 hover:text-white cursor-pointer whitespace-nowrap';

/** FORGED blue: the one promoted action in a view (the header's Enquire button). */
export const CTA_ACCENT_CLASS =
  'press inline-flex items-center justify-center gap-2 min-h-11 px-5 rounded-full bg-[#1D4ED8] text-white text-sm font-semibold hover:bg-[#2563EB] cursor-pointer whitespace-nowrap';
