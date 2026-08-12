import React from 'react';

interface TyreLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark' | 'gradient';
}

export const TyreLogo: React.FC<TyreLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'gradient',
}) => {
  const dimensions = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
  }[size];

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${dimensions} ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md transition-transform duration-300 group-hover:rotate-12"
      >
        <defs>
          <linearGradient id="magadhTyreRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="50%" stopColor="#7e22ce" />
            <stop offset="100%" stopColor="#3b0764" />
          </linearGradient>
          <linearGradient id="magadhGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <radialGradient id="hubGloss" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#7e22ce" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer Tyre Body - Dark Tread Ring */}
        <circle cx="50" cy="50" r="46" fill="#0f172a" stroke="url(#magadhTyreRimGrad)" strokeWidth="4" />

        {/* Outer Tyre Tread Blocks (12 radial notches) */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
          <rect
            key={deg}
            x="48"
            y="5"
            width="4"
            height="7"
            rx="1.5"
            fill="url(#magadhGoldGrad)"
            transform={`rotate(${deg} 50 50)`}
          />
        ))}

        {/* Tyre Sidewall Inner Ring */}
        <circle cx="50" cy="50" r="37" stroke="#334155" strokeWidth="2.5" strokeDasharray="4 2" />
        <circle cx="50" cy="50" r="32" fill="url(#magadhTyreRimGrad)" />

        {/* Alloy Rim Inner Geometry - 5 Precision Curved Spokes */}
        {[0, 72, 144, 216, 288].map((deg) => (
          <path
            key={deg}
            d="M 50 50 L 46 22 C 48 19, 52 19, 54 22 Z"
            fill="#ffffff"
            opacity="0.9"
            transform={`rotate(${deg} 50 50)`}
          />
        ))}

        {/* Outer Rim Lip Ring */}
        <circle cx="50" cy="50" r="22" stroke="url(#magadhGoldGrad)" strokeWidth="2" fill="none" />

        {/* Center Hub Cap */}
        <circle cx="50" cy="50" r="14" fill="#0f172a" stroke="#ffffff" strokeWidth="1.5" />

        {/* Center M Emblem (Magadh Iconography) */}
        <path
          d="M 43 54 L 43 45 L 47 50 L 50 46 L 53 50 L 57 45 L 57 54"
          stroke="url(#magadhGoldGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Gloss Overlay */}
        <circle cx="50" cy="50" r="46" fill="url(#hubGloss)" pointerEvents="none" />
      </svg>
    </div>
  );
};
