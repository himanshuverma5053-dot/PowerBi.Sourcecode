import React from 'react';

interface HourglassDueIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * Hourglass Time/Due Icon
 * Exact vector reproduction of uploaded hourglass-blue-circle-icon-design-vector-21964573.png
 * Color: Vibrant Royal Blue (#1976D2 / #0284C7)
 */
export const HourglassDueIcon: React.FC<HourglassDueIconProps> = ({
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
      <defs>
        <linearGradient id="hourglassSparshGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F6DFE" />
          <stop offset="25%" stopColor="#6F60FA" />
          <stop offset="50%" stopColor="#9C4EF2" />
          <stop offset="75%" stopColor="#CA44CF" />
          <stop offset="100%" stopColor="#F94CAB" />
        </linearGradient>
      </defs>

      {/* TOP RIM / CAP (Rounded Plate) */}
      <rect
        x="60"
        y="45"
        width="380"
        height="44"
        rx="22"
        fill="url(#hourglassSparshGrad)"
      />

      {/* BOTTOM RIM / BASE (Rounded Plate) */}
      <rect
        x="60"
        y="411"
        width="380"
        height="44"
        rx="22"
        fill="url(#hourglassSparshGrad)"
      />

      {/* OUTER HOURGLASS GLASS BULB WALLS */}
      <path
        d="M 98 89 C 105 210 205 240 235 250 C 205 260 105 290 98 411 L 138 411 C 145 320 220 280 245 262 C 248 260 252 260 255 262 C 280 280 355 320 362 411 L 402 411 C 395 290 295 260 265 250 C 295 240 395 210 402 89 L 362 89 C 355 180 280 220 255 238 C 252 240 248 240 245 238 C 220 220 145 180 138 89 Z"
        fill="url(#hourglassSparshGrad)"
      />

      {/* TOP CHAMBER SAND LEVEL */}
      <path
        d="M 170 170 Q 250 185 330 170 C 310 220 268 245 250 250 C 232 245 190 220 170 170 Z"
        fill="url(#hourglassSparshGrad)"
      />

      {/* BOTTOM CHAMBER ACCUMULATED SAND PILE */}
      <path
        d="M 155 385 C 160 330 215 315 250 310 C 285 315 340 330 345 385 Z"
        fill="url(#hourglassSparshGrad)"
      />

      {/* FALLING SAND STREAM */}
      <rect
        x="246"
        y="250"
        width="8"
        height="60"
        rx="4"
        fill="url(#hourglassSparshGrad)"
      />
    </svg>
  );
};

export default HourglassDueIcon;
