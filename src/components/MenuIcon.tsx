import React from 'react';

interface MenuIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number | string;
  isOpen?: boolean;
}

/**
 * Recreates the square-shaped Hamburger Menu and Close 'X' icons with subtly curved corners
 * exactly matching Screenshot_20260829_230943_Chrome.jpg and Screenshot_20260829_230922_Chrome.jpg
 */
export const CustomMenuIcon: React.FC<MenuIconProps> = ({
  className = 'w-10 h-10',
  size,
  isOpen = false,
  ...props
}) => {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      width={size}
      height={size}
      aria-hidden="true"
      {...props}
    >
      {isOpen ? (
        /* Closing 'X' State (matching Screenshot_20260829_230922_Chrome.jpg) */
        <g>
          {/* Square container with subtly curved corners */}
          <rect width="100" height="100" rx="18" fill="#B149E8" stroke="none" />
          {/* Dark Charcoal 'X' Cross Lines */}
          <g stroke="#3E2E4E" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="31" y1="31" x2="69" y2="69" />
            <line x1="69" y1="31" x2="31" y2="69" />
          </g>
        </g>
      ) : (
        /* Hamburger 3-Line State (matching Screenshot_20260829_230943_Chrome.jpg) */
        <g>
          {/* Square container with subtly curved corners */}
          <rect width="100" height="100" rx="18" fill="#EADBF8" stroke="none" />
          {/* 3 Horizontal Rounded Dark Charcoal/Black Bars */}
          <g stroke="#1F132B" strokeWidth="7.5" strokeLinecap="round">
            <line x1="30" y1="37" x2="70" y2="37" />
            <line x1="30" y1="50" x2="70" y2="50" />
            <line x1="30" y1="63" x2="70" y2="63" />
          </g>
        </g>
      )}
    </svg>
  );
};

export default CustomMenuIcon;
