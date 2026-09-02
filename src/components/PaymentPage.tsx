import React, { useState, useMemo, useEffect } from 'react';
import { PaymentRecord, Order } from '../types';
import {
  CreditCard, CheckCircle2, ShieldCheck, Download,
  ArrowLeft, Calendar,
  FileText, Check, ChevronsLeft, ChevronsRight,
  Building2, QrCode, X,
  Banknote, Landmark, Receipt,
  ChevronDown, ChevronUp, ThumbsUp, PieChart,
  Gift, Lock, Sparkles, AlertCircle, Copy
} from 'lucide-react';

interface PaymentPageProps {
  payments: PaymentRecord[];
  orders?: Order[];
  onProcessPayment: (paymentData: PaymentRecord) => void;
  onViewInvoice?: (order: Order) => void;
  incomingOrderToPay?: Order | null;
  onPaymentSuccess?: (order: Order) => void;
  onCancelPayment?: (order?: Order) => void;
}

export const PaymentPage: React.FC<PaymentPageProps> = ({
  payments = [],
  orders = [],
  onProcessPayment,
  onViewInvoice,
  incomingOrderToPay = null,
  onPaymentSuccess,
  onCancelPayment,
}) => {
  // Merged orders: include real orders without duplicates
  const allOrders = useMemo(() => {
    const existingOrderNumbers = new Set(orders.map(o => o.orderNumber));
    return orders;
  }, [orders]);

  // Filters State for History View
  const [sortBy, setSortBy] = useState<string>('inv_due_asc');
  const [viewStatus, setViewStatus] = useState<string>('Outstanding');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  // Helper for responsive pagination numbers
  const getVisiblePages = (current: number, total: number): (number | string)[] => {
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 3) {
      return [1, 2, 3, '...', total];
    }
    if (current >= total - 2) {
      return [1, '...', total - 2, total - 1, total];
    }
    return [1, '...', current, '...', total];
  };

  // Multi-Selection State for bulk payment
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);

  // Accordion Selection in Checkout Flow:
  // 'recommended' (Cash on Delivery), 'pay_in_3', 'upi', 'card', 'emi', 'cod', 'gift_card', 'bank_transfer'
  const [expandedSection, setExpandedSection] = useState<string>('recommended');
  
  // Specific Form Inputs
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'custom_upi' | 'qr'>('gpay');
  const [customUpiId, setCustomUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [giftCardNumber, setGiftCardNumber] = useState('');
  const [giftCardPin, setGiftCardPin] = useState('');
  const [giftCardApplied, setGiftCardApplied] = useState(false);
  const [selectedEmiTenure, setSelectedEmiTenure] = useState<number>(3);
  const [bankUtrNumber, setBankUtrNumber] = useState('');
  const [isTotalDetailsOpen, setIsTotalDetailsOpen] = useState(false);

  // General Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<PaymentRecord | null>(null);

  // Settlement modal state (for invoices list view)
  const [paymentModalOrders, setPaymentModalOrders] = useState<Order[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Auto-set when incomingOrderToPay changes & scroll immediately to top
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (incomingOrderToPay) {
      setExpandedSection('recommended');
      setIsProcessing(false);
    }
  }, [incomingOrderToPay]);

  // Helper date formatting: DD.MM.YYYY
  const formatDisplayDate = (dateStr?: string, addDays: number = 0): string => {
    if (!dateStr) return '25.07.2026';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '25.07.2026';
    if (addDays !== 0) {
      d.setDate(d.getDate() + addDays);
    }
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  };

  // Helper currency formatter
  const formatAmountINR = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Execute Settlement
  const handleExecutePayment = (methodName: string, activeOrder?: Order | null) => {
    const targetOrder = activeOrder || incomingOrderToPay;
    if (!targetOrder) return;

    setIsProcessing(true);

    setTimeout(() => {
      const receipt: PaymentRecord = {
        id: `pay-${Date.now()}-${targetOrder.id}`,
        paymentId: `REC-${methodName.substring(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
        orderId: targetOrder.orderNumber,
        customerName: targetOrder.customerName,
        amount: targetOrder.totalAmount,
        gstNumber: targetOrder.gstNumber,
        method: methodName,
        status: 'Success',
        date: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };

      onProcessPayment(receipt);
      setLastReceipt(receipt);
      setIsProcessing(false);

      if (onPaymentSuccess) {
        onPaymentSuccess(targetOrder);
      }
    }, 600);
  };

  // Filter & Sort Logic for General Invoices List
  const filteredAndSortedOrders = useMemo(() => {
    let result = allOrders.filter(order => {
      if (viewStatus === 'Outstanding') {
        if (order.paymentStatus === 'Paid') return false;
      } else if (viewStatus === 'Paid') {
        if (order.paymentStatus !== 'Paid') return false;
      } else if (viewStatus === 'Overdue') {
        if (order.paymentStatus === 'Paid') return false;
      }

      if (startDate) {
        const orderDate = new Date(order.date).getTime();
        const sDate = new Date(startDate).getTime();
        if (orderDate < sDate) return false;
      }
      if (endDate) {
        const orderDate = new Date(order.date).getTime();
        const eDate = new Date(endDate).getTime();
        if (orderDate > eDate + 86400000) return false;
      }

      return true;
    });

    result.sort((a, b) => {
      if (sortBy === 'inv_due_asc') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sortBy === 'inv_due_desc') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === 'amount_high') {
        return b.totalAmount - a.totalAmount;
      }
      if (sortBy === 'amount_low') {
        return a.totalAmount - b.totalAmount;
      }
      if (sortBy === 'created_desc') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === 'created_asc') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      return 0;
    });

    return result;
  }, [allOrders, viewStatus, sortBy, startDate, endDate]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedOrders.length / itemsPerPage));
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedOrders.slice(start, start + itemsPerPage);
  }, [filteredAndSortedOrders, currentPage, itemsPerPage]);

  const handleToggleSelect = (orderId: string) => {
    setSelectedInvoiceIds(prev =>
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const handleSelectAllOnPage = () => {
    const currentPageIds = paginatedOrders.map(o => o.id);
    const allSelected = currentPageIds.every(id => selectedInvoiceIds.includes(id));
    if (allSelected) {
      setSelectedInvoiceIds(prev => prev.filter(id => !currentPageIds.includes(id)));
    } else {
      setSelectedInvoiceIds(prev => Array.from(new Set([...prev, ...currentPageIds])));
    }
  };

  const handleInitiateSinglePayment = (order: Order) => {
    setPaymentModalOrders([order]);
    setIsPaymentModalOpen(true);
    setIsProcessing(false);
  };

  const handleInitiateBulkPayment = () => {
    const ordersToPay = allOrders.filter(o => selectedInvoiceIds.includes(o.id));
    if (ordersToPay.length === 0) return;
    setPaymentModalOrders(ordersToPay);
    setIsPaymentModalOpen(true);
    setIsProcessing(false);
  };

  // =========================================================================
  // VIEW 1: COMPLETE PAYMENT CHECKOUT PAGE (FLIPKART THEME MATCHING SCREENSHOT)
  // =========================================================================
  if (incomingOrderToPay) {
    const activeOrder = incomingOrderToPay;
    const totalPayable = activeOrder.totalAmount;
    const baseExcludingGst = activeOrder.subtotal || Math.round((totalPayable / 1.18) * 100) / 100;
    const gstAmount = activeOrder.gstAmount || Math.round((totalPayable - baseExcludingGst) * 100) / 100;
    const codHandlingFee = 29;

    const toggleSection = (sectionName: string) => {
      setExpandedSection(prev => prev === sectionName ? '' : sectionName);
    };

    return (
      <div className="min-h-screen bg-white text-slate-800 antialiased pb-20 select-none">
        
        {/* 1. TOP APP BAR / HEADER */}
        <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-2xs">
          <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-center justify-between">
            
            {/* Left: Back Arrow + Confirm Payments */}
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => {
                  if (onCancelPayment) onCancelPayment(activeOrder);
                }}
                className="p-1 -ml-1 text-slate-900 hover:text-blue-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                aria-label="Go back to order details"
              >
                <ArrowLeft className="w-5 h-5 text-slate-900 stroke-[2.5]" />
              </button>

              <div>
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  Confirm Payments
                </h1>
              </div>
            </div>

            {/* Right: 100% Secure Badge */}
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-[#f1f3f6] text-slate-700 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5 text-slate-700 stroke-[2.2]" />
              <span>100% Secure</span>
            </div>

          </div>
        </header>

        {/* MAIN BODY CONTAINER */}
        <main className="max-w-2xl mx-auto px-4 pt-2.5 space-y-3">
          
          {/* 2. TOTAL AMOUNT BANNER (COLLAPSIBLE / EXPANDABLE BREAKDOWN) */}
          <div className="bg-[#edf5fd] rounded-2xl p-4 transition-all">
            <div
              onClick={() => setIsTotalDetailsOpen(!isTotalDetailsOpen)}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center space-x-1.5 text-slate-800 font-bold text-sm sm:text-[15px]">
                <span className="text-[#1064ea]">Total Amount</span>
                <ChevronDown className={`w-4 h-4 text-[#1064ea] transition-transform duration-200 ${isTotalDetailsOpen ? 'rotate-180' : ''}`} />
              </div>
              <div className="text-lg sm:text-xl font-black text-[#1064ea]">
                ₹{totalPayable.toLocaleString('en-IN')}
              </div>
            </div>

            {/* Expandable Breakdown Details */}
            {isTotalDetailsOpen && (
              <div className="mt-3 pt-3 border-t border-blue-200/60 text-xs text-slate-700 space-y-1.5 animate-fade-in">
                <div className="flex justify-between">
                  <span>Base Price / Subtotal:</span>
                  <span className="font-semibold">₹{baseExcludingGst.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18% Included):</span>
                  <span className="font-semibold">₹{gstAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Protect Promise / Logistics:</span>
                  <span className="font-semibold text-emerald-700">Included</span>
                </div>
                <div className="flex justify-between font-bold pt-1 border-t border-blue-200/40 text-slate-900">
                  <span>Final Payable Amount:</span>
                  <span className="text-[#1064ea]">₹{totalPayable.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}
          </div>

          {/* 3. PAYMENT ACCORDIONS LIST (ON PURE WHITE WITH CRISP FLIPKART BORDERS) */}
          <div className="divide-y divide-slate-100 border-t border-b border-slate-100">

            {/* SECTION A: RECOMMENDED FOR YOU (Instant UPI Option) */}
            <div className="py-3.5">
              <button
                type="button"
                onClick={() => toggleSection('recommended')}
                className="w-full flex items-center justify-between text-left cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <ThumbsUp className="w-5 h-5 text-slate-900 shrink-0 stroke-[2.2]" />
                  <div>
                    <span className="text-sm sm:text-[15px] font-bold text-slate-900 block">
                      Recommended for You
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600">
                      Fastest & Zero Fee • Instant UPI
                    </span>
                  </div>
                </div>
                {expandedSection === 'recommended' ? (
                  <ChevronUp className="w-5 h-5 text-slate-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-600" />
                )}
              </button>

              {expandedSection === 'recommended' && (
                <div className="mt-3.5 pl-8 sm:pl-8 space-y-3.5 animate-fade-in">
                  
                  {/* Recommended UPI Apps Radio Selection */}
                  <div className="space-y-2 text-xs">
                    <label
                      onClick={() => setSelectedUpiApp('gpay')}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                        selectedUpiApp === 'gpay' ? 'border-[#1064ea] bg-[#f0f6ff]' : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <input type="radio" checked={selectedUpiApp === 'gpay'} readOnly className="accent-[#1064ea]" />
                        <span className="font-bold text-slate-900">Google Pay UPI</span>
                      </div>
                      <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                        Instant Approval
                      </span>
                    </label>

                    <label
                      onClick={() => setSelectedUpiApp('phonepe')}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                        selectedUpiApp === 'phonepe' ? 'border-[#1064ea] bg-[#f0f6ff]' : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <input type="radio" checked={selectedUpiApp === 'phonepe'} readOnly className="accent-[#1064ea]" />
                        <span className="font-bold text-slate-900">PhonePe UPI</span>
                      </div>
                      <span className="text-[11px] text-emerald-600 font-bold">Fast UPI</span>
                    </label>

                    <label
                      onClick={() => setSelectedUpiApp('paytm')}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                        selectedUpiApp === 'paytm' ? 'border-[#1064ea] bg-[#f0f6ff]' : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <input type="radio" checked={selectedUpiApp === 'paytm'} readOnly className="accent-[#1064ea]" />
                        <span className="font-bold text-slate-900">Paytm UPI</span>
                      </div>
                    </label>

                    <label
                      onClick={() => setSelectedUpiApp('custom_upi')}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                        selectedUpiApp === 'custom_upi' ? 'border-[#1064ea] bg-[#f0f6ff]' : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <input type="radio" checked={selectedUpiApp === 'custom_upi'} readOnly className="accent-[#1064ea]" />
                        <span className="font-bold text-slate-900">Enter other UPI ID</span>
                      </div>
                    </label>
                  </div>

                  {/* Custom UPI input when selected */}
                  {selectedUpiApp === 'custom_upi' && (
                    <div className="space-y-1">
                      <input
                        type="text"
                        placeholder="e.g. mobile@upi or username@okhdfcbank"
                        value={customUpiId}
                        onChange={e => setCustomUpiId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#1064ea] focus:outline-hidden"
                      />
                    </div>
                  )}

                  {/* Trust & Zero fee badge */}
                  <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 font-medium pt-0.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Instant payment confirmation with zero convenience fees.</span>
                  </div>

                  {/* Flipkart Yellow Pay Button */}
                  <button
                    type="button"
                    id="btn-recommended-upi-pay"
                    onClick={() => handleExecutePayment(`Recommended UPI (${selectedUpiApp.toUpperCase()})`, activeOrder)}
                    disabled={isProcessing}
                    className="w-full py-3.5 rounded-xl font-bold text-sm sm:text-base text-slate-950 bg-[#ffc200] hover:bg-[#f3b800] active:bg-[#e2aa00] shadow-xs transition-all duration-150 cursor-pointer active:scale-[0.99] flex items-center justify-center space-x-2"
                  >
                    {isProcessing ? (
                      <>
                        <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Processing UPI Payment...</span>
                      </>
                    ) : (
                      <span>Pay ₹{totalPayable.toLocaleString('en-IN')}</span>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* SECTION B: UPI */}
            <div className="py-3.5">
              <button
                type="button"
                onClick={() => toggleSection('upi')}
                className="w-full flex items-center justify-between text-left cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 rounded border border-slate-900 flex items-center justify-center text-[9px] font-black text-slate-900 shrink-0">
                    UPI
                  </div>
                  <div>
                    <div className="text-sm sm:text-[15px] font-bold text-slate-900">
                      UPI
                    </div>
                    <div className="text-xs text-slate-500 font-normal">
                      Pay by any UPI app
                    </div>
                    <div className="text-[11px] font-bold text-emerald-600 mt-0.5">
                      Get upto ₹100 cashback • 3 offers available
                    </div>
                  </div>
                </div>
                {expandedSection === 'upi' ? (
                  <ChevronUp className="w-5 h-5 text-slate-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-600" />
                )}
              </button>

              {expandedSection === 'upi' && (
                <div className="mt-3.5 pl-8 space-y-3.5 animate-fade-in">
                  
                  {/* UPI App Selection Radio Tiles */}
                  <div className="space-y-2 text-xs">
                    <label
                      onClick={() => setSelectedUpiApp('gpay')}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                        selectedUpiApp === 'gpay' ? 'border-[#1064ea] bg-[#f0f6ff]' : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <input type="radio" checked={selectedUpiApp === 'gpay'} readOnly className="accent-[#1064ea]" />
                        <span className="font-bold text-slate-900">Google Pay</span>
                      </div>
                      <span className="text-[11px] text-emerald-600 font-bold">Offer applied</span>
                    </label>

                    <label
                      onClick={() => setSelectedUpiApp('phonepe')}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                        selectedUpiApp === 'phonepe' ? 'border-[#1064ea] bg-[#f0f6ff]' : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <input type="radio" checked={selectedUpiApp === 'phonepe'} readOnly className="accent-[#1064ea]" />
                        <span className="font-bold text-slate-900">PhonePe</span>
                      </div>
                      <span className="text-[11px] text-emerald-600 font-bold">Fast UPI</span>
                    </label>

                    <label
                      onClick={() => setSelectedUpiApp('paytm')}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                        selectedUpiApp === 'paytm' ? 'border-[#1064ea] bg-[#f0f6ff]' : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <input type="radio" checked={selectedUpiApp === 'paytm'} readOnly className="accent-[#1064ea]" />
                        <span className="font-bold text-slate-900">Paytm UPI</span>
                      </div>
                    </label>

                    <label
                      onClick={() => setSelectedUpiApp('custom_upi')}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                        selectedUpiApp === 'custom_upi' ? 'border-[#1064ea] bg-[#f0f6ff]' : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <input type="radio" checked={selectedUpiApp === 'custom_upi'} readOnly className="accent-[#1064ea]" />
                        <span className="font-bold text-slate-900">Enter UPI ID</span>
                      </div>
                    </label>

                    <label
                      onClick={() => setSelectedUpiApp('qr')}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                        selectedUpiApp === 'qr' ? 'border-[#1064ea] bg-[#f0f6ff]' : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <input type="radio" checked={selectedUpiApp === 'qr'} readOnly className="accent-[#1064ea]" />
                        <span className="font-bold text-slate-900">Scan QR Code</span>
                      </div>
                      <QrCode className="w-4 h-4 text-slate-700" />
                    </label>
                  </div>

                  {/* Custom UPI ID Input */}
                  {selectedUpiApp === 'custom_upi' && (
                    <div className="space-y-1">
                      <input
                        type="text"
                        placeholder="e.g. mobile@upi or username@okhdfcbank"
                        value={customUpiId}
                        onChange={e => setCustomUpiId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#1064ea] focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Scan QR Code Container */}
                  {selectedUpiApp === 'qr' && (
                    <div className="p-4 bg-[#f5f6f8] rounded-xl flex flex-col items-center justify-center space-y-2 text-center">
                      <div className="w-28 h-28 bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-center shadow-xs">
                        <QrCode className="w-24 h-24 text-slate-800" />
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Scan using any UPI app to pay ₹{totalPayable.toLocaleString('en-IN')}
                      </p>
                    </div>
                  )}

                  {/* Pay Button */}
                  <button
                    type="button"
                    onClick={() => handleExecutePayment(`UPI (${selectedUpiApp.toUpperCase()})`, activeOrder)}
                    disabled={isProcessing}
                    className="w-full py-3.5 rounded-xl font-bold text-sm sm:text-base text-slate-950 bg-[#ffc200] hover:bg-[#f3b800] active:bg-[#e2aa00] shadow-xs transition-all duration-150 cursor-pointer active:scale-[0.99] flex items-center justify-center space-x-2"
                  >
                    <span>Pay ₹{totalPayable.toLocaleString('en-IN')}</span>
                  </button>

                </div>
              )}
            </div>

            {/* SECTION G: HAVE A FLIPKART GIFT CARD? */}
            <div className="py-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Gift className="w-5 h-5 text-slate-900 shrink-0 stroke-[2.2]" />
                  <span className="text-sm sm:text-[15px] font-bold text-slate-900">
                    Have a Flipkart Gift Card?
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSection('gift_card')}
                  className="text-xs sm:text-sm font-bold text-[#1064ea] hover:text-[#0b4dc1] cursor-pointer hover:underline"
                >
                  {expandedSection === 'gift_card' ? 'Close' : 'Add'}
                </button>
              </div>

              {expandedSection === 'gift_card' && (
                <div className="mt-3.5 pl-8 space-y-3 animate-fade-in">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Gift Card Number</label>
                      <input
                        type="text"
                        placeholder="16-digit card number"
                        value={giftCardNumber}
                        onChange={e => setGiftCardNumber(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#1064ea] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">6-Digit PIN</label>
                      <input
                        type="password"
                        maxLength={6}
                        placeholder="PIN"
                        value={giftCardPin}
                        onChange={e => setGiftCardPin(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#1064ea] focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setGiftCardApplied(true);
                      handleExecutePayment('Flipkart Gift Card', activeOrder);
                    }}
                    disabled={!giftCardNumber || !giftCardPin || isProcessing}
                    className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-[#ffc200] hover:bg-[#f3b800] disabled:opacity-50 transition-all cursor-pointer"
                  >
                    Apply & Settle
                  </button>
                </div>
              )}
            </div>

            {/* SECTION H: DIRECT BANK TRANSFER (B2B WHOLESALE) */}
            <div className="py-3.5">
              <button
                type="button"
                onClick={() => toggleSection('bank_transfer')}
                className="w-full flex items-center justify-between text-left cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <Landmark className="w-5 h-5 text-slate-900 shrink-0 stroke-[2.2]" />
                  <div>
                    <div className="text-sm sm:text-[15px] font-bold text-slate-900">
                      Bank Transfer (NEFT / RTGS)
                    </div>
                    <div className="text-xs text-slate-500 font-normal">
                      Direct Escrow Account for Wholesale Dispatch
                    </div>
                  </div>
                </div>
                {expandedSection === 'bank_transfer' ? (
                  <ChevronUp className="w-5 h-5 text-slate-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-600" />
                )}
              </button>

              {expandedSection === 'bank_transfer' && (
                <div className="mt-3.5 pl-8 space-y-3 animate-fade-in">
                  
                  <div className="bg-[#f5f6f8] rounded-xl p-3 text-xs space-y-1.5 text-slate-700 font-medium">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Beneficiary:</span>
                      <strong className="text-slate-900">Magadh Sparsh Logistics LLP</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Bank & Branch:</span>
                      <strong className="text-slate-900">HDFC Bank, Commercial Branch</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Account No:</span>
                      <strong className="text-slate-900 font-mono">50200088910244</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">IFSC Code:</span>
                      <strong className="text-slate-900 font-mono">HDFC0001824</strong>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Bank UTR / Transaction Reference (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. UTR108293847291"
                      value={bankUtrNumber}
                      onChange={e => setBankUtrNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-[#1064ea] focus:outline-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleExecutePayment('Direct Bank Transfer (NEFT/RTGS)', activeOrder)}
                    disabled={isProcessing}
                    className="w-full py-3.5 rounded-xl font-bold text-sm sm:text-base text-slate-950 bg-[#ffc200] hover:bg-[#f3b800] active:bg-[#e2aa00] shadow-xs transition-all duration-150 cursor-pointer active:scale-[0.99] flex items-center justify-center space-x-2"
                  >
                    <span>Confirm Bank Transfer</span>
                  </button>

                </div>
              )}
            </div>

          </div>

          {/* 5. TRUST & COMPLIANCE FOOTER */}
          <div className="pt-4 text-center space-y-2">
            <div className="flex items-center justify-center space-x-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              <span>Safe & Secure Payments • 100% Authentic Apollo Tyres</span>
            </div>
          </div>

        </main>

      </div>
    );
  }

  // =========================================================================
  // VIEW 2: GENERAL PAYMENTS & INVOICES (CLEAN FLIPKART THEME ON PURE WHITE)
  // =========================================================================
  const selectedTotalAmount = allOrders
    .filter(o => selectedInvoiceIds.includes(o.id))
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="min-h-screen bg-white text-slate-800 antialiased pb-24 select-none">
      
      {/* Top Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Payments & Invoices
            </h1>
          </div>
          <div className="px-2.5 py-1 rounded-md bg-[#edf5fd] text-[#1064ea] text-xs font-bold">
            {allOrders.filter(o => o.paymentStatus !== 'Paid').length} Due
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-2xl mx-auto px-4 pt-2.5 space-y-3">
        
        {/* Filters Card */}
        <div className="bg-[#f5f6f8] rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1064ea] cursor-pointer"
              >
                <option value="inv_due_asc">Inv. Due Date (Asc)</option>
                <option value="inv_due_desc">Inv. Due Date (Desc)</option>
                <option value="amount_high">Amount (High to Low)</option>
                <option value="amount_low">Amount (Low to High)</option>
                <option value="created_desc">Created Date (Newest)</option>
                <option value="created_asc">Created Date (Oldest)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                View Status
              </label>
              <select
                value={viewStatus}
                onChange={(e) => {
                  setViewStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1064ea] cursor-pointer"
              >
                <option value="Outstanding">Outstanding</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
                <option value="All">All Invoices</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-1.5 sm:space-x-2 py-2 text-slate-700 w-full max-w-full overflow-hidden select-none">
            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage <= 1}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer shrink-0 ${
                currentPage <= 1 ? 'text-slate-300 cursor-not-allowed' : 'hover:bg-slate-100 text-slate-700'
              }`}
              aria-label="Previous Page"
            >
              <ChevronsLeft className="w-4 h-4 stroke-[2.5]" />
            </button>

            <div className="flex items-center space-x-1 sm:space-x-1.5 flex-nowrap overflow-hidden">
              {getVisiblePages(currentPage, totalPages).map((pageNum, idx) => {
                if (pageNum === '...') {
                  return (
                    <span key={`dots-${idx}`} className="px-1 text-xs text-slate-400 font-bold shrink-0">
                      ...
                    </span>
                  );
                }
                const num = Number(pageNum);
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCurrentPage(num)}
                    className={`min-w-[28px] sm:min-w-[32px] h-7 px-1.5 sm:px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer shrink-0 ${
                      currentPage === num
                        ? 'bg-[#1064ea] text-white shadow-xs font-black'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer shrink-0 ${
                currentPage >= totalPages ? 'text-slate-300 cursor-not-allowed' : 'hover:bg-slate-100 text-slate-700'
              }`}
              aria-label="Next Page"
            >
              <ChevronsRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        )}

        {/* Select All on Page */}
        {paginatedOrders.length > 0 && (
          <div className="flex items-center justify-between px-2 text-xs font-semibold text-slate-500">
            <button
              type="button"
              onClick={handleSelectAllOnPage}
              className="flex items-center space-x-2 text-slate-700 hover:text-slate-900 cursor-pointer font-bold"
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                paginatedOrders.every(o => selectedInvoiceIds.includes(o.id))
                  ? 'bg-[#1064ea] border-[#1064ea] text-white'
                  : 'border-slate-300 bg-white'
              }`}>
                {paginatedOrders.every(o => selectedInvoiceIds.includes(o.id)) && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <span>Select all on this page</span>
            </button>
            <span>Showing {paginatedOrders.length} of {filteredAndSortedOrders.length} records</span>
          </div>
        )}

        {/* Invoices List */}
        <div className="space-y-3">
          {paginatedOrders.length === 0 ? (
            <div className="bg-[#f5f6f8] rounded-2xl p-8 text-center space-y-2">
              <FileText className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No Invoices Found</h3>
              <p className="text-xs text-slate-500">There are no invoices matching your current filter.</p>
            </div>
          ) : (
            paginatedOrders.map((order) => {
              const isSelected = selectedInvoiceIds.includes(order.id);
              const isPaid = order.paymentStatus === 'Paid';
              const dueDateFormatted = formatDisplayDate(order.date, 30);
              const createdDateFormatted = formatDisplayDate(order.date, 0);

              return (
                <div
                  key={order.id}
                  className={`bg-[#f5f6f8] rounded-2xl p-4 sm:p-4.5 border transition-all ${
                    isSelected ? 'border-[#1064ea] ring-1 ring-[#1064ea]' : 'border-slate-200/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-2.5">
                      <label className="relative flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(order.id)}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
                          isSelected ? 'bg-[#1064ea] border-[#1064ea] text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </label>

                      <button
                        type="button"
                        onClick={() => onViewInvoice ? onViewInvoice(order) : handleInitiateSinglePayment(order)}
                        className="text-[#1064ea] font-extrabold font-mono text-sm hover:underline cursor-pointer"
                      >
                        #{order.orderNumber}
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {isPaid ? 'Paid' : 'Outstanding'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2.5 border-t border-slate-200/80 flex items-baseline justify-between text-xs">
                    <span className="text-slate-500">Total Amount:</span>
                    <span className="font-extrabold text-sm text-slate-900">
                      {formatAmountINR(order.totalAmount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span>Due: <strong>{dueDateFormatted}</strong></span>
                    <span>Created: <strong>{createdDateFormatted}</strong></span>
                  </div>

                  {!isPaid && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleInitiateSinglePayment(order)}
                        className="px-4 py-1.5 rounded-lg bg-[#ffc200] hover:bg-[#f3b800] text-slate-950 font-bold text-xs shadow-2xs transition-all cursor-pointer active:scale-95"
                      >
                        Pay {formatAmountINR(order.totalAmount)}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Multi-Select Floating Bar */}
        {selectedInvoiceIds.length > 0 && (
          <div className="fixed bottom-6 inset-x-4 max-w-xl mx-auto z-40 bg-white p-4 rounded-2xl shadow-2xl border border-slate-200 flex items-center justify-between gap-4 animate-slide-up">
            <div>
              <div className="text-xs font-medium text-slate-500">
                {selectedInvoiceIds.length} Selected Total
              </div>
              <div className="text-lg font-black text-slate-900">
                {formatAmountINR(selectedTotalAmount)}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setSelectedInvoiceIds([])}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleInitiateBulkPayment}
                className="px-5 py-2 rounded-xl bg-[#ffc200] hover:bg-[#f3b800] text-slate-950 font-bold text-xs shadow-xs cursor-pointer active:scale-95"
              >
                Pay Selected
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Settle Modal */}
      {isPaymentModalOpen && paymentModalOrders.length > 0 && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {paymentModalOrders.length === 1
                  ? `Settle Invoice #${paymentModalOrders[0].orderNumber}`
                  : `Settle ${paymentModalOrders.length} Invoices`}
              </h3>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-[#f5f6f8] rounded-xl flex justify-between items-baseline text-xs">
              <span className="font-bold text-slate-700">Total Payable:</span>
              <span className="text-lg font-black text-slate-900">
                {formatAmountINR(paymentModalOrders.reduce((sum, o) => sum + o.totalAmount, 0))}
              </span>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  paymentModalOrders.forEach(ord => {
                    const receipt: PaymentRecord = {
                      id: `pay-${Date.now()}-${ord.id}`,
                      paymentId: `REC-UPI-${Math.floor(100000 + Math.random() * 900000)}`,
                      orderId: ord.orderNumber,
                      customerName: ord.customerName,
                      amount: ord.totalAmount,
                      gstNumber: ord.gstNumber,
                      method: 'Direct UPI',
                      status: 'Success',
                      date: new Date().toISOString().replace('T', ' ').substring(0, 16)
                    };
                    onProcessPayment(receipt);
                  });
                  setIsPaymentModalOpen(false);
                }}
                className="w-full py-3 rounded-xl font-bold text-sm text-slate-950 bg-[#ffc200] hover:bg-[#f3b800] shadow-xs cursor-pointer active:scale-98"
              >
                Confirm & Pay Now
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export const QuickPaymentsPage = PaymentPage;
export default PaymentPage;
