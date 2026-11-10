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

/** Shared look for the main orange button so every page's call to action matches. */
export const CTA_PRIMARY_CLASS =
  'inline-flex items-center justify-center gap-2 min-h-11 px-5 rounded-full bg-[#FF5500] text-white text-sm font-medium hover:bg-[#FF6B1A] transition-colors cursor-pointer whitespace-nowrap';

/** Shared look for the quiet outlined button. */
export const CTA_SECONDARY_CLASS =
  'inline-flex items-center justify-center gap-2 min-h-11 px-5 rounded-full border border-[#33333E] text-[#F5F5F7] text-sm font-medium hover:border-[#FF5500] hover:text-white transition-colors cursor-pointer whitespace-nowrap';
