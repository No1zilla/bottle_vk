import React, { forwardRef } from 'react';

// Bottle drawn symmetrically around viewBox center (50, 100).
// Total height of the shape = 180 (from y=10 tip to y=190 bottom),
// so the geometric center of the bottle is exactly at y=100.
// Solid colors (no SVG gradients) for guaranteed rendering on Safari iOS.
const GLASS = '#2E7D32';
const GLASS_DARK = '#1B5E20';
const GLASS_LIGHT = '#66BB6A';
const CAP = '#F57F17';
const CAP_LIGHT = '#FFB300';
const LABEL_BG = '#fff';

const BottleSVG = forwardRef(function BottleSVG(
  { width = 100, height = 200, className = '', style },
  ref
) {
  return (
    <svg
      ref={ref}
      className={className}
      style={style}
      width={width}
      height={height}
      viewBox="0 0 100 200"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* pointer tip (y=10) */}
      <polygon
        points="50,10 44,20 56,20"
        fill="#FFEB3B"
        stroke="#F57F17"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* cap */}
      <rect x="40" y="16" width="20" height="14" rx="3" fill={CAP} />
      <rect x="40" y="16" width="20" height="6" rx="2" fill={CAP_LIGHT} />

      {/* neck */}
      <rect x="42" y="30" width="16" height="32" rx="2" fill={GLASS} />
      <rect x="44" y="32" width="3" height="28" fill="rgba(255,255,255,0.35)" />

      {/* body */}
      <path
        d="M42 60 Q26 80 22 100 L22 178 Q22 190 34 190 L66 190 Q78 190 78 178 L78 100 Q74 80 58 60 Z"
        fill={GLASS}
      />

      {/* light edge */}
      <path
        d="M30 100 Q28 110 28 130 L28 176 Q28 184 34 184"
        stroke={GLASS_LIGHT}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      {/* dark edge */}
      <path
        d="M70 100 Q72 110 72 130 L72 176 Q72 184 66 184"
        stroke={GLASS_DARK}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />

      {/* label */}
      <rect x="28" y="115" width="44" height="55" rx="4" fill={LABEL_BG} />
      <rect
        x="28"
        y="115"
        width="44"
        height="55"
        rx="4"
        fill="none"
        stroke="rgba(0,0,0,0.2)"
        strokeWidth="1"
      />
      <circle cx="50" cy="142" r="11" fill="none" stroke="#0077FF" strokeWidth="2.5" />
      <circle cx="50" cy="142" r="4" fill="#7B61FF" />
    </svg>
  );
});

export default BottleSVG;
