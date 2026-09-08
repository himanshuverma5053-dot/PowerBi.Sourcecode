import React, { useState } from 'react';
import { TyreProduct, CustomerAccount } from '../types';
import { formatCurrency } from '../utils/formatters';
import { getCustomerEffectivePrice } from '../utils/customerPricing';
import { Eye, ShieldCheck, Zap, Minus, Plus } from 'lucide-react';
import { ProductImagePlaceholder } from './ProductImagePlaceholder';

interface ProductCardProps {
  product: TyreProduct;
  onInstantBuy?: (product: TyreProduct, quantity?: number) => void;
  currentCustomer?: CustomerAccount | null;
  isAdmin?: boolean;
  compact?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onInstantBuy,
  currentCustomer,
  compact = false,
}) => {
  const [quantity, setQuantity] = useState(1);
  const pricingInfo = getCustomerEffectivePrice(product, currentCustomer);
  const displayPrice = pricingInfo.effectivePrice;
  const isCustomRate = pricingInfo.hasCustomOverride || pricingInfo.appliedDiscountPercent > 0;

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity((prev) => (product.stock && prev >= product.stock ? prev : prev + 1));
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onInstantBuy) {
      onInstantBuy(product, quantity);
    }
  };

  return (
    <div className={`group bg-white rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden relative ${
      compact ? 'h-full' : ''
    }`}>
      {/* Top Badges Overlay */}
      <div className="p-3 pb-0 flex justify-between items-start z-10 gap-1">
        <div className="flex flex-wrap gap-1 items-center">
          {product.brand && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white shadow-2xs">
              {product.brand}
            </span>
          )}
          {product.evReady && (
            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-100 text-emerald-900 flex items-center">
              <Zap className="w-2.5 h-2.5 mr-0.5 text-emerald-700 fill-emerald-700" />
              EV
            </span>
          )}
          {isCustomRate && (
            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-extrabold bg-amber-400 text-slate-950 shadow-2xs">
              Custom Rate
            </span>
          )}
        </div>

        <div className="text-right shrink-0">
          {(product.stock !== undefined && product.stock > 0) ? (
            <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-slate-100 text-slate-800">
              {product.stock} in Stock
            </span>
          ) : product.stock === 0 ? (
            <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-100 text-amber-900">
              Pre-Order
            </span>
          ) : null}
        </div>
      </div>

      {/* Image Container */}
      <div
        className="relative h-20 sm:h-24 w-full flex items-center justify-center p-1.5 overflow-hidden bg-slate-50/70 mt-1 select-none"
      >
        {product.image || product.image_url || product.images?.[0] ? (
          <img
            src={product.image_url || product.image || product.images?.[0]}
            alt={product.name}
            className="max-h-18 sm:max-h-20 max-w-full object-contain"
            referrerPolicy="no-referrer"
          />
        ) : (
          <ProductImagePlaceholder label={product.name} size="sm" />
        )}
      </div>

      {/* Product Content Details */}
      <div className="p-2.5 pt-0 flex-1 flex flex-col justify-between space-y-1.5 mt-1">
        <div>
          {/* Tyre Dimension Badge if present */}
          {product.width && product.aspectRatio && product.rimSize ? (
            <div className="text-[10px] font-extrabold text-amber-900 tracking-wide uppercase bg-amber-100 inline-block px-2 py-0.5 rounded-md mb-1">
              {product.width}/{product.aspectRatio} R{product.rimSize} {product.speedRating ? `| ${product.speedRating}` : ''}
            </div>
          ) : null}

          <h3
            className="text-xs sm:text-sm font-extrabold text-slate-900 line-clamp-1 font-display"
          >
            {product.name}
          </h3>

          {product.description && (
            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
              {product.description}
            </p>
          )}
        </div>

        {/* Specs Pill Grid if present */}
        {(product.fuelEfficiency || product.wetGrip || product.noiseDb) ? (
          <div className="grid grid-cols-3 gap-1 bg-slate-50 p-1.5 rounded-lg text-[10px] font-semibold text-slate-900">
            {product.fuelEfficiency && (
              <div className="text-center">
                <span className="text-[8px] text-slate-500 block uppercase font-bold">Eff.</span>
                <span className="text-slate-950 font-extrabold">{product.fuelEfficiency}</span>
              </div>
            )}
            {product.wetGrip && (
              <div className="text-center">
                <span className="text-[8px] text-slate-500 block uppercase font-bold">Grip</span>
                <span className="text-slate-950 font-extrabold">{product.wetGrip}</span>
              </div>
            )}
            {product.noiseDb && (
              <div className="text-center">
                <span className="text-[8px] text-slate-500 block uppercase font-bold">Noise</span>
                <span className="text-slate-950 font-extrabold">{product.noiseDb} dB</span>
              </div>
            )}
          </div>
        ) : null}

        {/* Pricing & Quantity + Buy Now */}
        <div className="pt-1.5 space-y-1.5 border-t border-slate-100">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline space-x-1">
              <span className="text-sm font-black text-slate-950 font-display">
                {formatCurrency(displayPrice)}
              </span>
              <span className="text-[9px] text-slate-500 font-medium">/ unit</span>
            </div>
            {product.bulkPrice && product.bulkPrice < displayPrice && (
              <span className="text-[9px] text-slate-500 font-bold">
                Bulk: {formatCurrency(product.bulkPrice)}
              </span>
            )}
          </div>

          {/* Quantity Stepper & Buy Now Button */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center rounded-lg bg-slate-100 h-7 shrink-0 shadow-2xs">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={quantity <= 1}
                className="w-5 h-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 transition-colors cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="w-2.5 h-2.5" />
              </button>
              <span className="w-4 text-center text-[11px] font-black text-slate-900 select-none">
                {quantity}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                disabled={Boolean(product.stock && product.stock > 0 && quantity >= product.stock)}
                className="w-5 h-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 transition-colors cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus className="w-2.5 h-2.5" />
              </button>
            </div>

            <button
              type="button"
              id={`btn-card-buy-now-${product.id}`}
              onClick={handleBuyNow}
              className="flex-1 py-1 px-2 rounded-lg bg-[#0972D3] hover:bg-[#075ea8] active:bg-[#064c87] text-white text-[11px] font-black transition-all flex items-center justify-center space-x-1 cursor-pointer shadow-2xs active:scale-95"
            >
              <Zap className="w-3 h-3 fill-white text-white" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
