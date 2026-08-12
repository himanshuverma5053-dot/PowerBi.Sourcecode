import React, { useState, useEffect } from 'react';
import { TyreProduct, ProductComponentConfig, CustomerAccount } from '../types';
import { formatCurrency, formatGST } from '../utils/formatters';
import { getCustomerEffectivePrice } from '../utils/customerPricing';
import {
  X, ShoppingBag, CheckCircle2,
  FileText, Car, ChevronRight, Check, Layers, CheckSquare, Square
} from 'lucide-react';

interface ProductDetailModalProps {
  product: TyreProduct | null;
  products?: TyreProduct[];
  onClose: () => void;
  onAddToCart: (product: TyreProduct, quantity: number) => void;
  onInstantBuy: (product: TyreProduct, quantity: number) => void;
  currentCustomer?: CustomerAccount | null;
  isAdmin?: boolean;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  currentCustomer,
  isAdmin,
}) => {
  const [quantity, setQuantity] = useState<number>(1);

  if (!product) return null;

  const pricingInfo = getCustomerEffectivePrice(product, currentCustomer);
  const isCustomRate = pricingInfo.hasCustomOverride || pricingInfo.appliedDiscountPercent > 0;
  const unitPrice = isCustomRate 
    ? pricingInfo.effectivePrice 
    : (quantity >= 4 ? (product.bulkPrice || pricingInfo.effectivePrice) : pricingInfo.effectivePrice);

  const grandTotal = unitPrice * quantity;
  const gstTax = Math.round((grandTotal - (grandTotal / 1.18)) * 100) / 100;

  const handleAddToCartClick = () => {
    onAddToCart(product, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in select-none overflow-y-auto">
      <div className="relative w-full max-w-2xl sm:max-w-3xl max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden border border-purple-100 flex flex-col my-auto text-slate-900">
        
        {/* Header Close Bar */}
        <div className="flex items-center justify-between px-3.5 py-2 border-b border-purple-100 bg-purple-50/60 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider">
              {product.brand}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-purple-100/80 text-purple-700 hover:text-purple-950 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Grid - Single Slide Fit */}
        <div className="p-3.5 sm:p-4.5 grid grid-cols-1 sm:grid-cols-12 gap-3.5 sm:gap-4 overflow-y-auto items-center">
          
          {/* Left Column: Product Image Showcase */}
          <div className="sm:col-span-5 flex flex-col items-center justify-center bg-purple-50/40 p-3 sm:p-3.5 rounded-2xl border border-purple-100/80 shadow-2xs h-full">
            <div className="relative w-full h-32 sm:h-36 flex flex-col items-center justify-center overflow-hidden rounded-xl bg-white p-2 border border-purple-100/80 shadow-2xs">
              {/* Product Image */}
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={product.image}
                  alt={product.name}
                  className="max-h-28 sm:max-h-32 max-w-full object-contain transition-transform duration-300 hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Product Name Display below Image */}
            <div className="w-full mt-2 text-center px-1">
              <h3 className="text-sm sm:text-base font-black text-purple-950 font-display leading-tight tracking-tight">
                {product.name}
              </h3>
              <div className="flex items-center justify-center space-x-1.5 mt-1">
                <span className="text-[10px] font-extrabold text-purple-800 bg-purple-100/80 px-2 py-0.5 rounded-md">
                  {product.brand}
                </span>
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                  {product.size || `${product.width}/${product.aspectRatio} R${product.rimSize}`}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Specifications & Purchasing Controls */}
          <div className="sm:col-span-7 flex flex-col justify-center space-y-2.5">
            {/* Included Components Metadata Section */}
            <div className="p-2 px-2.5 rounded-lg bg-amber-50/90 border border-amber-200/90 flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center space-x-1.5 min-w-0">
                <Layers className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <div className="min-w-0 flex items-center space-x-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 shrink-0">
                    INCLUDED:
                  </span>
                  <span className="text-xs font-black text-slate-900 truncate">
                    {product.includedComponents || 'Tube & Flap'}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded-md border border-amber-300 shrink-0">
                Part of Set
              </span>
            </div>

            {/* Quantity Selector & Pricing */}
            <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200/90 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-purple-800 font-bold block">Quantity</span>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <button
                      type="button"
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="w-7 h-7 rounded-md bg-white border border-purple-300 font-black text-purple-950 hover:bg-purple-100 cursor-pointer text-xs"
                    >
                      -
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
                      onBlur={() => {
                        if (!quantity || quantity < 1) {
                          setQuantity(1);
                        }
                      }}
                      className="w-12 text-center text-sm font-black text-purple-950 bg-white border border-purple-300 rounded-md py-0.5 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity(prev => prev + 1)}
                      className="w-7 h-7 rounded-md bg-white border border-purple-300 font-black text-purple-950 hover:bg-purple-100 cursor-pointer text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-purple-800 font-bold block">Total Amount (Incl. GST)</span>
                  <span className="text-lg sm:text-xl font-black text-purple-950 font-display">
                    {formatCurrency(grandTotal)}
                  </span>
                  {quantity >= 4 && (
                    <span className="text-[10px] font-extrabold text-amber-900 bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded block mt-0.5">
                      Bulk Price ({formatCurrency(product.bulkPrice)}/unit)
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-0.5">
                {isAdmin ? (
                  <div className="w-full py-2 rounded-lg bg-purple-100 text-purple-900 font-bold text-xs text-center border border-purple-200">
                    <span>Order Creation Restricted — Available on Customer Portal Only</span>
                  </div>
                ) : (
                  <button
                    onClick={handleAddToCartClick}
                    className="w-full py-2.5 rounded-lg bg-purple-900 hover:bg-purple-950 text-white font-bold text-xs sm:text-sm shadow-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-purple-200" />
                    <span>Add {quantity} to Cart</span>
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
