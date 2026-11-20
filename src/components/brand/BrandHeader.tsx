import React, { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useRouter } from '../../utils/router';
import { brandOfWheel, findWheelBySlug, WHEEL_BRANDS } from '../../data/catalogue';
import { useForgedStore } from '../../store/useForgedStore';
import { BrandLogo } from '../shared/BrandLogo';
import { ContactCta, CTA_ACCENT_CLASS } from './ContactCta';

interface BrandHeaderProps {
  /** Kept so existing callers still compile; the header has one look. */
  forceLight?: boolean;
}

/** The two brands lead: each opens its own page, and stays marked on that brand's wheel pages. */
const NAV_ITEMS = [
  { label: WHEEL_BRANDS['forged-sa'].shortName, to: WHEEL_BRANDS['forged-sa'].path },
  { label: WHEEL_BRANDS.sixnine.shortName, to: WHEEL_BRANDS.sixnine.path },
  { label: 'Installs', to: '/installs' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contact', to: '/contact' },
] as const;

const HEADER_MESSAGE = "Hi, I'd like to ask about your wheels.";

/** The header's Enquire button: FORGED blue, the one accent on every page. */
const HEADER_CTA_CLASS = `${CTA_ACCENT_CLASS} !px-4 sm:!px-5`;

export const BrandHeader: React.FC<BrandHeaderProps> = () => {
  const { pathname } = useRouter();
  const customBrandWheels = useForgedStore((state) => state.customBrandWheels);
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

  // On a wheel page, the wheel's brand is the current section.
  const wheelSlug = pathname.startsWith('/wheels/') ? pathname.slice('/wheels/'.length).split('/')[0] : '';
  const wheel = wheelSlug ? findWheelBySlug(wheelSlug, customBrandWheels) : undefined;
  const wheelBrandId = wheel ? brandOfWheel(wheel) : undefined;
  const wheelBrandPath = wheelBrandId ? WHEEL_BRANDS[wheelBrandId].path : undefined;
  const isCurrent = (to: string) => pathname === to || pathname.startsWith(`${to}/`) || to === wheelBrandPath;

  const closeMenu = () => setMenuOpen(false);

  // Pill links: the current section sits on a lighter pill, the others light up on hover.
  const linkClass = (to: string) =>
    `press inline-flex items-center h-10 px-4 rounded-full text-[15px] ${
      isCurrent(to) ? 'bg-white/10 text-white font-semibold' : 'font-medium text-[#C2C2CC] hover:bg-white/[0.06] hover:text-white'
    }`;

  return (
    <>
      {/* A floating glass pill (the SIXNINE header): the sticky band itself is see-through, so the page
          scrolls behind the bar. 72 px tall in all: 8 px above and below a 56 px bar. */}
      <header className="sticky top-0 z-50 px-2 sm:px-4 md:px-6 py-2 text-[#EDEBE4]">
        <div className="relative mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 rounded-full border border-white/[0.09] bg-[#141418]/70 pl-4 pr-1.5 sm:pl-5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.55),0_2px_8px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md backdrop-saturate-150">
        <Link
          to="/"
          onClick={closeMenu}
          aria-label="FORGED Custom Wheels, home"
          className="shrink-0 inline-flex items-center min-h-11"
        >
          <BrandLogo />
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Desktop links, from 1024 px: below that the five links and the button do not fit beside the logo */}
          <nav aria-label="Main" className="hidden lg:flex items-center gap-0.5 mr-2">
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
            label="Enquire"
            fallbackLabel="Send an enquiry"
            onActivate={closeMenu}
            className={HEADER_CTA_CLASS}
          />

          {/* Phone and tablet menu button: the same five links live behind it, nothing else */}
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="press lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-full text-[#EDEBE4] hover:bg-white/10 hover:text-white cursor-pointer"
          >
            {menuOpen ? <X aria-hidden="true" className="w-5 h-5" /> : <Menu aria-hidden="true" className="w-5 h-5" />}
          </button>
        </div>
        </div>

        {menuOpen && (
          <nav
            ref={menuRef}
            id="mobile-menu"
            aria-label="Main"
            className="lg:hidden absolute top-full inset-x-2 sm:inset-x-4 md:inset-x-6 mt-1 rounded-3xl border border-white/[0.09] bg-[#141418]/95 px-2 py-2 shadow-[0_24px_64px_-24px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md"
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={closeMenu}
                aria-current={isCurrent(item.to) ? 'page' : undefined}
                className={`flex items-center min-h-13 px-4 rounded-2xl text-xl tracking-tight ${
                  isCurrent(item.to) ? 'bg-white/10 text-white font-medium' : 'font-light text-[#C2C2CC] hover:bg-white/[0.06]'
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
          className="lg:hidden fixed inset-0 z-40 bg-black/60"
        />
      )}
    </>
  );
};
