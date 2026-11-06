import React from 'react';
import { ShieldCheck, Lock, FileText, ArrowLeft, Mail, MapPin } from 'lucide-react';
import { BrandHeader } from './BrandHeader';
import { StackedCircularFooter } from '@/components/ui/stacked-circular-footer';
import { useRouter } from '../../utils/router';
import { useKahnStore } from '../../store/useKahnStore';

export const PrivacyPolicyPage: React.FC = () => {
  const { navigate } = useRouter();
  const { openEnquiryModal } = useKahnStore();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F7] flex flex-col justify-between">
      <BrandHeader forceLight={false} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-20 space-y-12 flex-1">
        {/* Navigation Breadcrumb */}
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
          <span className="text-[#FF5500] font-semibold">PRIVACY POLICY</span>
        </div>

        {/* Page Header */}
        <div className="space-y-4 border-b border-[#26262E] pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18181D] border border-[#FF5500]/40 text-[#FF5500] text-xs font-tech-mono uppercase tracking-[0.16em]">
            <Lock className="w-3.5 h-3.5 text-[#FF5500]" />
            <span>DATA GOVERNANCE &amp; PRIVACY COMPLIANCE</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-normal tracking-[-0.03em] text-white">
            Privacy Policy.
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs font-tech-mono text-neutral-400">
            <span>LAST REVISED: OCTOBER 2026</span>
            <span>·</span>
            <span>UK GDPR &amp; SOUTH AFRICA POPIA COMPLIANT</span>
          </div>

          <p className="text-sm sm:text-base text-[#C2C2CC] leading-relaxed pt-2">
            FORGED Custom wheels (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is committed to protecting the privacy and personal telemetry of our clients, dealers, and automotive enthusiasts worldwide. This Privacy Policy outlines our transparent data handling principles across our digital showcase, technical fitment engine, and boutique e-commerce platform.
          </p>
        </div>

        {/* Policy Sections */}
        <div className="space-y-10 text-sm leading-relaxed text-neutral-300">
          {/* Section 1 */}
          <section className="space-y-3 bg-[#121215] border border-[#26262E] rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <span className="text-xs font-tech-mono text-[#FF5500]">01.</span>
              <span>Information We Collect</span>
            </h2>
            <p>
              We collect information to engineer bespoke forged wheel sets, verify vehicle brake and suspension clearances, and deliver tailored automotive consultations:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-neutral-400 pl-2 font-tech-mono text-xs">
              <li><strong className="text-[#F5F5F7]">Client &amp; Contact Telemetry:</strong> Name, business title, email address, telephone contact, and shipping/billing destinations.</li>
              <li><strong className="text-[#F5F5F7]">Automotive Technical Specifications:</strong> Vehicle marque (BMW only), model, chassis generation (e.g. G80, G82, G87, G90), PCD bolt circle, wheel offset preferences, and aftermarket suspension configurations.</li>
              <li><strong className="text-[#F5F5F7]">Trade Dealer Applications:</strong> Corporate registrations, VAT/Tax identification, workshop ramp capacities, and monthly allocation tiers submitted via our Dealer Application portal.</li>
              <li><strong className="text-[#F5F5F7]">Session Preferences:</strong> Saved vehicle selections, wishlist and reserve bag allocations stored locally on your device. All prices are shown in South African Rand (ZAR).</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3 bg-[#121215] border border-[#26262E] rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <span className="text-xs font-tech-mono text-[#FF5500]">02.</span>
              <span>How We Use Your Data</span>
            </h2>
            <p>
              Your telemetry is processed strictly for legitimate engineering and commercial purposes:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-neutral-400 pl-2 font-tech-mono text-xs">
              <li>Fabricating bespoke 6061-T6 forged wheel sets according to validated hub-centric clearances.</li>
              <li>Dispatching allocation confirmation dossiers and scheduling direct showroom consultations in our Bradford, Mayfair, Leeds, and Midlands ateliers.</li>
              <li>Facilitating international express logistics with duty and homologation documentation for South Africa (Johannesburg, Cape Town, Durban) and Europe.</li>
              <li>Maintaining vehicle fitment compatibility and preventing unsprung clearance interference.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3 bg-[#121215] border border-[#26262E] rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <span className="text-xs font-tech-mono text-[#FF5500]">03.</span>
              <span>Regulatory Compliance &amp; International Standards</span>
            </h2>
            <p>
              We operate in full compliance with applicable statutory privacy regimes:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-[#18181D] border border-[#26262E] rounded-xl space-y-1">
                <p className="text-xs font-tech-mono text-[#FF5500] font-semibold">UNITED KINGDOM &amp; EU GDPR</p>
                <p className="text-xs text-neutral-400">
                  Data processed under the UK Data Protection Act 2018 and Regulation (EU) 2016/679.
                </p>
              </div>
              <div className="p-4 bg-[#18181D] border border-[#26262E] rounded-xl space-y-1">
                <p className="text-xs font-tech-mono text-[#FF5500] font-semibold">SOUTH AFRICA POPIA</p>
                <p className="text-xs text-neutral-400">
                  Protected under the Protection of Personal Information Act No. 4 of 2013 for all southern African builds.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3 bg-[#121215] border border-[#26262E] rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <span className="text-xs font-tech-mono text-[#FF5500]">04.</span>
              <span>Cookies &amp; Local Storage</span>
            </h2>
            <p>
              We use strictly necessary client-side storage technologies (<code className="text-[#FF5500]">localStorage</code>) to preserve your vehicle fitment search, active currency, custom custom wheels, and reserve allocation bag items across page reloads without third-party advertising trackers.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 bg-[#121215] border border-[#26262E] rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <span className="text-xs font-tech-mono text-[#FF5500]">05.</span>
              <span>Your Rights &amp; Data Deletion</span>
            </h2>
            <p>
              Under UK GDPR and POPIA, you have the right to request access to the personal data we hold about you, request rectification of inaccurate records, or request complete erasure of your consultation history.
            </p>
            <p className="pt-2">
              To exercise any of these rights, contact our Data Governance Officer at <span className="text-[#FF5500] font-tech-mono">privacy@forgedcustomwheels.com</span> or submit an inquiry using the link below.
            </p>
            <div className="pt-3">
              <button
                type="button"
                onClick={() =>
                  openEnquiryModal({
                    subject: 'Data Protection & Privacy Request',
                    domain: 'brand',
                  })
                }
                className="bg-[#18181D] border border-[#33333E] hover:border-[#FF5500] text-white hover:text-[#FF5500] rounded-full px-5 py-2.5 text-xs font-tech-mono uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                <Mail className="w-3.5 h-3.5 text-[#FF5500]" />
                <span>Submit Data Rights Request</span>
              </button>
            </div>
          </section>
        </div>

        {/* Contact Strip */}
        <div className="pt-8 border-t border-[#26262E] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-tech-mono text-neutral-400">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#FF5500]" />
            <span>FORGED Custom wheels · 240 Canal Road, Bradford, BD1 4SX, UK</span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-[#FF5500] hover:underline cursor-pointer"
          >
            ← Return to Editorial Showcase
          </button>
        </div>
      </main>

      <StackedCircularFooter onNavigate={navigate} useBrandLinks={true} />
    </div>
  );
};
