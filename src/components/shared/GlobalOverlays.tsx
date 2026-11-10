import React, { useState, Suspense, lazy } from 'react';
import { X, CheckCircle2, ShieldCheck, FileText } from 'lucide-react';
import { useForgedStore } from '../../store/useForgedStore';
import { useRouter } from '../../utils/router';

const AddWheelModal = lazy(() =>
  import('./AddWheelModal').then((m) => ({ default: m.AddWheelModal }))
);

export const GlobalOverlays: React.FC = () => {
  const { navigate } = useRouter();
  const {
    isAddWheelModalOpen,
    enquiryModal,
    closeEnquiryModal,
    submitEnquiryRecord,
    submittedEnquiries,
  } = useForgedStore();

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [vehicleReg, setVehicleReg] = useState('');
  const [wheelInterest, setWheelInterest] = useState('');
  const [preferredFinish, setPreferredFinish] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submittedSuccessId, setSubmittedSuccessId] = useState<string | null>(null);

  const handleEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerEmail.includes('@') || !customerPhone.trim()) {
      setFormError('Please provide your full name, a valid email address, and contact number.');
      return;
    }
    setFormError(null);
    const combinedNotes = [
      wheelInterest ? `Wheel Model: ${wheelInterest}` : '',
      preferredFinish ? `Preferred Finish: ${preferredFinish}` : '',
      notes ? `Requirements: ${notes}` : '',
    ]
      .filter(Boolean)
      .join(' | ');

    submitEnquiryRecord({
      subject: enquiryModal.subject || 'Bespoke Wheel Interest Request',
      partNo: enquiryModal.partNo,
      finish: enquiryModal.finish || preferredFinish,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim(),
      vehicleRegistrationOrVin: vehicleReg.trim() || 'To be confirmed',
      notes: combinedNotes || 'General fitment & allocation interest',
    });

    const refCode = `FORGED-${Math.floor(100000 + Math.random() * 900000)}`;
    setSubmittedSuccessId(refCode);
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setVehicleReg('');
    setWheelInterest('');
    setPreferredFinish('');
    setNotes('');
  };

  const handleCloseEnquiry = () => {
    setSubmittedSuccessId(null);
    setFormError(null);
    closeEnquiryModal();
  };

  return (
    <>
      {isAddWheelModalOpen && (
        <Suspense fallback={null}>
          <AddWheelModal />
        </Suspense>
      )}

      {/* Bespoke Specification & Interest Request Form (Replaces all E-Commerce Cart & Checkout) */}
      {enquiryModal.isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="FORGED Custom Wheels Interest Request Form"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
        >
          <div
            className={`w-full max-w-xl bg-[#0E0E12] text-[#F5F5F7] p-6 sm:p-8 shadow-2xl border border-[#26262E] my-auto ${
              enquiryModal.domain === 'brand' ? 'rounded-3xl' : 'rounded-2xl'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#26262E]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-[#FF5500] animate-pulse" />
                  <p className="text-[11px] font-tech-mono uppercase tracking-[0.16em] text-[#FF5500] font-semibold">
                    BESPOKE ALLOCATION · INTEREST REQUEST
                  </p>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white uppercase">
                  State Your Interest
                </h2>
                <p className="text-xs text-[#C2C2CC] mt-1">
                  No online checkout or payment required. Submit your vehicle details and requirements below; our engineering desk will review 3D hub clearances and contact you directly.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseEnquiry}
                aria-label="Close Interest Request Form"
                className="w-9 h-9 rounded-full border border-[#26262E] bg-[#141418] hover:border-[#FF5500] flex items-center justify-center text-[#C2C2CC] hover:text-[#FF5500] transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {submittedSuccessId ? (
              <div className="py-10 space-y-5 text-center">
                <div className="w-16 h-16 rounded-full bg-[#FF5500]/10 border border-[#FF5500]/40 flex items-center justify-center mx-auto text-[#FF5500]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <span className="text-[11px] font-tech-mono uppercase tracking-widest text-[#FF5500] font-semibold">
                    REQUEST SUBMITTED SUCCESSFULLY
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white uppercase">
                    Reference #{submittedSuccessId}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#C2C2CC] max-w-md mx-auto leading-relaxed">
                    Your interest and build preferences have been logged. We will review your fitment details and contact you using the details you provided.
                  </p>
                </div>

                {submittedEnquiries.length > 0 && (
                  <p className="text-[11px] font-tech-mono text-neutral-400">
                    RECORDED IN CLIENT DOSSIER ({submittedEnquiries.length} REGISTERED INQUIRIES)
                  </p>
                )}

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleCloseEnquiry}
                    className="px-8 py-3.5 bg-[#FF5500] hover:bg-[#FF6B1A] text-white text-xs font-tech-mono font-bold uppercase tracking-[0.16em] rounded-full transition-all shadow-[0_0_20px_rgba(255,85,0,0.3)] cursor-pointer"
                  >
                    Return to Atelier
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="space-y-4 pt-5">
                {/* Pre-filled Reference Badge if initiated from a specific wheel/fitment */}
                {enquiryModal.subject && (
                  <div className="p-3 bg-[#141418] border border-[#26262E] rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs font-tech-mono text-[#C2C2CC]">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-[#FF5500] shrink-0" />
                      <span className="font-semibold text-white truncate max-w-xs sm:max-w-md">
                        {enquiryModal.subject}
                      </span>
                    </div>
                    {enquiryModal.finish && (
                      <span className="text-[11px] text-[#FF5500] uppercase font-semibold">
                        FINISH: {enquiryModal.finish}
                      </span>
                    )}
                  </div>
                )}

                {/* Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="enq-name"
                      className="block text-[11px] font-tech-mono uppercase tracking-wider text-[#C2C2CC] mb-1.5"
                    >
                      Full Name *
                    </label>
                    <input
                      id="enq-name"
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Alexander Vance"
                      className="w-full h-11 px-3.5 bg-[#141418] border border-[#26262E] text-[#F5F5F7] text-xs sm:text-sm rounded-lg focus:outline-none focus:border-[#FF5500] transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="enq-phone"
                      className="block text-[11px] font-tech-mono uppercase tracking-wider text-[#C2C2CC] mb-1.5"
                    >
                      Telephone / WhatsApp *
                    </label>
                    <input
                      id="enq-phone"
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+27 82 000 0000"
                      className="w-full h-11 px-3.5 bg-[#141418] border border-[#26262E] text-[#F5F5F7] text-xs sm:text-sm rounded-lg focus:outline-none focus:border-[#FF5500] transition-colors"
                    />
                  </div>
                </div>

                {/* Email & Vehicle Registration / Model */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="enq-email"
                      className="block text-[11px] font-tech-mono uppercase tracking-wider text-[#C2C2CC] mb-1.5"
                    >
                      Email Address *
                    </label>
                    <input
                      id="enq-email"
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="client@prestige.com"
                      className="w-full h-11 px-3.5 bg-[#141418] border border-[#26262E] text-[#F5F5F7] text-xs sm:text-sm rounded-lg focus:outline-none focus:border-[#FF5500] transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="enq-reg"
                      className="block text-[11px] font-tech-mono uppercase tracking-wider text-[#C2C2CC] mb-1.5"
                    >
                      Vehicle Model &amp; Year
                    </label>
                    <input
                      id="enq-reg"
                      type="text"
                      value={vehicleReg}
                      onChange={(e) => setVehicleReg(e.target.value)}
                      placeholder="e.g. 2025 BMW G80 M3 Competition"
                      className="w-full h-11 px-3.5 bg-[#141418] border border-[#26262E] text-[#F5F5F7] text-xs sm:text-sm rounded-lg focus:outline-none focus:border-[#FF5500] transition-colors"
                    />
                  </div>
                </div>

                {/* Preferred Finish or Wheel (optional if not pre-set) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="enq-finish"
                      className="block text-[11px] font-tech-mono uppercase tracking-wider text-[#C2C2CC] mb-1.5"
                    >
                      Preferred Finish / Spec
                    </label>
                    <input
                      id="enq-finish"
                      type="text"
                      value={preferredFinish}
                      onChange={(e) => setPreferredFinish(e.target.value)}
                      placeholder={enquiryModal.finish || "e.g. Liquid Silver, Satin Black, Champagne"}
                      className="w-full h-11 px-3.5 bg-[#141418] border border-[#26262E] text-[#F5F5F7] text-xs sm:text-sm rounded-lg focus:outline-none focus:border-[#FF5500] transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="enq-timeline"
                      className="block text-[11px] font-tech-mono uppercase tracking-wider text-[#C2C2CC] mb-1.5"
                    >
                      Expected Build Timeline
                    </label>
                    <select
                      id="enq-timeline"
                      className="w-full h-11 px-3.5 bg-[#141418] border border-[#26262E] text-[#F5F5F7] text-xs sm:text-sm rounded-lg focus:outline-none focus:border-[#FF5500] cursor-pointer"
                    >
                      <option value="immediate">Immediate Dispatch / Urgent</option>
                      <option value="1-2-months">Within 1-2 Months</option>
                      <option value="planning">Future Build Planning / Consulting</option>
                    </select>
                  </div>
                </div>

                {/* Bespoke Requirements */}
                <div>
                  <label
                    htmlFor="enq-notes"
                    className="block text-[11px] font-tech-mono uppercase tracking-wider text-[#C2C2CC] mb-1.5"
                  >
                    Bespoke Notes / Requirements
                  </label>
                  <textarea
                    id="enq-notes"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Specify custom tire package (e.g. Michelin Cup 2), TPMS sensors, custom offsets, or international shipping address..."
                    className="w-full p-3.5 bg-[#141418] border border-[#26262E] text-[#F5F5F7] text-xs sm:text-sm rounded-lg focus:outline-none focus:border-[#FF5500] transition-colors resize-none"
                  />
                </div>

                {formError && (
                  <p className="text-xs font-tech-mono text-[#FF5500]">{formError}</p>
                )}

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-4 bg-[#FF5500] hover:bg-[#FF6B1A] text-white text-xs font-tech-mono font-bold uppercase tracking-[0.18em] rounded-full transition-all shadow-[0_0_25px_rgba(255,85,0,0.35)] cursor-pointer"
                  >
                    Submit Interest Request
                  </button>
                  <p className="flex items-start justify-center gap-2 mt-3 text-[11px] font-tech-mono text-neutral-400 text-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#FF5500] shrink-0 mt-0.5" />
                    <span>
                      By submitting, you consent to FORGED Custom Wheels using these details to respond
                      to your request, as described in our{' '}
                      <button
                        type="button"
                        onClick={() => {
                          handleCloseEnquiry();
                          navigate('/privacy-policy');
                        }}
                        className="text-[#FF5500] hover:underline cursor-pointer"
                      >
                        Privacy Notice
                      </button>
                      .
                    </span>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </>
  );
};
