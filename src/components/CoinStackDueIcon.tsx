import React from 'react';

interface CoinStackDueIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * Stack of Coins with Foreground Dollar Coin Icon
 * Exact vector reproduction of uploaded 43938_1976D2-1.png
 * Color: Vibrant Royal Blue (#1976D2)
 */
export const CoinStackDueIcon: React.FC<CoinStackDueIconProps> = ({
  className = 'w-8 h-8',
  ...props
}) => {
  return (
    <svg
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      {...props}
    >
      {/* 3D CYLINDER COIN STACK (Left) */}
      {/* Tier 1 (Top Lid) */}
      <ellipse cx="210" cy="165" rx="98" ry="36" fill="#1976D2" />

      {/* Tier 2 */}
      <path
        d="M 112 188 C 112 188 112 215 112 215 C 112 235 156 250 210 250 C 264 250 308 235 308 215 L 308 188 C 290 206 252 218 210 218 C 168 218 130 206 112 188 Z"
        fill="#1976D2"
      />

      {/* Tier 3 */}
      <path
        d="M 112 235 C 112 235 112 262 112 262 C 112 282 156 298 210 298 C 264 298 308 282 308 262 L 308 235 C 290 253 252 265 210 265 C 168 265 130 253 112 235 Z"
        fill="#1976D2"
      />

      {/* Tier 4 */}
      <path
        d="M 112 282 C 112 282 112 308 112 308 C 112 328 156 345 210 345 C 264 345 308 328 308 308 L 308 282 C 290 300 252 312 210 312 C 168 312 130 300 112 282 Z"
        fill="#1976D2"
      />

      {/* Tier 5 (Base) */}
      <path
        d="M 112 328 C 112 328 112 355 112 355 C 112 375 156 392 210 392 C 264 392 308 375 308 355 L 308 328 C 290 345 252 358 210 358 C 168 358 130 345 112 328 Z"
        fill="#1976D2"
      />

      {/* FOREGROUND CIRCLE COIN (Right) with white border contour */}
      <circle
        cx="340"
        cy="315"
        r="75"
        fill="#1976D2"
        stroke="#FFFFFF"
        strokeWidth="10"
      />

      {/* DOLLAR SIGN ($) in white */}
      {/* Vertical Spine Bar */}
      <rect x="334" y="260" width="12" height="110" rx="6" fill="#FFFFFF" />
      {/* S-curve Stroke */}
      <path
        d="M 368 288 C 368 272 355 266 340 266 C 322 266 310 276 310 292 C 310 330 370 312 370 342 C 370 360 354 366 340 366 C 322 366 308 356 308 340"
        stroke="#FFFFFF"
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

export default CoinStackDueIcon;
