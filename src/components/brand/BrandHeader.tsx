import React, { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useRouter } from '../../utils/router';
import { BrandLogo } from '../shared/BrandLogo';
import { ContactCta } from './ContactCta';

interface BrandHeaderProps {
  /** Kept so existing callers still compile; the header has one look. */
  forceLight?: boolean;
}

const NAV_ITEMS = [
  { label: 'Wheels', to: '/#catalogue' },
  { label: 'Installs', to: '/installs' },
  { label: 'Contact', to: '/contact' },
] as const;

const HEADER_MESSAGE = "Hi, I'd like to ask about your wheels.";

const HEADER_CTA_CLASS =
  'inline-flex items-center justify-center gap-2 min-h-11 px-4 sm:px-5 rounded-full bg-[#FF5500] text-white text-sm font-medium hover:bg-[#FF6B1A] transition-colors cursor-pointer whitespace-nowrap';

export const BrandHeader: React.FC<BrandHeaderProps> = () => {
  const { pathname } = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLElement | null>(null);

  // A new page always starts with the menu shut.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Escape closes the menu and hands focus back to the button that opened it.
  useEffect(() => {
    if (!menuOpen) return;
    // Move focus into the menu so keyboard and screen reader users land on it.
    menuRef.current?.querySelector('a')?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  // Wheels is the current section on the home page and on every wheel page.
  const isCurrent = (to: string) => {
    if (to === '/#catalogue') return pathname === '/' || pathname.startsWith('/wheels/');
    return pathname === to || pathname.startsWith(`${to}/`);
  };

  const closeMenu = () => setMenuOpen(false);

  const linkClass = (to: string) =>
    `inline-flex items-center min-h-11 px-3 text-sm font-medium transition-colors ${
      isCurrent(to) ? 'text-white' : 'text-[#C2C2CC] hover:text-white'
    }`;

  return (
    <>
      <header className="sticky top-0 z-50 h-16 px-4 sm:px-6 md:px-10 flex items-center justify-between gap-3 bg-[#0A0A0A] text-[#F5F5F7] border-b border-[#26262E]">
        <Link
          to="/"
          onClick={closeMenu}
          aria-label="FORGED Custom Wheels, home"
          className="shrink-0 inline-flex items-center min-h-11"
        >
          <BrandLogo />
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Desktop links */}
          <nav aria-label="Main" className="hidden md:flex items-center gap-1 mr-3">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                aria-current={isCurrent(item.to) ? 'page' : undefined}
                className={linkClass(item.to)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <ContactCta
            message={HEADER_MESSAGE}
            enquirySubject="Wheel enquiry"
            label="WhatsApp"
            fallbackLabel="Enquire"
            onActivate={closeMenu}
            className={HEADER_CTA_CLASS}
          />

          {/* Phone menu button: three links live behind it, nothing else */}
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-full text-[#F5F5F7] hover:text-white cursor-pointer"
          >
            {menuOpen ? <X aria-hidden="true" className="w-5 h-5" /> : <Menu aria-hidden="true" className="w-5 h-5" />}
          </button>
        </div>

        {menuOpen && (
          <nav
            ref={menuRef}
            id="mobile-menu"
            aria-label="Main"
            className="md:hidden absolute top-full inset-x-0 bg-[#0A0A0A] border-b border-[#26262E] px-4 sm:px-6 pb-2"
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={closeMenu}
                aria-current={isCurrent(item.to) ? 'page' : undefined}
                className={`flex items-center min-h-14 text-xl font-light tracking-tight border-t border-[#1E1E26] first:border-t-0 ${
                  isCurrent(item.to) ? 'text-white' : 'text-[#C2C2CC]'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      {/* Tapping outside the open menu closes it */}
      {menuOpen && (
        <div
          aria-hidden="true"
          onClick={closeMenu}
          className="md:hidden fixed inset-0 top-16 z-40 bg-black/60"
        />
      )}
    </>
  );
};
