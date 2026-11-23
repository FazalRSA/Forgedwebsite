import React from 'react';
import { brandOfWheel, formatZAR, getWheelImages, WHEEL_BRANDS, type BrandWheelItem } from '../../data/catalogue';
import { sixnineSeriesOfWheel } from '../../data/sixnineSeries';
import { cutoutSrcFor, designOf, formatSizes, isGeneratedPlaceholder, threeQuarterPhoto } from '../../utils/designCards';
import { Link } from '../../utils/router';
import { wheelImageSrcSet } from '../../utils/wheelImageSrcSet';
import { CatalogueSwatch } from './ColourSwatches';
import { WheelOutline } from './WheelCatalogue';

/**
 * How wide the wheel picture is drawn in PRODUCT_GRID_CLASS: two columns on phones, three from
 * 640 px, four from 1024 px inside the 1280 px container, less the tile's 9% padding.
 */
const PRODUCT_CARD_SIZES = '(min-width:1280px) 250px, (min-width:1024px) 20vw, (min-width:640px) 27vw, 40vw';

/** The grid product cards sit in: 2 columns on phones, 3 on tablets, 4 on wide screens. */
export const PRODUCT_GRID_CLASS = 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10';

/**
 * One in-stock listing as a SIXNINE product card (the sixnine-website skill): the whole card is one
 * link; the wheel sits contained on a soft radial tile with a stock badge; under it a small label
 * with the brand and series, the finish as the title, the sizes, then the price per set with the
 * finish's swatch. Every value comes from the catalogue.
 */
export const ProductCard: React.FC<{ wheel: BrandWheelItem; index: number }> = ({ wheel, index }) => {
  const brandId = brandOfWheel(wheel);
  const series = sixnineSeriesOfWheel(wheel);
  // "Sixnine · FF-THREE", "Forged SA · FSA003".
  const label = [brandId ? WHEEL_BRANDS[brandId].shortName : null, series?.code ?? designOf(wheel)].filter(Boolean).join(' · ');
  const finish = wheel.finishName ?? '';
  const sizes = formatSizes(wheel.sizesAvailable);
  const pcd = wheel.technicalSpecSheet?.split('·').map((p) => p.trim()).find((p) => p.startsWith('PCD'))?.replace(/^PCD\s*/, '');
  const sets = wheel.stockQuantitySets ?? 0;

  // The cut-out of the three-quarter photo, like the home page; a photo without one is shown as it is.
  const photo = threeQuarterPhoto(wheel) ?? getWheelImages(wheel).images[0];
  const hasPhoto = Boolean(photo) && !isGeneratedPlaceholder(photo);
  const cutout = cutoutSrcFor(photo);
  const image = cutout ?? (hasPhoto ? photo : undefined);

  return (
    <li>
      <Link to={`/wheels/${wheel.slug}`} className="press-card group grid gap-3.5 content-start">
        <div className="relative aspect-square overflow-hidden rounded-[22px] border border-white/[0.09] bg-[radial-gradient(90%_90%_at_50%_35%,rgba(255,255,255,0.075)_0%,rgba(255,255,255,0.02)_70%)] transition-colors duration-200 group-hover:border-white/[0.18]">
          <span className="absolute left-3 top-3 z-10 rounded-full bg-white px-2.5 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.06em] text-[#111111]">
            {sets > 1 ? `${sets} sets in stock` : 'In stock'}
          </span>
          {image ? (
            <img
              {...wheelImageSrcSet(image, PRODUCT_CARD_SIZES)}
              alt=""
              width={1000}
              height={1000}
              // The first row is what a phone shows on arrival, so it must not wait to be scrolled to.
              loading={index < 2 ? 'eager' : 'lazy'}
              fetchPriority={index === 0 ? 'high' : undefined}
              decoding="async"
              className={`absolute inset-0 h-full w-full object-contain p-[9%] drop-shadow-[0_18px_30px_rgba(0,0,0,0.5)] transition-transform duration-500 ease-[cubic-bezier(.23,1,.32,1)] group-hover:scale-[1.03] motion-reduce:transition-none ${
                cutout ? '' : 'rounded-2xl'
              }`}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <WheelOutline className="h-1/2 w-1/2 text-[#33333E]" />
            </div>
          )}
        </div>
        <div className="grid gap-1 px-1">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-400">{label}</span>
          <h3 className="text-base font-semibold leading-snug tracking-[-0.01em] text-white">{finish || wheel.model}</h3>
          {(sizes || pcd) && (
            <p className="text-sm text-neutral-400 tabular-nums">{[sizes, pcd].filter(Boolean).join(' · ')}</p>
          )}
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="text-[15px] font-semibold text-white tabular-nums">
              {formatZAR(wheel.priceZAR)}
              <span className="ml-1 text-[13px] font-medium text-neutral-400">per set of 4</span>
            </p>
            {/* the same paint as the 3D viewer; decorative, the finish is named in the title */}
            <span aria-hidden="true">
              <CatalogueSwatch finishId={wheel.defaultFinish} name={wheel.finishName} size={18} />
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
};
