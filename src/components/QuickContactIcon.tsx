import React from 'react';

interface QuickContactIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

/**
 * Customer Support Headset Agent Icon
 * Exact vector reproduction matching uploaded 43901_black.png
 */
export const QuickContactIcon: React.FC<QuickContactIconProps> = ({
  className = 'w-9 h-9 sm:w-10 sm:h-10',
  size,
  ...props
}) => {
  return (
    <svg
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      width={size}
      height={size}
      aria-hidden="true"
      {...props}
    >
      {/* Outer Headband Arch */}
      <path
        d="M 85 240 C 85 105 155 38 250 38 C 345 38 415 105 415 240"
        stroke="currentColor"
        strokeWidth="32"
        strokeLinecap="round"
        fill="none"
      />

      {/* Left Earmuff / Cushion */}
      <rect
        x="42"
        y="210"
        width="76"
        height="136"
        rx="38"
        fill="currentColor"
      />

      {/* Right Earmuff / Cushion */}
      <rect
        x="382"
        y="210"
        width="76"
        height="136"
        rx="38"
        fill="currentColor"
      />

      {/* Hair Silhouette Mass */}
      <path
        d="M 115 235 C 115 140 170 78 250 78 C 330 78 385 140 385 235 C 385 285 365 330 365 330 C 365 330 354 265 352 230 C 350 200 335 172 295 172 C 275 172 260 184 250 184 C 240 184 225 172 205 172 C 165 172 150 200 148 230 C 146 265 135 330 135 330 C 135 330 115 285 115 235 Z"
        fill="currentColor"
      />

      {/* Jawline & Chin Outline */}
      <path
        d="M 148 310 C 148 405 195 465 250 465 C 305 465 352 405 352 310"
        stroke="currentColor"
        strokeWidth="28"
        strokeLinecap="round"
        fill="none"
      />

      {/* Microphone Boom Arm from Right Earmuff */}
      <path
        d="M 390 355 C 390 415 340 435 280 405 L 265 400"
        stroke="currentColor"
        strokeWidth="24"
        strokeLinecap="round"
        fill="none"
      />

      {/* Microphone Capsule with clear interior */}
      <rect
        x="220"
        y="378"
        width="66"
        height="40"
        rx="20"
        fill="white"
        stroke="currentColor"
        strokeWidth="14"
      />
    </svg>
  );
};

export default QuickContactIcon;

