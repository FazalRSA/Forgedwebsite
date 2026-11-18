/**
 * The film behind the home page hero. The files are made from one source video by
 * scripts/make-hero-video.sh into public/video/; this module is the only place that names them, so
 * HeroSection and the poster preload that scripts/prerender-meta.ts writes into dist/index.html
 * always agree.
 */

/** Phones get the 854×480 film; wider screens the 1280×720 one. */
export const HERO_VIDEO_SMALL_MEDIA = '(max-width: 767px)';

/** One encoding of the film. `type` carries the codec, so a browser skips what it cannot play. */
export interface HeroVideoSource {
  src: string;
  type: string;
}

/** One size of the film: its encodings in order of preference, and the first frame as a still. */
export interface HeroVideoSize {
  width: number;
  height: number;
  poster: string;
  sources: HeroVideoSource[];
}

/**
 * AV1 first (about half the bytes of H.264 at the same look), then H.264, which plays everywhere.
 * The codec strings match the encoder settings in scripts/make-hero-video.sh: AV1 main profile,
 * 8-bit, level 3.1 (1280) and 3.0 (854); H.264 High profile, level 4.0 (1280) and 3.1 (854).
 * Safari only reports AV1 as playable where the device decodes it in hardware, so older iPhones
 * and Macs fall through to H.264 instead of decoding AV1 in software.
 */
export const HERO_VIDEO: Record<'small' | 'large', HeroVideoSize> = {
  large: {
    width: 1280,
    height: 720,
    poster: '/video/hero-poster-1280.webp',
    sources: [
      { src: '/video/hero-1280-av1.mp4', type: 'video/mp4; codecs="av01.0.05M.08"' },
      { src: '/video/hero-1280.mp4', type: 'video/mp4; codecs="avc1.640028"' },
    ],
  },
  small: {
    width: 854,
    height: 480,
    poster: '/video/hero-poster-854.webp',
    sources: [
      { src: '/video/hero-854-av1.mp4', type: 'video/mp4; codecs="av01.0.04M.08"' },
      { src: '/video/hero-854.mp4', type: 'video/mp4; codecs="avc1.64001F"' },
    ],
  },
};

/**
 * The still under the film, as an <img> srcset. It is what the visitor sees first (and the
 * largest thing on the first screen), what stays when the film does not play, and what the build
 * preloads. The film covers the hero, which is as wide as the window.
 */
export const HERO_POSTER_SRCSET = [HERO_VIDEO.small, HERO_VIDEO.large]
  .map((size) => `${size.poster} ${size.width}w`)
  .join(', ');
export const HERO_POSTER_SIZES = '100vw';

/**
 * Whether the film plays at all. Not for visitors whose device asks for reduced motion, nor for
 * those who turned on a data saver: they see the still and download no video.
 */
export function heroVideoAllowed(visitor: { reducedMotion: boolean; saveData: boolean }): boolean {
  return !visitor.reducedMotion && !visitor.saveData;
}
