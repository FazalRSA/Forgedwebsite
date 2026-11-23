import { type WheelFinishId } from './catalogue';
import stills from './finishStills.json';

/**
 * Studio renders of each wheel design in each colour it comes in: a face-on picture of the wheel itself, round
 * and ready to sit on a colour swatch. They are drawn by `scripts/render-finish-stills.py` from the same 3D
 * model and the same paint numbers (`studioFinishes.ts`) the 3D view uses, so a swatch, the 3D wheel and the
 * to-order colour a visitor previews agree. The script writes `finishStills.json`, the list of pictures that exist.
 */

type StillsFile = Record<string, Record<string, string>>;
const STILLS = stills as StillsFile;

/** The swatch picture for a design in a colour (a served path), or undefined when none was rendered. */
export function finishSwatchSrc(design: string | undefined, finishId: WheelFinishId): string | undefined {
  const code = (design ?? '').trim().toUpperCase();
  return STILLS[code]?.[finishId];
}

/** Every picture there is, as "design / colour" pairs: what the test checks against the files on disk. */
export function allFinishStills(): { design: string; finishId: string; src: string }[] {
  return Object.entries(STILLS).flatMap(([design, byFinish]) =>
    Object.entries(byFinish).map(([finishId, src]) => ({ design, finishId, src }))
  );
}
