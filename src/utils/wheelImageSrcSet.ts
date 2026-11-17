/**
 * The smaller copies of each wheel photo, so a phone showing a 350 px card is not sent the 1600 px
 * file. scripts/make-wheel-sizes.py writes them next to the photo:
 *
 *   /images/wheels/<slug>/front.webp   -> front-400.webp, front-800.webp   (likewise hero, profile)
 *   /images/wheels/<slug>/cutout.webp  -> cutout-600.webp
 *
 * wheelImageSrcSet() turns a photo path into the <img> src, srcset and sizes attributes. Only the
 * site's own photos have smaller copies: anything else (a photo added from the admin page, a
 * generated data: placeholder) gets just its src, so spreading the result onto an <img> adds no
 * srcset for it. src/utils/wheelImageSrcSet.test.ts checks every copy exists on disk.
 */

export interface WheelImageSources {
  src: string;
  srcSet?: string;
  sizes?: string;
}

/** The widths on disk for each photo name, smallest first; the last is the original file. */
export const WHEEL_IMAGE_WIDTHS: Record<string, readonly number[]> = {
  front: [400, 800, 1600],
  hero: [400, 800, 1600],
  profile: [400, 800, 1600],
  cutout: [600, 1000],
};

const SITE_PHOTO = /^(\/images\/wheels\/[^/]+\/)(front|hero|profile|cutout)\.webp$/;

/** The smaller copies of a site photo, smallest first, or [] when the path is not a site photo. */
export function wheelImageVariants(src: string): string[] {
  const match = SITE_PHOTO.exec(src);
  if (!match) return [];
  const [, folder, name] = match;
  const widths = WHEEL_IMAGE_WIDTHS[name];
  return widths.slice(0, -1).map((width) => `${folder}${name}-${width}.webp`);
}

/**
 * src, srcset and sizes for a wheel photo. `sizes` is the width the picture is drawn at, as a CSS
 * sizes attribute (for example "(min-width:1024px) 350px, 60vw"); it is passed through only when
 * there is a srcset for the browser to choose from.
 */
export function wheelImageSrcSet(src: string, sizes: string): WheelImageSources {
  const match = SITE_PHOTO.exec(src);
  if (!match) return { src };
  const [, , name] = match;
  const widths = WHEEL_IMAGE_WIDTHS[name];
  const candidates = [...wheelImageVariants(src), src];
  return {
    src,
    srcSet: candidates.map((path, i) => `${path} ${widths[i]}w`).join(', '),
    sizes,
  };
}
