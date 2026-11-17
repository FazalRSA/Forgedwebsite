import React from 'react';
import { MessageCircle } from 'lucide-react';
import { whatsappLink } from '../../config/site';
import { useForgedStore } from '../../store/useForgedStore';
import { useRouter } from '../../utils/router';
import { ContactCta } from '../brand/ContactCta';

/**
 * "Contact us on WhatsApp", fixed to the corner of every public page. Like every other call to
 * action it opens the enquiry form, which logs the enquiry and then opens WhatsApp. It is hidden
 * while the form is open, on the unlisted admin pages, and when no WhatsApp number is configured.
 */
export const FloatingWhatsApp: React.FC = () => {
  const formOpen = useForgedStore((state) => state.enquiryModal.isOpen);
  const { pathname } = useRouter();
  if (!whatsappLink() || formOpen || pathname.startsWith('/admin')) return null;

  return (
    <div className="fixed z-40 right-4 bottom-4 sm:right-6 sm:bottom-6 pb-[env(safe-area-inset-bottom)]">
      <ContactCta
        message="Hi, I'd like to ask about your wheels."
        enquirySubject="Wheel enquiry"
        label="Contact us on WhatsApp"
        className="inline-flex items-center justify-center gap-2 h-14 min-w-14 px-4 sm:px-5 rounded-full bg-[#25D366] text-[#07220F] text-sm font-semibold shadow-lg shadow-black/40 hover:bg-[#3EE07D] transition-colors cursor-pointer [&>span]:sr-only sm:[&>span]:not-sr-only [&>svg]:w-6 [&>svg]:h-6"
      />
    </div>
  );
};
