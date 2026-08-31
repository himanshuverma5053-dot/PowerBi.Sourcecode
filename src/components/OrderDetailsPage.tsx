import React, { useState, useEffect } from 'react';
import { TyreProduct, CustomerAccount } from '../types';
import { getCustomerEffectivePrice } from '../utils/customerPricing';
import {
  ArrowLeft, Check, Home, Phone, ShieldCheck,
  Truck, Star, ChevronRight, FileText,
  Disc3, Sparkles, X
} from 'lucide-react';

interface OrderDetailsPageProps {
  product: TyreProduct;
  initialQuantity?: number;
  currentCustomer?: CustomerAccount | null;
  currentUser?: string;
  currentUserEmail?: string;
  coupons?: any[];
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
  const [isChangeAddressOpen, setIsChangeAddressOpen] = useState(false);
  const [isGstModalOpen, setIsGstModalOpen] = useState(false);

  // Auto-scroll to top when page opens
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Address state editable if user clicks "Change"
  const [addressData, setAddressData] = useState({
    name: currentCustomer?.customerName || currentUser || 'Himanshu Verma',
    street: currentCustomer?.address || 'Yellow building, Vishwakarma Vihar, Dandiapali',
    city: currentCustomer?.city || 'Rourkela',
    state: currentCustomer?.state || 'Odisha',
    pincode: currentCustomer?.pincode || '769004',
    phone: currentCustomer?.phone || '6371231522',
    email: currentCustomer?.email || currentUserEmail || 'himanshu.verma5053@gmail.com',
    companyName: currentCustomer?.companyName || 'Magadh Sparsh Logistics',
    gstNumber: currentCustomer?.gstNumber || '21AAACM1234F1Z5',
  });

  // Pricing calculations
  const pricingInfo = getCustomerEffectivePrice(product, currentCustomer);
  const unitPrice = (quantity >= 4 && product.bulkPrice) ? product.bulkPrice : pricingInfo.effectivePrice;
  const protectPromiseFee = 29;
  const rawSubtotal = unitPrice * quantity;
  const totalPayable = rawSubtotal + protectPromiseFee;

  // Accurate Net Value (Excl. tax) and Tax (Incl. TCS+GST) at 18% standard rate
  const netValue = Math.round((totalPayable / 1.18) * 100) / 100;
  const taxAmount = Math.round((totalPayable - netValue) * 100) / 100;
  const gstAmount = taxAmount;

  // Format currency with two decimal places
  const formatCurrency = (val: number) => {
    return val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Estimated delivery date (2 days from now)
  const getDeliveryDateString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    const dayName = d.toLocaleDateString('en-IN', { weekday: 'short' });
    return `2 days, ${dayName}`;
  };

  const handleProceed = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onProceedOrder({
        customerName: addressData.name,
        customerEmail: addressData.email,
        phone: addressData.phone,
        companyName: addressData.companyName,
        gstNumber: addressData.gstNumber,
        shippingAddress: {
          street: addressData.street,
          city: addressData.city,
          state: addressData.state,
          pincode: addressData.pincode
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
    <div className="min-h-screen bg-white pb-36 antialiased text-slate-800 select-none">
      
      {/* 1. TOP CONFIRM DETAILS & 3-STEP PROGRESS HEADER (MATCHING SCREENSHOT) */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-2xl mx-auto px-4 py-3">
          
          {/* Header Row: Back Arrow + Confirm details */}
          <div className="flex items-center space-x-4 mb-3.5">
            <button
              onClick={onBack}
              type="button"
              className="p-1 -ml-1 text-slate-900 hover:text-[#1064ea] hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6 text-slate-900 stroke-[2.2]" />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Confirm details
            </h1>
          </div>

          {/* 3-Step Checkout Flow: Address (Done) -> Confirm details (Active) -> Payment */}
          <div className="max-w-md mx-auto px-2 pb-1">
            <div className="flex items-center justify-between relative">
              {/* Step 1: Address */}
              <button
                type="button"
                onClick={() => setIsChangeAddressOpen(true)}
                className="flex flex-col items-center group cursor-pointer focus:outline-hidden"
              >
                <div className="w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-full border-2 border-[#1064ea] bg-white text-[#1064ea] flex items-center justify-center mb-1 transition-transform group-hover:scale-105 shadow-2xs">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span className="text-[12px] sm:text-[13px] font-medium text-slate-700">
                  Address
                </span>
              </button>

              {/* Connecting Line 1 */}
              <div className="flex-1 h-[1px] bg-slate-200 mx-3 sm:mx-4 -mt-5" />

              {/* Step 2: Confirm details */}
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-full bg-[#1064ea] text-white flex items-center justify-center font-bold text-xs mb-1 shadow-xs">
                  2
                </div>
                <span className="text-[12px] sm:text-[13px] font-bold text-slate-900">
                  Confirm details
                </span>
              </div>

              {/* Connecting Line 2 */}
              <div className="flex-1 h-[1px] bg-slate-200 mx-3 sm:mx-4 -mt-5" />

              {/* Step 3: Payment */}
              <button
                type="button"
                onClick={handleProceed}
                className="flex flex-col items-center group cursor-pointer focus:outline-hidden"
              >
                <div className="w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-full border border-slate-300 bg-white text-slate-400 flex items-center justify-center font-medium text-xs mb-1 transition-transform group-hover:scale-105">
                  3
                </div>
                <span className="text-[12px] sm:text-[13px] font-normal text-slate-400 group-hover:text-slate-600">
                  Payment
                </span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* MAIN CONTAINER ON PURE WHITE BACKGROUND */}
      <main className="max-w-2xl mx-auto px-4 pt-3.5 space-y-4">
        
        {/* 3. PRODUCT ORDER SUMMARY SECTION */}
        <section className="space-y-2.5">
          
          <div className="flex items-start space-x-3.5 sm:space-x-4">
            
            {/* Left: Product Thumbnail & Quantity Stepper */}
            <div className="flex flex-col items-center shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#f5f6f8] p-2 flex items-center justify-center overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain mix-blend-multiply transition-transform hover:scale-105"
                  />
                ) : (
                  <Disc3 className="w-10 h-10 text-slate-300 animate-spin-slow" />
                )}
              </div>

              {/* Stepper Pill (- 1 +) Directly Under Thumbnail */}
              <div className="flex items-center justify-between border border-slate-200 rounded-lg mt-2.5 w-full bg-white shadow-2xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-slate-700 hover:bg-slate-100 active:bg-slate-200 disabled:opacity-30 font-bold text-sm cursor-pointer transition-colors"
                >
                  –
                </button>
                <span className="text-xs sm:text-sm font-bold text-slate-900 px-1 select-none">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(q => (product.stock ? Math.min(product.stock, q + 1) : q + 1))}
                  disabled={Boolean(product.stock && quantity >= product.stock)}
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-slate-700 hover:bg-slate-100 active:bg-slate-200 disabled:opacity-30 font-bold text-sm cursor-pointer transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Right: Product Details & Pricing */}
            <div className="flex-1 min-w-0 space-y-1 sm:space-y-1.5">
              
              {/* Product Title */}
              <h3 className="text-sm sm:text-[15px] font-bold text-slate-900 leading-snug line-clamp-2">
                {product.name}
              </h3>

              {/* Subtitle / Attributes */}
              <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {product.brand} Commercial Radial, {product.width}/{product.aspectRatio} R{product.rimSize}, Premium All-Weather Grip
              </p>

              {/* Rating & Assured Badge */}
              <div className="flex items-center space-x-2 pt-0.5">
                <div className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-emerald-700 text-white text-[10px] sm:text-[11px] font-bold">
                  <span>4.2</span>
                  <Star className="w-2.5 h-2.5 fill-white" />
                  <span className="text-emerald-100 font-normal pl-0.5">39.6K+</span>
                </div>

                {/* Assured Shield Badge */}
                <div className="inline-flex items-center space-x-1 text-[#1064ea] font-extrabold text-[11px] sm:text-xs italic tracking-tight">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1064ea] fill-blue-50" />
                  <span>Assured</span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline flex-wrap gap-x-2 gap-y-0.5 pt-1">
                <span className="text-base sm:text-lg font-black text-slate-900">
                  ₹{(unitPrice * quantity).toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  (₹{unitPrice.toLocaleString('en-IN')} / piece)
                </span>
              </div>

              {/* Protect Promise Fee row */}
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={() => {}}
                  className="text-[11px] text-slate-500 hover:text-slate-700 inline-flex items-center space-x-0.5 cursor-pointer"
                >
                  <span>+₹{protectPromiseFee} Protect Promise Fee</span>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                </button>
              </div>

            </div>

          </div>

          {/* Delivery Pill Row with Flipkart Card Theme */}
          <div className="bg-[#f5f6f8] rounded-xl px-3.5 py-2.5 flex items-center space-x-2 text-xs text-slate-700">
            <Truck className="w-4 h-4 text-slate-600 shrink-0" />
            <span className="text-slate-600">Delivery in</span>
            <span className="font-bold italic text-slate-900">{getDeliveryDateString()}</span>
          </div>

        </section>

        {/* 4. PRICE DETAILS / ORDER SUMMARY SECTION */}
        <section className="space-y-2">
          <h2 className="text-[16px] sm:text-[17px] font-extrabold text-slate-900 px-0.5">
            Order Summary
          </h2>

          {/* Flipkart Card Theme: Soft Off-White/Gray Container */}
          <div className="bg-[#f5f6f8] rounded-2xl p-4 sm:p-5 space-y-3.5">
            
            {/* Line Items matching requested data style and layout */}
            <div className="space-y-3 text-xs sm:text-[13px] text-slate-700">
              
              <div className="flex justify-between items-center">
                <span className="font-normal text-slate-700">
                  Total items
                </span>
                <span className="font-medium text-slate-900">
                  1
                </span>
              </div>

              <div className="flex justify-between items-start">
                <span className="font-normal text-slate-700">
                  Total Confirmed Quantity
                </span>
                <span className="font-medium text-slate-900">
                  {quantity}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-normal text-slate-700">
                  Net Value (Excl. tax)
                </span>
                <span className="font-medium text-slate-900">
                  ₹{formatCurrency(netValue)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-normal text-slate-700">
                  Tax (Incl. TCS+GST)
                </span>
                <span className="font-medium text-slate-900">
                  ₹{formatCurrency(taxAmount)}
                </span>
              </div>

              {/* Grand Total */}
              <div className="border-t border-slate-300/80 pt-3.5 flex justify-between items-center">
                <span className="text-base sm:text-lg font-black text-slate-900">
                  Grand Total
                </span>
                <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  ₹{formatCurrency(totalPayable)}
                </span>
              </div>

            </div>

          </div>

          {/* Trust Assurance Badge */}
          <div className="pt-2 flex items-center justify-center space-x-2 text-center text-[11px] text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Safe and secure payments. Easy returns. 100% Authentic products.</span>
          </div>
        </section>

        {/* 5. GST INPUT CREDIT BANNER */}
        <section className="bg-[#f5f6f8] rounded-2xl p-4 sm:p-4.5 flex items-center justify-between">
          <div className="space-y-1 pr-3">
            <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
              Claim up to 28% GST input credit on business purchases
            </p>
            <button
              type="button"
              onClick={() => setIsGstModalOpen(true)}
              className="text-xs sm:text-[13px] font-bold text-[#1064ea] hover:text-[#0b4dc1] underline cursor-pointer"
            >
              {addressData.gstNumber ? `GSTIN: ${addressData.gstNumber}` : 'Add GSTIN number'}
            </button>
          </div>

          {/* Receipt / Invoice Graphic */}
          <div className="w-14 h-14 rounded-xl bg-white border border-slate-200/80 p-2 flex items-center justify-center shrink-0 shadow-2xs">
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </section>

        {/* 6. LEGAL DISCLAIMER FOOTER */}
        <footer className="text-center px-4 py-2">
          <p className="text-[11px] text-slate-500 leading-relaxed">
            By proceeding, you confirm that you're above 18 years of age and you agree to Flipkart's{' '}
            <span className="text-[#1064ea] hover:underline cursor-pointer">Terms of Use</span> and{' '}
            <span className="text-[#1064ea] hover:underline cursor-pointer">Privacy Policy</span>
          </p>
        </footer>

      </main>

      {/* 7. FIXED FLOATING BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-2xl">

        {/* Bottom CTA Row */}
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          
          {/* Price details */}
          <div>
            <span className="text-[11px] text-slate-500 block font-medium">Total Amount</span>
            <div className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              ₹{totalPayable.toLocaleString('en-IN')}
            </div>
          </div>

          {/* Amazon Royal Blue 'Proceed' Button */}
          <button
            type="button"
            id="btn-confirm-continue"
            onClick={handleProceed}
            disabled={isSubmitting}
            className="py-3 px-8 sm:px-10 rounded-md font-bold text-sm sm:text-base text-white bg-[#0066c0] hover:bg-[#005299] active:bg-[#004080] shadow-sm transition-all duration-150 cursor-pointer active:scale-[0.98] disabled:opacity-60 flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Proceeding...</span>
              </>
            ) : (
              <span>Proceed</span>
            )}
          </button>

        </div>
      </div>

      {/* CHANGE ADDRESS MODAL */}
      {isChangeAddressOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Update Delivery Address</h3>
              <button
                onClick={() => setIsChangeAddressOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={addressData.name}
                  onChange={e => setAddressData({ ...addressData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1064ea] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Street Address / Building</label>
                <input
                  type="text"
                  value={addressData.street}
                  onChange={e => setAddressData({ ...addressData, street: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1064ea] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">City</label>
                  <input
                    type="text"
                    value={addressData.city}
                    onChange={e => setAddressData({ ...addressData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1064ea] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pincode</label>
                  <input
                    type="text"
                    value={addressData.pincode}
                    onChange={e => setAddressData({ ...addressData, pincode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1064ea] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={addressData.phone}
                  onChange={e => setAddressData({ ...addressData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1064ea] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex space-x-2">
              <button
                type="button"
                onClick={() => setIsChangeAddressOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-700 text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setIsChangeAddressOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#1064ea] font-bold text-white text-xs hover:bg-[#0b4dc1] cursor-pointer"
              >
                Save & Deliver Here
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GSTIN MODAL */}
      {isGstModalOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Business GSTIN</h3>
              <button
                onClick={() => setIsGstModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">GSTIN Number</label>
                <input
                  type="text"
                  placeholder="e.g. 21AAACM1234F1Z5"
                  value={addressData.gstNumber}
                  onChange={e => setAddressData({ ...addressData, gstNumber: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1064ea] focus:outline-none uppercase font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Company / Legal Business Name</label>
                <input
                  type="text"
                  value={addressData.companyName}
                  onChange={e => setAddressData({ ...addressData, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#1064ea] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex space-x-2">
              <button
                type="button"
                onClick={() => setIsGstModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-700 text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setIsGstModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#1064ea] font-bold text-white text-xs hover:bg-[#0b4dc1] cursor-pointer"
              >
                Save GSTIN
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrderDetailsPage;
