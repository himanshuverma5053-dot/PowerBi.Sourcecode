import React, { useState, useEffect } from 'react';
import { TyreProduct, CustomerAccount } from '../types';
import { Eye, Minus, Plus, Zap } from 'lucide-react';
import { ProductImagePlaceholder } from './ProductImagePlaceholder';
import { ApolloLogo } from './ApolloLogo';

interface VerticalProductCardProps {
  product: TyreProduct;
  currentCustomer?: CustomerAccount | null;
  isAdmin?: boolean;
  onInstantBuy?: (product: TyreProduct, quantity?: number) => void;
  onViewDetails?: (product: TyreProduct) => void;
  onUpdateImage?: (productId: string, imageUrl: string) => void;
}

export const VerticalProductCard: React.FC<VerticalProductCardProps> = ({
  product,
  currentCustomer,
  isAdmin,
  onInstantBuy,
  onViewDetails,
  onUpdateImage,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [product.image]);

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

  // Size / spec formatted
  const sizeSpec = `${product.width}/${product.aspectRatio} R${product.rimSize} ${product.loadIndex || '154'}${product.speedRating || 'K'} ${product.name} TL -D`;

  // Brand logo lookup or clean text styling
  const brandName = product.brand || 'Apollo';

  const handleIncrement = () => {
    setQuantity((prev) => (product.stock && prev >= product.stock ? prev : prev + 1));
  };

  const handleDecrement = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleBuyNow = () => {
    if (onInstantBuy) {
      onInstantBuy(product, quantity);
    } else if (onViewDetails) {
      onViewDetails(product);
    }
  };

  return (
    <div
      id={`vertical-product-card-${product.id}`}
      className="bg-white rounded-[28px] p-5 sm:p-6 shadow-sm border border-slate-100/90 hover:shadow-md hover:border-slate-200 transition-all duration-200 flex flex-col justify-between relative group"
    >
      {/* Top Header: Title & Brand Logo */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-display text-[#0972D3] tracking-tight uppercase">
              {product.name}
            </h2>
          </div>

          {/* Brand Logo / Monogram */}
          <div className="flex items-center text-right shrink-0">
            {brandName.toLowerCase().includes('apollo') ? (
              <ApolloLogo size="sm" className="opacity-95 hover:opacity-100 transition-opacity" />
            ) : (
              <span className="font-black text-xs text-slate-800 tracking-wider uppercase px-2 py-0.5 rounded-md bg-slate-100">
                {brandName}
              </span>
            )}
          </div>
        </div>

        {/* Pill Icon & Spec String */}
        <div className="flex items-center space-x-2.5 mt-2.5">
          <div className="w-5 h-5 rounded-md bg-[#0972D3] flex items-center justify-center shrink-0 shadow-2xs">
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
          </div>
          <span className="text-xs sm:text-[13px] font-medium text-slate-800 leading-tight">
            {sizeSpec}
          </span>
        </div>
      </div>

      {/* Product Image Center View */}
      <div 
        className="my-5 sm:my-7 flex items-center justify-center relative cursor-pointer group/img"
        onClick={() => onViewDetails?.(product)}
      >
        <div className="relative w-40 h-40 sm:w-52 sm:h-52 flex items-center justify-center p-2 rounded-2xl bg-gradient-to-b from-slate-50/60 to-transparent transition-colors duration-200">
          {!product.image || imgError ? (
            <ProductImagePlaceholder 
              label={product.name} 
              onImageSelected={(dataUrl) => {
                setImgError(false);
                onUpdateImage?.(product.id, dataUrl);
              }}
            />
          ) : (
            <img
              id={`product-card-img-${product.id}`}
              src={product.image}
              alt={product.name}
              onError={() => setImgError(true)}
              className="w-full h-full max-h-48 object-contain filter drop-shadow-xl group-hover/img:scale-105 transition-transform duration-300 select-none"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
          )}
        </div>

        {/* Subtle quick view trigger on hover */}
        <button
          id={`btn-view-spec-${product.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails?.(product);
          }}
          className="absolute right-1 bottom-1 p-2 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md border border-slate-200"
          title="View Specifications"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Price & Action Row */}
      <div className="space-y-3.5">
        {/* Price tag */}
        <div className="text-left flex items-baseline justify-between">
          <div className="text-xl sm:text-2xl font-black text-[#0972D3] tracking-tight">
            {formattedPrice}
          </div>
          {product.bulkPrice && product.bulkPrice < effectivePrice && (
            <span className="text-[11px] font-bold text-slate-500">
              Bulk: ₹{product.bulkPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* Quantity Bar and Buy Now button */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Quantity Stepper Bar */}
          <div className="flex items-center border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-2xs h-11 shrink-0">
            <button
              type="button"
              onClick={handleDecrement}
              disabled={quantity <= 1}
              className="w-8 sm:w-9 h-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-30 transition-colors cursor-pointer"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-7 sm:w-8 text-center text-xs sm:text-sm font-black text-slate-900 select-none">
              {quantity}
            </span>
            <button
              type="button"
              onClick={handleIncrement}
              disabled={Boolean(product.stock && product.stock > 0 && quantity >= product.stock)}
              className="w-8 sm:w-9 h-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-30 transition-colors cursor-pointer"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Buy Now Button */}
          <button
            type="button"
            id={`btn-buy-now-${product.id}`}
            onClick={handleBuyNow}
            className="flex-1 h-11 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center space-x-1.5 transition-all duration-200 shadow-sm cursor-pointer active:scale-[0.98] bg-[#0972D3] hover:bg-[#075ea8] active:bg-[#064c87] text-white"
          >
            <Zap className="w-4 h-4 fill-white text-white" />
            <span className="tracking-tight">Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
