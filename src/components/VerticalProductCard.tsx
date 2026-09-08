import React, { useState, useEffect } from 'react';
import { TyreProduct, CustomerAccount } from '../types';
import { Minus, Plus, Zap } from 'lucide-react';
import { ProductImagePlaceholder } from './ProductImagePlaceholder';

interface VerticalProductCardProps {
  product: TyreProduct;
  currentCustomer?: CustomerAccount | null;
  isAdmin?: boolean;
  onInstantBuy?: (product: TyreProduct, quantity?: number) => void;
}

export const VerticalProductCard: React.FC<VerticalProductCardProps> = ({
  product,
  currentCustomer,
  isAdmin,
  onInstantBuy,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [product.image, product.image_url]);

  // Compute pricing
  const effectivePrice = currentCustomer && product.dealerPrice 
    ? product.dealerPrice 
    : product.price;

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(effectivePrice);

  const hasDimensions = Boolean(product.width && product.aspectRatio && product.rimSize);
  const sizeSpec = hasDimensions
    ? `${product.width}/${product.aspectRatio} R${product.rimSize}${product.loadIndex ? ` ${product.loadIndex}` : ''}${product.speedRating || ''}`
    : '';

  const handleIncrement = () => {
    setQuantity((prev) => (product.stock && prev >= product.stock ? prev : prev + 1));
  };

  const handleDecrement = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleBuyNow = () => {
    if (onInstantBuy) {
      onInstantBuy(product, quantity);
    }
  };

  const productImage = product.image_url || product.image;

  return (
    <div
      id={`vertical-product-card-${product.id}`}
      className="product-card bg-white rounded-xl px-2.5 sm:px-3 py-3 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col justify-between relative group w-full max-w-[280px] sm:max-w-[295px] mx-auto"
    >
      {/* Top Header: Title & Brand */}
      <div>
        <div className="flex items-start justify-between gap-1">
          <div>
            <h3 className="text-[13px] sm:text-[14px] font-bold font-display text-[#0972D3] tracking-tight uppercase leading-snug">
              {product.name}
            </h3>
          </div>

          {/* Brand Tag if present in data */}
          {product.brand && (
            <div className="flex items-center text-right shrink-0">
              <span className="font-black text-[8px] sm:text-[9px] text-slate-800 tracking-wider uppercase px-1.5 py-0.5 rounded bg-slate-100">
                {product.brand}
              </span>
            </div>
          )}
        </div>

        {/* Spec String if dimensions exist */}
        {sizeSpec && (
          <div className="flex items-center space-x-1 mt-0.5">
            <div className="w-3 h-3 rounded bg-[#0972D3] flex items-center justify-center shrink-0 shadow-2xs">
              <div className="w-1 h-1 rounded-full bg-white" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-800 leading-tight">
              {sizeSpec}
            </span>
          </div>
        )}

        {/* Description */}
        {product.description && (
          <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 line-clamp-1 leading-snug">
            {product.description}
          </p>
        )}

        {/* Category if present in data */}
        {product.category && (
          <p className="category text-[8px] sm:text-[9px] font-medium text-slate-400 mt-0.5">
            Category: {product.category}
          </p>
        )}
      </div>

      {/* Product Image Center View */}
      <div 
        className="my-1 sm:my-1.5 flex items-center justify-center relative select-none"
      >
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center p-1 rounded-lg bg-gradient-to-b from-slate-50/60 to-transparent transition-colors duration-200">
          {!productImage || imgError ? (
            <ProductImagePlaceholder 
              id={`product-img-placeholder-${product.id}`}
              label={product.name} 
              size="sm"
            />
          ) : (
            <img
              id={`product-card-img-${product.id}`}
              src={productImage}
              alt={product.name}
              onError={() => setImgError(true)}
              className="w-full h-full max-h-16 sm:max-h-20 object-contain filter drop-shadow-sm select-none"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
          )}
        </div>
      </div>

      {/* Price & Action Row */}
      <div className="space-y-1 mt-1 pt-1 border-t border-slate-100">
        {/* Price tag */}
        <div className="text-left flex items-baseline justify-between">
          <div>
            <p className="price text-[14px] sm:text-[15px] font-black text-[#0972D3] tracking-tight leading-tight">
              Price: Rs. {product.price}
            </p>
            <span className="text-[8px] sm:text-[9px] text-slate-400 font-medium">({formattedPrice})</span>
          </div>
          {product.bulkPrice && product.bulkPrice < effectivePrice && (
            <span className="text-[8px] sm:text-[9px] font-bold text-slate-500">
              Bulk: ₹{product.bulkPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* Quantity Bar and Add to Cart / Buy Now button */}
        <div className="flex items-center gap-1">
          {/* Quantity Stepper Bar */}
          <div className="flex items-center rounded-lg bg-slate-100 overflow-hidden shadow-2xs h-6.5 sm:h-7 shrink-0">
            <button
              type="button"
              onClick={handleDecrement}
              disabled={quantity <= 1}
              className="w-5 sm:w-6 h-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-30 transition-colors cursor-pointer"
              aria-label="Decrease quantity"
            >
              <Minus className="w-2.5 h-2.5" />
            </button>
            <span className="w-4 sm:w-5 text-center text-[10px] sm:text-[11px] font-black text-slate-900 select-none">
              {quantity}
            </span>
            <button
              type="button"
              onClick={handleIncrement}
              disabled={Boolean(product.stock && product.stock > 0 && quantity >= product.stock)}
              className="w-5 sm:w-6 h-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-30 transition-colors cursor-pointer"
              aria-label="Increase quantity"
            >
              <Plus className="w-2.5 h-2.5" />
            </button>
          </div>

          {/* Add to Cart / Buy Now Button */}
          <button
            type="button"
            id={`btn-buy-now-${product.id}`}
            onClick={handleBuyNow}
            className="flex-1 h-6.5 sm:h-7 rounded-lg font-bold text-[11px] sm:text-xs flex items-center justify-center space-x-1 transition-all duration-200 shadow-2xs cursor-pointer active:scale-[0.98] bg-[#0972D3] hover:bg-[#075ea8] active:bg-[#064c87] text-white px-1.5"
          >
            <Zap className="w-2.5 h-2.5 fill-white text-white shrink-0" />
            <span className="tracking-tight whitespace-nowrap">Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};
