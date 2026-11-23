import { getWheelImages, type BrandWheelItem } from '../data/catalogue';
import { SIXNINE_RANGE } from '../data/sixnineRange';
import {
  seriesPath,
  SIXNINE_SERIES,
  sixnineSeriesOfWheel,
  sizeLine,
  type SixnineSeries,
} from '../data/sixnineSeries';
import { cutoutSrcFor, threeQuarterPhoto } from './designCards';

/**
 * The data behind the SIXNINE-style showcase cards ("New at Sixnine" and "Find your design"): which
 * picture a series shows and which series or sizes count as new. Everything is read from the catalogue
 * and the Sixnine range data, so nothing on the cards is typed by hand.
 */

export interface ShowcasePicture {
  src: string;
  /**
   * True for the shop's own cut-out, already shot at three-quarters like Sixnine's renders. False for
   * a face-on picture from public/images/sixnine, which the card turns to three-quarters itself.
   */
  angled: boolean;
}

/**
 * The picture for a series card. Sixnine's own three-quarter render comes first, so every series card
 * matches SIXNINE's storefront (the owner confirmed their use on 23 November 2026); the shop's own
 * photos stay on its stock cards and wheel pages. Without a render: the shop's cut-out of a listing in
 * stock, then the face-on range picture, then undefined (the card shows the series name, outlined).
 */
export function showcasePicture(series: SixnineSeries, wheels: BrandWheelItem[]): ShowcasePicture | undefined {
  const render = SIXNINE_RANGE.find((d) => d.name === series.code)?.render;
  if (render) return { src: render, angled: true };
  for (const wheel of wheels) {
    if (sixnineSeriesOfWheel(wheel)?.code !== series.code) continue;
    const cutout = cutoutSrcFor(threeQuarterPhoto(wheel) ?? getWheelImages(wheel).images[0]);
    if (cutout) return { src: cutout, angled: true };
  }
  const design = SIXNINE_RANGE.find((d) => d.name === series.code);
  return design ? { src: design.image, angled: false } : undefined;
}

/** The one-line description of a series, as the range section words it ("One wheel, five designs"). */
export const seriesTagline = (series: SixnineSeries): string | undefined =>
  SIXNINE_RANGE.find((d) => d.name === series.code)?.tagline;

export interface SixnineNewsItem {
  key: string;
  series: SixnineSeries;
  badge: string;
  title: string;
  description: string;
  to: string;
}

/**
 * "New at Sixnine": what Sixnine has on pre-order. A series whose every size is on pre-order is one
 * card (the EVO-TWO); a single pre-order size of an existing series is a card of its own, named after
 * the car it is made for when Sixnine gives one (the FF-THREE for the Audi RS5 B10). Pre-order is the
 * only signal used, because it is the only one the range data records.
 */
export function sixnineNews(series: readonly SixnineSeries[] = SIXNINE_SERIES): SixnineNewsItem[] {
  const items: SixnineNewsItem[] = [];
  for (const s of series) {
    const preOrder = s.sizes.filter((size) => size.preOrder);
    if (!preOrder.length) continue;
    if (preOrder.length === s.sizes.length) {
      const tagline = seriesTagline(s);
      items.push({
        key: s.slug,
        series: s,
        badge: 'Pre-order',
        title: s.code,
        description: `${tagline ? `${tagline}. ` : ''}On pre-order with Sixnine.`,
        to: seriesPath(s),
      });
      continue;
    }
    preOrder.forEach((size, i) => {
      items.push({
        key: `${s.slug}-${i}`,
        series: s,
        badge: 'Pre-order',
        title: size.note ? `${s.code} for ${size.note}` : `${s.code} ${size.size ?? ''}`.trim(),
        description: `${sizeLine(size)}, on pre-order with Sixnine.`,
        to: `${seriesPath(s)}#sizes`,
      });
    });
  }
  // Whole series on pre-order first, as Sixnine leads with its newest design.
  return items.sort((a, b) => Number(b.to === seriesPath(b.series)) - Number(a.to === seriesPath(a.series)));
}
