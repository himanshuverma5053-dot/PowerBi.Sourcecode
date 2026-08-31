import React from 'react';

interface MagadhSparshLogoProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showSubtitle?: boolean;
  isDark?: boolean;
  onClick?: () => void;
}

export const MagadhSparshLogo: React.FC<MagadhSparshLogoProps> = ({
  src = '/magadh_sparsh_logo.svg',
  alt = 'Magadh Sparsh',
  size = 'sm',
  className = '',
  isDark = false,
  onClick,
}) => {
  // Balanced height classes for the logo image with increased sizing
  const heightClasses = {
    xs: 'h-7 sm:h-8',
    sm: 'h-10 sm:h-12 md:h-14',
    md: 'h-13 sm:h-15 md:h-16 lg:h-18',
    lg: 'h-16 sm:h-20 md:h-22',
    xl: 'h-20 sm:h-24 md:h-28',
  }[size] || 'h-12 sm:h-14 md:h-16';

  return (
    <div
      id="magadh-sparsh-brand-logo-container"
      onClick={onClick}
      className={`inline-flex items-center justify-center cursor-pointer select-none group/logo relative overflow-visible transition-transform active:scale-95 bg-transparent ${className}`}
      title="Magadh Sparsh - Return home"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.();
        }
      }}
    >
      <img
        id="magadh-sparsh-logo-img"
        src={src || '/magadh_sparsh_logo.svg'}
        alt={alt || 'Magadh Sparsh'}
        className={`${heightClasses} w-auto max-w-[280px] sm:max-w-[340px] md:max-w-[420px] object-contain transition-all duration-200 group-hover/logo:opacity-90 select-none bg-transparent`}
        referrerPolicy="no-referrer"
        loading="eager"
        onError={(e) => {
          // Fallback if custom source fails
          const target = e.target as HTMLImageElement;
          if (target.src !== `${window.location.origin}/magadh_sparsh_logo.svg` && target.src !== '/magadh_sparsh_logo.svg') {
            target.src = '/magadh_sparsh_logo.svg';
          }
        }}
      />
    </div>
  );
};

export default MagadhSparshLogo;

