import React, { useState } from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  Building2,
  Globe,
  Wrench,
  ArrowUpRight,
  ArrowRight,
} from 'lucide-react';
import { BrandHeader } from './BrandHeader';
import { useRouter } from '../../utils/router';

interface DealerApplicationSubmission {
  referenceId: string;
  companyName: string;
  tradingName: string;
  country: string;
  city: string;
  website: string;
  contactName: string;
  contactRole: string;
  email: string;
  phone: string;
  vatNumber: string;
  facilityType: string;
  monthlyVolume: string;
  capabilities: string[];
  notes: string;
  submittedAt: string;
}

const CAPABILITY_OPTIONS = [
  'Touchless Center-Lock & Forged Wheel Mounting',
  'In-House 4-Wheel Laser Geometry & Corner Weighting',
  'BMW M Carbon-Ceramic Brake & Hub Service',
  'Dedicated Client Lounge & Wheel Display Wall',
  'Insured International Customs & Export Handling',
  'TÜV / JWL Homologation Inspection Desk',
];

export const DealerApplicationPage: React.FC = () => {
  const { navigate } = useRouter();

  const [companyName, setCompanyName] = useState('');
  const [tradingName, setTradingName] = useState('');
  const [country, setCountry] = useState('United Kingdom');
  const [city, setCity] = useState('');
  const [website, setWebsite] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactRole, setContactRole] = useState('Principal / Managing Director');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [facilityType, setFacilityType] = useState('Authorized BMW M Performance Specialist');
  const [monthlyVolume, setMonthlyVolume] = useState('4–8 Forged Sets / Month');
  const [capabilities, setCapabilities] = useState<string[]>([
    'Touchless Center-Lock & Forged Wheel Mounting',
    'In-House 4-Wheel Laser Geometry & Corner Weighting',
  ]);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submission, setSubmission] = useState<DealerApplicationSubmission | null>(null);

  const toggleCapability = (cap: string) => {
    setCapabilities((prev) =>
      prev.includes(cap) ? prev.filter((item) => item !== cap) : [...prev, cap]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !contactName.trim() || !email.includes('@') || !phone.trim() || !city.trim()) {
      setFormError(
        'Please complete all required trade fields: Company Name, City, Primary Contact Name, valid Email, and Direct Telephone.'
      );
      return;
    }

    setFormError(null);
    const referenceId = `FORGED-DLR-${Math.floor(100000 + Math.random() * 900000)}`;
    setSubmission({
      referenceId,
      companyName: companyName.trim(),
      tradingName: tradingName.trim() || companyName.trim(),
      country: country.trim(),
      city: city.trim(),
      website: website.trim() || 'Not specified',
      contactName: contactName.trim(),
      contactRole: contactRole.trim(),
      email: email.trim(),
      phone: phone.trim(),
      vatNumber: vatNumber.trim() || 'Pending verification',
      facilityType,
      monthlyVolume,
      capabilities,
      notes: notes.trim(),
      submittedAt: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F7]">
      <BrandHeader forceLight={false} />

      {/* Dark Architectural Editorial Hero */}
      <section className="bg-[#0A0A0A] text-[#F5F5F7] border-b border-[#26262E] px-6 md:px-10 py-16 md:py-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-2 text-xs font-tech-mono uppercase tracking-[0.18em] text-[#FF5500]">
              <span>FORGED CUSTOM WHEELS</span>
              <span>·</span>
              <span>GLOBAL TRADE NETWORK · ONYX ATELIER</span>
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-light tracking-[-0.03em] leading-[0.98] text-white">
              Dealer <span className="font-editorial-serif italic font-normal text-[#FF5500]">Application</span>.
            </h1>
            <p className="text-base sm:text-lg text-neutral-300 max-w-2xl leading-relaxed pt-2">
              Join our curated international network of BMW M performance ateliers, coachbuilders, and luxury showrooms. Accredited partners receive priority Bradford &amp; Coventry forged wheel allocations, trade margin tiers, and direct engineering support.
            </p>
          </div>

          <div className="lg:col-span-4 lg:text-right space-y-2 border-t lg:border-t-0 border-[#26262E] pt-6 lg:pt-0">
            <p className="text-xs font-tech-mono uppercase tracking-[0.15em] text-neutral-400">
              TRADE ACCREDITATION DESK
            </p>
            <p className="text-sm font-tech-mono text-white">
              240 CANAL ROAD · BRADFORD · BD1 4SX · UK
            </p>
            <p className="text-xs font-tech-mono text-[#FF5500] font-semibold">
              DIRECT B2B DISPATCH · TÜV HOMOLOGATED
            </p>
          </div>
        </div>
      </section>

      {/* 3-Pillar Trade Partner Benefits */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-12 border-b border-[#26262E]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#121215] rounded-3xl p-7 border border-[#26262E] flex flex-col justify-between space-y-4 text-[#F5F5F7]">
            <div className="w-10 h-10 rounded-full bg-[#FF5500] text-white flex items-center justify-center shadow-[0_0_15px_rgba(255,85,0,0.35)]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-tech-mono uppercase tracking-[0.15em] text-[#FF5500]">
                01 / TERRITORY &amp; MARGIN PROTECTION
              </p>
              <h2 className="text-xl font-semibold tracking-tight text-white">
                Structured Trade Tiers
              </h2>
              <p className="text-sm text-[#C2C2CC] leading-relaxed">
                Access tiered B2B trade pricing on all 20&quot;–23&quot; forged BMW M wheel packages (Type 52, LD RS, RS 3.0, G06 Aero, and Vengeance) with regional stockist protection.
              </p>
            </div>
          </div>

          <div className="bg-[#121215] rounded-3xl p-7 border border-[#26262E] flex flex-col justify-between space-y-4 text-[#F5F5F7]">
            <div className="w-10 h-10 rounded-full bg-[#FF5500] text-white flex items-center justify-center shadow-[0_0_15px_rgba(255,85,0,0.35)]">
              <Wrench className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-tech-mono uppercase tracking-[0.15em] text-[#FF5500]">
                02 / DIRECT BMW HUB-CENTRIC CAD DATA
              </p>
              <h2 className="text-xl font-semibold tracking-tight text-white">
                Engineering &amp; TÜV Dossiers
              </h2>
              <p className="text-sm text-[#C2C2CC] leading-relaxed">
                Every trade shipment includes German TÜV / JWL load certification documents, exact 5x112 / 66.6mm bore tolerances, and M Carbon Ceramic brake clearance schematics.
              </p>
            </div>
          </div>

          <div className="bg-[#121215] rounded-3xl p-7 border border-[#26262E] flex flex-col justify-between space-y-4 text-[#F5F5F7]">
            <div className="w-10 h-10 rounded-full bg-[#FF5500] text-white flex items-center justify-center shadow-[0_0_15px_rgba(255,85,0,0.35)]">
              <Globe className="w-5 h-5" />
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-tech-mono uppercase tracking-[0.15em] text-[#FF5500]">
                03 / SHOWROOM DISPLAY MONOLITH
              </p>
              <h2 className="text-xl font-semibold tracking-tight text-white">
                Point-of-Sale &amp; Priority Air Freight
              </h2>
              <p className="text-sm text-[#C2C2CC] leading-relaxed">
                Qualifying showrooms receive the bespoke FORGED Custom wheels brushed-aluminium 4-wheel display monolith, finish swatch cases, and 48-hour DHL Express global dispatch.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Application Section */}
      <main className="max-w-7xl mx-auto px-6 md:px-10 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Accreditation Requirements & Direct Trade Desk */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#121215] text-[#F5F5F7] rounded-3xl p-7 space-y-5 border border-[#26262E]">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-[#FF5500]" />
                <span className="text-xs font-tech-mono uppercase tracking-[0.18em] text-[#FF5500]">
                  ACCREDITATION CRITERIA
                </span>
              </div>

              <h3 className="text-2xl font-normal tracking-tight text-white">
                What We Look For in a Partner.
              </h3>

              <ul className="space-y-3 text-sm text-[#C2C2CC] border-t border-[#26262E] pt-4">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#FF5500] font-tech-mono text-xs mt-0.5">01</span>
                  <span>Established physical showroom or specialist BMW M workshop facility.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#FF5500] font-tech-mono text-xs mt-0.5">02</span>
                  <span>Touchless leverless tyre mounting and road-force balancing equipment rated up to 23&quot;.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#FF5500] font-tech-mono text-xs mt-0.5">03</span>
                  <span>Proven track record servicing G80 M3, G82 M4, G87 M2, or G90 M5 clientele.</span>
                </li>
              </ul>

              <div className="pt-4 border-t border-[#26262E] space-y-2">
                <p className="text-[11px] font-tech-mono uppercase tracking-[0.14em] text-neutral-400">
                  B2B TRADE CONCIERGE
                </p>
                <p className="text-sm font-tech-mono text-white">trade@forgedcustomwheels.co.uk</p>
                <p className="text-xs font-tech-mono text-neutral-400">+44 (0) 1274 749 999</p>
              </div>
            </div>

            <div className="p-6 rounded-3xl border border-[#26262E] bg-[#121215] space-y-3 text-[#F5F5F7]">
              <p className="text-xs font-tech-mono uppercase tracking-[0.14em] text-[#FF5500]">
                CLIENT GALLERY &amp; FITMENTS
              </p>
              <p className="text-sm text-[#C2C2CC] leading-relaxed">
                Explore how our authorized partners present FORGED Custom wheels BMW commissions in our 4x4 Client Fitments archive.
              </p>
              <button
                type="button"
                onClick={() => navigate('/client-fitments')}
                className="inline-flex items-center gap-2 text-xs font-tech-mono font-bold uppercase tracking-wider text-[#FF5500] hover:underline underline-offset-4 cursor-pointer"
              >
                <span>VIEW CLIENT FITMENTS BENTO GALLERY</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column: Interactive Dealer Application Form */}
          <div className="lg:col-span-8">
            {submission ? (
              <div
                data-testid="dealer-application-success"
                className="bg-[#121215] border border-[#26262E] rounded-3xl p-8 sm:p-10 space-y-6 text-[#F5F5F7]"
              >
                <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#26262E] pb-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-10 h-10 text-[#25D366] shrink-0" />
                    <div>
                      <p className="text-xs font-tech-mono uppercase tracking-[0.16em] text-[#25D366] font-bold">
                        APPLICATION DOSSIER REGISTERED
                      </p>
                      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                        Reference: {submission.referenceId}
                      </h2>
                    </div>
                  </div>
                  <span className="px-3.5 py-1.5 bg-[#FF5500] text-white text-xs font-tech-mono uppercase tracking-wider rounded-full font-bold">
                    STATUS: UNDER B2B REVIEW
                  </span>
                </div>

                <p className="text-sm sm:text-base text-[#C2C2CC] leading-relaxed">
                  Thank you, <span className="font-semibold text-white">{submission.contactName}</span>. Your trade application for{' '}
                  <span className="font-semibold text-white">{submission.companyName}</span> ({submission.city}, {submission.country}) has been routed to the FORGED Custom wheels Global Trade Director in Bradford. You will receive your trade account onboarding pack and wholesale price schedule within 24 business hours.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#18181D] p-5 rounded-2xl border border-[#26262E] text-xs font-tech-mono">
                  <div>
                    <span className="text-neutral-400 block">DEALERSHIP / ENTITY</span>
                    <span className="font-bold text-white uppercase">{submission.companyName}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">LOCATION</span>
                    <span className="font-bold text-white uppercase">
                      {submission.city}, {submission.country}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">FACILITY CLASSIFICATION</span>
                    <span className="font-bold text-white uppercase">{submission.facilityType}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">PROJECTED ALLOCATION</span>
                    <span className="font-bold text-[#FF5500] uppercase">{submission.monthlyVolume}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => navigate('/store')}
                    className="bg-[#FF5500] text-white rounded-full px-6 py-3.5 text-xs font-tech-mono font-bold uppercase tracking-[0.16em] hover:bg-[#FF6B1A] shadow-[0_0_15px_rgba(255,85,0,0.3)] inline-flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <span>EXPLORE BMW STOREFRONT</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubmission(null)}
                    className="border border-[#33333E] text-[#F5F5F7] rounded-full px-6 py-3.5 text-xs font-tech-mono font-bold uppercase tracking-[0.16em] hover:border-[#FF5500] hover:text-[#FF5500] cursor-pointer transition-colors"
                  >
                    SUBMIT ANOTHER LOCATION
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                data-testid="dealer-application-form"
                className="bg-[#121215] border border-[#26262E] rounded-3xl p-6 sm:p-10 space-y-8 text-[#F5F5F7]"
              >
                <div className="border-b border-[#26262E] pb-5">
                  <p className="text-xs font-tech-mono uppercase tracking-[0.18em] text-[#FF5500]">
                    OFFICIAL B2B TRADE ONBOARDING FORM
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-normal tracking-tight mt-1 text-white">
                    Dealership &amp; Workshop Dossier
                  </h2>
                </div>

                {/* Section 1: Corporate Identity */}
                <div className="space-y-4">
                  <h3 className="text-xs font-tech-mono font-bold uppercase tracking-[0.16em] text-[#FF5500]">
                    01 / CORPORATE &amp; SHOWROOM IDENTITY
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="dealer-company"
                        className="block text-[11px] font-tech-mono uppercase tracking-wider text-neutral-400 mb-1.5"
                      >
                        REGISTERED COMPANY / DEALERSHIP NAME *
                      </label>
                      <input
                        id="dealer-company"
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Apex Munich Motorsport GmbH"
                        className="w-full h-11 px-4 bg-[#18181D] border border-[#33333E] rounded-xl text-sm text-[#F5F5F7] focus:outline-none focus:border-[#FF5500]"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="dealer-trading"
                        className="block text-[11px] font-tech-mono uppercase tracking-wider text-neutral-400 mb-1.5"
                      >
                        TRADING / SHOWROOM NAME
                      </label>
                      <input
                        id="dealer-trading"
                        type="text"
                        value={tradingName}
                        onChange={(e) => setTradingName(e.target.value)}
                        placeholder="e.g. Apex M Performance Atelier"
                        className="w-full h-11 px-4 bg-[#18181D] border border-[#33333E] rounded-xl text-sm text-[#F5F5F7] focus:outline-none focus:border-[#FF5500]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label
                        htmlFor="dealer-country"
                        className="block text-[11px] font-tech-mono uppercase tracking-wider text-neutral-400 mb-1.5"
                      >
                        COUNTRY / REGION *
                      </label>
                      <input
                        id="dealer-country"
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full h-11 px-4 bg-[#18181D] border border-[#33333E] rounded-xl text-sm text-[#F5F5F7] focus:outline-none focus:border-[#FF5500]"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="dealer-city"
                        className="block text-[11px] font-tech-mono uppercase tracking-wider text-neutral-400 mb-1.5"
                      >
                        CITY *
                      </label>
                      <input
                        id="dealer-city"
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. London / Munich / Dubai"
                        className="w-full h-11 px-4 bg-[#18181D] border border-[#33333E] rounded-xl text-sm text-[#F5F5F7] focus:outline-none focus:border-[#FF5500]"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="dealer-vat"
                        className="block text-[11px] font-tech-mono uppercase tracking-wider text-neutral-400 mb-1.5"
                      >
                        VAT / TAX REGISTRATION NO.
                      </label>
                      <input
                        id="dealer-vat"
                        type="text"
                        value={vatNumber}
                        onChange={(e) => setVatNumber(e.target.value)}
                        placeholder="e.g. GB 948 2810 42"
                        className="w-full h-11 px-4 bg-[#18181D] border border-[#33333E] rounded-xl text-sm font-tech-mono text-[#F5F5F7] focus:outline-none focus:border-[#FF5500]"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="dealer-website"
                      className="block text-[11px] font-tech-mono uppercase tracking-wider text-neutral-400 mb-1.5"
                    >
                      WEBSITE OR OFFICIAL INSTAGRAM URL
                    </label>
                    <input
                      id="dealer-website"
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://www.yourdealership.com"
                      className="w-full h-11 px-4 bg-[#18181D] border border-[#33333E] rounded-xl text-sm text-[#F5F5F7] focus:outline-none focus:border-[#FF5500]"
                    />
                  </div>
                </div>

                {/* Section 2: Principal Contact */}
                <div className="space-y-4 pt-4 border-t border-[#26262E]">
                  <h3 className="text-xs font-tech-mono font-bold uppercase tracking-[0.16em] text-[#FF5500]">
                    02 / PRINCIPAL TRADE CONTACT
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="dealer-contact-name"
                        className="block text-[11px] font-tech-mono uppercase tracking-wider text-neutral-400 mb-1.5"
                      >
                        CONTACT FULL NAME *
                      </label>
                      <input
                        id="dealer-contact-name"
                        type="text"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="e.g. Marcus Vance"
                        className="w-full h-11 px-4 bg-[#18181D] border border-[#33333E] rounded-xl text-sm text-[#F5F5F7] focus:outline-none focus:border-[#FF5500]"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="dealer-contact-role"
                        className="block text-[11px] font-tech-mono uppercase tracking-wider text-neutral-400 mb-1.5"
                      >
                        POSITION / TITLE
                      </label>
                      <input
                        id="dealer-contact-role"
                        type="text"
                        value={contactRole}
                        onChange={(e) => setContactRole(e.target.value)}
                        className="w-full h-11 px-4 bg-[#18181D] border border-[#33333E] rounded-xl text-sm text-[#F5F5F7] focus:outline-none focus:border-[#FF5500]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="dealer-email"
                        className="block text-[11px] font-tech-mono uppercase tracking-wider text-neutral-400 mb-1.5"
                      >
                        CORPORATE EMAIL ADDRESS *
                      </label>
                      <input
                        id="dealer-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="director@yourdealership.com"
                        className="w-full h-11 px-4 bg-[#18181D] border border-[#33333E] rounded-xl text-sm text-[#F5F5F7] focus:outline-none focus:border-[#FF5500]"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="dealer-phone"
                        className="block text-[11px] font-tech-mono uppercase tracking-wider text-neutral-400 mb-1.5"
                      >
                        DIRECT TELEPHONE / WHATSAPP *
                      </label>
                      <input
                        id="dealer-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+44 7700 900412"
                        className="w-full h-11 px-4 bg-[#18181D] border border-[#33333E] rounded-xl text-sm text-[#F5F5F7] focus:outline-none focus:border-[#FF5500]"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Technical Profile & Volume */}
                <div className="space-y-4 pt-4 border-t border-[#26262E]">
                  <h3 className="text-xs font-tech-mono font-bold uppercase tracking-[0.16em] text-[#FF5500]">
                    03 / FACILITY CLASSIFICATION &amp; PROJECTED VOLUME
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="dealer-facility-type"
                        className="block text-[11px] font-tech-mono uppercase tracking-wider text-neutral-400 mb-1.5"
                      >
                        PRIMARY FACILITY CLASSIFICATION
                      </label>
                      <select
                        id="dealer-facility-type"
                        value={facilityType}
                        onChange={(e) => setFacilityType(e.target.value)}
                        className="w-full h-11 px-3.5 bg-[#18181D] border border-[#33333E] rounded-xl text-xs font-tech-mono uppercase text-[#F5F5F7] focus:outline-none focus:border-[#FF5500]"
                      >
                        <option value="Authorized BMW M Performance Specialist">
                          Authorized BMW M Performance Specialist
                        </option>
                        <option value="Luxury & Exotic Vehicle Dealership">
                          Luxury &amp; Exotic Vehicle Dealership
                        </option>
                        <option value="Bespoke Coachbuilder & Styling Atelier">
                          Bespoke Coachbuilder &amp; Styling Atelier
                        </option>
                        <option value="Motorsport & Track Preparation Center">
                          Motorsport &amp; Track Preparation Center
                        </option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="dealer-volume"
                        className="block text-[11px] font-tech-mono uppercase tracking-wider text-neutral-400 mb-1.5"
                      >
                        ESTIMATED MONTHLY FORGED WHEEL ALLOCATION
                      </label>
                      <select
                        id="dealer-volume"
                        value={monthlyVolume}
                        onChange={(e) => setMonthlyVolume(e.target.value)}
                        className="w-full h-11 px-3.5 bg-[#18181D] border border-[#33333E] rounded-xl text-xs font-tech-mono uppercase text-[#F5F5F7] focus:outline-none focus:border-[#FF5500]"
                      >
                        <option value="1–3 Forged Sets / Month">
                          1–3 Forged Sets / Month (Tier 1 Stockist)
                        </option>
                        <option value="4–8 Forged Sets / Month">
                          4–8 Forged Sets / Month (Tier 2 Premier Partner)
                        </option>
                        <option value="10+ Forged Sets / Month">
                          10+ Forged Sets / Month (Regional Distributor)
                        </option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <span className="block text-[11px] font-tech-mono uppercase tracking-wider text-neutral-400 mb-2">
                      IN-HOUSE WORKSHOP &amp; SHOWROOM CAPABILITIES:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {CAPABILITY_OPTIONS.map((cap) => {
                        const active = capabilities.includes(cap);
                        return (
                          <button
                            key={cap}
                            type="button"
                            onClick={() => toggleCapability(cap)}
                            className={`p-3 rounded-xl border text-left text-xs font-tech-mono transition-all cursor-pointer flex items-center justify-between gap-2 ${
                              active
                                ? 'bg-[#1E1E24] text-[#F5F5F7] border-[#FF5500]'
                                : 'bg-[#18181D] text-[#C2C2CC] border-[#33333E] hover:border-neutral-400'
                            }`}
                          >
                            <span className="leading-snug">{cap}</span>
                            <span
                              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 text-[10px] ${
                                active ? 'border-[#FF5500] text-[#FF5500]' : 'border-neutral-500'
                              }`}
                            >
                              {active ? '✓' : ''}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="dealer-notes"
                      className="block text-[11px] font-tech-mono uppercase tracking-wider text-neutral-400 mb-1.5"
                    >
                      SHOWROOM OVERVIEW &amp; CURRENT BMW CLIENT PORTFOLIO
                    </label>
                    <textarea
                      id="dealer-notes"
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Describe your showroom square footage, number of service bays, and primary BMW M models serviced..."
                      className="w-full p-4 bg-[#18181D] border border-[#33333E] rounded-xl text-sm text-[#F5F5F7] focus:outline-none focus:border-[#FF5500]"
                    />
                  </div>
                </div>

                {formError && (
                  <p className="text-xs font-tech-mono text-[#FF5500] bg-[#FF5500]/10 border border-[#FF5500]/30 p-3 rounded-xl">
                    {formError}
                  </p>
                )}

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <p className="text-xs font-tech-mono text-neutral-400">
                    STRICTLY CONFIDENTIAL · REVIEWED BY FORGED CUSTOM WHEELS UK TRADE BOARD
                  </p>
                  <button
                    type="submit"
                    className="bg-[#FF5500] text-white rounded-full px-8 py-4 text-xs font-tech-mono font-bold uppercase tracking-[0.18em] hover:bg-[#FF6B1A] transition-all shadow-[0_0_20px_rgba(255,85,0,0.35)] inline-flex items-center justify-center gap-3 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span>SUBMIT DEALER APPLICATION</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
