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
  onNavigateToProfile?: () => void;
}

export const OrderDetailsPage: React.FC<OrderDetailsPageProps> = ({
  product,
  initialQuantity = 1,
  currentCustomer,
  currentUser,
  currentUserEmail,
  onProceedOrder,
  onBack,
  onNavigateToProfile
}) => {
  const [quantity, setQuantity] = useState<number>(initialQuantity || 1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Auto-scroll to top when page opens
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Helper to load current user profile from localStorage or props
  const getInitialProfileData = () => {
    let savedProfile: any = null;
    try {
      const activeUser = currentUser || '';
      const userKey = activeUser ? `user_profile_${activeUser.toLowerCase()}` : null;
      const raw = userKey ? localStorage.getItem(userKey) || localStorage.getItem('user_profile') : localStorage.getItem('user_profile');
      if (raw) {
        savedProfile = JSON.parse(raw);
      }
    } catch (e) {
      // ignore
    }

    const name = savedProfile?.customerName || savedProfile?.name || currentCustomer?.customerName || currentUser || 'Himanshu Verma';
    const street = savedProfile?.address || currentCustomer?.address || 'Yellow building, Vishwakarma Vihar, Dandiapali';
    const city = currentCustomer?.city || 'Rourkela';
    const state = currentCustomer?.state || 'Odisha';
    const pincode = currentCustomer?.pincode || '769004';
    const phone = savedProfile?.phone || currentCustomer?.phone || '6371231522';
    const email = savedProfile?.email || savedProfile?.userId || currentCustomer?.email || currentUserEmail || 'himanshu.verma5053@gmail.com';
    const companyName = savedProfile?.companyName || currentCustomer?.companyName || 'Magadh Sparsh Logistics';
    const gstNumber = savedProfile?.gstNumber || currentCustomer?.gstNumber || '21AAACM1234F1Z5';

    return {
      name,
      street,
      city,
      state,
      pincode,
      phone,
      email,
      companyName,
      gstNumber
    };
  };

  // Address and GST state
  const [addressData, setAddressData] = useState(getInitialProfileData);

  // Sync addressData instantly whenever props or storage changes
  useEffect(() => {
    const syncData = () => {
      setAddressData(getInitialProfileData());
    };

    syncData();

    window.addEventListener('storage', syncData);
    window.addEventListener('magadh_profile_updated', syncData);
    return () => {
      window.removeEventListener('storage', syncData);
      window.removeEventListener('magadh_profile_updated', syncData);
    };
  }, [currentCustomer, currentUser, currentUserEmail]);

  // Pricing calculations
  const pricingInfo = getCustomerEffectivePrice(product, currentCustomer);
  const unitPrice = (quantity >= 4 && product.bulkPrice) ? product.bulkPrice : pricingInfo.effectivePrice;
  const rawSubtotal = unitPrice * quantity;
  const totalPayable = rawSubtotal;

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
          <div className="flex items-center space-x-4">
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

        </div>
      </div>

      {/* MAIN CONTAINER ON PURE WHITE BACKGROUND */}
      <main className="max-w-2xl mx-auto px-4 pt-3.5 space-y-4">
        
        {/* 2. DELIVERING TO ADDRESS SECTION */}
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Delivering to
          </h2>

          {/* Sharp Edge Pointed Corners Container */}
          <div className="bg-[#f5f6f8] rounded-none p-4 sm:p-5 space-y-2.5">
            {/* Name Row with Home icon and Change button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5 min-w-0">
                <Home className="w-5 h-5 text-slate-900 fill-slate-900 shrink-0" />
                <span className="text-base sm:text-[17px] font-black text-slate-900 tracking-tight truncate">
                  {addressData.name}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (onNavigateToProfile) {
                    onNavigateToProfile();
                  }
                }}
                className="text-[#1064ea] hover:text-[#0b4dc1] font-bold text-sm sm:text-[15px] cursor-pointer transition-colors shrink-0 ml-2"
              >
                Change
              </button>
            </div>

            {/* Address Details */}
            <div className="text-xs sm:text-[13px] text-slate-600 font-medium leading-relaxed pl-7.5 space-y-0.5">
              <p className="line-clamp-2">
                {addressData.street}, {addressData.city}, {addressData.state} - {addressData.pincode}
              </p>
              <p className="text-slate-500 font-mono">
                +91 {addressData.phone}
              </p>
            </div>
          </div>
        </section>

        {/* Separator Line */}
        <div className="w-full h-px bg-slate-200 my-2" role="separator" />

        {/* 3. PRODUCT ORDER SUMMARY SECTION */}
        <section className="space-y-2.5">
          
          <div className="flex items-start space-x-3.5 sm:space-x-4">
            
            {/* Left: Product Thumbnail & Quantity Stepper */}
            <div className="flex flex-col items-center shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-none bg-[#f5f6f8] p-2 flex items-center justify-center overflow-hidden">
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
              <div className="flex items-center justify-between border border-slate-200 rounded-none mt-2.5 w-full bg-white shadow-2xs overflow-hidden">
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

              {/* Price */}
              <div className="flex items-baseline flex-wrap gap-x-2 gap-y-0.5 pt-1">
                <span className="text-base sm:text-lg font-black text-slate-900">
                  ₹{(unitPrice * quantity).toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  (₹{unitPrice.toLocaleString('en-IN')} / piece)
                </span>
              </div>

            </div>

          </div>

        </section>

        {/* Separator Line */}
        <div className="w-full h-px bg-slate-200 my-2" role="separator" />

        {/* 4. GST DETAILS SECTION */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-[16px] sm:text-[17px] font-extrabold text-slate-900">
              GST Details
            </h2>
          </div>

          {/* Sharp Edge Pointed Corners Container */}
          <div className="bg-[#f5f6f8] rounded-none p-4 sm:p-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5 min-w-0">
                <FileText className="w-5 h-5 text-slate-900 shrink-0" />
                <div className="min-w-0">
                  <span className="text-sm sm:text-base font-black text-slate-900 tracking-tight block truncate">
                    {addressData.gstNumber ? `GSTIN: ${addressData.gstNumber}` : 'No GSTIN Added'}
                  </span>
                  {addressData.companyName && (
                    <span className="text-xs text-slate-600 block truncate font-medium">
                      {addressData.companyName}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (onNavigateToProfile) {
                    onNavigateToProfile();
                  }
                }}
                className="text-[#1064ea] hover:text-[#0b4dc1] font-bold text-sm sm:text-[15px] cursor-pointer transition-colors shrink-0 ml-2"
              >
                {addressData.gstNumber ? 'Edit' : 'Add'}
              </button>
            </div>

            <p className="text-xs text-slate-500 pl-7.5 leading-relaxed">
              {addressData.gstNumber 
                ? 'GST input tax credit will be automatically mapped to your business invoice.' 
                : 'Add your business GSTIN to claim GST input tax credit on this order.'}
            </p>
          </div>
        </section>

        {/* Separator Line */}
        <div className="w-full h-px bg-slate-200 my-2" role="separator" />

        {/* 5. PRICE DETAILS / ORDER SUMMARY SECTION */}
        <section className="space-y-2">
          <h2 className="text-[16px] sm:text-[17px] font-extrabold text-slate-900 px-0.5">
            Order Summary
          </h2>

          {/* Sharp Edge Corners: Soft Off-White/Gray Container */}
          <div className="bg-[#f5f6f8] rounded-none p-4 sm:p-5 space-y-3.5">
            
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
        </section>

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

    </div>
  );
};

export default OrderDetailsPage;
