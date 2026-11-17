import React, { useEffect, useMemo, useState } from 'react';
import { SITE } from '../../config/site';
import { formatZAR, getAllBrandWheels } from '../../data/catalogue';
import { useForgedStore } from '../../store/useForgedStore';
import { HERO_WHEEL_MEDIA, heroWheelImage } from '../../utils/designCards';

/** The fallback sentence when nothing is listed in stock (the counts below come from the catalogue). */
const STATIC_LINE = 'Every set below is in stock. Prices are in Rand for a set of four.';

/** Whether a CSS media query matches, kept up to date as the window is resized. */
function useMediaMatches(query: string): boolean {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(query).matches
  );
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);
  return matches;
}

/** One headline, one sentence, one button, and on wide screens the first in-stock design beside them. */
export const HeroSection: React.FC = () => {
  const customBrandWheels = useForgedStore((state) => state.customBrandWheels);
  // getAllBrandWheels returns only wheels that are in stock.
  const wheels = useMemo(() => getAllBrandWheels(customBrandWheels), [customBrandWheels]);
  // "14 sets in stock in South Africa, from R 65,000 per set of four": counted from the live catalogue.
  const stockLine = useMemo(() => {
    if (wheels.length === 0) return STATIC_LINE;
    const sets = wheels.reduce((sum, wheel) => sum + (wheel.stockQuantitySets ?? 0), 0);
    const minPrice = Math.min(...wheels.map((wheel) => wheel.priceZAR));
    return `${sets} sets in stock in ${SITE.country}, from ${formatZAR(minPrice)} per set of four.`;
  }, [wheels]);
  // The first design card's cut-out, the same picture the catalogue below leads with. Decorative, so it
  // is only rendered (and so only downloaded) on screens wide enough to show it beside the headline.
  const heroWheel = useMemo(() => heroWheelImage(wheels), [wheels]);
  const showWheel = useMediaMatches(HERO_WHEEL_MEDIA);

  const jumpToCatalogue = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById('catalogue');
    if (!target) return; // fall back to the plain #catalogue link
    event.preventDefault();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <section
      aria-labelledby="home-heading"
      className="relative w-full bg-[#111111] text-[#EDEBE4] overflow-hidden"
    >
      {/* A faint glow behind the headline; decorative only */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_left,_rgba(29,78,216,0.16),_transparent_60%)]"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-10 pt-14 pb-12 sm:pt-20 sm:pb-16 md:pt-20 md:pb-14">
        {heroWheel && showWheel && (
          <img
            {...heroWheel}
            alt=""
            aria-hidden="true"
            width={1000}
            height={1000}
            // The largest picture on the first screen, so it is requested first (prerender-meta.ts
            // also preloads it from dist/index.html).
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="hidden lg:block absolute right-[4%] top-1/2 -translate-y-1/2 h-[82%] w-auto aspect-square object-contain drop-shadow-[0_24px_40px_rgba(0,0,0,0.55)] pointer-events-none"
          />
        )}

        <div className="relative z-10 max-w-xl">
          <h1
            id="home-heading"
            className="text-balance text-4xl sm:text-6xl md:text-7xl font-light tracking-[-0.035em] leading-[1.04] text-white"
          >
            Forged wheels for BMW M cars.
          </h1>
          <p className="mt-5 text-base sm:text-lg leading-relaxed text-neutral-300">{stockLine}</p>
          <a
            href="#catalogue"
            onClick={jumpToCatalogue}
            className="mt-8 inline-flex items-center justify-center min-h-12 px-7 rounded-full bg-[#1D4ED8] hover:bg-[#2563EB] text-white text-base font-medium transition-colors"
          >
            See wheels in stock
          </a>
        </div>
      </div>
    </section>
  );
};
