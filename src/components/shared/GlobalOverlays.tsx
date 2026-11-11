import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, MessageCircle, X } from 'lucide-react';
import { SITE, telLink, whatsappLink } from '../../config/site';
import { useForgedStore } from '../../store/useForgedStore';
import { Link } from '../../utils/router';

/**
 * The enquiry form. Short on purpose: a message and a phone number (name is optional).
 *
 * Where the enquiry goes:
 * - WhatsApp number set in src/config/site.ts: the form opens WhatsApp with the message already
 *   typed, and the visitor taps Send there. That is the only way an enquiry reaches the shop.
 * - No number set yet: the form has nowhere to send it. The text is saved in this browser only,
 *   and the dialog says so instead of claiming it was received.
 * There is no backend, e-mail or database behind this form.
 */
const inputClass =
  'w-full min-h-12 px-4 bg-[#141418] border border-[#26262E] text-[#EDEBE4] text-base rounded-xl focus:outline-none focus:border-[#F43F5E] transition-colors placeholder:text-neutral-500';
const labelClass = 'block text-sm text-[#C2C2CC] mb-1.5';
const primaryButtonClass =
  'flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1D4ED8] px-6 text-base font-semibold text-white hover:bg-[#2563EB] transition-colors cursor-pointer';

const EnquiryDialog: React.FC = () => {
  const { enquiryModal, closeEnquiryModal, submitEnquiryRecord } = useForgedStore();

  // Opened from a wheel page the subject is the message already typed ("Hi, I'd like to ask about
  // the FSA002 in Gold ..."); from anywhere else it is a short topic, which still makes a fair start.
  const [message, setMessage] = useState(enquiryModal.subject);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<null | { whatsappHref: string | null }>(null);

  const dialogRef = useRef<HTMLDivElement | null>(null);

  const waConfigured = Boolean(whatsappLink());
  const phoneRequired = !waConfigured;

  // Keep the page behind still, move focus into the dialog, and give focus back when it closes.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      opener?.focus?.();
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = message.trim();
    if (!text) {
      setError('Please type a short message.');
      return;
    }
    if (phoneRequired && !phone.trim()) {
      setError('Please add a phone or WhatsApp number so we can reply.');
      return;
    }
    setError(null);

    const lines = [text];
    if (name.trim()) lines.push(`Name: ${name.trim()}`);
    if (phone.trim()) lines.push(`Phone: ${phone.trim()}`);
    const href = whatsappLink(lines.join('\n'));

    if (href) {
      window.open(href, '_blank', 'noopener,noreferrer');
    } else {
      // Nowhere to send it yet: keep it on this device, and say so below.
      submitEnquiryRecord({
        subject: enquiryModal.subject || 'Website enquiry',
        partNo: enquiryModal.partNo,
        finish: enquiryModal.finish,
        customerName: name.trim(),
        customerEmail: '',
        customerPhone: phone.trim(),
        vehicleRegistrationOrVin: '',
        notes: text,
      });
    }
    setDone({ whatsappHref: href });
  };

  const tel = telLink();

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) closeEnquiryModal();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') closeEnquiryModal();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="enquiry-title"
        tabIndex={-1}
        className="w-full max-w-md max-h-[92svh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[#0E0E12] text-[#EDEBE4] border border-[#26262E] p-5 sm:p-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl focus:outline-none"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="enquiry-title" className="text-xl font-semibold tracking-tight text-white">
            {done ? (done.whatsappHref ? 'Almost there' : 'Saved on this device') : 'Send an enquiry'}
          </h2>
          <button
            type="button"
            onClick={closeEnquiryModal}
            aria-label="Close enquiry form"
            className="-mr-2 -mt-2 w-11 h-11 rounded-full flex items-center justify-center text-[#C2C2CC] hover:text-white cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {done ? (
          <div className="pt-3 space-y-4">
            {done.whatsappHref ? (
              <>
                <p className="flex items-start gap-2 text-sm text-[#C2C2CC]">
                  <CheckCircle2 className="w-5 h-5 text-[#F43F5E] shrink-0" aria-hidden="true" />
                  <span>WhatsApp should be opening with your message. Tap Send there to reach us.</span>
                </p>
                <a
                  href={done.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={primaryButtonClass}
                >
                  <MessageCircle className="w-5 h-5" aria-hidden="true" />
                  Open WhatsApp
                </a>
              </>
            ) : (
              <>
                <p className="text-sm text-[#C2C2CC]">
                  This form does not reach us yet, so your message has not been sent.
                  {tel && SITE.phoneDisplay
                    ? ' Please call us instead.'
                    : ' Please use the details on our contact page.'}
                </p>
                {tel && SITE.phoneDisplay ? (
                  <a href={tel} className={primaryButtonClass}>
                    Call {SITE.phoneDisplay}
                  </a>
                ) : (
                  <Link to="/contact" onClick={closeEnquiryModal} className={primaryButtonClass}>
                    Contact details
                  </Link>
                )}
              </>
            )}
            <button
              type="button"
              onClick={closeEnquiryModal}
              className="w-full min-h-11 text-sm text-[#C2C2CC] hover:text-white cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="pt-4 space-y-4" noValidate>
            <div>
              <label htmlFor="enq-message" className={labelClass}>
                Your message
              </label>
              <textarea
                id="enq-message"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Which wheels, and for which car?"
                className={`${inputClass} py-3 resize-none`}
              />
            </div>

            <div>
              <label htmlFor="enq-phone" className={labelClass}>
                Phone or WhatsApp number{phoneRequired ? '' : ' (optional)'}
              </label>
              <input
                id="enq-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="082 000 0000"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="enq-name" className={labelClass}>
                Name (optional)
              </label>
              <input
                id="enq-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-[#F43F5E]">
                {error}
              </p>
            )}

            <button type="submit" className={primaryButtonClass}>
              {waConfigured && <MessageCircle className="w-5 h-5" aria-hidden="true" />}
              {waConfigured ? 'Send on WhatsApp' : 'Send enquiry'}
            </button>

            <p className="text-xs text-neutral-400 text-center">
              We use your details only to reply. See our{' '}
              <Link
                to="/privacy-policy"
                onClick={closeEnquiryModal}
                className="underline underline-offset-2 hover:text-white"
              >
                privacy policy
              </Link>
              .
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export const GlobalOverlays: React.FC = () => {
  const isOpen = useForgedStore((state) => state.enquiryModal.isOpen);
  return isOpen ? <EnquiryDialog /> : null;
};
