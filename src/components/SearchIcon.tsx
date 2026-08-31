import React from 'react';

interface SearchIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

export const CustomSearchIcon: React.FC<SearchIconProps> = ({
  className = 'w-8 h-8',
  size,
  ...props
}) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      width={size}
      height={size}
      aria-hidden="true"
      {...props}
    >
      <g transform="translate(36, 36) rotate(-45)">
        {/* Main Magnifying Glass Lens Rim (Full Ring) */}
        <circle
          cx="0"
          cy="0"
          r="24.5"
          stroke="#262626"
          strokeWidth="7"
          fill="none"
        />

        {/* Top-Left Dark Accent Quadrant on Lens Outer Ring */}
        <path
          d="M -24.5 0 A 24.5 24.5 0 0 1 0 -24.5"
          stroke="#111111"
          strokeWidth="7"
          fill="none"
          strokeLinecap="butt"
        />

        {/* Neck Connector (Between Lens Ring and Handle) */}
        {/* Left/Lighter half */}
        <rect
          x="-2.5"
          y="24.5"
          width="2.5"
          height="7.5"
          fill="#444444"
        />
        {/* Right/Darker half */}
        <rect
          x="0"
          y="24.5"
          width="2.5"
          height="7.5"
          fill="#222222"
        />

        {/* Handle - Angled Cylinder pointing Down-Right with Two-Tone Shading */}
        {/* Left / Upper Half of Handle */}
        <rect
          x="-4.8"
          y="32"
          width="4.8"
          height="43"
          fill="#2a2a2a"
        />
        {/* Right / Darker Shadow Half of Handle */}
        <rect
          x="0"
          y="32"
          width="4.8"
          height="43"
          fill="#141414"
        />
      </g>
    </svg>
  );
};

export default CustomSearchIcon;
