import React from 'react';
import { ArrowRight } from 'lucide-react';
import { getAllBrandWheels, getWheelImages, type BrandWheelItem } from '../../data/catalogue';
import {
  diameterRange,
  seriesFacts,
  seriesPath,
  sixnineSeriesOfWheel,
  type SixnineSeries,
} from '../../data/sixnineSeries';
import { cutoutSrcFor, threeQuarterPhoto } from '../../utils/designCards';
import { Link } from '../../utils/router';
import { SIXNINE_RANGE } from '../../data/sixnineRange';
import { wheelImageSrcSet } from '../../utils/wheelImageSrcSet';

/** The shop's in-stock listings of a Sixnine series (FF-1 listings for the FF-ONE, and so on). */
export function stockOfSeries(series: SixnineSeries, wheels: BrandWheelItem[] = getAllBrandWheels()): BrandWheelItem[] {
  return wheels.filter((wheel) => sixnineSeriesOfWheel(wheel)?.code === series.code);
}

/**
 * The picture for a series in the mega menu and the series page's hero: Sixnine's own three-quarter
 * render (the owner confirmed their use on 23 November 2026), else the cut-out of the shop's own photo
 * of a listing in stock, else undefined (the series name is shown, outlined).
 */
export function seriesImage(series: SixnineSeries, wheels?: BrandWheelItem[]): string | undefined {
  const render = SIXNINE_RANGE.find((d) => d.name === series.code)?.render;
  if (render) return render;
  for (const wheel of stockOfSeries(series, wheels)) {
    const cutout = cutoutSrcFor(threeQuarterPhoto(wheel) ?? getWheelImages(wheel).images[0]);
    if (cutout) return cutout;
  }
  return undefined;
}

/** "Forged · 19″ to 22″", the line under a series name. */
export function seriesSummary(series: SixnineSeries): string {
  return [series.construction, diameterRange(seriesFacts(series))].filter(Boolean).join(' · ');
}

/**
 * A series as a tile: its picture (or its name, outlined, when there is no picture) on a soft radial
 * tile, then its name, construction and diameters, and whether the shop has it in stock. Used in the
 * header's mega menu; the pages use the larger SixnineShowcase cards.
 */
export const SixnineSeriesTile: React.FC<{
  series: SixnineSeries;
  inStock: boolean;
  image?: string;
  compact?: boolean;
  onActivate?: () => void;
}> = ({ series, inStock, image, compact = false, onActivate }) => (
  <Link
    to={seriesPath(series)}
    onClick={onActivate}
    className={`press-card group grid content-start ${compact ? 'gap-2' : 'gap-3'}`}
  >
    <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] border border-white/[0.09] bg-[radial-gradient(90%_90%_at_50%_35%,rgba(255,255,255,0.075)_0%,rgba(255,255,255,0.02)_70%)] transition-colors duration-200 group-hover:border-white/[0.18]">
      {inStock && (
        <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-[#111111]">
          In stock
        </span>
      )}
      {image ? (
        <img
          // Drawn about 220 px wide in the mega menu, a third to a fifth of the page in the grids.
          {...wheelImageSrcSet(image, compact ? '220px' : '(min-width:1024px) 20vw, (min-width:640px) 30vw, 45vw')}
          alt=""
          width={600}
          height={600}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-contain p-[8%] drop-shadow-[0_14px_24px_rgba(0,0,0,0.5)] transition-transform duration-500 ease-[cubic-bezier(.23,1,.32,1)] group-hover:scale-[1.04] motion-reduce:transition-none"
        />
      ) : (
        // No photo of our own yet: the series name, outlined, the way Sixnine sets its model names.
        <span
          aria-hidden="true"
          className={`absolute inset-0 flex items-center justify-center font-[family-name:var(--font-display)] font-black uppercase tracking-[-0.03em] text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.45)] ${
            compact ? 'text-2xl' : 'text-4xl sm:text-5xl'
          }`}
        >
          {series.code}
        </span>
      )}
    </div>
    <div className="flex items-start justify-between gap-2 px-1">
      <div className="min-w-0">
        <span className={`block font-semibold text-white ${compact ? 'text-sm' : 'text-base'}`}>{series.code}</span>
        <span className="block text-xs text-neutral-400">{seriesSummary(series)}</span>
      </div>
      {!compact && (
        <span
          aria-hidden="true"
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors group-hover:bg-white group-hover:text-[#111111]"
        >
          <ArrowRight className="h-4 w-4" />
        </span>
      )}
    </div>
  </Link>
);
