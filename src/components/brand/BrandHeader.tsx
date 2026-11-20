import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ChevronDown, Menu, X } from 'lucide-react';
import { Link, useRouter } from '../../utils/router';
import { brandOfWheel, findWheelBySlug, getAllBrandWheels, WHEEL_BRANDS } from '../../data/catalogue';
import { seriesPath, SIXNINE_SERIES } from '../../data/sixnineSeries';
import { useForgedStore } from '../../store/useForgedStore';
import { BrandLogo } from '../shared/BrandLogo';
import { ContactCta, CTA_ACCENT_CLASS } from './ContactCta';
import { seriesImage, seriesSummary, SixnineSeriesTile, stockOfSeries } from './SixnineSeriesTile';

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

const SIXNINE_TO = WHEEL_BRANDS.sixnine.path;

const HEADER_MESSAGE = "Hi, I'd like to ask about your wheels.";

/** The header's Enquire button: FORGED blue, the one accent on every page. */
const HEADER_CTA_CLASS = `${CTA_ACCENT_CLASS} !px-4 sm:!px-5`;

/** Hover opens the mega menu only for a mouse or trackpad; touch screens use the button. */
const canHover = () => typeof window !== 'undefined' && window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;

export const BrandHeader: React.FC<BrandHeaderProps> = () => {
  const { pathname } = useRouter();
  const customBrandWheels = useForgedStore((state) => state.customBrandWheels);
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileSeriesOpen, setMobileSeriesOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLElement | null>(null);
  const megaRef = useRef<HTMLDivElement | null>(null);
  const megaButtonRef = useRef<HTMLButtonElement | null>(null);
  const closeTimer = useRef<number | undefined>(undefined);

  // What the mega menu shows: each series with the shop's own photo and stock, from the catalogue.
  const wheels = useMemo(() => getAllBrandWheels(customBrandWheels), [customBrandWheels]);
  const seriesTiles = useMemo(
    () =>
      SIXNINE_SERIES.map((series) => ({
        series,
        inStock: stockOfSeries(series, wheels).length > 0,
        image: seriesImage(series, wheels),
      })),
    [wheels]
  );

  // A new page always starts with every menu shut.
  useEffect(() => {
    setMenuOpen(false);
    setMegaOpen(false);
    setMobileSeriesOpen(false);
  }, [pathname]);

  // Escape closes the phone menu and hands focus back to the button that opened it.
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

  // The mega menu (a disclosure, not an ARIA menu): Escape closes it and returns focus to its button;
  // a click anywhere outside it closes it.
  useEffect(() => {
    if (!megaOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMegaOpen(false);
        megaButtonRef.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!megaRef.current?.contains(event.target as Node)) setMegaOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [megaOpen]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  const openOnHover = () => {
    if (!canHover()) return;
    window.clearTimeout(closeTimer.current);
    setMegaOpen(true);
  };
  // A short delay, so moving the pointer from the link down to the panel does not close it.
  const closeOnLeave = () => {
    if (!canHover()) return;
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setMegaOpen(false), 160);
  };
  // Tabbing out of the link, the button and the panel closes the panel.
  const closeOnFocusOut = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setMegaOpen(false);
  };

  // On a wheel page, the wheel's brand is the current section.
  const wheelSlug = pathname.startsWith('/wheels/') ? pathname.slice('/wheels/'.length).split('/')[0] : '';
  const wheel = wheelSlug ? findWheelBySlug(wheelSlug, customBrandWheels) : undefined;
  const wheelBrandId = wheel ? brandOfWheel(wheel) : undefined;
  const wheelBrandPath = wheelBrandId ? WHEEL_BRANDS[wheelBrandId].path : undefined;
  const isCurrent = (to: string) => pathname === to || pathname.startsWith(`${to}/`) || to === wheelBrandPath;

  const closeMenu = () => setMenuOpen(false);
  const closeAll = () => {
    setMenuOpen(false);
    setMegaOpen(false);
  };

  // Pill links: the current section sits on a lighter pill, the others light up on hover.
  const linkClass = (to: string) =>
    `press inline-flex items-center h-10 px-4 rounded-full text-[15px] ${
      isCurrent(to) ? 'bg-white/10 text-white font-semibold' : 'font-medium text-[#C2C2CC] hover:bg-white/[0.06] hover:text-white'
    }`;

  const mobileLinkClass = (to: string) =>
    `flex flex-1 items-center min-h-13 px-4 rounded-2xl text-xl tracking-tight ${
      isCurrent(to) ? 'bg-white/10 text-white font-medium' : 'font-light text-[#C2C2CC] hover:bg-white/[0.06]'
    }`;

  return (
    <>
      {/* A floating glass pill (the SIXNINE header): the sticky band itself is see-through, so the page
          scrolls behind the bar. 72 px tall in all: 8 px above and below a 56 px bar. */}
      <header className="sticky top-0 z-50 px-2 sm:px-4 md:px-6 py-2 text-[#EDEBE4]">
        <div className="relative mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 rounded-full border border-white/[0.09] bg-[#141418]/70 pl-4 pr-1.5 sm:pl-5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.55),0_2px_8px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md backdrop-saturate-150">
          <Link
            to="/"
            onClick={closeAll}
            aria-label="FORGED Custom Wheels, home"
            className="shrink-0 inline-flex items-center min-h-11"
          >
            <BrandLogo />
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Desktop links, from 1024 px: below that the five links and the button do not fit beside the logo */}
            <nav aria-label="Main" className="hidden lg:flex items-center gap-0.5 mr-2">
              {NAV_ITEMS.map((item) =>
                item.to === SIXNINE_TO ? (
                  // Sixnine: a link to the dealer page plus a button that opens the mega menu of series
                  // (the "link + disclosure" navigation pattern).
                  <div
                    key={item.to}
                    ref={megaRef}
                    className="flex items-center"
                    onPointerEnter={openOnHover}
                    onPointerLeave={closeOnLeave}
                    onBlur={closeOnFocusOut}
                  >
                    <Link
                      to={item.to}
                      onClick={closeAll}
                      aria-current={isCurrent(item.to) ? 'page' : undefined}
                      className={`${linkClass(item.to)} !pr-2`}
                    >
                      {item.label}
                    </Link>
                    <button
                      ref={megaButtonRef}
                      type="button"
                      onClick={() => setMegaOpen((open) => !open)}
                      aria-expanded={megaOpen}
                      aria-controls="sixnine-mega"
                      aria-label="Sixnine series"
                      className="press -ml-1 inline-flex h-10 w-8 items-center justify-center rounded-full text-[#C2C2CC] hover:bg-white/[0.06] hover:text-white cursor-pointer"
                    >
                      <ChevronDown aria-hidden="true" className={`h-4 w-4 transition-transform duration-200 ${megaOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* The panel hangs under the whole bar; its top padding bridges the gap so the
                        pointer can travel from the link to the tiles without closing it. */}
                    <div id="sixnine-mega" hidden={!megaOpen} className="absolute inset-x-0 top-full pt-2">
                      <div className="grid grid-cols-[15rem_minmax(0,1fr)] gap-6 rounded-[28px] border border-white/[0.09] bg-[#141418]/95 p-6 shadow-[0_24px_64px_-24px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md">
                        <div className="flex flex-col gap-3 border-r border-white/[0.09] pr-6">
                          <img src={WHEEL_BRANDS.sixnine.logo.url} alt="" width={56} height={56} className="h-14 w-14 object-contain" />
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-400">{WHEEL_BRANDS.sixnine.relation}</p>
                            <p className="mt-1 text-xl font-semibold text-white">{WHEEL_BRANDS.sixnine.name}</p>
                          </div>
                          <p className="text-sm text-neutral-300">Every Sixnine series, with every size Sixnine lists and the sets we have in stock.</p>
                          <Link
                            to={item.to}
                            onClick={closeAll}
                            className="press mt-auto inline-flex items-center gap-2 text-sm font-semibold text-white hover:underline underline-offset-4"
                          >
                            Dealer page and sets in stock
                            <ArrowRight aria-hidden="true" className="h-4 w-4" />
                          </Link>
                        </div>
                        <ul className="grid grid-cols-3 gap-x-4 gap-y-5">
                          {seriesTiles.map(({ series, inStock, image }) => (
                            <li key={series.code}>
                              <SixnineSeriesTile series={series} inStock={inStock} image={image} compact onActivate={closeAll} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    key={item.to}
                    to={item.to}
                    aria-current={isCurrent(item.to) ? 'page' : undefined}
                    className={linkClass(item.to)}
                  >
                    {item.label}
                  </Link>
                )
              )}
            </nav>

            <ContactCta
              message={HEADER_MESSAGE}
              enquirySubject="Wheel enquiry"
              label="Enquire"
              fallbackLabel="Send an enquiry"
              onActivate={closeAll}
              className={HEADER_CTA_CLASS}
            />

            {/* Phone and tablet menu button: the same five links live behind it, plus the Sixnine series */}
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
            className="lg:hidden absolute top-full inset-x-2 sm:inset-x-4 md:inset-x-6 mt-1 max-h-[calc(100svh-5.5rem)] overflow-y-auto overscroll-contain rounded-3xl border border-white/[0.09] bg-[#141418]/95 px-2 py-2 shadow-[0_24px_64px_-24px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md"
          >
            {NAV_ITEMS.map((item) =>
              item.to === SIXNINE_TO ? (
                <div key={item.to}>
                  <div className="flex items-center gap-1">
                    <Link to={item.to} onClick={closeMenu} aria-current={isCurrent(item.to) ? 'page' : undefined} className={mobileLinkClass(item.to)}>
                      {item.label}
                    </Link>
                    <button
                      type="button"
                      onClick={() => setMobileSeriesOpen((open) => !open)}
                      aria-expanded={mobileSeriesOpen}
                      aria-controls="mobile-sixnine-series"
                      aria-label="Sixnine series"
                      className="press inline-flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl text-[#C2C2CC] hover:bg-white/[0.06] hover:text-white cursor-pointer"
                    >
                      <ChevronDown aria-hidden="true" className={`h-5 w-5 transition-transform duration-200 ${mobileSeriesOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                  <ul id="mobile-sixnine-series" hidden={!mobileSeriesOpen} className="mb-1 ml-4 border-l border-white/[0.09] pl-2">
                    {seriesTiles.map(({ series, inStock }) => (
                      <li key={series.code}>
                        <Link
                          to={seriesPath(series)}
                          onClick={closeMenu}
                          aria-current={pathname === seriesPath(series) ? 'page' : undefined}
                          className={`flex min-h-12 items-center justify-between gap-3 rounded-2xl px-3 ${
                            pathname === seriesPath(series) ? 'bg-white/10 text-white' : 'text-[#C2C2CC] hover:bg-white/[0.06]'
                          }`}
                        >
                          <span>
                            <span className="block text-base font-medium">{series.code}</span>
                            <span className="block text-xs text-neutral-400">{seriesSummary(series)}</span>
                          </span>
                          {inStock && (
                            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-[#111111]">
                              In stock
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <Link key={item.to} to={item.to} onClick={closeMenu} aria-current={isCurrent(item.to) ? 'page' : undefined} className={`${mobileLinkClass(item.to)} flex`}>
                  {item.label}
                </Link>
              )
            )}
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
