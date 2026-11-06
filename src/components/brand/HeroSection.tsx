import React from 'react';
import { useRouter } from '../../utils/router';

/**
 * Set HERO_VIDEO_SRC to your background video path when ready
 * (e.g., '/assets/hero-background.mp4' or '/assets/hero-background.webm').
 */
export const HERO_VIDEO_SRC = '';

interface HeroSectionProps {
  videoSrc?: string;
  posterSrc?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  videoSrc = HERO_VIDEO_SRC,
  posterSrc,
}) => {
  const { navigate } = useRouter();

  return (
    <section className="relative w-full min-h-[75vh] sm:min-h-[85vh] bg-[#0A0A0A] text-[#F5F5F7] flex flex-col justify-end overflow-hidden border-b border-[#1E1E24]">
      {/* Mobile-Responsive Background Video Layer */}
      <div
        aria-hidden="true"
        className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0"
      >
        {videoSrc ? (
          <video
            key={videoSrc}
            src={videoSrc}
            poster={posterSrc}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="w-full h-full object-cover object-center scale-100"
          />
        ) : (
          /* Subtle fallback studio backdrop until video file is added */
          <div className="w-full h-full bg-[radial-gradient(ellipse_at_top,_rgba(255,85,0,0.08),_transparent_65%),_linear-gradient(to_bottom,_#0D0D10,_#0A0A0A)]" />
        )}

        {/* Multi-stop gradient scrim for mobile & desktop text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-black/30" />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 max-w-7xl w-full mx-auto py-16 sm:py-24 md:py-28 px-4 sm:px-6 md:px-12 flex flex-col md:flex-row md:items-end justify-between gap-8 sm:gap-10">
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-tech-mono tracking-[0.2em] uppercase text-[#FF5500]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500]" />
            <span>Market Leader · Bespoke Forged Wheels</span>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-light tracking-[-0.035em] leading-[1.05] text-white">
            The pinnacle of custom forged engineering.
          </h1>
          <p className="text-base sm:text-lg text-neutral-300 font-light max-w-2xl leading-relaxed pt-1">
            Engineered from 6061-T6 aerospace aluminum with zero-rub hub-centric precision for the world&apos;s most demanding performance platforms.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/#catalogue')}
            className="bg-[#FF5500] hover:bg-[#FF6B1A] text-white rounded-full px-6 py-3.5 text-xs font-tech-mono uppercase tracking-[0.14em] font-semibold transition-all shadow-[0_0_24px_rgba(255,85,0,0.25)] cursor-pointer whitespace-nowrap"
          >
            Wheel Catalogue →
          </button>

          <button
            type="button"
            onClick={() => navigate('/store')}
            className="border border-white/20 bg-black/40 backdrop-blur-sm hover:border-[#FF5500] text-neutral-200 hover:text-white rounded-full px-6 py-3.5 text-xs font-tech-mono uppercase tracking-[0.14em] transition-colors cursor-pointer whitespace-nowrap"
          >
            Vehicle Fitment Store ↗
          </button>
        </div>
      </div>
    </section>
  );
};
