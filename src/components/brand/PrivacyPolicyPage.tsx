import React from 'react';
import { ArrowLeft, Lock, MapPin, MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import { BrandHeader } from './BrandHeader';
import { useRouter } from '../../utils/router';
import { SITE, telLink, whatsappLink } from '../../config/site';

/**
 * Responsible-party details published in the notice (POPIA s18(1)(b)).
 * Fill in the registration number and Information Officer name once confirmed;
 * empty strings are simply not rendered.
 */
const RESPONSIBLE_PARTY = {
  tradingName: SITE.name,
  registrationNumber: '',
  physicalAddress: SITE.addressLine,
  country: SITE.country,
  informationOfficerName: '',
};

const LAST_REVISED = '10 November 2026';

const REGULATOR = {
  name: 'Information Regulator (South Africa)',
  address: 'Woodmead North Office Park, 54 Maxwell Drive, Woodmead, Johannesburg, 2191',
  phone: '010 023 5200',
  tollFree: '0800 017 160',
  enquiries: 'enquiries@inforegulator.org.za',
  complaints: 'POPIAComplaints@inforegulator.org.za',
  portal: 'https://eservices.inforegulator.org.za/complaints/default.aspx',
  site: 'https://inforegulator.org.za',
};

const LINK_CLASS = 'text-[#F43F5E] font-tech-mono hover:underline';

const Section: React.FC<{ index: string; title: string; children: React.ReactNode }> = ({
  index,
  title,
  children,
}) => (
  <section
    id={`s-${index}`}
    className="space-y-3 bg-[#121215] border border-[#26262E] rounded-2xl p-6 sm:p-8 scroll-mt-24"
  >
    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
      <span className="text-xs font-tech-mono text-[#F43F5E]">{index}.</span>
      <span>{title}</span>
    </h2>
    {children}
  </section>
);

const Bullets: React.FC<{ items: React.ReactNode[] }> = ({ items }) => (
  <ul className="list-disc list-outside space-y-1.5 text-neutral-400 pl-5 text-sm">
    {items.map((item, i) => (
      <li key={i}>{item}</li>
    ))}
  </ul>
);

const Strong: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <strong className="text-[#EDEBE4] font-semibold">{children}</strong>
);

/** The ways to reach the business that are actually configured: WhatsApp, phone, and email if set. */
const ContactChannels: React.FC = () => {
  const wa = whatsappLink();
  const tel = telLink();
  const parts: React.ReactNode[] = [];
  if (wa) {
    parts.push(
      <a key="wa" href={wa} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
        WhatsApp {SITE.phoneDisplay}
      </a>,
    );
  }
  if (tel) {
    parts.push(
      <a key="tel" href={tel} className={LINK_CLASS}>
        call {SITE.phoneDisplay}
      </a>,
    );
  }
  if (SITE.privacyEmail) {
    parts.push(
      <a key="mail" href={`mailto:${SITE.privacyEmail}`} className={LINK_CLASS}>
        email {SITE.privacyEmail}
      </a>,
    );
  }
  return (
    <>
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {i > 0 ? (i === parts.length - 1 ? ', or ' : ', ') : null}
          {part}
        </React.Fragment>
      ))}
    </>
  );
};

export const PrivacyPolicyPage: React.FC = () => {
  const { navigate } = useRouter();
  const requestLink = whatsappLink('Privacy request (access / correction / deletion / objection)');

  const toc: Array<[string, string]> = [
    ['01', 'Who we are'],
    ['02', 'What we collect and where it comes from'],
    ['03', 'Why we process it and on what basis'],
    ['04', 'Who we share it with'],
    ['05', 'Transfers outside South Africa'],
    ['06', 'Cookies and local storage'],
    ['07', 'How long we keep it'],
    ['08', 'How we protect it'],
    ['09', 'Your rights'],
    ['10', 'Contacting you'],
    ['11', 'Children'],
    ['12', 'Complaints to the Information Regulator'],
    ['13', 'Changes to this notice'],
  ];

  return (
    <div className="min-h-screen bg-[#111111] text-[#EDEBE4]">
      <BrandHeader forceLight={false} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-20 space-y-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-tech-mono text-neutral-400">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="hover:text-[#F43F5E] inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>HOME</span>
          </button>
          <span>/</span>
          <span className="text-[#F43F5E] font-semibold">PRIVACY NOTICE</span>
        </div>

        {/* Header */}
        <div className="space-y-4 border-b border-[#26262E] pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18181D] border border-[#1D4ED8]/40 text-[#F43F5E] text-xs font-tech-mono uppercase tracking-[0.16em]">
            <Lock className="w-3.5 h-3.5 text-[#F43F5E]" />
            <span>Protection of Personal Information Act 4 of 2013</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-normal tracking-[-0.03em] text-white">
            Privacy Notice.
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs font-tech-mono text-neutral-400">
            <span>LAST REVISED: {LAST_REVISED.toUpperCase()}</span>
            <span>·</span>
            <span>APPLIES TO THIS WEBSITE</span>
          </div>

          <p className="text-sm sm:text-base text-[#C2C2CC] leading-relaxed pt-2">
            This notice explains what personal information {RESPONSIBLE_PARTY.tradingName} (&quot;we&quot;,
            &quot;us&quot;) handles when you use this website or contact us, why, who else sees it, how
            long we keep it, and the rights you have under the Protection of Personal Information Act,
            2013 (POPIA). This website has no accounts and no sign-in. You contact us through the
            enquiry form on this website, on WhatsApp or by phone.
          </p>

          <nav aria-label="Contents" className="pt-4">
            <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs font-tech-mono text-neutral-400">
              {toc.map(([idx, label]) => (
                <li key={idx}>
                  <a href={`#s-${idx}`} className="hover:text-[#F43F5E] transition-colors">
                    <span className="text-[#F43F5E]">{idx}</span> · {label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <div className="space-y-10 text-sm leading-relaxed text-neutral-300">
          <Section index="01" title="Who we are">
            <p>
              The responsible party for personal information handled through this website is{' '}
              <Strong>{RESPONSIBLE_PARTY.tradingName}</Strong>
              {RESPONSIBLE_PARTY.registrationNumber
                ? ` (registration number ${RESPONSIBLE_PARTY.registrationNumber})`
                : ''}
              , a supplier of forged alloy wheels based in {RESPONSIBLE_PARTY.country}.
              {RESPONSIBLE_PARTY.physicalAddress ? ` Our address is ${RESPONSIBLE_PARTY.physicalAddress}.` : ''}
            </p>
            <p>
              Questions, access requests and complaints about personal information go to us here:{' '}
              <ContactChannels />.
              {RESPONSIBLE_PARTY.informationOfficerName
                ? ` Our Information Officer is ${RESPONSIBLE_PARTY.informationOfficerName}.`
                : ''}{' '}
              You can also use the button in section 09.
            </p>
          </Section>

          <Section index="02" title="What we collect and where it comes from">
            <p>
              We only receive personal information that you choose to send us, plus the technical
              information any website receives.
            </p>
            <Bullets
              items={[
                <>
                  <Strong>The enquiry form</Strong>: when you send an enquiry from this website we
                  receive your message, the wheel it is about, your phone number and, if you add them,
                  your name and email address, together with the page you sent it from and the time.
                  The form passes this to our automation service (see section 04), which records it,
                  emails it to us and, if you gave an email address, sends you a receipt with a
                  reference number. If you have WhatsApp, the form then opens WhatsApp with the same
                  message typed in; nothing is sent on WhatsApp until you press send there.
                </>,
                <>
                  <Strong>Messages and calls to us</Strong>: when you message us on WhatsApp or phone
                  us, we see your phone number, your WhatsApp profile name, and whatever you tell us,
                  such as your name, your car and the wheels you are asking about.
                </>,
                <>
                  <Strong>Technical information</Strong>: like every website, our hosting provider
                  (Render) may record your IP address, browser type and the pages requested in server
                  logs for security and capacity purposes. Page fonts are loaded from Google Fonts, which
                  receives your IP address and browser details when a page loads.
                </>,
              ]}
            />
            <p className="pt-1">
              We do not run accounts, sign-in or mailing lists, and we do not use advertising or
              analytics trackers. We do not collect special personal information (such as health,
              religious or biometric data) or information about children. No law requires you to
              contact us; if you choose not to, we simply cannot answer your question.
            </p>
          </Section>

          <Section index="03" title="Why we process it and on what basis">
            <Bullets
              items={[
                <>
                  <Strong>To respond to you and take steps towards a sale at your request</Strong>:
                  checking fitment for your vehicle, giving you a quotation, and following up on your
                  enquiry (POPIA s11(1)(b)).
                </>,
                <>
                  <Strong>To keep business records</Strong> that South African tax, company and consumer
                  protection law require us to keep, where an enquiry becomes a sale (s11(1)(c)).
                </>,
                <>
                  <Strong>To keep the website secure and prevent abuse</Strong>, which is in our
                  legitimate interest (s11(1)(f)).
                </>,
              ]}
            />
            <p className="pt-1">
              We do not use your information for automated decision-making that has legal or similarly
              significant effects on you, and we never sell personal information.
            </p>
          </Section>

          <Section index="04" title="Who we share it with">
            <p>We share personal information only with the recipients below, and only to the extent needed for the purposes in section 03.</p>
            <Bullets
              items={[
                <>
                  <Strong>Our automation service (n8n GmbH)</Strong>: receives each enquiry sent from
                  the form, keeps a log of enquiries for us, and sends the emails described in section
                  02 through <Strong>Google (Gmail)</Strong>. Both act on our instructions as operators
                  under POPIA.
                </>,
                <>
                  <Strong>WhatsApp (Meta Platforms)</Strong>: carries the messages you send us and
                  handles them under its own terms and privacy policy.
                </>,
                <>
                  <Strong>Our website providers</Strong>: Render hosts this website, and Google Fonts
                  supplies its typefaces (see section 02).
                </>,
                <>
                  <Strong>Professional advisers and authorities</Strong>: only where the law requires
                  it, or to establish, exercise or defend legal claims.
                </>,
              ]}
            />
          </Section>

          <Section index="05" title="Transfers outside South Africa">
            <p>
              Some of the providers in section 04, including Meta, Google, n8n and our hosting
              provider, store and process information on servers outside South Africa. Section 72 of POPIA allows
              this where the recipient is subject to a law, binding corporate rules or a binding
              agreement that provides substantially similar protection to POPIA, where the transfer is
              necessary to perform a contract with you or to take steps at your request before a
              contract, or where you consent. For messages you send us, the transfer is necessary to
              respond to your request.
            </p>
          </Section>

          <Section index="06" title="Cookies and local storage">
            <p>
              This website does not set cookies. We do not use advertising, analytics or third-party
              tracking cookies. The only thing kept in your browser&apos;s local storage is a copy of an
              enquiry that could not be sent to us, so that it is not lost; it stays on your device and
              is never read by us. When you open WhatsApp from this website, WhatsApp applies its own
              cookie and privacy practices.
            </p>
          </Section>

          <Section index="07" title="How long we keep it">
            <Bullets
              items={[
                <>
                  <Strong>Messages and enquiries</Strong>: for as long as needed to respond and follow
                  up, and then for up to five years from our last contact with you, so that we can honour
                  quotations and answer later questions about a specification.
                </>,
                <>
                  <Strong>Transaction records</Strong>: where an enquiry leads to a sale, invoices and
                  related records are kept for the periods required by South African tax and company law,
                  generally five to seven years.
                </>,
                <>
                  <Strong>Server logs</Strong>: retained by our hosting providers for their standard
                  security retention periods.
                </>,
              ]}
            />
          </Section>

          <Section index="08" title="How we protect it">
            <p>
              All traffic to this website is encrypted in transit. Access within our business is limited
              to the people who need it to respond to you. If a security compromise affects your
              personal information we will notify the Information Regulator and, where required, you, as
              section 22 of POPIA requires.
            </p>
          </Section>

          <Section index="09" title="Your rights">
            <p>Under POPIA you have the right to:</p>
            <Bullets
              items={[
                <>be told whether we hold personal information about you, and to receive a copy of it;</>,
                <>have inaccurate, incomplete or out-of-date information corrected, and to have information deleted or destroyed where we are no longer entitled to keep it;</>,
                <>object, on reasonable grounds, to processing based on our legitimate interests;</>,
                <>withdraw consent at any time where processing relies on it, without affecting what was done before;</>,
                <>object to direct marketing and to be removed from any list we message;</>,
                <>not be subject to a decision based solely on automated processing that significantly affects you;</>,
                <>complain to the Information Regulator (section 12).</>,
              ]}
            />
            <p className="pt-2">
              To exercise any of these rights, contact us using the details in section 01
              {requestLink ? ' or use the button below' : ''}. Requests under the Promotion of Access to
              Information Act may be made on the prescribed forms, which we will supply on request. We
              may ask you to confirm your identity before acting, and we will respond without undue delay
              and within the statutory periods. Access and correction requests are free unless the law
              allows a fee.
            </p>
            {requestLink ? (
              <div className="pt-3">
                <a
                  href={requestLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#18181D] border border-[#33333E] hover:border-[#1D4ED8] text-white hover:text-[#F43F5E] rounded-full px-5 py-2.5 text-xs font-tech-mono uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center gap-2"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#F43F5E]" />
                  <span>Send a privacy request on WhatsApp</span>
                </a>
              </div>
            ) : null}
          </Section>

          <Section index="10" title="Contacting you">
            <p>
              This website has no newsletter or mailing list. We message or call you only in reply to
              your own enquiry, or about a sale you have asked about. If you do not want us to contact
              you, tell us and we will stop. This follows section 69 of POPIA.
            </p>
          </Section>

          <Section index="11" title="Children">
            <p>
              This website is intended for adults. We do not knowingly collect personal information
              from anyone under 18. If you believe a child has sent us information, contact us using
              the details in section 01 and we will delete it.
            </p>
          </Section>

          <Section index="12" title="Complaints to the Information Regulator">
            <p>
              If you are not satisfied with how we have handled your personal information or your
              request, you have the right to lodge a complaint with the Information Regulator. The
              Regulator asks that complaints be submitted through its eServices portal.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
              <div className="p-4 bg-[#18181D] border border-[#26262E] rounded-xl space-y-2">
                <p className="font-tech-mono text-[#F43F5E] font-semibold uppercase">{REGULATOR.name}</p>
                <p className="flex items-start gap-2 text-neutral-400">
                  <MapPin className="w-3.5 h-3.5 text-[#F43F5E] shrink-0 mt-0.5" />
                  <span>{REGULATOR.address}</span>
                </p>
                <p className="flex items-start gap-2 text-neutral-400">
                  <Phone className="w-3.5 h-3.5 text-[#F43F5E] shrink-0 mt-0.5" />
                  <span>
                    {REGULATOR.phone} · toll free {REGULATOR.tollFree}
                  </span>
                </p>
              </div>
              <div className="p-4 bg-[#18181D] border border-[#26262E] rounded-xl space-y-2 font-tech-mono">
                <p>
                  <span className="text-neutral-500">Complaints: </span>
                  <a href={`mailto:${REGULATOR.complaints}`} className="text-[#F43F5E] hover:underline break-all">
                    {REGULATOR.complaints}
                  </a>
                </p>
                <p>
                  <span className="text-neutral-500">Enquiries: </span>
                  <a href={`mailto:${REGULATOR.enquiries}`} className="text-[#F43F5E] hover:underline break-all">
                    {REGULATOR.enquiries}
                  </a>
                </p>
                <p>
                  <span className="text-neutral-500">Portal: </span>
                  <a
                    href={REGULATOR.portal}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#F43F5E] hover:underline break-all"
                  >
                    eservices.inforegulator.org.za
                  </a>
                </p>
                <p>
                  <span className="text-neutral-500">Website: </span>
                  <a
                    href={REGULATOR.site}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#F43F5E] hover:underline break-all"
                  >
                    inforegulator.org.za
                  </a>
                </p>
              </div>
            </div>
          </Section>

          <Section index="13" title="Changes to this notice">
            <p>
              We will update this notice when our processing changes, and the revision date at the top
              will change with it.
            </p>
          </Section>
        </div>

        {/* Contact strip */}
        <div className="pt-8 border-t border-[#26262E] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-tech-mono text-neutral-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#F43F5E]" />
            <span>
              {RESPONSIBLE_PARTY.tradingName} · {RESPONSIBLE_PARTY.country}
              {SITE.phoneDisplay ? ` · ${SITE.phoneDisplay}` : ''}
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-[#F43F5E] hover:underline cursor-pointer"
          >
            ← Return to the showcase
          </button>
        </div>
      </main>
    </div>
  );
};
