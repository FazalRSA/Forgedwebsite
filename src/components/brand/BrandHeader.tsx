import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  ChevronDown,
  X,
  Layers,
  Disc3,
  Car,
  User as UserIcon,
} from 'lucide-react';
import { useRouter } from '../../utils/router';
import { displayAddress } from '../../config/site';
import { useForgedStore } from '../../store/useForgedStore';
import { useFirebaseAuth } from '../../context/FirebaseContext';
import { LogoPlaceholder } from '../shared/LogoPlaceholder';

interface BrandHeaderProps {
  forceLight?: boolean;
}

export const BrandHeader: React.FC<BrandHeaderProps> = () => {
  const { navigate } = useRouter();
  const { openEnquiryModal } = useForgedStore();
  const { user, profile } = useFirebaseAuth();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [wheelsDropdownOpen, setWheelsDropdownOpen] = useState(false);
  const [drawerWheelsExpanded, setDrawerWheelsExpanded] = useState(true);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setWheelsDropdownOpen(false);
      }
    };

    if (wheelsDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [wheelsDropdownOpen]);

  // Lock body scroll when drawer is open & handle Esc key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDrawerOpen(false);
        setWheelsDropdownOpen(false);
      }
    };

    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [drawerOpen]);

  const handleNav = (target: string) => {
    setDrawerOpen(false);
    setWheelsDropdownOpen(false);
    navigate(target);
  };

  return (
    <>
      <header className="sticky top-0 z-50 h-16 px-6 md:px-10 flex items-center justify-between gap-6 bg-[#0A0A0A]/95 backdrop-blur-md text-[#F5F5F7] border-b border-[#26262E]">
        {/* Left: Brand Logo Wireframe */}
        <button
          type="button"
          onClick={() => handleNav('/')}
          aria-label="FORGED Custom wheels Home"
          className="shrink-0 cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF5500] flex items-center gap-3"
        >
          <LogoPlaceholder label="IMAGE PLACEHOLDER · LOGO" variant="dark" />
        </button>

        {/* Center / Primary Navigation Controls */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Direct Wheel Catalogue Link */}
          <button
            type="button"
            onClick={() => handleNav('/#catalogue')}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#F5F5F7] hover:text-[#FF5500] transition-colors cursor-pointer"
          >
            <Disc3 className="w-3.5 h-3.5 text-[#FF5500] shrink-0" />
            <span>Wheel Catalogue</span>
          </button>

          {/* Client Fitments Link (Desktop) */}
          <button
            type="button"
            onClick={() => handleNav('/client-fitments')}
            className="hidden md:inline-flex text-xs sm:text-sm font-medium text-[#C2C2CC] hover:text-[#FF5500] transition-colors cursor-pointer"
          >
            Client Fitments
          </button>

          {/* Official Dealer of Sixnine Wheels Link (Desktop) */}
          <button
            type="button"
            onClick={() => handleNav('/sixnine-wheels')}
            className="hidden lg:inline-flex text-xs sm:text-sm font-medium text-[#C2C2CC] hover:text-[#FF5500] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Sixnine Wheels
          </button>

          {/* Quick Store Pill */}
          <button
            type="button"
            onClick={() => handleNav('/store')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#FF5500]/40 bg-[#FF5500]/10 text-[#FF5500] hover:bg-[#FF5500] hover:text-white text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-[0_0_12px_rgba(255,85,0,0.15)]"
          >
            <span>Store</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          {/* My Account & Garage Button */}
          <button
            type="button"
            onClick={() => handleNav('/account')}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#26262E] bg-[#141418] hover:border-[#FF5500] text-[#F5F5F7] text-xs font-mono transition-colors cursor-pointer"
          >
            {user ? (
              <>
                <Car className="w-3.5 h-3.5 text-[#FF5500]" />
                <span className="hidden md:inline">
                  {profile?.primaryModel || 'My Garage'}
                </span>
              </>
            ) : (
              <>
                <UserIcon className="w-3.5 h-3.5 text-[#FF5500]" />
                <span>Account</span>
              </>
            )}
          </button>

          {/* Slide-out Menu Trigger */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open Navigation Menu"
            aria-expanded={drawerOpen}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-[#26262E] bg-[#121215] hover:border-[#FF5500] text-[#F5F5F7] text-xs font-tech-mono uppercase tracking-[0.14em] cursor-pointer transition-all hover:shadow-[0_0_15px_rgba(255,85,0,0.2)] select-none"
          >
            <span className="font-semibold">MENU</span>
            <div className="flex flex-col gap-1 w-4">
              <span className="block h-[1.5px] w-4 bg-[#F5F5F7] rounded-full" />
              <span className="block h-[1.5px] w-2.5 bg-[#FF5500] rounded-full self-end" />
            </div>
          </button>
        </div>
      </header>

      {/* Slide-out Drawer Menu */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Dimmed Backdrop Scrim */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Right Sliding Drawer Panel */}
          <aside
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Menu"
            className="fixed inset-y-0 right-0 max-w-full w-full sm:w-[460px] bg-[#0E0E12] border-l border-[#26262E] text-[#F5F5F7] flex flex-col justify-between shadow-[0_0_60px_rgba(0,0,0,0.9)] z-50 overflow-y-auto animate-in slide-in-from-right duration-300"
          >
            {/* Top Bar inside Drawer */}
            <div className="p-6 sm:p-8 border-b border-[#26262E] flex items-center justify-between">
              <span className="text-xs font-tech-mono uppercase tracking-[0.16em] text-[#FF5500] font-semibold">
                FORGED ATELIER
              </span>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="w-9 h-9 rounded-full border border-[#26262E] bg-[#141418] hover:border-[#FF5500] text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-[#FF5500]" />
              </button>
            </div>

            {/* Navigation Links Body: Clean, Minimalist Typography */}
            <div className="p-6 sm:p-8 space-y-1 flex-1">
              {/* 1. Wheel Catalogue */}
              <button
                type="button"
                onClick={() => handleNav('/#catalogue')}
                className="w-full py-4 border-b border-[#26262E] text-left text-2xl font-light tracking-tight hover:text-[#FF5500] transition-colors cursor-pointer flex items-center justify-between"
              >
                <span>Wheel Catalogue</span>
                <Disc3 className="w-5 h-5 text-[#FF5500]" />
              </button>

              {/* 2. Official Dealer of Sixnine Wheels */}
              <button
                type="button"
                onClick={() => handleNav('/sixnine-wheels')}
                className="w-full py-4 border-b border-[#26262E] text-left text-2xl font-light tracking-tight hover:text-[#FF5500] transition-colors cursor-pointer flex items-center justify-between"
              >
                <span>Official Dealer of Sixnine Wheels</span>
                <ArrowUpRight className="w-5 h-5 text-[#FF5500]" />
              </button>

              {/* 3. Wheel Store */}
              <button
                type="button"
                onClick={() => handleNav('/store')}
                className="w-full py-4 border-b border-[#26262E] text-left text-2xl font-light tracking-tight hover:text-[#FF5500] transition-colors cursor-pointer flex items-center justify-between"
              >
                <span>Wheel Store</span>
                <ArrowUpRight className="w-5 h-5 text-[#FF5500]" />
              </button>

              {/* 4. My Account & Vehicle Garage */}
              <button
                type="button"
                onClick={() => handleNav('/account')}
                className="w-full py-4 border-b border-[#26262E] text-left text-2xl font-light tracking-tight hover:text-[#FF5500] transition-colors cursor-pointer flex items-center justify-between"
              >
                <span>My Account &amp; Garage</span>
                <Car className="w-5 h-5 text-[#FF5500]" />
              </button>

              {/* 5. Client Fitments */}
              <button
                type="button"
                onClick={() => handleNav('/client-fitments')}
                className="w-full py-4 border-b border-[#26262E] text-left text-2xl font-light tracking-tight hover:text-[#FF5500] transition-colors cursor-pointer"
              >
                Client Fitments
              </button>

              {/* 6. Dealer Application */}
              <button
                type="button"
                onClick={() => handleNav('/dealer-application')}
                className="w-full py-4 border-b border-[#26262E] text-left text-2xl font-light tracking-tight hover:text-[#FF5500] transition-colors cursor-pointer"
              >
                Dealer Application
              </button>

              {/* 4. Admin Uploader */}
              <button
                type="button"
                onClick={() => handleNav('/admin/wheels')}
                className="w-full py-4 border-b border-[#26262E] text-left text-2xl font-light tracking-tight hover:text-[#FF5500] transition-colors cursor-pointer"
              >
                Admin Uploader
              </button>

              {/* 5. Contact */}
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  openEnquiryModal({
                    subject: 'Studio Consultation & Fitment Brief',
                    domain: 'brand',
                  });
                }}
                className="w-full py-4 border-b border-[#26262E] text-left text-2xl font-light tracking-tight hover:text-[#FF5500] transition-colors cursor-pointer"
              >
                Contact
              </button>

              {/* 6. Privacy Policy */}
              <button
                type="button"
                onClick={() => handleNav('/privacy-policy')}
                className="w-full py-4 border-b border-[#26262E] text-left text-2xl font-light tracking-tight hover:text-[#FF5500] transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>
            </div>

            {/* Drawer Bottom Details: Clean, with Two Logo Placeholders */}
            <div className="p-6 sm:p-8 border-t border-[#26262E] bg-[#0A0A0A] space-y-5">
              {/* Two Logo Placeholders Side-by-Side as Requested */}
              <div className="flex items-center justify-center gap-4 py-1">
                <LogoPlaceholder label="IMAGE PLACEHOLDER · LOGO 01" variant="dark" />
                <LogoPlaceholder label="IMAGE PLACEHOLDER · LOGO 02" variant="dark" />
              </div>

              {/* Quiet Architectural Atelier Address */}
              <div className="text-center">
                <p className="text-xs font-tech-mono text-neutral-400">
                  {displayAddress()}
                </p>
              </div>

              {/* Clean Understated Action Button */}
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  openEnquiryModal({
                    subject: 'Technical Fitment Consultation Request',
                    domain: 'brand',
                  });
                }}
                className="w-full py-3 px-5 rounded-full bg-[#FF5500] hover:bg-[#FF6B1A] text-white text-xs font-tech-mono uppercase tracking-wider font-semibold transition-all shadow-[0_0_15px_rgba(255,85,0,0.25)] cursor-pointer"
              >
                Request Technical Consultation
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
