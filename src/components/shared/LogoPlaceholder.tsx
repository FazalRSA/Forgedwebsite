import React from 'react';

interface LogoPlaceholderProps {
  label?: string;
  variant?: 'dark' | 'light' | 'compact';
  className?: string;
}

export const LogoPlaceholder: React.FC<LogoPlaceholderProps> = ({
  label,
  variant = 'dark',
  className = '',
}) => {
  if (variant === 'compact') {
    return (
      <span
        data-testid="brand-logo-mark"
        className={`inline-flex items-center gap-2 text-xs font-medium tracking-[0.2em] uppercase select-none text-white ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500]" />
        <span className="font-semibold">FORGED</span>
        {label && label !== 'IMAGE PLACEHOLDER' && label !== 'IMAGE PLACEHOLDER · LOGO' && (
          <span className="text-[10px] text-neutral-400 font-tech-mono font-normal">
            · {label}
          </span>
        )}
      </span>
    );
  }

  return (
    <div
      data-testid="brand-logo-mark"
      className={`inline-flex items-center gap-2.5 select-none ${className}`}
    >
      <div className="w-6 h-6 rounded-lg bg-[#18181D] border border-[#26262E] flex items-center justify-center text-[#FF5500] text-[10px] font-tech-mono font-bold">
        F
      </div>
      <div className="flex flex-col text-left">
        <span className="text-xs font-semibold tracking-[0.22em] text-white uppercase leading-none">
          FORGED
        </span>
        <span className="text-[9px] font-tech-mono tracking-[0.18em] text-neutral-400 uppercase mt-0.5">
          Custom Wheels
        </span>
      </div>
    </div>
  );
};
