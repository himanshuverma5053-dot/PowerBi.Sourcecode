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
      ? 'w-7 h-7'
      : size === 'lg'
      ? 'w-20 h-20 sm:w-24 sm:h-24'
      : 'w-12 h-12 sm:w-14 sm:h-14';

  return (
    <div
      id={id}
      className={`w-full h-full flex items-center justify-center rounded-2xl bg-slate-50/60 text-slate-300 select-none ${className}`}
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
