import React from 'react';
import silverCartImg from '../assets/images/silver_cart_white_bg_1786857058797.jpg';

interface SilverCartIconProps {
  className?: string;
  imageClassName?: string;
  alt?: string;
}

export const SilverCartIcon: React.FC<SilverCartIconProps> = ({
  className = 'w-6 h-6',
  imageClassName = 'w-4 h-4',
  alt = 'Add to Cart'
}) => {
  return (
    <span
      className={`inline-flex items-center justify-center bg-white rounded-full p-1 shadow-xs border border-white/80 shrink-0 select-none overflow-hidden ${className}`}
    >
      <img
        src={silverCartImg}
        alt={alt}
        referrerPolicy="no-referrer"
        className={`object-contain ${imageClassName}`}
      />
    </span>
  );
};

export default SilverCartIcon;
