import React from 'react';

interface ApolloLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export const ApolloLogo: React.FC<ApolloLogoProps> = ({ 
  className = '', 
  size = 'sm' 
}) => {
  const heightClasses = {
    xs: 'h-4 w-auto',
    sm: 'h-5 sm:h-5.5 w-auto',
    md: 'h-7 sm:h-8 w-auto',
    lg: 'h-10 sm:h-12 w-auto',
  }[size];

  return (
    <div className={`inline-flex items-center justify-center shrink-0 select-none ${className}`}>
      <img
        src="/apollo_tyres_logo.svg"
        alt="Apollo Tyres"
        className={`${heightClasses} object-contain`}
        loading="eager"
      />
    </div>
  );
};
