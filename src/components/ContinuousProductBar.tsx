import React, { useState } from 'react';
import { TyreProduct, CustomerAccount } from '../types';
import { getCustomerEffectivePrice } from '../utils/customerPricing';
import { Eye, Disc3, ShieldCheck, Zap, Pause, Play, ChevronRight } from 'lucide-react';
import { ProductImagePlaceholder } from './ProductImagePlaceholder';

interface ContinuousProductBarProps {
  title: string;
  subtitle?: string;
  badgeText: string;
  badgeType?: 'radial' | 'non-radial';
  products: TyreProduct[];
  direction?: 'left' | 'right';
  speedSeconds?: number;
  currentCustomer?: CustomerAccount | null;
  isAdmin?: boolean;
  onInstantBuy?: (product: TyreProduct) => void;
  onViewAllCategory?: () => void;
}

export const ContinuousProductBar: React.FC<ContinuousProductBarProps> = ({
  title,
  subtitle,
  badgeText,
  badgeType = 'radial',
  products,
  direction = 'left',
  speedSeconds = 28,
  currentCustomer,
  isAdmin,
  onInstantBuy,
  onViewAllCategory
}) => {
  const [isPaused, setIsPaused] = useState(false);

  if (!products || products.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 shadow-2xs space-y-2 my-4">
        <Disc3 className="w-8 h-8 text-slate-400 mx-auto animate-spin" />
        <h3 className="text-sm font-bold text-slate-800">No {badgeText} Products Available</h3>
        <p className="text-xs text-slate-500">Check back soon for inventory updates.</p>
      </div>
    );
  }

  // Multiply products so the loop has seamless continuity
  const displayItems = [...products, ...products, ...products, ...products];

  const badgeColorClasses = badgeType === 'radial'
    ? 'bg-slate-900 text-white border-slate-950 shadow-2xs'
    : 'bg-amber-950 text-amber-200 border-amber-800 shadow-2xs';

  const headerGradient = badgeType === 'radial'
    ? 'from-slate-100 via-slate-50 to-transparent'
    : 'from-amber-500/10 via-amber-500/5 to-transparent';

  return (
    <div className="my-2 space-y-1 bg-white rounded-2xl md:rounded-3xl p-2 sm:p-2.5 md:p-4 border border-slate-200/90 shadow-2xs overflow-hidden relative group/bar">
      {/* CONTINUOUS MOVING CAROUSEL MARQUEE TRACK */}
      <div className="relative overflow-hidden py-1 md:py-2 -mx-2 sm:-mx-2.5 md:-mx-4 px-2 sm:px-2.5 md:px-4">
        {/* Visual edge gradient overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-12 md:w-16 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-12 md:w-16 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

        <div
          className={
            direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right'
          }
          style={{
            animationDuration: `${speedSeconds}s`,
            animationPlayState: isPaused ? 'paused' : undefined
          }}
        >
          {displayItems.map((product, idx) => {
            const pricing = getCustomerEffectivePrice(product, currentCustomer);
            const sizeString = `${product.width}/${product.aspectRatio} R${product.rimSize}`;

            return (
              <div
                key={`${product.id}-${idx}`}
                className="w-40 sm:w-48 md:w-56 lg:w-48 shrink-0 mx-1.5 md:mx-2 group/card bg-slate-50 hover:bg-white rounded-xl md:rounded-2xl border border-slate-200 hover:border-slate-400 p-2 md:p-3 transition-all duration-200 hover:shadow-md flex flex-col justify-between select-none relative"
              >
                {/* Product Image & Badges */}
                <div
                  className="relative w-full h-20 sm:h-24 md:h-32 lg:h-24 rounded-lg md:rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center p-1.5 md:p-2 mb-1.5 md:mb-2 select-none"
                >
                  {product.image || product.images?.[0] ? (
                    <img
                      src={product.image || product.images?.[0]}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain group-hover/card:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <ProductImagePlaceholder label={product.name} size="sm" />
                  )}
                  {/* Brand Badge */}
                  <span className="absolute top-1 left-1 bg-slate-950/80 backdrop-blur-xs text-white font-black text-[8px] md:text-[9px] px-1 md:px-1.5 py-0.5 rounded uppercase tracking-wider">
                    {product.brand}
                  </span>
                  {/* Warranty Badge */}
                  <span className="absolute bottom-1 right-1 bg-slate-900 text-amber-300 font-extrabold text-[8px] md:text-[9px] px-1 md:px-1.5 py-0.5 rounded shadow-2xs">
                    {product.warrantyYears}Y
                  </span>
                </div>

                {/* Product Info */}
                <div className="space-y-0.5 md:space-y-1 select-none">
                  <div className="text-[9px] md:text-[10px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                    <span>{sizeString}</span>
                    <span className="text-[8px] md:text-[9px] text-slate-500 font-semibold">{product.category}</span>
                  </div>
                  <h3 className="text-[11px] md:text-[13px] font-black text-slate-900 line-clamp-1 group-hover/card:text-slate-700 transition-colors">
                    {product.name}
                  </h3>

                  {/* Pricing */}
                  <div className="pt-0.5 md:pt-1 flex items-baseline justify-between border-t border-slate-200 mt-0.5">
                    <div>
                      <div className="text-[8px] md:text-[9px] text-slate-400 font-semibold">Dealer Rate</div>
                      <div className="text-xs md:text-sm font-black text-slate-950">
                        ₹{pricing.effectivePrice.toLocaleString('en-IN')}
                      </div>
                    </div>
                    {product.mrp && product.mrp > pricing.effectivePrice && (
                      <div className="text-[9px] md:text-[10px] text-slate-400 line-through">
                        ₹{product.mrp.toLocaleString('en-IN')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-1.5 md:mt-2 pt-1.5 md:pt-2 border-t border-slate-200 flex items-center gap-1 md:gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onInstantBuy) {
                        onInstantBuy(product);
                      }
                    }}
                    className="flex-1 py-1 md:py-1.5 px-1.5 md:px-2 rounded-xl bg-[#9800ff] hover:bg-[#8500df] active:bg-[#7200be] active:scale-95 text-white font-extrabold text-[10px] md:text-xs shadow-2xs transition-all flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Zap className="w-3 h-3 md:w-3.5 md:h-3.5 fill-white text-white" />
                    <span>Buy Now</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
