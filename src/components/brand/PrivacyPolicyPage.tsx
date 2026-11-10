import React from 'react';
import { ArrowLeft, Lock, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { BrandHeader } from './BrandHeader';
import { useRouter } from '../../utils/router';
import { useForgedStore } from '../../store/useForgedStore';
import { SITE } from '../../config/site';

/**
 * Responsible-party details published in the notice (POPIA s18(1)(b)).
 * Fill in the registration number, physical address and Information Officer
 * name once confirmed; empty strings are simply not rendered.
 */
const RESPONSIBLE_PARTY = {
  tradingName: SITE.name,
  registrationNumber: '',
  physicalAddress: SITE.addressLine,
  country: SITE.country,
  informationOfficerName: '',
  privacyEmail: SITE.privacyEmail,
};

const LAST_REVISED = '9 November 2026';

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
      <span className="text-xs font-tech-mono text-[#FF5500]">{index}.</span>
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
  <strong className="text-[#F5F5F7] font-semibold">{children}</strong>
);

export const PrivacyPolicyPage: React.FC = () => {
  const { navigate } = useRouter();
  const { openEnquiryModal } = useForgedStore();

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
    ['10', 'Direct marketing'],
    ['11', 'Children'],
    ['12', 'Complaints to the Information Regulator'],
    ['13', 'Changes to this notice'],
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F7]">
      <BrandHeader forceLight={false} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-20 space-y-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-tech-mono text-neutral-400">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="hover:text-[#FF5500] inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>HOME</span>
          </button>
          <span>/</span>
          <span className="text-[#FF5500] font-semibold">PRIVACY NOTICE</span>
        </div>

        {/* Header */}
        <div className="space-y-4 border-b border-[#26262E] pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18181D] border border-[#FF5500]/40 text-[#FF5500] text-xs font-tech-mono uppercase tracking-[0.16em]">
            <Lock className="w-3.5 h-3.5 text-[#FF5500]" />
            <span>Protection of Personal Information Act 4 of 2013</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-normal tracking-[-0.03em] text-white">
            Privacy Notice.
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs font-tech-mono text-neutral-400">
            <span>LAST REVISED: {LAST_REVISED.toUpperCase()}</span>
            <span>·</span>
            <span>APPLIES TO FORGEDCUSTOMWHEELS WEBSITE, STORE AND CLIENT ACCOUNTS</span>
          </div>

          <p className="text-sm sm:text-base text-[#C2C2CC] leading-relaxed pt-2">
            This notice explains what personal information {RESPONSIBLE_PARTY.tradingName} (&quot;we&quot;,
            &quot;us&quot;) collects when you use this website, why we collect it, who we share it with,
            how long we keep it, and the rights you have under the Protection of Personal Information
            Act, 2013 (POPIA). It is written to meet the disclosure requirements of section 18 of POPIA.
            Please read it before submitting an enquiry, applying as a dealer or creating an account.
          </p>

          <nav aria-label="Contents" className="pt-4">
            <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs font-tech-mono text-neutral-400">
              {toc.map(([idx, label]) => (
                <li key={idx}>
                  <a href={`#s-${idx}`} className="hover:text-[#FF5500] transition-colors">
                    <span className="text-[#FF5500]">{idx}</span> · {label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <div className="space-y-10 text-sm leading-relaxed text-neutral-300">
          <Section index="01" title="Who we are">
            <p>
              The responsible party for personal information processed through this website is{' '}
              <Strong>{RESPONSIBLE_PARTY.tradingName}</Strong>
              {RESPONSIBLE_PARTY.registrationNumber
                ? ` (registration number ${RESPONSIBLE_PARTY.registrationNumber})`
                : ''}
              , a supplier of forged alloy wheels based in {RESPONSIBLE_PARTY.country}.
              {RESPONSIBLE_PARTY.physicalAddress ? ` Our address is ${RESPONSIBLE_PARTY.physicalAddress}.` : ''}
            </p>
            <p>
              Questions, access requests and complaints about personal information go to our
              Information Officer
              {RESPONSIBLE_PARTY.informationOfficerName ? `, ${RESPONSIBLE_PARTY.informationOfficerName},` : ''}{' '}
              at{' '}
              <a
                href={`mailto:${RESPONSIBLE_PARTY.privacyEmail}`}
                className="text-[#FF5500] font-tech-mono hover:underline"
              >
                {RESPONSIBLE_PARTY.privacyEmail}
              </a>
              . You can also use the request button in section 09.
            </p>
          </Section>

          <Section index="02" title="What we collect and where it comes from">
            <p>We only collect personal information that you give us directly, or that Google passes to us when you choose to sign in with your Google account.</p>
            <Bullets
              items={[
                <>
                  <Strong>Interest requests and specification enquiries</Strong> (the &quot;State your
                  interest&quot; form): your full name, email address, telephone or WhatsApp number,
                  vehicle model and year, the wheel, part number and finish you were viewing, your
                  preferred finish and build timeline, and any notes you add. Name, email and telephone
                  are required so that we can respond; the rest is voluntary.
                </>,
                <>
                  <Strong>Dealer and trade applications</Strong>: company and trading name, country and
                  city, website, the primary contact&apos;s name, role, email and telephone, VAT number,
                  facility type, expected monthly volume, workshop capabilities and notes. Company name,
                  city, contact name, email and telephone are required to assess an application.
                </>,
                <>
                  <Strong>Client accounts and the Garage</Strong>: when you sign in with Google we
                  receive your Google account identifier, display name, email address and whether that
                  email is verified. You may then save a profile (city, primary vehicle make, model,
                  year and chassis code, exterior paint, brake system, preferred wheel finish) and one or
                  more garage vehicles with the same fields plus your own notes.
                </>,
                <>
                  <Strong>Newsletter</Strong>: your email address, if you subscribe to allocation alerts.
                </>,
                <>
                  <Strong>Technical information</Strong>: like every website, our hosting and
                  authentication providers record the IP address, browser type and pages requested in
                  server logs for security and capacity purposes. We do not run advertising or analytics
                  trackers.
                </>,
                <>
                  <Strong>Preferences stored on your device</Strong>: a copy of enquiries you have
                  submitted, and wheels previewed in the admin tool, are kept in your browser&apos;s
                  local storage (see section 06). These stay on your device
                  and are not transmitted to us by that mechanism.
                </>,
              ]}
            />
            <p className="pt-1">
              We do not collect special personal information (such as health, religious or biometric
              data) or information about children. No law requires you to provide information to us;
              if you choose not to, we may be unable to respond to your enquiry, assess your application
              or offer you an account.
            </p>
          </Section>

          <Section index="03" title="Why we process it and on what basis">
            <Bullets
              items={[
                <>
                  <Strong>To respond to you and take steps towards a sale at your request</Strong>:
                  verifying fitment for your vehicle, preparing a specification and quotation, arranging
                  a consultation, and following up on your enquiry (POPIA s11(1)(b) and (d)).
                </>,
                <>
                  <Strong>To assess and manage dealer and trade relationships</Strong>, including
                  verifying business and VAT details (s11(1)(b), (c) and (f)).
                </>,
                <>
                  <Strong>To provide your account and Garage</Strong>, which exist only because you asked
                  us to create them; you can delete them at any time (s11(1)(a) and (b)).
                </>,
                <>
                  <Strong>To send allocation alerts and news</Strong> where you have subscribed (s11(1)(a);
                  see section 10).
                </>,
                <>
                  <Strong>To keep the website secure, prevent abuse and keep business records</Strong>{' '}
                  that South African tax, company and consumer protection law require us to keep
                  (s11(1)(c) and (f)).
                </>,
              ]}
            />
            <p className="pt-1">
              We do not use your information for automated decision-making that has legal or similarly
              significant effects on you, and we never sell personal information.
            </p>
          </Section>

          <Section index="04" title="Who we share it with">
            <p>We share personal information only with the categories of recipients below, and only to the extent needed for the purposes in section 03.</p>
            <Bullets
              items={[
                <>
                  <Strong>Our infrastructure providers</Strong>: this website, client accounts and the
                  Garage run on Google LLC services (Firebase Authentication, Cloud Firestore and Google
                  hosting). Page fonts are loaded from Google Fonts, which receives your IP address when
                  the page loads. Google acts as our operator under its data processing terms.
                </>,
                <>
                  <Strong>The business tools we use to receive and act on enquiries</Strong>: when you
                  submit an interest request, dealer application or newsletter sign-up, the details may
                  be routed to the systems our team works in, which may include our email provider, our
                  WhatsApp Business account (operated by Meta Platforms), our customer relationship
                  management system, a spreadsheet and the workflow automation service that connects them.
                  Each acts on our instructions.
                </>,
                <>
                  <Strong>Fitment and installation partners</Strong>: if you ask us to arrange fitment at
                  a partner workshop, we share the contact and vehicle details needed to book it, and
                  only after confirming that with you.
                </>,
                <>
                  <Strong>Professional advisers and authorities</Strong>: our accountants, lawyers and
                  insurers where necessary, and public bodies where the law requires it or to establish,
                  exercise or defend legal claims.
                </>,
              ]}
            />
          </Section>

          <Section index="05" title="Transfers outside South Africa">
            <p>
              Some of the providers in section 04, including Google and Meta, store and process
              information on servers outside South Africa, for example in the United States or the
              European Union. Section 72 of POPIA allows this where the recipient is subject to a law,
              binding corporate rules or a binding agreement that provides substantially similar
              protection to POPIA, where the transfer is necessary to perform a contract with you or to
              take steps at your request before a contract, or where you consent. We rely on our
              providers&apos; binding data processing terms and, for enquiries you send us, on the
              transfer being necessary to respond to your request.
            </p>
          </Section>

          <Section index="06" title="Cookies and local storage">
            <p>
              We do not use advertising, analytics or third-party tracking cookies. The website uses
              the following strictly necessary storage in your browser:
            </p>
            <Bullets
              items={[
                <>
                  <Strong>Local storage</Strong>: admin preview wheels and a record of enquiries you
                  have submitted, so that they survive a page reload.
                  This data never leaves your device through this mechanism.
                </>,
                <>
                  <Strong>Authentication session</Strong>: when you sign in with Google, Firebase
                  Authentication stores a session token in your browser so you stay signed in.
                </>,
              ]}
            />
            <p className="pt-1">
              You can clear this storage at any time through your browser settings. Doing so signs you
              out and resets your saved preferences, but does not delete any account or Garage you
              created earlier. To have those deleted, write to us at the privacy address in section 09.
            </p>
          </Section>

          <Section index="07" title="How long we keep it">
            <Bullets
              items={[
                <>
                  <Strong>Enquiries and dealer applications</Strong>: for as long as needed to respond
                  and follow up, and then for up to five years from our last contact with you, so that
                  we can honour quotations and answer later questions about a specification.
                </>,
                <>
                  <Strong>Transaction records</Strong>: where an enquiry leads to a sale, invoices and
                  related records are kept for the periods required by South African tax and company law,
                  generally five to seven years.
                </>,
                <>
                  <Strong>Accounts and the Garage</Strong>: until you delete them. We may delete accounts
                  that have been inactive for 24 months after notifying the email address on the account.
                </>,
                <>
                  <Strong>Newsletter</Strong>: until you unsubscribe.
                </>,
                <>
                  <Strong>Server logs</Strong>: retained by our hosting providers for their standard
                  security retention periods, typically no longer than 12 months.
                </>,
              ]}
            />
          </Section>

          <Section index="08" title="How we protect it">
            <p>
              All traffic to this website is encrypted in transit. Account and Garage data in Cloud
              Firestore is protected by security rules that allow each record to be read or changed only
              by the signed-in account that owns it, and only with a verified email address; nobody can
              list other clients&apos; records. Access within our business is limited to the people who
              need it to respond to you. If a security compromise affects your personal information we
              will notify the Information Regulator and, where required, you, as section 22 of POPIA
              requires.
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
                <>object to direct marketing and to be removed from our mailing list;</>,
                <>not be subject to a decision based solely on automated processing that significantly affects you;</>,
                <>complain to the Information Regulator (section 12).</>,
              ]}
            />
            <p className="pt-2">
              To exercise any of these rights, email our Information Officer at{' '}
              <a
                href={`mailto:${RESPONSIBLE_PARTY.privacyEmail}`}
                className="text-[#FF5500] font-tech-mono hover:underline"
              >
                {RESPONSIBLE_PARTY.privacyEmail}
              </a>{' '}
              or use the button below. Requests under the Promotion of Access to Information Act may be
              made on the prescribed forms, which we will supply on request. We may ask you to confirm
              your identity before acting, and we will respond without undue delay and within the
              statutory periods. Access and correction requests are free unless the law allows a fee.
            </p>
            <div className="pt-3">
              <button
                type="button"
                onClick={() =>
                  openEnquiryModal({
                    subject: 'POPIA data subject request (access / correction / deletion / objection)',
                    domain: 'brand',
                  })
                }
                className="bg-[#18181D] border border-[#33333E] hover:border-[#FF5500] text-white hover:text-[#FF5500] rounded-full px-5 py-2.5 text-xs font-tech-mono uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                <Mail className="w-3.5 h-3.5 text-[#FF5500]" />
                <span>Submit a data subject request</span>
              </button>
            </div>
          </Section>

          <Section index="10" title="Direct marketing">
            <p>
              We send marketing by electronic means only where you have opted in (for example by
              subscribing to allocation alerts), or where you are an existing customer and the message
              concerns similar products, in which case you were given the chance to opt out when we
              collected your details. Every marketing message includes a way to unsubscribe, and we act
              on it promptly. This follows section 69 of POPIA.
            </p>
          </Section>

          <Section index="11" title="Children">
            <p>
              This website is intended for adults. We do not knowingly collect personal information
              from anyone under 18. If you believe a child has provided information to us, contact the
              Information Officer and we will delete it.
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
                <p className="font-tech-mono text-[#FF5500] font-semibold uppercase">{REGULATOR.name}</p>
                <p className="flex items-start gap-2 text-neutral-400">
                  <MapPin className="w-3.5 h-3.5 text-[#FF5500] shrink-0 mt-0.5" />
                  <span>{REGULATOR.address}</span>
                </p>
                <p className="flex items-start gap-2 text-neutral-400">
                  <Phone className="w-3.5 h-3.5 text-[#FF5500] shrink-0 mt-0.5" />
                  <span>
                    {REGULATOR.phone} · toll free {REGULATOR.tollFree}
                  </span>
                </p>
              </div>
              <div className="p-4 bg-[#18181D] border border-[#26262E] rounded-xl space-y-2 font-tech-mono">
                <p>
                  <span className="text-neutral-500">Complaints: </span>
                  <a href={`mailto:${REGULATOR.complaints}`} className="text-[#FF5500] hover:underline break-all">
                    {REGULATOR.complaints}
                  </a>
                </p>
                <p>
                  <span className="text-neutral-500">Enquiries: </span>
                  <a href={`mailto:${REGULATOR.enquiries}`} className="text-[#FF5500] hover:underline break-all">
                    {REGULATOR.enquiries}
                  </a>
                </p>
                <p>
                  <span className="text-neutral-500">Portal: </span>
                  <a
                    href={REGULATOR.portal}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#FF5500] hover:underline break-all"
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
                    className="text-[#FF5500] hover:underline break-all"
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
              will change with it. If a change materially affects account holders, we will also notify
              the email address on the account before it takes effect.
            </p>
          </Section>
        </div>

        {/* Contact strip */}
        <div className="pt-8 border-t border-[#26262E] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-tech-mono text-neutral-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#FF5500]" />
            <span>
              {RESPONSIBLE_PARTY.tradingName} · {RESPONSIBLE_PARTY.country} · Information Officer:{' '}
              {RESPONSIBLE_PARTY.privacyEmail}
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-[#FF5500] hover:underline cursor-pointer"
          >
            ← Return to the showcase
          </button>
        </div>
      </main>
    </div>
  );
};
