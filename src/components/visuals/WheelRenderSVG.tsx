import React, { useState, useEffect } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { SpokeGeometryType, WHEEL_FINISHES, WheelFinishId } from '../../data/kahnData';

interface WheelRenderSVGProps {
  geometry: SpokeGeometryType;
  finish?: WheelFinishId;
  rotationDeg?: number;
  viewAngle?: 'front' | 'three-quarter' | 'concave-detail' | 'barrel-profile';
  className?: string;
  showShadow?: boolean;
  imageUrl?: string;
  label?: string;
}

const ANGLE_LABELS: Record<
  NonNullable<WheelRenderSVGProps['viewAngle']>,
  string
> = {
  'front': 'FRONT FACE PLACEHOLDER',
  'three-quarter': '3/4 PROFILE PLACEHOLDER',
  'concave-detail': 'DETAIL PLACEHOLDER',
  'barrel-profile': 'BARREL PLACEHOLDER',
};

export const WheelRenderSVG: React.FC<WheelRenderSVGProps> = ({
  geometry,
  finish = 'silver',
  rotationDeg = 0,
  viewAngle = 'front',
  className = 'w-full h-full',
  imageUrl,
  label,
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [imageUrl]);

  if (imageUrl && !imgFailed) {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <img
          src={imageUrl}
          alt={label || `FORGED Custom wheels (${geometry})`}
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          style={{
            transform: `rotate(${rotationDeg}deg) ${
              viewAngle === 'three-quarter'
                ? 'scale(0.94, 1)'
                : viewAngle === 'concave-detail'
                ? 'scale(1.18)'
                : 'scale(1)'
            }`,
          }}
          className="w-full h-full object-contain transition-transform duration-150"
        />
      </div>
    );
  }

  const palette = WHEEL_FINISHES[finish] ?? WHEEL_FINISHES.silver;
  const angleLabel = ANGLE_LABELS[viewAngle] ?? ANGLE_LABELS.front;

  return (
    <div
      data-testid="wheel-image-placeholder"
      role="img"
      aria-label={label || `Wheel Image Placeholder (${palette.name})`}
      className={`relative w-full h-full min-h-[96px] aspect-square rounded-2xl border-2 border-dashed border-[#26262E] bg-[#141418] text-[#F5F5F7] flex flex-col items-center justify-center p-3 sm:p-5 text-center select-none overflow-hidden ${className}`}
    >
      {/* Subtle architectural grid background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Corner registration ticks */}
      <div className="absolute inset-2.5 pointer-events-none">
        <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-[#33333E]" />
        <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-[#33333E]" />
        <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-[#33333E]" />
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-[#33333E]" />
      </div>

      {/* Center placeholder badge */}
      <div
        style={{
          transform: rotationDeg ? `rotate(${rotationDeg}deg)` : undefined,
        }}
        className="relative z-10 flex flex-col items-center justify-center gap-1.5 transition-transform duration-150"
      >
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#18181D] border border-[#26262E] flex items-center justify-center shadow-md">
          <ImageIcon className="w-5 h-5 text-[#FF5500]" />
        </div>

        <span className="text-[10px] sm:text-xs font-tech-mono font-bold uppercase tracking-[0.14em] text-[#F5F5F7] leading-tight">
          {label || 'WHEEL PLACEHOLDER'}
        </span>

        <span className="text-[9px] sm:text-[10px] font-tech-mono uppercase tracking-[0.12em] text-[#C2C2CC]">
          {angleLabel}
        </span>

        {/* Finish Swatch Pill */}
        <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#18181D] border border-[#26262E] text-[9px] font-tech-mono uppercase tracking-wider text-[#C2C2CC]">
          <span
            className="w-2 h-2 rounded-full border border-neutral-600 shrink-0"
            style={{ backgroundColor: palette.swatchHex }}
          />
          <span className="truncate max-w-[110px]">{palette.name}</span>
        </div>
      </div>
    </div>
  );
};
