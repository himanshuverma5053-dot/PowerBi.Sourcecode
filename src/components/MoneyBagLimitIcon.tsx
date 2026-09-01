import React from 'react';

interface MoneyBagLimitIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * Money Bag with Coins and Checkmark Verified Badge Icon
 * Exact vector reproduction of uploaded 10106199.png
 * Features vibrant blue-to-cyan gradient, money pouch with $ sign, coin stack, and checkmark badge.
 */
export const MoneyBagLimitIcon: React.FC<MoneyBagLimitIconProps> = ({
  className = 'w-8 h-8',
  ...props
}) => {
  return (
    <svg
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      {...props}
    >
      <defs>
        <linearGradient id="moneyBagGrad" x1="15%" y1="5%" x2="85%" y2="95%">
          <stop offset="0%" stopColor="#566BFF" />
          <stop offset="45%" stopColor="#2E85FF" />
          <stop offset="100%" stopColor="#00BAFF" />
        </linearGradient>
      </defs>

      {/* TOP RUFFLE / KNOT OF MONEY SACK */}
      <path
        d="M 270 90 C 265 85 260 55 270 25 C 285 5 330 0 355 20 C 375 5 415 10 425 25 C 435 55 430 85 425 90 Z"
        fill="url(#moneyBagGrad)"
      />

      {/* TIE BAND AT NECK */}
      <rect
        x="290"
        y="82"
        width="115"
        height="18"
        rx="9"
        fill="#2563EB"
      />

      {/* MAIN MONEY POUCH / SACK */}
      <path
        d="M 348 95 C 235 95 160 185 160 295 C 160 380 215 450 348 450 C 445 450 495 380 495 295 C 495 185 445 95 348 95 Z"
        fill="url(#moneyBagGrad)"
      />

      {/* SACK DOLLAR SIGN ($) - Crisp White */}
      {/* Vertical center bar */}
      <rect x="339" y="185" width="18" height="175" rx="9" fill="#FFFFFF" />
      {/* S-curve paths */}
      <path
        d="M 390 230 C 390 200 365 195 345 195 C 315 195 295 210 295 235 C 295 295 395 265 395 315 C 395 345 370 355 345 355 C 315 355 290 340 290 315"
        stroke="#FFFFFF"
        strokeWidth="20"
        strokeLinecap="round"
        fill="none"
      />

      {/* COIN STACK (Left Side) */}
      {/* Top Face Coin */}
      <circle cx="105" cy="215" r="75" fill="url(#moneyBagGrad)" stroke="#FFFFFF" strokeWidth="8" />
      {/* Coin 1 Dollar Sign ($) */}
      <rect x="100" y="155" width="10" height="120" rx="5" fill="#FFFFFF" />
      <path
        d="M 125 185 C 125 168 112 165 105 165 C 90 165 80 175 80 190 C 80 228 130 210 130 240 C 130 258 115 265 105 265 C 90 265 75 255 75 240"
        stroke="#FFFFFF"
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
      />

      {/* Stacked Coin Edge Pills */}
      <rect x="25" y="300" width="145" height="32" rx="16" fill="url(#moneyBagGrad)" stroke="#FFFFFF" strokeWidth="4" />
      <rect x="25" y="348" width="145" height="32" rx="16" fill="url(#moneyBagGrad)" stroke="#FFFFFF" strokeWidth="4" />
      <rect x="25" y="396" width="145" height="32" rx="16" fill="url(#moneyBagGrad)" stroke="#FFFFFF" strokeWidth="4" />

      {/* VERIFIED CHECKMARK BADGE (Bottom-Left / Foreground) */}
      <circle cx="215" cy="425" r="82" fill="url(#moneyBagGrad)" stroke="#FFFFFF" strokeWidth="12" />
      {/* White Bold Checkmark (✓) */}
      <path
        d="M 165 422 L 202 460 L 265 395"
        stroke="#FFFFFF"
        strokeWidth="22"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};

export default MoneyBagLimitIcon;
