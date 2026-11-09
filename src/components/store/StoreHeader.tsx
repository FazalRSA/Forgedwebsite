import React, { useState } from 'react';
import {
  Menu,
  Phone,
  Search,
  FileText,
  X,
  ChevronDown,
  Bookmark,
  ArrowUpRight,
  Plus,
} from 'lucide-react';
import { useRouter } from '../../utils/router';
import { useKahnStore } from '../../store/useKahnStore';
import {
  formatZAR,
  getAllStoreProducts,
} from '../../data/kahnData';
import { LogoPlaceholder } from '../shared/LogoPlaceholder';

export const StoreHeader: React.FC = () => {
  const { navigate } = useRouter();
  const {
    wishlistSlugs,
    openEnquiryModal,
    customStoreProducts,
    setAddWheelModalOpen,
  } = useKahnStore();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const allStoreProducts = getAllStoreProducts(customStoreProducts);

  const searchResults = searchQuery.trim()
    ? allStoreProducts.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.technicalSpecs.partNo.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allStoreProducts.slice(0, 4);

  const toggleAccordion = (section: string) => {
    setOpenAccordion((prev) => (prev === section ? null : section));
  };

  const handleNavigate = (path: string) => {
    setDrawerOpen(false);
    setSearchOpen(false);
    navigate(path);
  };

  return (
    <>
      <div className="sticky top-0 z-50">
        {/* Sticky Onyx Navbar */}
        <header className="bg-[#0A0A0A] text-[#F5F5F7] h-14 px-4 sm:px-8 flex items-center justify-between gap-4 border-b border-[#26262E]">
          {/* Left: Hamburger + Direct Brand Portal Switch */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open FORGED Custom wheels Store Menu"
              className="w-10 h-10 flex items-center justify-center hover:text-[#FF5500] transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('/')}
              className="hidden md:inline-flex items-center gap-1 text-[11px] font-tech-mono uppercase tracking-[0.14em] text-[#C2C2CC] hover:text-[#FF5500] transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>← FORGED Custom wheels Editorial</span>
            </button>
          </div>

          {/* Center: Logo Image Placeholder */}
          <button
            type="button"
            onClick={() => handleNavigate('/store')}
            aria-label="FORGED Custom wheels Store Home"
            className="shrink-0 cursor-pointer"
          >
            <LogoPlaceholder label="IMAGE PLACEHOLDER · LOGO" variant="dark" />
          </button>

          {/* Right: Phone, Search, Register Interest Form Request */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() =>
                openEnquiryModal({
                  subject: 'FORGED Custom wheels Direct Telephone Callback (+44 1274 749 999)',
                  domain: 'store',
                })
              }
              aria-label="Telephone Technical Fitment Team"
              className="w-9 h-9 flex items-center justify-center hover:text-[#FF5500] transition-colors cursor-pointer"
            >
              <Phone className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setSearchOpen((prev) => !prev)}
              aria-label="Search Store Catalog"
              className="w-9 h-9 flex items-center justify-center hover:text-[#FF5500] transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('/account')}
              aria-label="My Account and Vehicle Garage"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#26262E] bg-[#141418] hover:border-[#FF5500] text-xs font-mono text-[#F5F5F7] transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>Account</span>
            </button>

            {/* Register Interest Form Request Button */}
            <button
              type="button"
              onClick={() =>
                openEnquiryModal({
                  subject: 'Vehicle Fitment & Bespoke Wheel Allocation Request',
                  domain: 'store',
                })
              }
              aria-label="State Your Interest & Request Specification Form"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#FF5500] bg-[#FF5500]/10 hover:bg-[#FF5500] text-[#FF5500] hover:text-white text-xs font-tech-mono font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap shadow-[0_0_12px_rgba(255,85,0,0.2)]"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Register Interest</span>
              <span className="sm:hidden">Enquire</span>
            </button>
          </div>
        </header>



        {/* Instant Search Dropdown Bar */}
        {searchOpen && (
          <div className="bg-[#0A0A0A] text-[#F5F5F7] border-b border-[#26262E] p-4 sm:px-8 shadow-2xl">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 border-b border-[#26262E] pb-2">
                <Search className="w-4 h-4 text-[#FF5500] shrink-0" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by BMW model (M3, M4, M2, M5), wheel (Type 52, RS 3.0) or Part No..."
                  aria-label="Search vehicle parts and forged wheels"
                  className="w-full bg-transparent text-sm text-[#F5F5F7] placeholder-neutral-500 focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="text-xs font-tech-mono uppercase text-[#C2C2CC] hover:text-[#FF5500] cursor-pointer"
                >
                  ESC
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3">
                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavigate(`/store/products/${item.slug}`)}
                    className="flex items-center justify-between p-2.5 bg-[#121215] hover:bg-[#18181D] hover:border-[#FF5500] text-left border border-[#26262E] transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider line-clamp-1 text-[#F5F5F7]">
                        {item.title}
                      </p>
                      <p className="text-[11px] font-tech-mono text-[#C2C2CC]">
                        {item.technicalSpecs.partNo} · {item.diameterBadge}
                      </p>
                    </div>
                    <span className="text-xs font-tech-mono font-bold text-[#FF5500] tabular-nums ml-3 shrink-0">
                      {formatZAR(item.priceZAR)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Left-Sliding Multi-Level Store Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setDrawerOpen(false)}
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="FORGED Custom wheels Store Drawer"
            className="relative z-10 w-full max-w-sm bg-[#0A0A0A] text-[#F5F5F7] h-full flex flex-col justify-between overflow-y-auto border-r border-[#26262E]"
          >
            <div>
              {/* Top bar inside drawer */}
              <div className="h-14 px-5 flex items-center justify-between border-b border-[#26262E]">
                <LogoPlaceholder label="IMAGE PLACEHOLDER · LOGO" variant="dark" />
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close Store Menu"
                  className="w-9 h-9 flex items-center justify-center text-[#C2C2CC] hover:text-[#FF5500] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Multi-Level Accordion Navigation */}
              <nav aria-label="Store Categories" className="divide-y divide-[#26262E]">
                {/* VEHICLES FOR SALE ↗ */}
                <button
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    openEnquiryModal({
                      subject: 'FORGED Custom wheels Turnkey BMW M Vehicles For Sale Stocklist',
                      domain: 'store',
                    });
                  }}
                  className="w-full px-5 py-4 flex items-center justify-between text-xs font-bold tracking-[0.16em] uppercase hover:bg-[#121215] cursor-pointer"
                >
                  <span>VEHICLES FOR SALE</span>
                  <ArrowUpRight className="w-4 h-4 text-[#FF5500]" />
                </button>

                {/* PREVIOUS CAR BUILDS */}
                <div>
                  <button
                    type="button"
                    onClick={() => toggleAccordion('PREVIOUS CAR BUILDS')}
                    className="w-full px-5 py-4 flex items-center justify-between text-xs font-bold tracking-[0.16em] uppercase hover:bg-[#121215] cursor-pointer"
                  >
                    <span>PREVIOUS CAR BUILDS</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        openAccordion === 'PREVIOUS CAR BUILDS' ? 'rotate-180 text-[#FF5500]' : ''
                      }`}
                    />
                  </button>
                  {openAccordion === 'PREVIOUS CAR BUILDS' && (
                    <div className="bg-[#121215] px-5 py-3 space-y-2 text-xs text-neutral-400">
                      <p>BMW G80 M3 Carbon Widebody Type 52 Edition</p>
                      <p>BMW G82 M4 Competition RS 3.0 Heritage Build</p>
                      <p>BMW G90 M5 Vengeance Coachbuilt Touring</p>
                    </div>
                  )}
                </div>

                {/* EXPLORE */}
                <div>
                  <button
                    type="button"
                    onClick={() => toggleAccordion('EXPLORE')}
                    className="w-full px-5 py-4 flex items-center justify-between text-xs font-bold tracking-[0.16em] uppercase hover:bg-[#121215] cursor-pointer"
                  >
                    <span>EXPLORE</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        openAccordion === 'EXPLORE' ? 'rotate-180 text-[#FF5500]' : ''
                      }`}
                    />
                  </button>
                  {openAccordion === 'EXPLORE' && (
                    <div className="bg-[#121215] px-5 py-3 space-y-2 text-xs font-tech-mono uppercase">
                      <button
                        type="button"
                        onClick={() => handleNavigate('/')}
                        className="block w-full text-left py-1 text-white hover:text-[#FF5500] cursor-pointer"
                      >
                        FORGED Custom wheels Editorial Portal ↗
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNavigate('/client-fitments')}
                        className="block w-full text-left py-1 text-neutral-300 hover:text-[#FF5500] cursor-pointer"
                      >
                        → Client Fitments (4×4 Bento Gallery)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNavigate('/dealer-application')}
                        className="block w-full text-left py-1 text-neutral-300 hover:text-[#FF5500] cursor-pointer"
                      >
                        → Dealer Application (Trade Network)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNavigate('/admin/wheels')}
                        className="block w-full text-left py-1 text-neutral-300 hover:text-[#FF5500] cursor-pointer"
                      >
                        → Admin Wheel Uploader (Protected)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNavigate('/#catalogue')}
                        className="block w-full text-left py-1 text-neutral-400 hover:text-white cursor-pointer"
                      >
                        Wheel Catalogue
                      </button>
                    </div>
                  )}
                </div>

                {/* BOUTIQUE */}
                <button
                  type="button"
                  onClick={() =>
                    handleNavigate('/store/products/bmw-m3-type-52-forged')
                  }
                  className="w-full px-5 py-4 flex items-center justify-between text-xs font-bold tracking-[0.16em] uppercase hover:bg-[#121215] cursor-pointer"
                >
                  <span>BOUTIQUE</span>
                  <span className="text-[10px] font-tech-mono text-[#FF5500]">FORGED SETS</span>
                </button>
              </nav>

              {/* WISHLIST SECTION */}
              <div className="p-5 border-t border-[#26262E]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-[0.16em] inline-flex items-center gap-2">
                    <Bookmark className="w-3.5 h-3.5 text-[#FF5500]" />
                    <span>WISHLIST ({wishlistSlugs.length})</span>
                  </span>
                </div>
                {wishlistSlugs.length === 0 ? (
                  <p className="text-xs text-neutral-500">
                    Tap the bookmark ribbon on any technical PDP to save wheels for comparison.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {wishlistSlugs.map((slug) => {
                      const prod = allStoreProducts.find((p) => p.slug === slug);
                      if (!prod) return null;
                      return (
                        <button
                          key={slug}
                          type="button"
                          onClick={() => handleNavigate(`/store/products/${prod.slug}`)}
                          className="w-full p-2.5 bg-[#121215] border border-[#26262E] hover:border-[#FF5500] text-left flex items-center justify-between cursor-pointer"
                        >
                          <span className="text-xs font-medium truncate pr-2 text-[#F5F5F7]">
                            {prod.shortModel} ({prod.make} {prod.model})
                          </span>
                          <span className="text-xs font-tech-mono text-[#FF5500] tabular-nums shrink-0">
                            {formatZAR(prod.priceZAR)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom: Pricing note (all prices are South African Rand, per set of 4) */}
            <div className="p-5 border-t border-[#26262E] bg-[#0A0A0A]">
              <p className="text-[11px] font-tech-mono uppercase tracking-[0.15em] text-[#C2C2CC]">
                ALL PRICES IN SOUTH AFRICAN RAND (ZAR) · PER SET OF 4
              </p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
