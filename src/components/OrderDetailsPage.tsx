import React, { useState } from 'react';
import { TyreProduct, CustomerAccount } from '../types';
import { getCustomerEffectivePrice } from '../utils/customerPricing';
import { ArrowLeft, Disc3, Zap, X } from 'lucide-react';

interface OrderDetailsPageProps {
  product: TyreProduct;
  initialQuantity?: number;
  currentCustomer?: CustomerAccount | null;
  currentUser?: string;
  currentUserEmail?: string;
  onProceedOrder: (orderData: {
    customerName: string;
    customerEmail: string;
    phone: string;
    companyName?: string;
    gstNumber?: string;
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      pincode: string;
    };
    paymentMethod: 'UPI' | 'Card' | 'NetBanking' | 'EMI' | 'Pay on Delivery';
    quantity: number;
    couponCode?: string;
    discount: number;
    subtotal: number;
    gstAmount: number;
    totalAmount: number;
  }) => void;
  onBack: () => void;
}

export const OrderDetailsPage: React.FC<OrderDetailsPageProps> = ({
  product,
  initialQuantity = 1,
  currentCustomer,
  currentUser,
  currentUserEmail,
  onProceedOrder,
  onBack
}) => {
  const [quantity, setQuantity] = useState<number>(initialQuantity || 1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Pricing calculation
  const pricingInfo = getCustomerEffectivePrice(product, currentCustomer);
  const unitPrice = (quantity >= 4 && product.bulkPrice) ? product.bulkPrice : pricingInfo.effectivePrice;
  const rawSubtotal = unitPrice * quantity;
  const totalPayable = rawSubtotal;
  
  // 18% GST calculation
  const gstAmount = Math.round((totalPayable - (totalPayable / 1.18)) * 100) / 100;
  const baseExcludingGst = Math.round((totalPayable / 1.18) * 100) / 100;

  const handleProceed = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onProceedOrder({
        customerName: currentCustomer?.customerName || currentUser || 'Valued Customer',
        customerEmail: currentCustomer?.email || currentUserEmail || 'customer@magadhtyres.com',
        phone: currentCustomer?.phone || '+91 98351 22345',
        companyName: currentCustomer?.companyName || 'Magadh Commercial Fleet',
        gstNumber: currentCustomer?.gstNumber || '10AAACM1234F1Z5',
        shippingAddress: {
          street: currentCustomer?.address || 'Industrial Area, Bypass Road',
          city: currentCustomer?.city || 'Patna',
          state: currentCustomer?.state || 'Bihar',
          pincode: currentCustomer?.pincode || '800001'
        },
        paymentMethod: 'UPI',
        quantity,
        discount: 0,
        subtotal: rawSubtotal,
        gstAmount,
        totalAmount: totalPayable
      });
      setIsSubmitting(false);
    }, 300);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-purple-700 bg-white hover:bg-purple-50 px-4 py-2 rounded-xl border border-slate-200 shadow-2xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalogue</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-100 text-[#8a14d4] border border-purple-200">
            {product.brand} {product.category}
          </span>
        </div>
      </div>

      {/* Main Grid: Left (Product Demonstration Showcase) & Right (Order Summary & Proceed) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 8 Columns: Pure Product Demonstration */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            
            {/* Header / Title */}
            <div className="pb-4 border-b border-slate-100">
              <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight">
                {product.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">
                Size: <span className="text-slate-900 font-bold">{product.width}/{product.aspectRatio} R{product.rimSize}</span> • Load & Speed: <span className="text-slate-900 font-bold">{product.loadIndex}{product.speedRating}</span>
              </p>
            </div>

            {/* Product Visual Demonstration Stage */}
            <div className="rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/80 p-8 border border-slate-200 flex items-center justify-center min-h-[360px]">
              <div className="w-full max-w-md h-72 sm:h-80 flex items-center justify-center">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain mix-blend-multiply"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Disc3 className="w-24 h-24 text-slate-300 animate-spin-slow" />
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Right 4 Columns: Order Summary & Proceed Action */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-5">
            
            <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
              Order Summary
            </h2>

            {/* Product Mini Row */}
            <div className="flex items-center space-x-3.5 pb-4 border-b border-slate-100">
              <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 p-1.5 flex items-center justify-center shrink-0">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                ) : (
                  <Disc3 className="w-6 h-6 text-slate-300" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-black text-slate-900 truncate">{product.name}</div>
                <div className="text-xs text-slate-500 font-semibold">{product.width}/{product.aspectRatio} R{product.rimSize}</div>
                <div className="text-xs font-black text-[#8a14d4] mt-0.5">₹{unitPrice.toLocaleString('en-IN')} / unit</div>
              </div>
            </div>

            {/* Quantity Stepper */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Select Quantity</span>
                {quantity >= 4 && product.bulkPrice && (
                  <span className="text-[11px] font-black text-emerald-600">Bulk Tier Active</span>
                )}
              </div>
              <div className="flex items-center justify-between border border-slate-200 rounded-2xl p-1.5 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-700 hover:bg-slate-100 active:bg-slate-200 disabled:opacity-30 border border-slate-200 shadow-2xs font-black text-base transition-colors cursor-pointer"
                >
                  -
                </button>
                <span className="text-base font-black text-slate-900 select-none">
                  {quantity} {quantity === 1 ? 'Tyre' : 'Tyres'}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(q => product.stock ? Math.min(product.stock, q + 1) : q + 1)}
                  disabled={Boolean(product.stock && quantity >= product.stock)}
                  className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-700 hover:bg-slate-100 active:bg-slate-200 disabled:opacity-30 border border-slate-200 shadow-2xs font-black text-base transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Pricing Line Items */}
            <div className="space-y-2.5 text-xs sm:text-sm text-slate-600 border-t border-slate-100 pt-4">
              <div className="flex justify-between items-center">
                <span>Taxable Base Value</span>
                <span className="font-semibold text-slate-900">₹{baseExcludingGst.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between items-center">
                <span>GST (18% Included)</span>
                <span className="font-semibold text-slate-900">₹{gstAmount.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between items-center">
                <span>Direct Dispatch</span>
                <span className="font-black text-emerald-600 text-xs">FREE</span>
              </div>

              {/* Total Payable Box */}
              <div className="border-t-2 border-dashed border-slate-200 pt-3 mt-3 flex justify-between items-baseline">
                <div>
                  <div className="text-base font-black text-slate-900">Total Payable</div>
                  <div className="text-[10px] text-slate-400 font-semibold">(Incl. 18% GST)</div>
                </div>
                <div className="text-2xl font-black text-[#8a14d4]">
                  ₹{totalPayable.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Action Buttons: Cancel & Proceed Horizontally */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                id="btn-cancel-order"
                onClick={onBack}
                disabled={isSubmitting}
                className="px-5 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold text-sm sm:text-base transition-all flex items-center justify-center space-x-1.5 border border-slate-200 cursor-pointer disabled:opacity-50"
              >
                <X className="w-4 h-4 text-slate-500" />
                <span>Cancel</span>
              </button>

              <button
                type="button"
                id="btn-proceed-order"
                onClick={handleProceed}
                disabled={isSubmitting}
                className="flex-1 py-4 px-6 rounded-2xl font-black text-base flex items-center justify-center space-x-2 transition-all duration-200 shadow-md cursor-pointer active:scale-[0.98] bg-[#9800ff] hover:bg-[#8500df] active:bg-[#7200be] text-white disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center space-x-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </span>
                ) : (
                  <>
                    <Zap className="w-5 h-5 fill-white text-white" />
                    <span>Proceed</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
