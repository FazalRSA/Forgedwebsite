import React from 'react';
import { BrandHeader } from './BrandHeader';
import { ContactCta } from './ContactCta';
import { SITE, telLink, whatsappLink } from '../../config/site';

const CONTACT_MESSAGE = "Hi, I'd like to ask about your wheels.";

const WHAT_TO_SEND = [
  'Your car model, for example G80 M3',
  'The wheel you like: the design and finish from the wheels page',
  'The wheel size, if you have one in mind',
];

/**
 * /contact. Every value comes from SITE (src/config/site.ts) and appears only when it is filled in.
 * With no WhatsApp number the main button opens the enquiry form instead.
 */
export const ContactPage: React.FC = () => {
  const hasWhatsapp = whatsappLink() !== null;
  const phoneHref = telLink();

  // Rows are built from what is configured, so nothing empty or invented is ever shown.
  const rows: { label: string; content: React.ReactNode }[] = [];
  if (phoneHref && SITE.phoneDisplay) {
    rows.push({
      label: 'Phone',
      content: (
        <a href={phoneHref} className="inline-flex items-center min-h-11 text-white underline underline-offset-4 hover:text-[#F43F5E]">
          {SITE.phoneDisplay}
        </a>
      ),
    });
  }
  if (SITE.tradeEmail) {
    rows.push({
      label: 'Email',
      content: (
        <a href={`mailto:${SITE.tradeEmail}`} className="inline-flex items-center min-h-11 text-white underline underline-offset-4 hover:text-[#F43F5E]">
          {SITE.tradeEmail}
        </a>
      ),
    });
  }
  if (SITE.addressLine) {
    rows.push({ label: 'Address', content: <span className="inline-flex items-center min-h-11 py-1.5 text-white">{SITE.addressLine}</span> });
  }
  if (SITE.serviceAreas.length > 0) {
    rows.push({ label: 'Areas we serve', content: <span className="inline-flex items-center min-h-11 py-1.5 text-white">{SITE.serviceAreas.join(', ')}</span> });
  }
  if (SITE.instagramUrl) {
    rows.push({
      label: 'Instagram',
      content: (
        <a
          href={SITE.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center min-h-11 text-white underline underline-offset-4 hover:text-[#F43F5E]"
        >
          Instagram
        </a>
      ),
    });
  }
  if (SITE.facebookUrl) {
    rows.push({
      label: 'Facebook',
      content: (
        <a
          href={SITE.facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center min-h-11 text-white underline underline-offset-4 hover:text-[#F43F5E]"
        >
          Facebook
        </a>
      ),
    });
  }

  return (
    <div className="min-h-screen bg-[#111111] text-[#EDEBE4]">
      <BrandHeader />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 md:px-10 py-12 sm:py-16">
        <h1 className="text-4xl sm:text-5xl font-light tracking-[-0.03em] leading-tight text-white">
          Contact
        </h1>
        <p className="mt-4 max-w-xl text-lg text-neutral-300">
          {hasWhatsapp
            ? 'Message us on WhatsApp with your car and the wheel you like.'
            : 'Send us an enquiry with your car and the wheel you like.'}
        </p>

        <ContactCta
          message={CONTACT_MESSAGE}
          enquirySubject="Wheel enquiry"
          label="Message us on WhatsApp"
          fallbackLabel="Send an enquiry"
          className="mt-8 inline-flex w-full sm:w-auto items-center justify-center gap-3 min-h-14 px-8 rounded-full bg-[#1D4ED8] text-white text-lg font-medium hover:bg-[#2563EB] transition-colors cursor-pointer"
        />

        {rows.length > 0 && (
          <dl className="mt-12 divide-y divide-[#26262E] border-y border-[#26262E]">
            {rows.map((row) => (
              <div key={row.label} className="py-3 sm:flex sm:items-center sm:gap-6">
                <dt className="text-sm text-neutral-400 sm:w-40 sm:shrink-0">{row.label}</dt>
                <dd className="mt-0.5 sm:mt-0">{row.content}</dd>
              </div>
            ))}
          </dl>
        )}

        <section aria-labelledby="what-to-send" className="mt-12">
          <h2 id="what-to-send" className="text-xl font-medium text-white">
            What to send us
          </h2>
          <ul className="mt-4 space-y-2 text-neutral-300 list-disc pl-5 marker:text-[#F43F5E]">
            {WHAT_TO_SEND.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
};
