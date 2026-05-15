import React, { forwardRef } from 'react';

const BottleSVG = forwardRef(function BottleSVG(
  { width = 100, height = 220, className = '', style },
  ref
) {
  return (
    <svg
      ref={ref}
      className={className}
      style={style}
      width={width}
      height={height}
      viewBox="0 0 100 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
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

      {/* cap */}
      <rect x="40" y="2" width="20" height="14" rx="3" fill="url(#cap)" />
      <rect x="40" y="6" width="20" height="2" fill="rgba(0,0,0,0.2)" />

      {/* neck */}
      <rect x="42" y="16" width="16" height="40" rx="2" fill="url(#glass)" />
      <rect x="44" y="18" width="3" height="36" fill="rgba(255,255,255,0.35)" />

      {/* body */}
      <path
        d="M42 56 Q26 76 22 100 L22 200 Q22 214 36 214 L64 214 Q78 214 78 200 L78 100 Q74 76 58 56 Z"
        fill="url(#glass)"
      />

      {/* highlight */}
      <path
        d="M30 100 Q28 110 28 130 L28 196 Q28 204 34 204"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M70 100 Q72 110 72 130 L72 196 Q72 204 66 204"
        stroke="rgba(0,0,0,0.25)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />

      {/* label */}
      <rect x="28" y="120" width="44" height="60" rx="4" fill="url(#label)" />
      <rect
        x="28"
        y="120"
        width="44"
        height="60"
        rx="4"
        fill="none"
        stroke="rgba(0,0,0,0.15)"
        strokeWidth="1"
      />
      <text
        x="50"
        y="148"
        textAnchor="middle"
        fontSize="14"
        fill="#0077FF"
        fontWeight="800"
        fontFamily="Inter, sans-serif"
      >
        VK
      </text>
      <text
        x="50"
        y="168"
        textAnchor="middle"
        fontSize="9"
        fill="#7B61FF"
        fontWeight="700"
        fontFamily="Inter, sans-serif"
      >
        ИГРА
      </text>
    </svg>
  );
});

export default BottleSVG;
