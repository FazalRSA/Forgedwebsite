import React from 'react';

/** The traced wordmark is 541 × 40 units; width and height attributes keep its box stable before it loads. */
export const WORDMARK_WIDTH = 541;
export const WORDMARK_HEIGHT = 40;

interface BrandLogoProps {
  className?: string;
}

/**
 * The FORGED logo: the gold monogram beside the red and white FORGED SA wordmark.
 * Both are SVGs traced from the business's own logo files, in public/brand/.
 * The images carry no alt text because the link around the logo names it.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({ className = '' }) => (
  <span data-testid="brand-logo" className={`inline-flex items-center gap-2.5 select-none ${className}`}>
    <img src="/brand/forged-monogram.svg" alt="" width={28} height={28} className="h-7 w-7 shrink-0" />
    <img
      src="/brand/forged-wordmark.svg"
      alt=""
      width={WORDMARK_WIDTH}
      height={WORDMARK_HEIGHT}
      className="h-2.5 min-[400px]:h-3 sm:h-3.5 w-auto"
    />
  </span>
);
