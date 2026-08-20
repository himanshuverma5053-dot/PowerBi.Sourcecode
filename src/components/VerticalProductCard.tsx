import React, { useState, useEffect } from 'react';
import { TyreProduct, CustomerAccount } from '../types';
import { Minus, Plus, ShoppingBag, Eye, Check } from 'lucide-react';
import { SilverCartIcon } from './SilverCartIcon';
import { ProductImagePlaceholder } from './ProductImagePlaceholder';

interface VerticalProductCardProps {
  product: TyreProduct;
  currentCustomer?: CustomerAccount | null;
  isAdmin?: boolean;
  onAddToCart: (product: TyreProduct, quantity?: number) => void;
  onInstantBuy?: (product: TyreProduct, quantity?: number) => void;
  onViewDetails?: (product: TyreProduct) => void;
  onUpdateImage?: (productId: string, imageUrl: string) => void;
}

export const VerticalProductCard: React.FC<VerticalProductCardProps> = ({
  product,
  currentCustomer,
  isAdmin,
  onAddToCart,
  onInstantBuy,
  onViewDetails,
  onUpdateImage,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);
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

  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrement = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  // Brand logo lookup or clean text styling
  const brandName = product.brand || 'Apollo';

  return (
    <div
      id={`vertical-product-card-${product.id}`}
      className="bg-white rounded-[28px] p-5 sm:p-6 shadow-sm border border-slate-100/90 hover:shadow-md hover:border-slate-200 transition-all duration-200 flex flex-col justify-between relative group"
    >
      {/* Top Header: Title & Brand Logo */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-display text-[#8a14d4] tracking-tight uppercase">
              {product.name}
            </h2>
          </div>

          {/* Brand Logo / Monogram */}
          <div className="flex items-center text-right shrink-0">
            {brandName.toLowerCase().includes('apollo') ? (
              <div className="flex items-center">
                <span className="font-extrabold text-[#431268] text-base tracking-tighter">apollo</span>
                <span className="text-[7px] font-black text-[#8a14d4] uppercase ml-0.5 mt-2">TYRES</span>
              </div>
            ) : (
              <span className="font-black text-xs text-slate-800 tracking-wider uppercase px-2 py-0.5 rounded-md bg-slate-100">
                {brandName}
              </span>
            )}
          </div>
        </div>

        {/* Pill Icon & Spec String */}
        <div className="flex items-center space-x-2.5 mt-2.5">
          <div className="w-5 h-5 rounded-md bg-[#4c1d77] flex items-center justify-center shrink-0 shadow-2xs">
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
      <div className="space-y-4">
        {/* Price tag */}
        <div className="text-left">
          <div className="text-xl sm:text-2xl font-black text-[#8a14d4] tracking-tight">
            {formattedPrice}
          </div>
        </div>

        {/* Counter and Add to Cart button */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Increment / Decrement Counter Pill */}
          <div className="flex items-center border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-2xs h-11 shrink-0">
            <button
              onClick={handleDecrement}
              className="w-9 h-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center text-sm font-bold text-slate-900 select-none">
              {quantity}
            </span>
            <button
              onClick={handleIncrement}
              className="w-9 h-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add to Cart Purple Button */}
          <button
            onClick={handleAdd}
            className={`flex-1 h-11 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center transition-all duration-200 shadow-2xs cursor-pointer active:scale-[0.98] border-2 ${
              addedAnimation
                ? 'bg-emerald-50 border-emerald-600 text-emerald-700'
                : 'bg-white hover:bg-purple-50/70 border-[#9800ff] text-[#9800ff]'
            }`}
          >
            {addedAnimation ? (
              <span className="inline-flex items-center space-x-2">
                <span>Added!</span>
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
              </span>
            ) : (
              <span className="inline-flex items-center space-x-2">
                <span className="tracking-tight">Add to cart</span>
                <SilverCartIcon className="w-5 h-5 drop-shadow-sm text-[#9800ff]" />
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
