import React, { useState, useEffect } from 'react';
import { TyreProduct, CustomerAccount } from '../types';
import { formatCurrency } from '../utils/formatters';
import { getCustomerEffectivePrice } from '../utils/customerPricing';
import {
  X, Layers, CheckCircle2, ShieldCheck, Zap, Info, Minus, Plus
} from 'lucide-react';
import { ProductImagePlaceholder } from './ProductImagePlaceholder';

interface ProductDetailModalProps {
  product: TyreProduct | null;
  products?: TyreProduct[];
  onClose: () => void;
  onInstantBuy?: (product: TyreProduct, quantity: number) => void;
  currentCustomer?: CustomerAccount | null;
  isAdmin?: boolean;
  onUpdateImage?: (productId: string, imageUrl: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onInstantBuy,
  currentCustomer,
  isAdmin,
  onUpdateImage,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [imgError, setImgError] = useState<boolean>(false);

  useEffect(() => {
    setImgError(false);
    setQuantity(1);
  }, [product?.image, product?.id]);

  if (!product) return null;

  const pricingInfo = getCustomerEffectivePrice(product, currentCustomer);
  const isCustomRate = pricingInfo.hasCustomOverride || pricingInfo.appliedDiscountPercent > 0;
  const unitPrice = isCustomRate 
    ? pricingInfo.effectivePrice 
    : (quantity >= 4 && product.bulkPrice ? product.bulkPrice : pricingInfo.effectivePrice);

  const grandTotal = unitPrice * quantity;

  const handleBuyNow = () => {
    if (onInstantBuy) {
      onInstantBuy(product, quantity);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in select-none overflow-y-auto">
      <div className="relative w-full max-w-2xl sm:max-w-3xl max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col my-auto text-slate-900">
        
        {/* Header Close Bar */}
        <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-200 bg-slate-50 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white font-extrabold text-[10px] uppercase tracking-wider">
              {product.brand}
            </span>
            <span className="text-xs font-bold text-slate-500">
              Product Specifications & Details
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Grid - Single Slide Fit */}
        <div className="p-3.5 sm:p-4.5 grid grid-cols-1 sm:grid-cols-12 gap-3.5 sm:gap-4 overflow-y-auto items-center">
          
          {/* Left Column: Product Image Showcase */}
          <div className="sm:col-span-5 flex flex-col items-center justify-center bg-slate-50 p-3 sm:p-3.5 rounded-2xl border border-slate-200 shadow-2xs h-full">
            <div className="relative w-full h-32 sm:h-36 flex flex-col items-center justify-center overflow-hidden rounded-xl bg-white p-2 border border-slate-200 shadow-2xs">
              {/* Product Image */}
              <div className="relative w-full h-full flex items-center justify-center">
                {(!product.image && !product.images?.[0]) || imgError ? (
                  <ProductImagePlaceholder 
                    label={product.name} 
                    size="sm" 
                    onImageSelected={(dataUrl) => {
                      setImgError(false);
                      onUpdateImage?.(product.id, dataUrl);
                    }}
                  />
                ) : (
                  <img
                    src={product.image || product.images?.[0]}
                    alt={product.name}
                    onError={() => setImgError(true)}
                    className="max-h-28 sm:max-h-32 max-w-full object-contain transition-transform duration-300 hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
            </div>

            {/* Product Name Display below Image */}
            <div className="w-full mt-2 text-center px-1">
              <h3 className="text-sm sm:text-base font-black text-slate-900 font-display leading-tight tracking-tight">
                {product.name}
              </h3>
              <div className="flex items-center justify-center space-x-1.5 mt-1">
                <span className="text-[10px] font-extrabold text-slate-700 bg-slate-200 px-2 py-0.5 rounded-md">
                  {product.brand}
                </span>
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                  {product.size || `${product.width}/${product.aspectRatio} R${product.rimSize}`}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Specifications & Pricing Information */}
          <div className="sm:col-span-7 flex flex-col justify-center space-y-2.5">
            {/* Included Components Metadata Section */}
            <div className="p-2 px-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center space-x-1.5 min-w-0">
                <Layers className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                <div className="min-w-0 flex items-center space-x-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 shrink-0">
                    INCLUDED:
                  </span>
                  <span className="text-xs font-black text-slate-900 truncate">
                    {product.includedComponents || 'Tube & Flap'}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded-md border border-slate-300 shrink-0">
                Part of Set
              </span>
            </div>

            {/* Key Specs Pills */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px]">
              <div className="text-center">
                <span className="text-[9px] text-slate-500 font-bold uppercase block">Category</span>
                <span className="font-extrabold text-slate-900">{product.category || 'Radial'}</span>
              </div>
              <div className="text-center border-x border-slate-200">
                <span className="text-[9px] text-slate-500 font-bold uppercase block">Warranty</span>
                <span className="font-extrabold text-slate-900">{product.warrantyYears || 3} Years</span>
              </div>
              <div className="text-center">
                <span className="text-[9px] text-slate-500 font-bold uppercase block">Stock Status</span>
                <span className={`font-extrabold ${(product.stock ?? 1) > 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {(product.stock ?? 1) > 0 ? `${product.stock} in Stock` : 'Available to Order'}
                </span>
              </div>
            </div>

            {/* Quantity Bar & Pricing Section */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-600 font-bold block">Quantity</span>
                  {/* Quantity Stepper Bar */}
                  <div className="flex items-center space-x-1.5 mt-1">
                    <button
                      type="button"
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-300 font-black text-slate-700 hover:bg-slate-100 active:bg-slate-200 cursor-pointer text-xs flex items-center justify-center"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={quantity || 1}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (isNaN(val) || val < 1) {
                          setQuantity(1);
                        } else {
                          setQuantity(val);
                        }
                      }}
                      className="w-12 text-center text-sm font-black text-slate-900 bg-white border border-slate-300 rounded-lg py-0.5 focus:outline-none focus:border-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity((prev) => (product.stock && prev >= product.stock ? prev : prev + 1))}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-300 font-black text-slate-700 hover:bg-slate-100 active:bg-slate-200 cursor-pointer text-xs flex items-center justify-center"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-600 font-bold block">Total (Incl. GST)</span>
                  <span className="text-lg sm:text-xl font-black text-slate-900 font-display">
                    {formatCurrency(grandTotal)}
                  </span>
                  {quantity >= 4 && product.bulkPrice ? (
                    <span className="text-[9px] font-extrabold text-[#0972D3] bg-sky-100 px-1.5 py-0.5 rounded inline-block mt-0.5">
                      Bulk Price Applied
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-500 block">
                      {formatCurrency(unitPrice)}/unit
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  id={`btn-modal-buy-now-${product.id}`}
                  onClick={handleBuyNow}
                  className="flex-1 py-2.5 rounded-2xl bg-[#0972D3] hover:bg-[#075ea8] active:bg-[#064c87] text-white font-black text-xs sm:text-sm shadow-sm flex items-center justify-center space-x-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <Zap className="w-4 h-4 fill-white text-white" />
                  <span>Buy Now ({quantity})</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
