import React from 'react';
import { TyreProduct, CustomerAccount } from '../types';
import { formatCurrency } from '../utils/formatters';
import { getCustomerEffectivePrice } from '../utils/customerPricing';
import { ShoppingBag, Eye, ShieldCheck, Zap, Disc3, Star, Check } from 'lucide-react';
import { ProductImagePlaceholder } from './ProductImagePlaceholder';

interface ProductCardProps {
  product: TyreProduct;
  onQuickView?: (product: TyreProduct) => void;
  onViewDetails?: (product: TyreProduct) => void;
  onInstantBuy?: (product: TyreProduct) => void;
  onAddToCart: (product: TyreProduct, quantity: number) => void;
  currentCustomer?: CustomerAccount | null;
  isAdmin?: boolean;
  compact?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onQuickView,
  onViewDetails,
  onInstantBuy,
  onAddToCart,
  currentCustomer,
  isAdmin,
  compact = false,
}) => {
  const pricingInfo = getCustomerEffectivePrice(product, currentCustomer);
  const displayPrice = pricingInfo.effectivePrice;
  const isCustomRate = pricingInfo.hasCustomOverride || pricingInfo.appliedDiscountPercent > 0;

  const handleView = () => {
    if (onViewDetails) {
      onViewDetails(product);
    } else if (onQuickView) {
      onQuickView(product);
    }
  };

  return (
    <div className={`group bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col justify-between overflow-hidden relative ${
      compact ? 'h-full' : ''
    }`}>
      {/* Top Badges Overlay */}
      <div className="p-3 pb-0 flex justify-between items-start z-10 gap-1">
        <div className="flex flex-wrap gap-1 items-center">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white border border-slate-950 shadow-2xs">
            {product.brand}
          </span>
          {product.evReady && (
            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-100 text-emerald-900 flex items-center border border-emerald-300">
              <Zap className="w-2.5 h-2.5 mr-0.5 text-emerald-700 fill-emerald-700" />
              EV
            </span>
          )}
          {isCustomRate && (
            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-extrabold bg-amber-400 text-slate-950 shadow-2xs border border-amber-300">
              Custom Rate
            </span>
          )}
        </div>

        <div className="text-right shrink-0">
          {product.stock > 0 ? (
            <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
              {product.stock} in Stock
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              Pre-Order
            </span>
          )}
        </div>
      </div>

      {/* Image Container with Hover Zoom */}
      <div
        className="relative h-32 sm:h-36 w-full flex items-center justify-center p-3 cursor-pointer overflow-hidden bg-slate-50/70 mt-1"
        onClick={handleView}
      >
        {product.image || product.images?.[0] ? (
          <img
            src={product.image || product.images?.[0]}
            alt={product.name}
            className="max-h-28 sm:max-h-32 max-w-full object-contain group-hover:scale-108 transition-transform duration-300 ease-out"
            referrerPolicy="no-referrer"
          />
        ) : (
          <ProductImagePlaceholder label={product.name} size="sm" />
        )}
      </div>

      {/* Product Content Details */}
      <div className="p-3.5 pt-0 flex-1 flex flex-col justify-between space-y-2.5 mt-2">
        <div>
          {/* Tyre Dimension Badge */}
          <div className="text-[10px] font-extrabold text-amber-900 tracking-wide uppercase bg-amber-100 inline-block px-2 py-0.5 rounded-md border border-amber-300 mb-1">
            {product.width}/{product.aspectRatio} R{product.rimSize} | {product.speedRating}
          </div>

          <h3
            onClick={handleView}
            className="text-xs sm:text-sm font-extrabold text-slate-900 hover:text-slate-700 cursor-pointer line-clamp-1 transition-colors font-display"
          >
            {product.name}
          </h3>

          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
            {product.description}
          </p>
        </div>

        {/* Specs Pill Grid */}
        <div className="grid grid-cols-3 gap-1 bg-slate-50 p-1.5 rounded-lg border border-slate-200 text-[10px] font-semibold text-slate-900">
          <div className="text-center">
            <span className="text-[8px] text-slate-500 block uppercase font-bold">Eff.</span>
            <span className="text-slate-950 font-extrabold">{product.fuelEfficiency}</span>
          </div>
          <div className="text-center border-x border-slate-200">
            <span className="text-[8px] text-slate-500 block uppercase font-bold">Grip</span>
            <span className="text-slate-950 font-extrabold">{product.wetGrip}</span>
          </div>
          <div className="text-center">
            <span className="text-[8px] text-slate-500 block uppercase font-bold">Noise</span>
            <span className="text-slate-950 font-extrabold">{product.noiseDb} dB</span>
          </div>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-1">
          <div>
            <div className="flex items-baseline space-x-1">
              <span className="text-sm sm:text-base font-black text-slate-950 font-display">
                {formatCurrency(displayPrice)}
              </span>
              <span className="text-[9px] text-slate-500 font-medium">/ unit</span>
            </div>
            <div className="text-[9px] text-amber-900 font-bold truncate">
              Bulk 4+: {formatCurrency(isCustomRate ? displayPrice : (product.bulkPrice || displayPrice))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleView}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-purple-50/70 border-2 border-[#9800ff] text-[#9800ff] text-[11px] font-bold transition-all flex items-center space-x-1 cursor-pointer shrink-0 shadow-2xs active:scale-95"
          >
            <span>Details</span>
            <Eye className="w-3 h-3 text-[#9800ff]" />
          </button>
        </div>

      </div>
    </div>
  );
};
