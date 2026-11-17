/**
 * The 800 px copies of the customer-install photos, so a phone showing a 175 px thumbnail is not
 * sent the 1600 px file. scripts/fitment-reshoot/build_site_data.py writes them next to each photo:
 *
 *   /assets/fitments/<id>/front34.webp  -> front34_800.webp   (likewise side)
 *   /assets/fitments/<id>/original.webp -> original_800.webp
 *
 * fitmentImageSrcSet() turns a photo path into the <img> src, srcset and sizes attributes. Only the
 * two studio re-shoots get a srcset: they are always 1600 x 1200, so their width descriptors are
 * known. The owner's original photo can be any shape, so it keeps just its src (the lightbox shows
 * it at full size anyway). src/utils/fitmentImageSrcSet.test.ts checks every 800 px copy exists.
 */

export interface FitmentImageSources {
  src: string;
  srcSet?: string;
  sizes?: string;
}

/** Widths on disk for the studio photos, smallest first; the last is the original file. */
export const FITMENT_IMAGE_WIDTHS: readonly number[] = [800, 1600];

const STUDIO_PHOTO = /^(\/assets\/fitments\/[^/]+\/)(front34|side)\.webp$/;
const ANY_PHOTO = /^(\/assets\/fitments\/[^/]+\/)(front34|side|original)\.webp$/;

/** Path of the 800 px copy of any install photo, or null when the path is not an install photo. */
export function fitmentThumbnail(src: string): string | null {
  const match = ANY_PHOTO.exec(src);
  if (!match) return null;
  const [, folder, name] = match;
  return `${folder}${name}_800.webp`;
}

/**
 * src, srcset and sizes for an install photo. `sizes` is the width the picture is drawn at, as a CSS
 * sizes attribute (for example "(min-width:1280px) 285px, 48vw"); it is passed through only when
 * there is a srcset for the browser to choose from.
 */
export function fitmentImageSrcSet(src: string, sizes: string): FitmentImageSources {
  if (!STUDIO_PHOTO.test(src)) return { src };
  const candidates = [fitmentThumbnail(src) as string, src];
  return {
    src,
    srcSet: candidates.map((path, i) => `${path} ${FITMENT_IMAGE_WIDTHS[i]}w`).join(', '),
    sizes,
  };
}
