import React from 'react';
import { SpokeGeometryType, WheelFinishId } from '../../data/catalogue';

interface VehicleProfileRenderProps {
  make: string;
  model: string;
  primaryColorHex?: string;
  accentColorHex?: string;
  wheelGeometry?: SpokeGeometryType;
  wheelFinish?: WheelFinishId;
  className?: string;
}

export const VehicleProfileRender: React.FC<VehicleProfileRenderProps> = ({
  make,
  model,
  primaryColorHex = '#0F4C35',
  accentColorHex = '#1B7A56',
  className = 'w-full h-auto',
}) => {
  const isSUV =
    // BMW X1–X7, XM and iX model lines from the fitment tree
    /^(x\d|xm|ix)\b/i.test(model.trim()) ||
    model.includes('MACAN') ||
    model.includes('GRENADIER') ||
    model.includes('DBX') ||
    model.includes('DEFENDER') ||
    model.includes('PUROSANGUE');

  const safeModelId = `${make}-${model}`.replace(/[^a-zA-Z0-9_-]/g, '-');

  return (
    <div className={`relative select-none ${className}`}>
      <svg
        viewBox="0 0 900 310"
        className="w-full h-auto overflow-visible"
        role="img"
        aria-label={`${make} ${model} Studio Side Profile with Wheel Placeholders`}
      >
        <defs>
          <linearGradient id={`body-${safeModelId}`} x1="0%" y1="0%" x2="100%" y2="85%">
            <stop offset="0%" stopColor={accentColorHex} />
            <stop offset="50%" stopColor={primaryColorHex} />
            <stop offset="100%" stopColor="#071B12" />
          </linearGradient>
          <linearGradient id="glass-tint" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1E242B" />
            <stop offset="100%" stopColor="#090B0E" />
          </linearGradient>
          <radialGradient id="car-floor-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0,0,0,0.55)" />
            <stop offset="70%" stopColor="rgba(0,0,0,0.2)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
        </defs>

        {/* Floor Studio Shadow */}
        <ellipse cx="450" cy="268" rx="390" ry="20" fill="url(#car-floor-shadow)" />

        {isSUV ? (
          <g>
            <path
              d="M 95 215 L 82 175 Q 85 138 125 130 L 250 120 L 345 64 Q 450 56 645 66 L 735 122 Q 795 130 812 165 L 818 218 L 748 224 A 72 72 0 0 0 596 224 L 316 224 A 72 72 0 0 0 164 224 Z"
              fill={`url(#body-${safeModelId})`}
              stroke="rgba(255,255,255,0.22)"
              strokeWidth="1.5"
            />
            <path
              d="M 272 120 L 352 74 L 628 76 L 695 120 Z"
              fill="url(#glass-tint)"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1.5"
            />
            <line
              x1="130"
              y1="154"
              x2="785"
              y2="150"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
            />
            <rect x="315" y="214" width="280" height="8" fill="#111111" />
          </g>
        ) : (
          <g>
            <path d="M 768 118 L 802 108 L 796 124 Z" fill="#111111" />
            <path d="M 64 222 L 122 222 L 118 230 L 58 228 Z" fill="#111111" />

            <path
              d="M 74 222 L 70 182 Q 78 148 138 136 L 278 124 L 378 72 Q 485 62 595 76 L 702 122 L 788 126 Q 814 142 816 184 L 808 220 L 744 224 A 68 68 0 0 0 600 224 L 314 224 A 68 68 0 0 0 170 224 Z"
              fill={`url(#body-${safeModelId})`}
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1.5"
            />

            <path
              d="M 296 123 L 382 80 Q 485 72 585 84 L 668 123 Z"
              fill="url(#glass-tint)"
              stroke="#111111"
              strokeWidth="2"
            />
            <line x1="485" y1="76" x2="478" y2="123" stroke="#111111" strokeWidth="4" />

            <polygon points="262,146 286,146 280,162 258,162" fill="#0B0C0E" />
            <path
              d="M 286 152 L 778 146"
              stroke="rgba(255,255,255,0.32)"
              strokeWidth="2"
            />

            <path d="M 78 168 L 126 162 L 118 176 L 76 178 Z" fill="#E2F1FF" />
            <path d="M 785 144 L 814 148 L 812 164 L 780 160 Z" fill="#D9232E" />

            <rect x="312" y="216" width="290" height="7" fill="#0D0E10" />
          </g>
        )}

        {/* Front Wheel Arch Placeholder */}
        <g transform="translate(242, 214)">
          <circle
            cx="0"
            cy="0"
            r="56"
            fill="#141414"
            stroke="#737373"
            strokeWidth="2"
            strokeDasharray="6 4"
          />
          <circle cx="0" cy="0" r="38" fill="none" stroke="#404040" strokeWidth="1" />
          <text
            x="0"
            y="-4"
            textAnchor="middle"
            fill="#E5E5E5"
            fontSize="9"
            fontWeight="700"
            letterSpacing="1.2"
            fontFamily="JetBrains Mono, monospace"
          >
            WHEEL
          </text>
          <text
            x="0"
            y="9"
            textAnchor="middle"
            fill="#A3A3A3"
            fontSize="7.5"
            letterSpacing="1"
            fontFamily="JetBrains Mono, monospace"
          >
            PLACEHOLDER
          </text>
        </g>

        {/* Rear Wheel Arch Placeholder */}
        <g transform="translate(672, 214)">
          <circle
            cx="0"
            cy="0"
            r="56"
            fill="#141414"
            stroke="#737373"
            strokeWidth="2"
            strokeDasharray="6 4"
          />
          <circle cx="0" cy="0" r="38" fill="none" stroke="#404040" strokeWidth="1" />
          <text
            x="0"
            y="-4"
            textAnchor="middle"
            fill="#E5E5E5"
            fontSize="9"
            fontWeight="700"
            letterSpacing="1.2"
            fontFamily="JetBrains Mono, monospace"
          >
            WHEEL
          </text>
          <text
            x="0"
            y="9"
            textAnchor="middle"
            fill="#A3A3A3"
            fontSize="7.5"
            letterSpacing="1"
            fontFamily="JetBrains Mono, monospace"
          >
            PLACEHOLDER
          </text>
        </g>
      </svg>
    </div>
  );
};
