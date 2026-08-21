import React, { useRef, useState, useEffect } from 'react';
import { TyreProduct, CustomerAccount } from '../types';
import { ProductCard } from './ProductCard';
import { ChevronLeft, ChevronRight, Disc3, Sparkles } from 'lucide-react';

interface ProductCarouselProps {
  title?: string;
  subtitle?: string;
  products: TyreProduct[];
  currentCustomer?: CustomerAccount | null;
  isAdmin?: boolean;
  onInstantBuy?: (product: TyreProduct) => void;
  onViewDetails: (product: TyreProduct) => void;
  emptyMessage?: string;
  badgeText?: string;
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({
  title,
  subtitle,
  products,
  currentCustomer,
  isAdmin,
  onInstantBuy,
  onViewDetails,
  emptyMessage = "No products found matching your criteria.",
  badgeText
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [products]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header section with title, badge & scroll buttons */}
      {(title || badgeText) && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 px-1">
          <div>
            {badgeText && (
              <span className="text-[11px] font-black tracking-wider text-slate-800 uppercase bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200 inline-block mb-1 shadow-2xs">
                {badgeText}
              </span>
            )}
            {title && (
              <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 flex items-center gap-2">
                {title}
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                  {products.length} {products.length === 1 ? 'item' : 'items'}
                </span>
              </h2>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>

          {/* Scrolling Controls */}
          {products.length > 0 && (
            <div className="flex items-center space-x-2 self-end sm:self-auto">
              <span className="text-[11px] font-semibold text-slate-400 mr-1 hidden sm:inline-block">
                Scroll horizontally
              </span>
              <button
                type="button"
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                aria-label="Scroll left"
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  canScrollLeft
                    ? 'bg-white border-slate-200 text-slate-900 hover:bg-slate-100 hover:scale-105 shadow-2xs'
                    : 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed opacity-50'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                aria-label="Scroll right"
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  canScrollRight
                    ? 'bg-slate-900 border-slate-950 text-white hover:bg-slate-800 hover:scale-105 shadow-2xs'
                    : 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed opacity-50'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Horizontal Carousel View */}
      {products.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-2xs space-y-2">
          <Disc3 className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">{emptyMessage}</h3>
          <p className="text-xs text-slate-500">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="relative group/carousel">
          {/* Scroll fade gradients for visual cue */}
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-50/90 to-transparent z-10 pointer-events-none" />
          )}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-50/90 to-transparent z-10 pointer-events-none" />
          )}

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="flex items-stretch gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 px-1 scrollbar-thin scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400 scrollbar-track-transparent pb-3"
            style={{
              scrollbarWidth: 'thin',
              scrollSnapType: 'x mandatory'
            }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="w-64 sm:w-72 shrink-0 snap-start"
              >
                <ProductCard
                  product={product}
                  currentCustomer={currentCustomer}
                  isAdmin={isAdmin}
                  onInstantBuy={onInstantBuy}
                  onViewDetails={onViewDetails}
                  compact
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
