import React from 'react';

/** One headline, one sentence, one button. The wheels themselves start directly below. */
export const HeroSection: React.FC = () => {
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

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-10 pt-14 pb-12 sm:pt-20 sm:pb-16 md:pt-28 md:pb-20">
        <h1
          id="home-heading"
          className="max-w-4xl text-balance text-4xl sm:text-6xl md:text-7xl font-light tracking-[-0.035em] leading-[1.04] text-white"
        >
          Forged wheels for BMW M cars.
        </h1>
        <p className="mt-5 max-w-xl text-base sm:text-lg leading-relaxed text-neutral-300">
          Every set below is in stock. Prices are in Rand for a set of four.
        </p>
        <a
          href="#catalogue"
          onClick={jumpToCatalogue}
          className="mt-8 inline-flex items-center justify-center min-h-12 px-7 rounded-full bg-[#1D4ED8] hover:bg-[#2563EB] text-white text-base font-medium transition-colors"
        >
          See wheels in stock
        </a>
      </div>
    </section>
  );
};
