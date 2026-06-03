import React, { forwardRef } from 'react';

// Bottle drawn symmetrically around viewBox center (50, 100).
// Total height of the shape = 180 (from y=10 tip to y=190 bottom),
// so the geometric center of the bottle is exactly at y=100.
// This ensures CSS rotation around the SVG center pivots the bottle
// around its own visual middle — it stays put while spinning.
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

      {/* pointer tip (y=10) */}
      <polygon
        points="50,10 44,20 56,20"
        fill="#FFEB3B"
        stroke="#F57F17"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* cap (y=16..28) */}
      <rect x="40" y="16" width="20" height="14" rx="3" fill="url(#cap)" />
      <rect x="40" y="20" width="20" height="2" fill="rgba(0,0,0,0.2)" />

      {/* neck (y=30..60) */}
      <rect x="42" y="30" width="16" height="32" rx="2" fill="url(#glass)" />
      <rect x="44" y="32" width="3" height="28" fill="rgba(255,255,255,0.35)" />

      {/* body (y=60..190 — center is exactly y=100, matching viewBox center) */}
      <path
        d="M42 60 Q26 80 22 100 L22 178 Q22 190 34 190 L66 190 Q78 190 78 178 L78 100 Q74 80 58 60 Z"
        fill="url(#glass)"
      />

      {/* highlights */}
      <path
        d="M30 100 Q28 110 28 130 L28 176 Q28 184 34 184"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M70 100 Q72 110 72 130 L72 176 Q72 184 66 184"
        stroke="rgba(0,0,0,0.25)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />

      {/* label */}
      <rect x="28" y="115" width="44" height="55" rx="4" fill="url(#label)" />
      <rect
        x="28"
        y="115"
        width="44"
        height="55"
        rx="4"
        fill="none"
        stroke="rgba(0,0,0,0.15)"
        strokeWidth="1"
      />
      <circle cx="50" cy="142" r="11" fill="none" stroke="#0077FF" strokeWidth="2.5" />
      <circle cx="50" cy="142" r="4" fill="#7B61FF" />
    </svg>
  );
});

export default BottleSVG;
