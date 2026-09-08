import React from 'react';
import { ImageIcon } from 'lucide-react';

interface ProductImagePlaceholderProps {
  id?: string;
  className?: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ProductImagePlaceholder: React.FC<ProductImagePlaceholderProps> = ({
  id,
  className = '',
  size = 'md',
}) => {
  const iconSize =
    size === 'sm'
      ? 'w-5 h-5'
      : size === 'lg'
      ? 'w-10 h-10 sm:w-12 sm:h-12'
      : 'w-7 h-7 sm:w-8 sm:h-8';

  return (
    <div
      id={id}
      className={`w-full h-full flex items-center justify-center rounded-xl bg-slate-50/60 text-slate-300 select-none ${className}`}
      aria-label="No image available"
    >
      <div className="flex items-center justify-center">
        <ImageIcon
          className={`${iconSize} stroke-[1.2] text-slate-300/80 drop-shadow-2xs`}
        />
      </div>
    </div>
  );
};
