import React, { useState } from 'react';
import { TyreProduct, CustomerAccount } from '../types';
import { getCustomerEffectivePrice } from '../utils/customerPricing';
import { ShoppingBag, Eye, Disc3, ShieldCheck, Zap, Pause, Play, ChevronRight } from 'lucide-react';
import { SilverCartIcon } from './SilverCartIcon';

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
  onAddToCart: (product: TyreProduct, quantity: number) => void;
  onInstantBuy?: (product: TyreProduct) => void;
  onViewDetails: (product: TyreProduct) => void;
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
  onAddToCart,
  onInstantBuy,
  onViewDetails,
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
    <div className="my-2 space-y-1 bg-white rounded-2xl p-2 sm:p-2.5 border border-slate-200/90 shadow-2xs overflow-hidden relative group/bar">
      {/* CONTINUOUS MOVING CAROUSEL MARQUEE TRACK */}
      <div className="relative overflow-hidden py-1 -mx-2 sm:-mx-2.5 px-2 sm:px-2.5">
        {/* Visual edge gradient overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

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
                className="w-40 sm:w-48 shrink-0 mx-1.5 group/card bg-slate-50 hover:bg-white rounded-xl border border-slate-200 hover:border-slate-400 p-2 transition-all duration-200 hover:shadow-md flex flex-col justify-between select-none relative"
              >
                {/* Product Image & Badges */}
                <div
                  className="relative w-full h-20 sm:h-24 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center p-1.5 mb-1.5 cursor-pointer group-hover/card:bg-slate-200/50 transition-colors"
                  onClick={() => onViewDetails(product)}
                >
                  <img
                    src={product.image || product.images?.[0] || 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&q=80&w=800'}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain group-hover/card:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {/* Brand Badge */}
                  <span className="absolute top-1 left-1 bg-slate-950/80 backdrop-blur-xs text-white font-black text-[8px] px-1 py-0.5 rounded uppercase tracking-wider">
                    {product.brand}
                  </span>
                  {/* Warranty Badge */}
                  <span className="absolute bottom-1 right-1 bg-slate-900 text-amber-300 font-extrabold text-[8px] px-1 py-0.5 rounded shadow-2xs">
                    {product.warrantyYears}Y
                  </span>
                </div>

                {/* Product Info */}
                <div className="space-y-0.5 cursor-pointer" onClick={() => onViewDetails(product)}>
                  <div className="text-[9px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                    <span>{sizeString}</span>
                    <span className="text-[8px] text-slate-500 font-semibold">{product.category}</span>
                  </div>
                  <h3 className="text-[11px] font-black text-slate-900 line-clamp-1 group-hover/card:text-slate-700 transition-colors">
                    {product.name}
                  </h3>

                  {/* Pricing */}
                  <div className="pt-0.5 flex items-baseline justify-between border-t border-slate-200 mt-0.5">
                    <div>
                      <div className="text-[8px] text-slate-400 font-semibold">Dealer Rate</div>
                      <div className="text-xs font-black text-slate-950">
                        ₹{pricing.effectivePrice.toLocaleString('en-IN')}
                      </div>
                    </div>
                    {product.mrp && product.mrp > pricing.effectivePrice && (
                      <div className="text-[9px] text-slate-400 line-through">
                        ₹{product.mrp.toLocaleString('en-IN')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-1.5 pt-1.5 border-t border-slate-200 flex items-center justify-between gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails(product);
                    }}
                    className="p-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors flex items-center justify-center cursor-pointer"
                    title="View Product Specs"
                  >
                    <Eye className="w-3 h-3" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(product, 1);
                    }}
                    className="flex-1 py-1 px-1.5 rounded-lg bg-[#54b4e7] hover:bg-[#3ea5dc] active:scale-95 text-white font-extrabold text-[10px] shadow-2xs transition-all flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <SilverCartIcon className="w-3 h-3" />
                    <span>Add +</span>
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
