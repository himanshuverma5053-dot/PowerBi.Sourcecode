import React from 'react';

interface SearchIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
}

/**
 * Bold Circular Magnifying Glass Search Icon
 * Matches 43898_black.png and Screenshot_20260901_133935_PixelLab.jpg
 */
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
      {/* Bold Circular Lens Ring */}
      <circle
        cx="41"
        cy="41"
        r="24"
        stroke="currentColor"
        strokeWidth="11"
        fill="none"
      />
      {/* 45° Diagonal Rounded Handle */}
      <line
        x1="59"
        y1="59"
        x2="84"
        y2="84"
        stroke="currentColor"
        strokeWidth="12"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default CustomSearchIcon;

