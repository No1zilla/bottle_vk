import React, { forwardRef } from 'react';

// Bottle is drawn symmetrically around the viewBox center (50, 100).
// Top of the cap is at y = 0 (12 o'clock), tail of the bottle is at y = 200.
// Because the bottle visually points UPWARD at rotation = 0, we can rotate
// it by an angle equal to the target player's clockwise position from 12.
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
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="glass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1B5E20" />
          <stop offset="35%" stopColor="#43A047" />
          <stop offset="60%" stopColor="#66BB6A" />
          <stop offset="100%" stopColor="#1B5E20" />
        </linearGradient>
        <linearGradient id="cap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD54F" />
          <stop offset="100%" stopColor="#F57F17" />
        </linearGradient>
        <linearGradient id="label" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#e0e0e0" />
        </linearGradient>
      </defs>

      {/* All shapes are translated so the visual axis is centered around (50, 100).
          Cap at the very top (y=0..14), body extending downward to y=196. */}

      {/* pointer arrow at the very tip — same direction the bottle points */}
      <polygon
        points="50,0 44,12 56,12"
        fill="#FFEB3B"
        stroke="#F57F17"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* cap */}
      <rect x="40" y="8" width="20" height="14" rx="3" fill="url(#cap)" />
      <rect x="40" y="12" width="20" height="2" fill="rgba(0,0,0,0.2)" />

      {/* neck */}
      <rect x="42" y="22" width="16" height="36" rx="2" fill="url(#glass)" />
      <rect x="44" y="24" width="3" height="32" fill="rgba(255,255,255,0.35)" />

      {/* body */}
      <path
        d="M42 58 Q26 78 22 100 L22 186 Q22 198 34 198 L66 198 Q78 198 78 186 L78 100 Q74 78 58 58 Z"
        fill="url(#glass)"
      />

      {/* highlights */}
      <path
        d="M30 100 Q28 110 28 130 L28 184 Q28 192 34 192"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M70 100 Q72 110 72 130 L72 184 Q72 192 66 192"
        stroke="rgba(0,0,0,0.25)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />

      {/* label */}
      <rect x="28" y="118" width="44" height="56" rx="4" fill="url(#label)" />
      <rect
        x="28"
        y="118"
        width="44"
        height="56"
        rx="4"
        fill="none"
        stroke="rgba(0,0,0,0.15)"
        strokeWidth="1"
      />
      <circle cx="50" cy="146" r="11" fill="none" stroke="#0077FF" strokeWidth="2.5" />
      <circle cx="50" cy="146" r="4" fill="#7B61FF" />
    </svg>
  );
});

export default BottleSVG;
