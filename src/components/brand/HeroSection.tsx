import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { SITE } from '../../config/site';
import { formatZAR, getAllBrandWheels } from '../../data/catalogue';
import { useForgedStore } from '../../store/useForgedStore';
import {
  HERO_POSTER_SIZES,
  HERO_POSTER_SRCSET,
  HERO_VIDEO,
  HERO_VIDEO_SMALL_MEDIA,
  heroVideoAllowed,
} from '../../utils/heroVideo';

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

/** Whether the browser says the visitor turned on a data saver (Chrome on Android, Opera). */
function prefersSavingData(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
}

/**
 * One headline, one sentence, one button, over the brand film. The film is muted, loops, plays only
 * while the hero is on screen, and has a pause button (WCAG 2.2.2). Visitors who ask for reduced
 * motion or a data saver get its first frame as a still and download no video.
 */
export const HeroSection: React.FC = () => {
  const customBrandWheels = useForgedStore((state) => state.customBrandWheels);
  // getAllBrandWheels returns only wheels that are in stock.
  const wheels = useMemo(() => getAllBrandWheels(customBrandWheels), [customBrandWheels]);
  // "Forged wheels for BMW M cars. 14 sets in stock in South Africa, from R 65,000 per set of four.",
  // counted from the live catalogue. The headline speaks for the brand; this line says what is for sale
  // and carries the words the page is found by (the home <title> says the same).
  const stockLine = useMemo(() => {
    if (wheels.length === 0) return STATIC_LINE;
    const sets = wheels.reduce((sum, wheel) => sum + (wheel.stockQuantitySets ?? 0), 0);
    const minPrice = Math.min(...wheels.map((wheel) => wheel.priceZAR));
    return `Forged wheels for BMW M cars. ${sets} sets in stock in ${SITE.country}, from ${formatZAR(minPrice)} per set of four.`;
  }, [wheels]);

  const small = useMediaMatches(HERO_VIDEO_SMALL_MEDIA);
  const reducedMotion = useMediaMatches('(prefers-reduced-motion: reduce)');
  const [saveData] = useState(prefersSavingData);
  const filmAllowed = heroVideoAllowed({ reducedMotion, saveData });
  const film = HERO_VIDEO[small ? 'small' : 'large'];

  const videoRef = useRef<HTMLVideoElement>(null);
  const [userPaused, setUserPaused] = useState(false);
  const [playing, setPlaying] = useState(false);
  // The film (by its first source) that has drawn a frame, so a newly swapped-in size fades in too.
  const [filmWithFrames, setFilmWithFrames] = useState<string>();
  const hasFrames = filmWithFrames === film.sources[0].src;

  // Play while at least part of the hero is on screen, pause once it scrolls away (no decoding,
  // no battery spent on a film nobody sees), and never restart a film the visitor paused.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !filmAllowed) return;
    if (userPaused) {
      video.pause();
      return;
    }
    // play() is refused when the browser blocks autoplay (an iPhone in Low Power Mode, for one).
    // The still stays, and the button offers Play, which works because it is a tap.
    const play = () => void video.play().catch(() => setPlaying(false));
    if (typeof IntersectionObserver !== 'function') {
      play();
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? play() : video.pause()),
      { threshold: 0.1 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [filmAllowed, userPaused, film]);

  const toggleFilm = () => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) {
      setUserPaused(true);
      video.pause();
    } else {
      setUserPaused(false);
      void video.play().catch(() => setPlaying(false));
    }
  };

  const jumpToCatalogue = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById('catalogue');
    if (!target) return; // fall back to the plain #catalogue link
    event.preventDefault();
    target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <section
      aria-labelledby="home-heading"
      className="relative isolate w-full bg-[#111111] text-[#EDEBE4] overflow-hidden"
    >
      {/* The film and its first frame; decorative only */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 pointer-events-none">
        <img
          src={HERO_VIDEO.large.poster}
          srcSet={HERO_POSTER_SRCSET}
          sizes={HERO_POSTER_SIZES}
          alt=""
          width={HERO_VIDEO.large.width}
          height={HERO_VIDEO.large.height}
          // The largest picture on the first screen, so it is requested first (prerender-meta.ts
          // also preloads it from dist/index.html).
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {filmAllowed && (
          <video
            // A new size is a new film: remount so the browser picks its sources afresh.
            key={film.sources[0].src}
            ref={videoRef}
            muted
            loop
            playsInline
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
            tabIndex={-1}
            onPlaying={() => {
              setPlaying(true);
              setFilmWithFrames(film.sources[0].src);
            }}
            onPause={() => setPlaying(false)}
            // Shown only once it has frames, so a slow start never flashes black over the still.
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              hasFrames ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {film.sources.map((source) => (
              <source key={source.src} src={source.src} type={source.type} />
            ))}
          </video>
        )}
        {/* Darkens the film behind the words: from below on phones, from the left on wide screens */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/95 via-[#111111]/50 to-[#111111]/15 lg:bg-gradient-to-r lg:from-[#111111]/95 lg:via-[#111111]/70 lg:to-[#111111]/10" />
        {/* Fades the bottom edge into the catalogue below */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#111111] to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-10 flex items-end lg:items-center min-h-[32rem] sm:min-h-[36rem] lg:min-h-[min(78svh,46rem)] pt-24 pb-12 sm:pb-16 lg:py-20">
        <div className="max-w-5xl">
          <h1
            id="home-heading"
            className="text-balance text-4xl sm:text-6xl lg:text-7xl font-light tracking-[-0.035em] leading-[1.04] text-white"
          >
            {/* How every wheel here is made, in the words of the forged-vs-cast guide on the blog: a cast
                wheel is poured into a mould; a forged one is pressed from a solid block, then machined. */}
            Forged, not cast.{' '}
            <span className="block text-neutral-300">Pressed from solid aluminium.</span>
          </h1>
          <p className="mt-5 max-w-xl text-pretty text-base sm:text-lg leading-relaxed text-neutral-200 [text-shadow:0_1px_12px_rgba(0,0,0,0.7)]">{stockLine}</p>
          <a
            href="#catalogue"
            onClick={jumpToCatalogue}
            className="mt-8 inline-flex items-center justify-center min-h-12 px-7 rounded-full bg-[#1D4ED8] hover:bg-[#2563EB] text-white text-base font-medium transition-colors"
          >
            See wheels in stock
          </a>
        </div>
      </div>

      {filmAllowed && (
        <button
          type="button"
          onClick={toggleFilm}
          aria-label={playing ? 'Pause the background film' : 'Play the background film'}
          className="absolute bottom-12 right-4 sm:bottom-16 sm:right-6 md:right-10 lg:bottom-8 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-white ring-1 ring-white/25 backdrop-blur-sm transition-colors hover:bg-black/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4 translate-x-px" aria-hidden="true" />}
        </button>
      )}
    </section>
  );
};
