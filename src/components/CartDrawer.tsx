import React, { useState } from 'react';
import { CartItem, getCartItemPrices } from '../types';
import { formatCurrency, formatGST } from '../utils/formatters';
import {
  X, ShoppingBag, Trash2, ArrowRight, CreditCard, Layers
} from 'lucide-react';
import { SilverCartIcon } from './SilverCartIcon';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, delta: number, parentProductId?: string) => void;
  onRemoveItem: (productId: string, parentProductId?: string) => void;
  onPlaceOrder: (orderData: any) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onPlaceOrder,
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');

  // Checkout modal form state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [gstNumber, setGstin] = useState('');
  const [street, setStreet] = useState('Boring Road Expressway');
  const [city, setCity] = useState('Patna');
  const [state, setState] = useState('Bihar');
  const [pincode, setPincode] = useState('800001');
  const [paymentMethod] = useState<string>('Integrated Gateway');

  if (!isOpen) return null;

  // Calculate totals
  let subtotal = 0;
  cart.forEach(item => {
    const { bundleUnitPrice } = getCartItemPrices(item);
    subtotal += bundleUnitPrice * item.quantity;
  });

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (couponCode.toUpperCase() === 'MAGADH10') {
      const discount = Math.min(subtotal * 0.10, 2000);
      setAppliedDiscount(discount);
    } else if (couponCode.toUpperCase() === 'BULK50') {
      if (subtotal >= 20000) {
        const discount = Math.min(subtotal * 0.15, 10000);
        setAppliedDiscount(discount);
      } else {
        setCouponError('BULK50 requires minimum ₹20,000 cart subtotal');
      }
    } else {
      setCouponError('Invalid coupon code. Try MAGADH10 or BULK50.');
    }
  };

  const discountedSubtotal = subtotal - appliedDiscount;
  const grandTotal = Math.round(discountedSubtotal * 100) / 100;
  const gstTax = Math.round((grandTotal - (grandTotal / 1.18)) * 100) / 100; // Included 18% GST

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !phone) {
      alert("Please provide customer name and mobile number.");
      return;
    }

    onPlaceOrder({
      customerName,
      customerEmail: customerEmail || 'customer@magadhtyres.com',
      phone,
      companyName,
      gstNumber,
      items: cart.map(item => ({ productId: item.product.id, quantity: item.quantity })),
      couponCode,
      paymentMethod,
      shippingAddress: { street, city, state, pincode }
    });

    setIsCheckoutOpen(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-fade-in">
      
      {/* Sliding Cart Panel */}
      <div className="relative w-full max-w-md bg-white text-slate-900 h-full shadow-2xl flex flex-col justify-between border-l border-slate-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-2.5">
            <SilverCartIcon className="w-6 h-6" />
            <span className="text-lg font-black text-slate-900 font-display">
              Your Tyre Shopping Cart ({cart.reduce((s, i) => s + i.quantity, 0)})
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-3">
              <SilverCartIcon className="w-16 h-16 opacity-60" />
              <p className="text-sm font-bold text-slate-800">Your cart is empty</p>
              <p className="text-xs text-slate-500">Browse our catalogue and add tyres to get instant bulk discounts.</p>
            </div>
          ) : (
            cart.map((item, idx) => {
              const { bundleUnitPrice, itemSubtotal } = getCartItemPrices(item);
              const cartKey = `${item.product.id}_${item.parentProductId || 'root'}_${idx}`;

              return (
                <div
                  key={cartKey}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 object-contain"
                    referrerPolicy="no-referrer"
                  />

                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-[10px] font-extrabold uppercase text-slate-800 bg-slate-200 border border-slate-300 px-2 py-0.5 rounded">
                        {item.product.brand}
                      </span>
                    </div>
                    <h4 className="text-xs font-extrabold text-slate-900 line-clamp-1">
                      {item.product.name}
                    </h4>
                    <p className="text-[10px] text-slate-600 font-bold flex items-center gap-1">
                      <Layers className="w-2.5 h-2.5 text-slate-700 shrink-0" />
                      Includes: {item.product.includedComponents || 'Tube & Flap'}
                    </p>
                    <p className="text-[11px] font-bold text-slate-800">
                      {formatCurrency(bundleUnitPrice)} x {item.quantity} = {formatCurrency(itemSubtotal)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    <button
                      onClick={() => onRemoveItem(item.product.id, item.parentProductId)}
                      className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex items-center space-x-1 border border-slate-300 rounded-lg bg-white p-0.5">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, -1, item.parentProductId)}
                        className="w-6 h-6 rounded text-xs font-black hover:bg-slate-100 text-slate-700 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-xs font-black px-1.5 text-slate-900">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, 1, item.parentProductId)}
                        className="w-6 h-6 rounded text-xs font-black hover:bg-slate-100 text-slate-700 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer & Checkout Trigger */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-slate-200 bg-slate-50/80 space-y-4">
            
            {/* Coupon Box */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="Coupon code (e.g. MAGADH10)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900 uppercase focus:outline-none focus:border-slate-400"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#54b4e7] hover:bg-[#3ea5dc] text-white font-bold text-xs cursor-pointer shadow-2xs transition-colors"
              >
                Apply
              </button>
            </form>

            {couponError && <p className="text-[11px] text-red-600 font-semibold">{couponError}</p>}
            {appliedDiscount > 0 && (
              <p className="text-[11px] text-emerald-700 font-bold">
                Coupon Applied! Saved {formatCurrency(appliedDiscount)}
              </p>
            )}

            {/* Totals */}
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal (Incl. GST):</span>
                <span className="font-semibold text-slate-900">{formatCurrency(discountedSubtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Included GST (18% Rate):</span>
                <span className="font-bold text-slate-800">{formatGST(gstTax)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Grand Total:</span>
                <span className="font-display text-slate-900">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full py-4 rounded-2xl bg-[#54b4e7] hover:bg-[#3ea5dc] text-white font-black text-sm shadow-md active:scale-95 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        )}

      </div>

      {/* Checkout Modal Popup */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-60 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 text-slate-900">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="text-xl font-black text-slate-900 font-display">
                Express Checkout & Shipping Details
              </h3>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Kumar"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98351 22345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="Magadh Logistics"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Business GSTIN (Optional)</label>
                  <input
                    type="text"
                    placeholder="10AAACM1234F1Z2"
                    value={gstNumber}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900 uppercase focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    placeholder="Boring Road, Phase II"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              {/* Automated Payment Gateway Integration Notice */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center space-x-2 text-slate-900 font-bold text-xs">
                  <CreditCard className="w-4 h-4 text-slate-700" />
                  <span>Automated Payment Gateway Checkout</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Order will be securely processed through the integrated Payment Gateway (Razorpay, PhonePe, Stripe, or Paytm). No manual payment method selection required.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-slate-900 space-y-1">
                <div className="flex justify-between font-black text-sm">
                  <span>Grand Total (Incl. 18% GST):</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#54b4e7] hover:bg-[#3ea5dc] text-white font-black text-sm shadow-md cursor-pointer transition-colors"
              >
                Confirm Order & Generate Tax Invoice
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
