import React, { useState } from 'react';
import { CartItem, Order, getCartItemPrices } from '../types';
import { formatCurrency, formatGST } from '../utils/formatters';
import {
  X, ShoppingBag, Trash2, Plus, Minus, Tag, ShieldCheck,
  CreditCard, ArrowRight, CheckCircle2, Building2, FileText, Layers
} from 'lucide-react';

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
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end animate-fade-in">
      
      {/* Sliding Cart Panel */}
      <div className="relative w-full max-w-md bg-slate-900 text-white h-full shadow-2xl flex flex-col justify-between border-l border-purple-800/60">
        
        {/* Header */}
        <div className="p-6 border-b border-purple-800/50 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <span className="text-lg font-black text-white font-display">
              Your Tyre Shopping Cart ({cart.reduce((s, i) => s + i.quantity, 0)})
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-purple-900/60 text-purple-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-purple-300 space-y-3">
              <ShoppingBag className="w-12 h-12 text-purple-400/50" />
              <p className="text-sm font-bold text-white">Your cart is empty</p>
              <p className="text-xs text-purple-300/80">Browse our catalogue and add tyres to get instant bulk discounts.</p>
            </div>
          ) : (
            cart.map((item, idx) => {
              const { bundleUnitPrice, itemSubtotal } = getCartItemPrices(item);
              const cartKey = `${item.product.id}_${item.parentProductId || 'root'}_${idx}`;

              return (
                <div
                  key={cartKey}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-purple-800/50 flex items-center justify-between gap-3"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 object-contain"
                    referrerPolicy="no-referrer"
                  />

                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-[10px] font-extrabold uppercase text-amber-300 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded">
                        {item.product.brand}
                      </span>
                    </div>
                    <h4 className="text-xs font-extrabold text-white line-clamp-1">
                      {item.product.name}
                    </h4>
                    <p className="text-[10px] text-amber-300/90 font-bold flex items-center gap-1">
                      <Layers className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                      Includes: {item.product.includedComponents || 'Tube & Flap'}
                    </p>
                    <p className="text-[11px] font-bold text-purple-200">
                      {formatCurrency(bundleUnitPrice)} x {item.quantity} = {formatCurrency(itemSubtotal)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    <button
                      onClick={() => onRemoveItem(item.product.id, item.parentProductId)}
                      className="text-purple-400 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex items-center space-x-1 border border-purple-700/60 rounded-lg bg-slate-900 p-0.5">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, -1, item.parentProductId)}
                        className="w-6 h-6 rounded text-xs font-black hover:bg-purple-900 text-amber-300 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-xs font-black px-1.5 text-white">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, 1, item.parentProductId)}
                        className="w-6 h-6 rounded text-xs font-black hover:bg-purple-900 text-amber-300 cursor-pointer"
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
          <div className="p-6 border-t border-purple-800/50 bg-slate-950/80 space-y-4">
            
            {/* Coupon Box */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="Coupon code (e.g. MAGADH10)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-purple-800/50 text-xs font-bold text-white uppercase focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-purple-800 hover:bg-purple-700 text-white font-bold text-xs"
              >
                Apply
              </button>
            </form>

            {couponError && <p className="text-[11px] text-red-400 font-semibold">{couponError}</p>}
            {appliedDiscount > 0 && (
              <p className="text-[11px] text-emerald-400 font-bold">
                Coupon Applied! Saved {formatCurrency(appliedDiscount)}
              </p>
            )}

            {/* Totals */}
            <div className="space-y-1.5 text-xs text-purple-200">
              <div className="flex justify-between">
                <span>Subtotal (Incl. GST):</span>
                <span className="font-semibold text-white">{formatCurrency(discountedSubtotal)}</span>
              </div>
              <div className="flex justify-between text-purple-300">
                <span>Included GST (18% Rate):</span>
                <span className="font-bold text-amber-300">{formatGST(gstTax)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-white pt-2 border-t border-purple-800/50">
                <span>Grand Total:</span>
                <span className="font-display text-white">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center space-x-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
          </div>
        )}

      </div>

      {/* Checkout Modal Popup */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-60 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-purple-800/60 space-y-6 text-white">
            <div className="flex justify-between items-center pb-3 border-b border-purple-800/50">
              <h3 className="text-xl font-black text-white font-display">
                Express Checkout & Shipping Details
              </h3>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="p-1 text-purple-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-purple-200 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Kumar"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-purple-800/50 font-semibold text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-purple-200 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98351 22345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-purple-800/50 font-semibold text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-purple-200 mb-1">Company Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="Magadh Logistics"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-purple-800/50 font-semibold text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block font-bold text-purple-200 mb-1">Business GSTIN (Optional)</label>
                  <input
                    type="text"
                    placeholder="10AAACM1234F1Z2"
                    value={gstNumber}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-purple-800/50 font-semibold text-white uppercase focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-purple-200 mb-1">Street Address</label>
                  <input
                    type="text"
                    placeholder="Boring Road, Phase II"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-purple-800/50 font-semibold text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Automated Payment Gateway Integration Notice */}
              <div className="p-3.5 rounded-2xl bg-purple-950/60 border border-purple-800/50 space-y-1">
                <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>Automated Payment Gateway Checkout</span>
                </div>
                <p className="text-[11px] text-purple-200 leading-snug">
                  Order will be securely processed through the integrated Payment Gateway (Razorpay, PhonePe, Stripe, or Paytm). No manual payment method selection required.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-400 text-slate-950 space-y-1">
                <div className="flex justify-between font-black text-sm">
                  <span>Grand Total (Incl. 18% GST):</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-xl"
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
