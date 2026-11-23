import React, { useEffect, useState } from 'react';
import { defaultPaintRenderer, type PaintRenderer, type StudioFinish } from './paint';
import { cachedSwatch, fallbackSwatchBackground, swatchFor } from './swatch';
import './wheel-viewer.css';

export interface FinishSwatchProps {
  finish: StudioFinish;
  /** Edge in CSS pixels. Defaults to 28. */
  size?: number;
  /** Pass the same renderer the stage gets, so the swatch and the wheel are painted alike. */
  paint?: PaintRenderer;
  className?: string;
}

/**
 * A swatch of a finish. When the finish carries a `swatchImage` (a studio render of the wheel itself in that
 * colour) it shows that picture. Otherwise it is a ball dressed in the wheel's own paint under the stage's
 * reflections (see swatch.ts). Decorative: put the finish's name next to it. Until the picture is ready, or
 * when the device has no WebGL, it shows a drawn ball in the finish's dot colour, so there is never a gap.
 */
export const FinishSwatch = ({ finish, size = 28, paint = defaultPaintRenderer, className }: FinishSwatchProps) => {
  const image = finish.swatchImage;
  const [src, setSrc] = useState<string | null>(() => (image ? null : cachedSwatch(finish, size, paint)));
  const paintKey = JSON.stringify([finish.name, finish.paint]);

  useEffect(() => {
    if (image) return; // a picture of the wheel needs no drawing
    let live = true;
    const hit = cachedSwatch(finish, size, paint);
    if (hit) {
      setSrc(hit);
      return;
    }
    setSrc(null);
    swatchFor({ finish, size, paint }).then((url) => {
      if (live) setSrc(url);
    });
    return () => {
      live = false;
    };
    // by value: a catalogue reload hands over new objects with the same numbers
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paintKey, size, paint, image]);

  const shown = image ?? src;
  return (
    <span
      aria-hidden="true"
      className={`wv-finish-swatch${className ? ` ${className}` : ''}`}
      style={{
        width: size,
        height: size,
        background: shown ? 'transparent' : fallbackSwatchBackground(finish.swatchHex),
      }}
    >
      {shown && <img src={shown} alt="" width={size} height={size} draggable={false} decoding="async" />}
    </span>
  );
};
