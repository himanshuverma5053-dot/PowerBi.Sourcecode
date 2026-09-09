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

  // Determine size spec for product
  const getProductSize = (): string => {
    const anyProd = product as any;
    if (anyProd.size && typeof anyProd.size === 'string' && anyProd.size.trim()) {
      return anyProd.size.trim();
    }
    if (anyProd.tyreSize && typeof anyProd.tyreSize === 'string' && anyProd.tyreSize.trim()) {
      return anyProd.tyreSize.trim();
    }
    if (product.width && product.rimSize) {
      const aspect = product.aspectRatio ? `/${product.aspectRatio}` : '';
      const speedIndex = [product.loadIndex, product.speedRating].filter(Boolean).join('');
      return `${product.width}${aspect} R${product.rimSize}${speedIndex ? ` ${speedIndex}` : ''}`.trim();
    }
    const combinedText = `${product.name || ''} ${product.description || ''}`;
    const match = combinedText.match(/\b\d{2,3}\/\d{2,3}\s*[R\-\/]\s*\d{2}(?:\.\d)?(?:\s+\d{2,3}[A-Z])?|\b\d{1,2}\.\d{2}\s*R\s*\d{2}|\b\d{2,3}\/\d{2,3}\s*-\s*\d{2}/i);
    if (match) {
      return match[0].trim();
    }
    if (product.rimSize) {
      return `R${product.rimSize}`;
    }
    const lower = combinedText.toLowerCase();
    if (lower.includes('truck') || lower.includes('commercial') || lower.includes('endutrax') || lower.includes('heavy duty')) {
      return '295/90 R20';
    }
    return 'Standard';
  };

  const productSize = getProductSize();

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

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Prevent triggering if clicked on quantity stepper buttons
    if (target.closest('button')) {
      return;
    }
    handleBuyNow();
  };

  const productImage = product.image_url || product.image;

  return (
    <div
      id={`vertical-product-card-${product.id}`}
      onClick={handleCardClick}
      className="product-card bg-white rounded-2xl px-4 sm:px-4.5 py-6 sm:py-7 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between relative group w-full max-w-[325px] sm:max-w-[345px] mx-auto cursor-pointer"
    >
      {/* Top Header: Title & Brand */}
      <div>
        <div className="flex items-start justify-between gap-1.5">
          <div className="py-0.5">
            <h3 className="text-[16px] sm:text-[17px] font-extrabold font-display text-[#8a18ca] tracking-tight uppercase leading-relaxed">
              {product.name}
            </h3>
          </div>

          {/* Brand Logo / Tag */}
          <div className="flex items-center text-right shrink-0">
            {(!product.brand || product.brand.toLowerCase().includes('apollo')) ? (
              <img
                src="/apollo_tyres_logo.svg"
                alt="Apollo Tyres"
                className="h-4 sm:h-4.5 w-auto object-contain"
              />
            ) : product.brand.toLowerCase().includes('jk') ? (
              <img
                src="/jk_tyre_logo_transparent.svg"
                alt={product.brand}
                className="h-4 sm:h-4.5 w-auto object-contain"
              />
            ) : (
              <span className="font-extrabold text-[8.5px] sm:text-[9.5px] text-[#43006A] tracking-wider uppercase px-2 py-0.5 rounded bg-purple-50">
                {product.brand}
              </span>
            )}
          </div>
        </div>

        {/* Tagline / Subtitle */}
        {product.description && (
          <p className="text-[10.5px] sm:text-[11.5px] text-slate-500 mt-1.5 line-clamp-1 leading-snug">
            {product.description}
          </p>
        )}

        {/* Tyre Size below Description & Red Icon */}
        <div className="flex items-center justify-between gap-2 mt-2">
          <div className="flex items-center min-w-0">
            <span className="text-[12px] sm:text-[13px] font-extrabold font-display text-[#8a18ca] tracking-tight uppercase truncate">
              {productSize}
            </span>
          </div>
          <div 
            id={`product-red-icon-${product.id}`}
            className="w-5.5 h-4 sm:w-6 sm:h-4.5 rounded-xs bg-[#E50000] border border-[#B30000] shrink-0" 
            title="Red Icon"
          />
        </div>
      </div>

      {/* Product Image Center View */}
      <div 
        className="my-4 sm:my-5 flex items-center justify-center relative select-none"
      >
        <div className="relative w-26 h-26 sm:w-30 sm:h-30 flex items-center justify-center p-1 rounded-lg transition-colors duration-200">
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
              className="w-full h-full max-h-26 sm:max-h-30 object-contain filter drop-shadow-md select-none transition-transform duration-300 group-hover:scale-105"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
          )}
        </div>
      </div>

      {/* Price & Action Row */}
      <div className="space-y-2.5 mt-2.5 pt-2.5 border-t border-slate-100">
        {/* Price tag */}
        <div className="text-left flex items-baseline justify-between">
          <div>
            <p className="price text-[18px] sm:text-[20px] font-extrabold text-[#8a18ca] tracking-tight leading-tight font-display">
              ₹{effectivePrice.toLocaleString('en-IN')}{effectivePrice % 1 === 0 ? '.00' : ''}
            </p>
            {product.mrp && product.mrp > effectivePrice && (
              <span className="text-[9.5px] sm:text-[10.5px] text-slate-400 line-through mr-1.5">
                MRP: ₹{product.mrp.toLocaleString('en-IN')}
              </span>
            )}
          </div>
          {product.bulkPrice && product.bulkPrice < effectivePrice && (
            <span className="text-[8.5px] sm:text-[9.5px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
              Bulk: ₹{product.bulkPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* Quantity Stepper Bar and Add to Cart button */}
        <div className="flex items-center gap-2">
          {/* Quantity Stepper Bar */}
          <div className="flex items-center rounded-xl bg-white border border-slate-300 overflow-hidden shadow-2xs h-10 sm:h-10.5 shrink-0">
            <button
              type="button"
              onClick={handleDecrement}
              disabled={quantity <= 1}
              className="w-8 sm:w-9 h-full flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-30 transition-colors cursor-pointer border-r border-slate-200"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
            <span className="w-7 sm:w-8 text-center text-xs sm:text-sm font-bold text-slate-900 select-none">
              {quantity}
            </span>
            <button
              type="button"
              onClick={handleIncrement}
              disabled={Boolean(product.stock && product.stock > 0 && quantity >= product.stock)}
              className="w-8 sm:w-9 h-full flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-30 transition-colors cursor-pointer border-l border-slate-200"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            id={`btn-buy-now-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              handleBuyNow();
            }}
            className="flex-1 h-10 sm:h-10.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center transition-all duration-200 shadow-2xs cursor-pointer active:scale-[0.98] bg-[#8a18ca] hover:bg-[#7b14b5] active:bg-[#6c109f] text-white px-3"
          >
            <span className="tracking-tight whitespace-nowrap">Add to cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};
