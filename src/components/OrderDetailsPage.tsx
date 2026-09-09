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
  onNavigateToProfile?: (targetField?: string) => void;
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

  // Sync quantity whenever product or initialQuantity changes
  useEffect(() => {
    setQuantity(initialQuantity || 1);
  }, [initialQuantity, product.id]);

  // Dynamic Size specification extractor
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
    return '';
  };

  const productSize = getProductSize();
  const productImage = product.image_url || product.image;

  // Auto-scroll to top when page opens
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Helper to load current user profile dynamically from localStorage, draft, or props
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

    // Only fetch data strictly written in the My Profile page fields; if nothing is written, fetch NO data (empty strings)
    const name = (
      savedProfile?.username ||
      savedProfile?.customerName ||
      savedProfile?.name ||
      ''
    ).trim();

    const workshopAddress = (
      savedProfile?.workshop_address ||
      savedProfile?.['workshop address'] ||
      savedProfile?.workshopAddress ||
      savedProfile?.address ||
      savedProfile?.office_address ||
      ''
    ).trim();

    const phone = (
      savedProfile?.contact_number ||
      savedProfile?.['contact number'] ||
      savedProfile?.contactNumber ||
      savedProfile?.phone ||
      ''
    ).trim();

    const email = (
      savedProfile?.email_address ||
      savedProfile?.['email address'] ||
      savedProfile?.emailAddress ||
      savedProfile?.email ||
      savedProfile?.userId ||
      currentUserEmail ||
      ''
    ).trim();

    const companyName = (
      savedProfile?.companyName ||
      ''
    ).trim();

    const gstNumber = (
      savedProfile?.GSTIN ||
      savedProfile?.gstin ||
      savedProfile?.gstNumber ||
      ''
    ).trim();

    return {
      name,
      workshopAddress,
      street: workshopAddress,
      city: '',
      state: '',
      pincode: '',
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
          street: addressData.workshopAddress || addressData.street,
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
    <div className="min-h-screen bg-[#f5f6f8] pb-36 antialiased text-slate-800 select-none">
      
      {/* 1. TOP CONFIRM DETAILS & 3-STEP PROGRESS HEADER (MATCHING SCREENSHOT) */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
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

      {/* MAIN CONTAINER ON SECTION-COLOR BACKGROUND (#f5f6f8) */}
      <main className="max-w-2xl mx-auto px-4 pt-3.5 pb-6 space-y-4">
        
        {/* 2. DELIVERING TO ADDRESS SECTION */}
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Delivering to
          </h2>

          {/* Clickable White Container on #f5f6f8 Background that navigates to My Profile */}
          <div
            id="confirm-details-delivering-to-section"
            role="button"
            tabIndex={0}
            onClick={() => {
              try {
                sessionStorage.setItem('profile_target_focus', 'workshop_address');
              } catch (err) {
                // ignore
              }
              if (onNavigateToProfile) {
                onNavigateToProfile('workshop_address');
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                try {
                  sessionStorage.setItem('profile_target_focus', 'workshop_address');
                } catch (err) {
                  // ignore
                }
                if (onNavigateToProfile) {
                  onNavigateToProfile('workshop_address');
                }
              }
            }}
            title="Click to view or edit My Profile address details"
            className="bg-white border border-slate-200/80 hover:border-[#1064ea]/60 shadow-2xs hover:shadow-sm active:bg-slate-50/80 rounded-none p-4 sm:p-5 cursor-pointer transition-all duration-150 group"
          >
            {/* Name Row with Home icon and Change button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5 min-w-0">
                <Home className="w-5 h-5 text-slate-900 fill-slate-900 shrink-0 group-hover:text-[#1064ea] group-hover:fill-[#1064ea] transition-colors" />
                <span className={`text-base sm:text-[17px] tracking-tight truncate ${addressData.name ? 'font-black text-slate-900' : 'font-medium text-slate-400'}`}>
                  {addressData.name || 'No Name Added'}
                </span>
              </div>

              <button
                type="button"
                id="confirm-details-change-address-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  try {
                    sessionStorage.setItem('profile_target_focus', 'workshop_address');
                  } catch (err) {
                    // ignore
                  }
                  if (onNavigateToProfile) {
                    onNavigateToProfile('workshop_address');
                  }
                }}
                className="flex items-center space-x-1 text-[#1064ea] hover:text-[#0b4dc1] group-hover:text-[#0b4dc1] font-bold text-sm sm:text-[15px] shrink-0 ml-2 transition-colors cursor-pointer"
              >
                <span>{(addressData.name || addressData.workshopAddress) ? 'Change' : 'Add'}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Address Details - flush directly under name with no vertical spacing */}
            <div className="text-xs sm:text-[13px] text-slate-600 font-medium leading-relaxed pl-7.5">
              {addressData.workshopAddress ? (
                <p className="line-clamp-2 text-slate-700">
                  {addressData.workshopAddress}
                </p>
              ) : (
                <p className="text-slate-400">
                  No delivery address added. Click to add workshop address.
                </p>
              )}
              {addressData.phone ? (
                <p className="text-slate-500 font-mono">
                  {addressData.phone.startsWith('+91') ? addressData.phone : `+91 ${addressData.phone}`}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        {/* 3. PRODUCT ORDER SUMMARY SECTION */}
        <section className="space-y-2">
          <div className="bg-white border border-slate-200/80 shadow-2xs rounded-none p-4 sm:p-5">
            <div className="flex items-start space-x-3.5 sm:space-x-4">
              
              {/* Left: Product Thumbnail & Quantity Stepper */}
              <div className="flex flex-col items-center shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-none bg-[#f5f6f8] p-2 flex items-center justify-center overflow-hidden">
                  {productImage ? (
                    <img
                      src={productImage}
                      alt={product.name}
                      className="w-full h-full object-contain mix-blend-multiply transition-transform hover:scale-105"
                      referrerPolicy="no-referrer"
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
              <div className="flex-1 min-w-0 space-y-1.5">
                
                {/* Brand & Size Header Row */}
                <div className="flex items-center justify-between gap-1.5 flex-wrap">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {(!product.brand || product.brand.toLowerCase().includes('apollo')) ? (
                      <img
                        src="/apollo_tyres_logo.svg"
                        alt="Apollo Tyres"
                        className="h-3.5 sm:h-4 w-auto object-contain shrink-0"
                      />
                    ) : product.brand.toLowerCase().includes('jk') ? (
                      <img
                        src="/jk_tyre_logo_transparent.svg"
                        alt={product.brand}
                        className="h-3.5 sm:h-4 w-auto object-contain shrink-0"
                      />
                    ) : (
                      <span className="font-extrabold text-[9px] text-[#43006A] uppercase px-1.5 py-0.5 rounded bg-purple-50 shrink-0">
                        {product.brand}
                      </span>
                    )}
                    {productSize && (
                      <span className="text-[11.5px] sm:text-[12.5px] font-black text-[#8a18ca] font-display uppercase tracking-tight truncate">
                        {productSize}
                      </span>
                    )}
                  </div>

                  {/* Red Icon Standard */}
                  <div 
                    id={`confirm-product-red-icon-${product.id}`}
                    className="w-4.5 h-3.5 sm:w-5 sm:h-4 rounded-xs bg-[#E50000] border border-[#B30000] shrink-0" 
                    title="Quality Standard"
                  />
                </div>

                {/* Dynamic Product Title */}
                <h3 className="text-sm sm:text-[15px] font-extrabold font-display text-slate-900 leading-snug">
                  {product.name}
                </h3>

                {/* Dynamic Product Description */}
                {product.description ? (
                  <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {product.description}
                  </p>
                ) : (
                  <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {product.brand || 'Commercial'} Radial Tyre, {productSize || 'Heavy Duty'}, Premium Performance & Load Bearing
                  </p>
                )}

                {/* Dynamic Tyre Specs / Attributes Tags */}
                {(product.tireType || product.tire_type || product.pattern || product.warrantyYears) && (
                  <div className="flex items-center gap-1.5 flex-wrap text-[10px] sm:text-[10.5px] text-slate-600 pt-0.5">
                    {(product.tireType || product.tire_type) && (
                      <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                        {product.tireType || product.tire_type}
                      </span>
                    )}
                    {product.pattern && (
                      <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                        {product.pattern}
                      </span>
                    )}
                    {product.warrantyYears && (
                      <span className="bg-purple-50 text-[#8a18ca] px-1.5 py-0.5 rounded font-bold">
                        {product.warrantyYears} Yr Warranty
                      </span>
                    )}
                  </div>
                )}

                {/* Price */}
                <div className="flex items-baseline flex-wrap gap-x-2 gap-y-0.5 pt-1.5 border-t border-slate-100">
                  <span className="text-base sm:text-lg font-black text-[#8a18ca] font-display">
                    ₹{(unitPrice * quantity).toLocaleString('en-IN')}{(unitPrice * quantity) % 1 === 0 ? '.00' : ''}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    (₹{unitPrice.toLocaleString('en-IN')}{unitPrice % 1 === 0 ? '.00' : ''} / piece)
                  </span>
                  {product.mrp && product.mrp > unitPrice && (
                    <span className="text-[10px] sm:text-[10.5px] text-slate-400 line-through">
                      MRP: ₹{product.mrp.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* 4. GST DETAILS SECTION */}
        <section className="space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-[16px] sm:text-[17px] font-extrabold text-slate-900">
              GST Details
            </h2>
          </div>

          {/* White Container on #f5f6f8 Background */}
          <div
            id="confirm-details-gst-section"
            role="button"
            tabIndex={0}
            onClick={() => {
              try {
                sessionStorage.setItem('profile_target_focus', 'GSTIN');
              } catch (err) {
                // ignore
              }
              if (onNavigateToProfile) {
                onNavigateToProfile('GSTIN');
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                try {
                  sessionStorage.setItem('profile_target_focus', 'GSTIN');
                } catch (err) {
                  // ignore
                }
                if (onNavigateToProfile) {
                  onNavigateToProfile('GSTIN');
                }
              }
            }}
            title="Click to view or edit GSTIN in My Profile"
            className="bg-white border border-slate-200/80 hover:border-[#1064ea]/60 shadow-2xs hover:shadow-sm active:bg-slate-50/80 rounded-none p-4 sm:p-5 space-y-2.5 cursor-pointer transition-all duration-150 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5 min-w-0">
                <FileText className="w-5 h-5 text-slate-900 shrink-0 group-hover:text-[#1064ea] transition-colors" />
                <div className="min-w-0">
                  <span className={`text-sm sm:text-base tracking-tight block truncate ${addressData.gstNumber ? 'font-black text-slate-900' : 'font-medium text-slate-400'}`}>
                    {addressData.gstNumber ? `GSTIN: ${addressData.gstNumber}` : 'No GSTIN Added'}
                  </span>
                  {addressData.gstNumber && addressData.companyName ? (
                    <span className="text-xs text-slate-600 block truncate font-medium">
                      {addressData.companyName}
                    </span>
                  ) : null}
                </div>
              </div>

              <button
                type="button"
                id="confirm-details-edit-gst-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  try {
                    sessionStorage.setItem('profile_target_focus', 'GSTIN');
                  } catch (err) {
                    // ignore
                  }
                  if (onNavigateToProfile) {
                    onNavigateToProfile('GSTIN');
                  }
                }}
                className="flex items-center space-x-1 text-[#1064ea] hover:text-[#0b4dc1] group-hover:text-[#0b4dc1] font-bold text-sm sm:text-[15px] cursor-pointer transition-colors shrink-0 ml-2"
              >
                <span>{addressData.gstNumber ? 'Edit' : 'Add'}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            <p className="text-xs text-slate-500 pl-7.5 leading-relaxed">
              {addressData.gstNumber 
                ? 'GST input tax credit will be automatically mapped to your business invoice.' 
                : 'Add your business GSTIN to claim GST input tax credit on this order.'}
            </p>
          </div>
        </section>

        {/* 5. PRICE DETAILS / ORDER SUMMARY SECTION */}
        <section className="space-y-2">
          <h2 className="text-[16px] sm:text-[17px] font-extrabold text-slate-900 px-0.5">
            Order Summary
          </h2>

          {/* White Container on #f5f6f8 Background */}
          <div className="bg-white border border-slate-200/80 shadow-2xs rounded-none p-4 sm:p-5 space-y-3.5">
            
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

          {/* Amazon Royal Blue 'Place Order' Button */}
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
                <span>Placing Order...</span>
              </>
            ) : (
              <span>Place Order</span>
            )}
          </button>

        </div>
      </div>

    </div>
  );
};

export default OrderDetailsPage;
