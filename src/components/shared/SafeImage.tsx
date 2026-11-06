import React, { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Shown in the fallback card if the image fails to load or no src is given. */
  fallbackLabel?: string;
  /**
   * className for the fallback card when it needs different sizing than the
   * real <img> (e.g. the real image is capped by max-h and sized to its
   * intrinsic dimensions, but the placeholder has none to size from).
   * Defaults to `className`.
   */
  fallbackClassName?: string;
}

/**
 * Drop-in <img> replacement that degrades to a placeholder card instead of a
 * broken-image icon, matching WheelRenderSVG's self-healing behavior for
 * places (Brand Showcase gallery, lightbox) that render raw photo URLs.
 */
export const SafeImage: React.FC<SafeImageProps> = ({
  fallbackLabel,
  fallbackClassName,
  className,
  src,
  onError,
  alt,
  ...rest
}) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={fallbackLabel || alt || 'Image unavailable'}
        className={`flex flex-col items-center justify-center gap-1.5 p-2 bg-[#141418] border border-dashed border-[#26262E] text-[#727280] overflow-hidden ${
          fallbackClassName ?? className ?? ''
        }`}
      >
        <ImageOff className="w-4 h-4 shrink-0" />
        <span className="text-[9px] font-tech-mono uppercase tracking-wider text-center leading-tight line-clamp-2">
          {fallbackLabel || 'Image unavailable'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        setFailed(true);
        onError?.(e);
      }}
      {...rest}
    />
  );
};
