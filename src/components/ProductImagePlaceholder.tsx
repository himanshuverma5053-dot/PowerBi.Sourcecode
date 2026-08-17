import React, { useRef } from 'react';
import { Disc, UploadCloud } from 'lucide-react';

interface ProductImagePlaceholderProps {
  className?: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  onImageSelected?: (dataUrl: string) => void;
}

export const ProductImagePlaceholder: React.FC<ProductImagePlaceholderProps> = ({
  className = '',
  label = 'No Image Available',
  size = 'md',
  onImageSelected,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const iconSize = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-14 h-14' : 'w-10 h-10';
  const textSize = size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-xs' : 'text-[11px]';

  const handleFile = (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const res = e.target?.result as string;
      if (res && onImageSelected) {
        onImageSelected(res);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      onClick={(e) => {
        if (onImageSelected) {
          e.stopPropagation();
          fileInputRef.current?.click();
        }
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className={`w-full h-full flex flex-col items-center justify-center p-3 rounded-xl bg-slate-100/80 border border-dashed border-slate-300 text-slate-400 select-none group/placeholder ${
        onImageSelected ? 'cursor-pointer hover:bg-slate-200/70 hover:border-slate-400 transition-colors' : ''
      } ${className}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />
      <div className="w-12 h-12 rounded-full bg-slate-200/70 flex items-center justify-center mb-1.5 text-slate-400 group-hover/placeholder:text-slate-700 transition-colors">
        {onImageSelected ? (
          <UploadCloud className={`${iconSize} stroke-[1.5] group-hover/placeholder:scale-110 transition-transform`} />
        ) : (
          <Disc className={`${iconSize} stroke-[1.5]`} />
        )}
      </div>
      <span className={`${textSize} font-medium text-slate-500 tracking-tight text-center line-clamp-1`}>
        {label}
      </span>
      <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5 group-hover/placeholder:text-slate-600">
        {onImageSelected ? 'Click or Drop Image' : 'Upload Required'}
      </span>
    </div>
  );
};

