'use client'

import { useId } from 'react'

interface WowCoinProps {
  size?: number
}

export default function WowCoin({ size = 16 }: WowCoinProps) {
  // useId garantit des IDs uniques par instance pour éviter les conflits SVG
  const uid = useId().replace(/[^a-zA-Z0-9]/g, 'x')

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        display:     'inline-block',
        position:    'relative',
        top:         '0.15em',
        marginLeft:  '6px',
        flexShrink:  0,
      }}
      aria-hidden="true"
    >
      <defs>
        {/* Gradient principal : couleur de la pièce */}
        <radialGradient id={`fill-${uid}`} cx="38%" cy="35%" r="65%">
          <stop offset="0%"   stopColor="#ffe97a" />
          <stop offset="28%"  stopColor="#ffb800" />
          <stop offset="58%"  stopColor="#d97000" />
          <stop offset="80%"  stopColor="#a04800" />
          <stop offset="100%" stopColor="#5c2200" />
        </radialGradient>

        {/* Halo doré extérieur */}
        <radialGradient id={`halo-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="70%"  stopColor="#ffb800" stopOpacity="0"   />
          <stop offset="100%" stopColor="#ffb800" stopOpacity="0.4" />
        </radialGradient>

        {/* Drop-shadow doré */}
        <filter id={`shadow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#c9a84c" floodOpacity="0.55" />
        </filter>
      </defs>

      {/* Halo */}
      <circle cx="16" cy="16" r="15.5" fill={`url(#halo-${uid})`} />

      {/* Corps de la pièce */}
      <circle
        cx="16" cy="16" r="13"
        fill={`url(#fill-${uid})`}
        filter={`url(#shadow-${uid})`}
      />

      {/* Bordure fine dorée */}
      <circle
        cx="16" cy="16" r="13"
        fill="none"
        stroke="#ffcc00"
        strokeWidth="0.6"
        strokeOpacity="0.6"
      />

      {/* Reflet principal haut-gauche */}
      <ellipse
        cx="11.5" cy="10.5" rx="5.5" ry="3"
        fill="white"
        fillOpacity="0.42"
        transform="rotate(-30, 11.5, 10.5)"
      />

      {/* Hot spot intense */}
      <circle cx="10.5" cy="9.5" r="2.2" fill="white" fillOpacity="0.68" />

      {/* Ombre bas pour effet 3D */}
      <ellipse cx="16" cy="25.5" rx="9" ry="2.5" fill="#3a1500" fillOpacity="0.28" />
    </svg>
  )
}
