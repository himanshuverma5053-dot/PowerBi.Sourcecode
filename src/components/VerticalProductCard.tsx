import React, { useState } from 'react';
import { TyreProduct, CustomerAccount } from '../types';
import { Minus, Plus, ShoppingBag, Eye, Check } from 'lucide-react';

interface VerticalProductCardProps {
  product: TyreProduct;
  currentCustomer?: CustomerAccount | null;
  isAdmin?: boolean;
  onAddToCart: (product: TyreProduct, quantity?: number) => void;
  onInstantBuy?: (product: TyreProduct, quantity?: number) => void;
  onViewDetails?: (product: TyreProduct) => void;
}

export const VerticalProductCard: React.FC<VerticalProductCardProps> = ({
  product,
  currentCustomer,
  isAdmin,
  onAddToCart,
  onInstantBuy,
  onViewDetails,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

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
  const sizeSpec = `${product.width}/${product.aspectRatio}-${product.rimSize} ${product.loadIndex || '66'}${product.speedRating || 'S'} ${product.name} TL -D`;
  const productCode = product.productCode || product.sku || (product.hsnCode ? `RLV9C0ZR51AP1` : `APL-${product.id.slice(0, 6).toUpperCase()}`);
  const tagline = product.description || 'Cruise Far. Stay in Command.';

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

        {/* Tagline / Subtitle */}
        <p className="text-[11px] sm:text-xs text-slate-500 mt-2 font-normal">
          {tagline}
        </p>

        {/* Product Code & Red Badge */}
        <div className="flex items-center justify-between mt-3.5">
          <span className="text-xs sm:text-[13px] font-bold text-[#8a14d4] font-mono tracking-wide uppercase">
            {productCode}
          </span>

          {/* Red square indicator as shown in screenshot */}
          <div
            className="w-4 h-4 sm:w-5 sm:h-5 bg-[#e50914] rounded-[3px] border border-red-700/30 shadow-2xs"
            title="Standard Spec Registered"
          />
        </div>
      </div>

      {/* Product Image Center View */}
      <div 
        className="my-6 sm:my-8 flex items-center justify-center relative cursor-pointer group/img"
        onClick={() => onViewDetails?.(product)}
      >
        <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
          <img
            src={product.image || 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=600&auto=format&fit=crop&q=80'}
            alt={product.name}
            className="w-full h-full object-contain filter drop-shadow-md group-hover/img:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        </div>

        {/* Subtle quick view trigger on hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails?.(product);
          }}
          className="absolute right-0 bottom-0 p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-2xs"
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
            className={`flex-1 h-11 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center transition-all duration-200 shadow-sm cursor-pointer active:scale-[0.98] ${
              addedAnimation
                ? 'bg-emerald-600 text-white'
                : 'bg-[#9800ff] hover:bg-[#8500e0] text-white shadow-[#9800ff]/20'
            }`}
          >
            {addedAnimation ? (
              <span className="inline-flex items-center space-x-1.5">
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Added!</span>
              </span>
            ) : (
              <span>Add to cart</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
