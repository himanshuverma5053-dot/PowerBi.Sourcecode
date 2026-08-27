import React, { useState, useMemo, useEffect } from 'react';
import { PaymentRecord, Order } from '../types';
import {
  CreditCard, CheckCircle2, ShieldCheck, Download,
  ArrowLeft, Zap, Calendar,
  FileText, Check, ChevronsLeft, ChevronsRight,
  Building2, QrCode, RefreshCw, X,
  Banknote, Landmark, Receipt, Disc3
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

// Seed Invoices (Empty by default)
const DEFAULT_SEED_ORDERS: Order[] = [];

export const PaymentPage: React.FC<PaymentPageProps> = ({
  payments = [],
  orders = [],
  onProcessPayment,
  onViewInvoice,
  incomingOrderToPay = null,
  onPaymentSuccess,
  onCancelPayment,
}) => {
  // Merged orders: include real orders + seed invoices without duplicating order numbers
  const allOrders = useMemo(() => {
    const existingOrderNumbers = new Set(orders.map(o => o.orderNumber));
    const uniqueSeedOrders = DEFAULT_SEED_ORDERS.filter(seed => !existingOrderNumbers.has(seed.orderNumber));
    return [...orders, ...uniqueSeedOrders];
  }, [orders]);

  // Filters State
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

  // Payment Settlement State
  const [paymentModalOrders, setPaymentModalOrders] = useState<Order[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'bank_transfer' | 'cheque' | 'upi' | 'credit' | 'cash'>('upi');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [upiId, setUpiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<PaymentRecord | null>(null);

  // Auto-set when incomingOrderToPay is provided
  useEffect(() => {
    if (incomingOrderToPay) {
      setPaymentModalOrders([incomingOrderToPay]);
      setReferenceNumber('');
      setUpiId('');
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
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Filter & Sort Logic
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

  // Pagination calculation
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
    setReferenceNumber('');
    setUpiId('');
    setIsProcessing(false);
  };

  const handleInitiateBulkPayment = () => {
    const ordersToPay = allOrders.filter(o => selectedInvoiceIds.includes(o.id));
    if (ordersToPay.length === 0) return;
    setPaymentModalOrders(ordersToPay);
    setIsPaymentModalOpen(true);
    setReferenceNumber('');
    setUpiId('');
    setIsProcessing(false);
  };

  // Execute Payment Settlement
  const handleExecuteSettlement = (targetOrders: Order[]) => {
    if (targetOrders.length === 0) return;
    setIsProcessing(true);

    setTimeout(() => {
      const methodLabel =
        selectedPaymentMethod === 'bank_transfer' ? 'Direct Bank Transfer (NEFT/RTGS)' :
        selectedPaymentMethod === 'cheque' ? `Cheque / Demand Draft (${referenceNumber || 'Recorded'})` :
        selectedPaymentMethod === 'upi' ? `Direct UPI (${upiId || 'Direct QR'})` :
        selectedPaymentMethod === 'cash' ? 'Cash / Counter Deposit' : 'Trade Credit Account (30-Day)';

      const paidOrdersCopy = [...targetOrders];

      targetOrders.forEach(ord => {
        const receipt: PaymentRecord = {
          id: `pay-${Date.now()}-${ord.id}`,
          paymentId: `REC-${selectedPaymentMethod.substring(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
          orderId: ord.orderNumber,
          customerName: ord.customerName,
          amount: ord.totalAmount,
          gstNumber: ord.gstNumber,
          method: methodLabel,
          status: 'Success',
          date: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
        onProcessPayment(receipt);
        setLastReceipt(receipt);
      });

      setIsProcessing(false);
      setIsPaymentModalOpen(false);
      setSelectedInvoiceIds([]);

      if (onPaymentSuccess && paidOrdersCopy.length > 0) {
        onPaymentSuccess(paidOrdersCopy[0]);
      }
    }, 800);
  };

  const selectedTotalAmount = allOrders
    .filter(o => selectedInvoiceIds.includes(o.id))
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // =========================================================================
  // VIEW 1: DIRECT ORDER PAYMENT (Matches Order Details Page Theme Exactly)
  // =========================================================================
  if (incomingOrderToPay) {
    const activeOrder = incomingOrderToPay;
    const totalPayable = activeOrder.totalAmount;
    const baseExcludingGst = activeOrder.subtotal || Math.round((totalPayable / 1.18) * 100) / 100;
    const gstAmount = activeOrder.gstAmount || Math.round((totalPayable - baseExcludingGst) * 100) / 100;

    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
        <div className="max-w-xl mx-auto w-full">
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md space-y-5">
              
              <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
                Complete Payment
              </h2>

              {/* Select Payment Method */}
              <div className="space-y-2.5">
                <div className="text-xs font-bold text-slate-700">
                  Select Payment Method
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('upi')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center space-x-2.5 ${
                      selectedPaymentMethod === 'upi'
                        ? 'border-[#9800ff] bg-purple-50/60 text-slate-900 font-black ring-1 ring-[#9800ff]'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80 text-slate-700 font-semibold'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-[#8a14d4] shrink-0" />
                    <div>
                      <div className="text-xs font-bold leading-tight">Direct UPI QR</div>
                      <div className="text-[10px] text-slate-500">GPay / PhonePe / Paytm</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('bank_transfer')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center space-x-2.5 ${
                      selectedPaymentMethod === 'bank_transfer'
                        ? 'border-[#9800ff] bg-purple-50/60 text-slate-900 font-black ring-1 ring-[#9800ff]'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80 text-slate-700 font-semibold'
                    }`}
                  >
                    <Landmark className="w-4 h-4 text-[#8a14d4] shrink-0" />
                    <div>
                      <div className="text-xs font-bold leading-tight">Bank Transfer</div>
                      <div className="text-[10px] text-slate-500">NEFT / RTGS / IMPS</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('cheque')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center space-x-2.5 ${
                      selectedPaymentMethod === 'cheque'
                        ? 'border-[#9800ff] bg-purple-50/60 text-slate-900 font-black ring-1 ring-[#9800ff]'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80 text-slate-700 font-semibold'
                    }`}
                  >
                    <Receipt className="w-4 h-4 text-[#8a14d4] shrink-0" />
                    <div>
                      <div className="text-xs font-bold leading-tight">Cheque / DD</div>
                      <div className="text-[10px] text-slate-500">Commercial Clearance</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('credit')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center space-x-2.5 ${
                      selectedPaymentMethod === 'credit'
                        ? 'border-[#9800ff] bg-purple-50/60 text-slate-900 font-black ring-1 ring-[#9800ff]'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80 text-slate-700 font-semibold'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-[#8a14d4] shrink-0" />
                    <div>
                      <div className="text-xs font-bold leading-tight">Trade Credit Line</div>
                      <div className="text-[10px] text-slate-500">30-Day B2B Credit</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('cash')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center space-x-2.5 col-span-2 ${
                      selectedPaymentMethod === 'cash'
                        ? 'border-[#9800ff] bg-purple-50/60 text-slate-900 font-black ring-1 ring-[#9800ff]'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80 text-slate-700 font-semibold'
                    }`}
                  >
                    <Banknote className="w-4 h-4 text-[#8a14d4] shrink-0" />
                    <div>
                      <div className="text-xs font-bold leading-tight">Cash / Counter Deposit</div>
                      <div className="text-[10px] text-slate-500">Official Depot Cash Receipt</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Optional reference / UPI ID */}
              {selectedPaymentMethod === 'upi' && (
                <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                  <label className="font-bold text-slate-700">UPI ID / VPA (Optional)</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. yourbusiness@upi / 9835122345@paytm"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#9800ff]"
                  />
                </div>
              )}

              {(selectedPaymentMethod === 'bank_transfer' || selectedPaymentMethod === 'cheque') && (
                <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                  <label className="font-bold text-slate-700">
                    {selectedPaymentMethod === 'bank_transfer' ? 'Bank UTR / Transaction Reference (Optional)' : 'Cheque / DD Number'}
                  </label>
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder={selectedPaymentMethod === 'bank_transfer' ? 'e.g. UTR108293847291' : 'e.g. CHQ-448201'}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#9800ff]"
                  />
                </div>
              )}

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
                  <div className="text-2xl font-black text-[#0972D3]">
                    ₹{totalPayable.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Cancel & Pay Now Horizontally with Equal Width & Size */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  id="btn-cancel-payment"
                  onClick={() => {
                    if (onCancelPayment) {
                      onCancelPayment(activeOrder);
                    }
                  }}
                  disabled={isProcessing}
                  className="w-full py-4 px-4 sm:px-6 rounded-2xl bg-white hover:bg-blue-50/50 active:bg-blue-100/50 text-[#0972D3] font-bold text-sm sm:text-base transition-all flex items-center justify-center space-x-1.5 border-2 border-[#0972D3] hover:border-[#0862b5] shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4 text-[#0972D3] shrink-0" />
                  <span className="truncate text-[#0972D3]">Back to Order</span>
                </button>

                <button
                  type="button"
                  id="btn-confirm-payment"
                  onClick={() => handleExecuteSettlement([activeOrder])}
                  disabled={isProcessing}
                  className="w-full py-4 px-4 sm:px-6 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center space-x-2 transition-all duration-200 shadow-md shadow-[#0972D3]/20 cursor-pointer active:scale-[0.98] bg-[#0972D3] hover:bg-[#0862b5] active:bg-[#07539a] text-white disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span className="inline-flex items-center space-x-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </span>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 fill-white text-white shrink-0" />
                      <span className="truncate">Proceed</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: GENERAL PAYMENTS & INVOICES (Matches Order Details Page Theme)
  // =========================================================================
  return (
    <div className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in overflow-x-hidden min-w-0">
      <div className="max-w-2xl mx-auto w-full space-y-6 min-w-0">

        {/* Top Header Card */}
        <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <h2 className="text-lg font-black text-slate-900">
              Payment & Invoices
            </h2>
            <div className="text-xs font-black text-[#8a14d4] bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
              {allOrders.filter(o => o.paymentStatus !== 'Paid').length} Due
            </div>
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-bold tracking-wider text-slate-500 uppercase mb-1.5">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#9800ff] cursor-pointer"
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
              <label className="block text-[11px] font-bold tracking-wider text-slate-500 uppercase mb-1.5">
                View Status
              </label>
              <select
                value={viewStatus}
                onChange={(e) => {
                  setViewStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#9800ff] cursor-pointer"
              >
                <option value="Outstanding">Outstanding</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
                <option value="All">All Invoices</option>
              </select>
            </div>
          </div>

          {/* Date Range - Flexible responsive grid */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                Date Range
              </label>
              {(startDate || endDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="text-[11px] text-[#8a14d4] hover:underline font-bold flex items-center space-x-1 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  <span>Clear Dates</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between min-w-0">
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800 flex-1 min-w-0">
                  <span className="text-[11px] font-bold text-slate-400 shrink-0">From:</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-transparent text-slate-800 text-xs font-medium focus:outline-none cursor-pointer w-full min-w-0"
                  />
                </div>
                <Calendar className="w-4 h-4 text-slate-400 shrink-0 ml-1.5" />
              </div>

              <div className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between min-w-0">
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800 flex-1 min-w-0">
                  <span className="text-[11px] font-bold text-slate-400 shrink-0">To:</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-transparent text-slate-800 text-xs font-medium focus:outline-none cursor-pointer w-full min-w-0"
                  />
                </div>
                <Calendar className="w-4 h-4 text-slate-400 shrink-0 ml-1.5" />
              </div>
            </div>
          </div>

        </div>

        {/* Pagination Bar - Safe Responsive Layout with Ellipsis */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-1.5 sm:space-x-2 py-2 text-slate-700 w-full max-w-full overflow-hidden select-none">
            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage <= 1}
              className={`p-1.5 rounded-xl transition-colors cursor-pointer shrink-0 ${
                currentPage <= 1 ? 'text-slate-300 cursor-not-allowed' : 'hover:bg-slate-200 text-slate-700'
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
                        ? 'bg-[#9800ff] text-white shadow-xs font-black'
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
                currentPage >= totalPages ? 'text-slate-300 cursor-not-allowed' : 'hover:bg-slate-200 text-slate-700'
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
                  ? 'bg-[#9800ff] border-[#9800ff] text-white'
                  : 'border-slate-300 bg-white'
              }`}>
                {paginatedOrders.every(o => selectedInvoiceIds.includes(o.id)) && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <span>Select all on this page</span>
            </button>
            <span>Showing {paginatedOrders.length} of {filteredAndSortedOrders.length} records</span>
          </div>
        )}

        {/* Invoices Cards List */}
        <div className="space-y-4">
          {paginatedOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm space-y-3">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No Invoices Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                There are no invoices matching your current filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setViewStatus('All');
                  setStartDate('');
                  setEndDate('');
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Reset Filters
              </button>
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
                  className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all relative shadow-sm hover:shadow-md ${
                    isSelected ? 'border-[#9800ff] ring-2 ring-[#9800ff]/20 bg-purple-50/20' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Checkbox + Invoice Number */}
                    <div className="flex items-center space-x-3">
                      <label className="relative flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(order.id)}
                          className="sr-only peer"
                        />
                        <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
                          isSelected
                            ? 'bg-[#9800ff] border-[#9800ff] text-white shadow-2xs'
                            : 'border-slate-300 bg-white hover:border-slate-500'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          if (onViewInvoice) {
                            onViewInvoice(order);
                          } else {
                            handleInitiateSinglePayment(order);
                          }
                        }}
                        className="text-[#8a14d4] font-black underline font-mono text-sm sm:text-base tracking-tight hover:text-[#7200be] transition-colors cursor-pointer"
                      >
                        #{order.orderNumber}
                      </button>
                    </div>

                    {/* Right: Status Pill & Actions */}
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                        isPaid
                          ? 'border border-emerald-300 text-emerald-700 bg-emerald-50'
                          : 'border border-rose-300 text-rose-700 bg-rose-50'
                      }`}>
                        {isPaid ? 'Paid' : 'Outstanding'}
                      </span>

                      <button
                        type="button"
                        onClick={() => onViewInvoice ? onViewInvoice(order) : window.print()}
                        className="p-1.5 text-slate-500 hover:text-[#8a14d4] rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        title="View GST Invoice"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 text-xs">
                    <div className="flex items-center justify-between text-slate-600 mb-1.5">
                      <span>Total Amount:</span>
                      <span className="font-black text-sm text-[#8a14d4]">
                        {formatAmountINR(order.totalAmount)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-500">
                      <span>Due Date: <strong className="text-slate-700">{dueDateFormatted}</strong></span>
                      <span>Created: <strong className="text-slate-700">{createdDateFormatted}</strong></span>
                    </div>
                  </div>

                  {/* Pay Now Single Button */}
                  {!isPaid && (
                    <div className="mt-3.5 pt-3 border-t border-slate-100 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleInitiateSinglePayment(order)}
                        className="px-4 py-2 rounded-xl bg-[#9800ff] hover:bg-[#8500df] text-white font-black text-xs shadow-sm flex items-center space-x-1.5 transition-all cursor-pointer active:scale-95"
                      >
                        <Zap className="w-3.5 h-3.5 fill-white" />
                        <span>Pay {formatAmountINR(order.totalAmount)}</span>
                      </button>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

        {/* Multi-Select Sticky Bottom Action */}
        {selectedInvoiceIds.length > 0 && (
          <div className="fixed bottom-6 inset-x-4 max-w-xl mx-auto z-40 bg-white p-4 sm:p-5 rounded-3xl shadow-2xl border border-slate-200 flex items-center justify-between gap-4 animate-slide-up">
            <div>
              <div className="text-xs font-bold text-slate-500">
                {selectedInvoiceIds.length} Selected Total
              </div>
              <div className="text-lg font-black text-[#8a14d4]">
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
                className="px-5 py-2.5 rounded-xl bg-[#9800ff] hover:bg-[#8500df] text-white font-black text-xs shadow-md flex items-center space-x-1.5 cursor-pointer active:scale-95"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Pay Selected</span>
              </button>
            </div>
          </div>
        )}

        {/* Last Receipt Confirmation Banner */}
        {lastReceipt && (
          <div className="bg-white p-6 rounded-3xl border border-emerald-200 shadow-md space-y-3 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-emerald-700">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-black">
                  Payment Recorded Successfully
                </span>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center space-x-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Receipt</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Receipt ID</span>
                <span className="font-mono font-bold text-slate-900">{lastReceipt.paymentId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Order</span>
                <span className="font-bold text-slate-900">#{lastReceipt.orderId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Method</span>
                <span className="font-bold text-slate-900">{lastReceipt.method}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Amount</span>
                <span className="font-black text-[#8a14d4]">{formatAmountINR(lastReceipt.amount)}</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* MODAL: Settle Invoice */}
      {isPaymentModalOpen && paymentModalOrders.length > 0 && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 p-6 sm:p-8 space-y-5">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">
                {paymentModalOrders.length === 1
                  ? `Settle Invoice #${paymentModalOrders[0].orderNumber}`
                  : `Settle ${paymentModalOrders.length} Invoices`}
              </h3>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Methods */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-700 block">
                Select Settlement Method
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('upi')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center space-x-2.5 ${
                    selectedPaymentMethod === 'upi'
                      ? 'border-[#9800ff] bg-purple-50/60 text-slate-900 font-black ring-1 ring-[#9800ff]'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80 text-slate-700 font-semibold'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-[#8a14d4] shrink-0" />
                  <div>
                    <div className="text-xs font-bold leading-tight">Direct UPI QR</div>
                    <div className="text-[10px] text-slate-500">Fast QR / App</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('bank_transfer')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center space-x-2.5 ${
                    selectedPaymentMethod === 'bank_transfer'
                      ? 'border-[#9800ff] bg-purple-50/60 text-slate-900 font-black ring-1 ring-[#9800ff]'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80 text-slate-700 font-semibold'
                  }`}
                >
                  <Landmark className="w-4 h-4 text-[#8a14d4] shrink-0" />
                  <div>
                    <div className="text-xs font-bold leading-tight">Bank Transfer</div>
                    <div className="text-[10px] text-slate-500">NEFT / RTGS</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('cheque')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center space-x-2.5 ${
                    selectedPaymentMethod === 'cheque'
                      ? 'border-[#9800ff] bg-purple-50/60 text-slate-900 font-black ring-1 ring-[#9800ff]'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80 text-slate-700 font-semibold'
                  }`}
                >
                  <Receipt className="w-4 h-4 text-[#8a14d4] shrink-0" />
                  <div>
                    <div className="text-xs font-bold leading-tight">Cheque / DD</div>
                    <div className="text-[10px] text-slate-500">Bank Draft</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('credit')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center space-x-2.5 ${
                    selectedPaymentMethod === 'credit'
                      ? 'border-[#9800ff] bg-purple-50/60 text-slate-900 font-black ring-1 ring-[#9800ff]'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80 text-slate-700 font-semibold'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-[#8a14d4] shrink-0" />
                  <div>
                    <div className="text-xs font-bold leading-tight">Trade Credit Line</div>
                    <div className="text-[10px] text-slate-500">30-Day B2B</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('cash')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center space-x-2.5 col-span-2 ${
                    selectedPaymentMethod === 'cash'
                      ? 'border-[#9800ff] bg-purple-50/60 text-slate-900 font-black ring-1 ring-[#9800ff]'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80 text-slate-700 font-semibold'
                  }`}
                >
                  <Banknote className="w-4 h-4 text-[#8a14d4] shrink-0" />
                  <div>
                    <div className="text-xs font-bold leading-tight">Cash Deposit</div>
                    <div className="text-[10px] text-slate-500">Depot Counter Deposit</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Total Row */}
            <div className="border-t-2 border-dashed border-slate-200 pt-3 flex justify-between items-baseline">
              <div className="text-base font-black text-slate-900">Total Payable</div>
              <div className="text-2xl font-black text-[#8a14d4]">
                {formatAmountINR(paymentModalOrders.reduce((sum, o) => sum + o.totalAmount, 0))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                disabled={isProcessing}
                className="px-5 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold text-sm sm:text-base transition-all flex items-center justify-center space-x-1.5 border border-slate-200 cursor-pointer disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4 text-slate-500" />
                <span>Cancel</span>
              </button>

              <button
                type="button"
                onClick={() => handleExecuteSettlement(paymentModalOrders)}
                disabled={isProcessing}
                className="flex-1 py-4 px-6 rounded-2xl font-black text-base flex items-center justify-center space-x-2 transition-all duration-200 shadow-md cursor-pointer active:scale-[0.98] bg-[#9800ff] hover:bg-[#8500df] active:bg-[#7200be] text-white disabled:opacity-50"
              >
                {isProcessing ? (
                  <span className="inline-flex items-center space-x-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </span>
                ) : (
                  <>
                    <Zap className="w-5 h-5 fill-white text-white" />
                    <span>Pay {formatAmountINR(paymentModalOrders.reduce((sum, o) => sum + o.totalAmount, 0))}</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export const QuickPaymentsPage = PaymentPage;
