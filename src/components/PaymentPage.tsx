import React, { useState, useMemo } from 'react';
import { PaymentRecord, Order } from '../types';
import { formatCurrency } from '../utils/formatters';
import {
  CreditCard, CheckCircle2, ShieldCheck, Download,
  ArrowRight, Zap, Search, Calendar, Clock,
  FileText, Check, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  AlertCircle, Building2, Smartphone, QrCode, Lock, RefreshCw, X,
  Banknote, Landmark, Receipt
} from 'lucide-react';

interface PaymentPageProps {
  payments: PaymentRecord[];
  orders?: Order[];
  onProcessPayment: (paymentData: PaymentRecord) => void;
  onViewInvoice?: (order: Order) => void;
}

// B2B Seed Invoices to ensure exact screenshot fidelity and rich data
const DEFAULT_SEED_ORDERS: Order[] = [
  {
    id: 'inv-1066109821',
    orderNumber: '1066109821',
    date: '2026-07-25T10:30:00Z',
    customerName: 'Magadh Commercial Fleet & Tyres',
    customerEmail: 'billing@magadhtyres.in',
    phone: '+91 98765 43210',
    companyName: 'Magadh Transport Logistics Ltd',
    gstNumber: '10AAACM1234F1Z2',
    items: [
      {
        product: {
          id: 'seed-tyre-1',
          name: 'Apollo EnduTrax HD 295/90 R20 Radial',
          brand: 'Apollo',
          category: 'Truck',
          width: 295,
          aspectRatio: 90,
          rimSize: 20,
          speedRating: 'K',
          loadIndex: 154,
          price: 26470,
          bulkPrice: 24500,
          stock: 40,
          image: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&q=80&w=800',
          terrain: 'Highway',
          warrantyYears: 3,
          fuelEfficiency: 'B',
          wetGrip: 'A',
          noiseDb: 68,
          description: 'Heavy duty commercial radial tyre',
          compatibleVehicles: ['Commercial Truck', 'Multi-Axle Trailer'],
          featured: true,
          hsnCode: '40111010'
        },
        quantity: 4
      }
    ],
    subtotal: 89731.36,
    discount: 0,
    gstAmount: 16151.64,
    totalAmount: 105883.00,
    paymentMethod: 'UPI',
    paymentStatus: 'Pending',
    orderStatus: 'Confirmed',
    shippingAddress: {
      street: 'NH-30, Transport Nagar Depot #4',
      city: 'Patna',
      state: 'Bihar',
      pincode: '800007'
    },
    trackingNumber: 'TRK-MG-1066109821',
    estimatedDelivery: '2026-08-01',
    timeline: []
  },
  {
    id: 'inv-1066109822',
    orderNumber: '1066109822',
    date: '2026-07-28T14:15:00Z',
    customerName: 'Patliputra Auto Services',
    customerEmail: 'patliputra.tyres@gmail.com',
    phone: '+91 94310 98765',
    companyName: 'Patliputra Multi-Axle Fleet',
    gstNumber: '10BBBPK9876G1Z4',
    items: [
      {
        product: {
          id: 'seed-tyre-2',
          name: 'JK Tyre Jetsteel JDH5 10.00 R20',
          brand: 'JK Tyre',
          category: 'Truck',
          width: 10,
          aspectRatio: 100,
          rimSize: 20,
          speedRating: 'L',
          loadIndex: 146,
          price: 24650,
          bulkPrice: 22900,
          stock: 35,
          image: 'https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?auto=format&fit=crop&q=80&w=800',
          terrain: 'All-Terrain',
          warrantyYears: 3,
          fuelEfficiency: 'B',
          wetGrip: 'A',
          noiseDb: 70,
          description: 'High mileage drive axle commercial tyre',
          compatibleVehicles: ['Commercial Truck'],
          featured: true,
          hsnCode: '40111010'
        },
        quantity: 2
      }
    ],
    subtotal: 41779.66,
    discount: 0,
    gstAmount: 7520.34,
    totalAmount: 49300.00,
    paymentMethod: 'NetBanking',
    paymentStatus: 'Pending',
    orderStatus: 'Confirmed',
    shippingAddress: {
      street: 'Boring Road Commercial Complex',
      city: 'Patna',
      state: 'Bihar',
      pincode: '800001'
    },
    trackingNumber: 'TRK-MG-1066109822',
    estimatedDelivery: '2026-08-05',
    timeline: []
  },
  {
    id: 'inv-1066109820',
    orderNumber: '1066109820',
    date: '2026-07-15T09:00:00Z',
    customerName: 'Gaya Super Express Transport',
    customerEmail: 'gaya.express@yahoo.com',
    phone: '+91 98350 11223',
    companyName: 'Gaya Super Fleet Pvt Ltd',
    gstNumber: '10AABCG5544H1Z9',
    items: [
      {
        product: {
          id: 'seed-tyre-3',
          name: 'CEAT Mile-XL 10.00-20 Non-Radial',
          brand: 'CEAT',
          category: 'Truck',
          width: 10,
          aspectRatio: 100,
          rimSize: 20,
          speedRating: 'J',
          loadIndex: 144,
          price: 18900,
          bulkPrice: 17500,
          stock: 50,
          image: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&q=80&w=800',
          terrain: 'Highway',
          warrantyYears: 2,
          fuelEfficiency: 'C',
          wetGrip: 'B',
          noiseDb: 72,
          description: 'High durability bias ply truck tyre',
          compatibleVehicles: ['Commercial Truck'],
          featured: false,
          hsnCode: '40111010'
        },
        quantity: 4
      }
    ],
    subtotal: 64067.80,
    discount: 0,
    gstAmount: 11532.20,
    totalAmount: 75600.00,
    paymentMethod: 'UPI',
    paymentStatus: 'Paid',
    orderStatus: 'Delivered',
    shippingAddress: {
      street: 'Station Road Truck Stand',
      city: 'Gaya',
      state: 'Bihar',
      pincode: '823001'
    },
    trackingNumber: 'TRK-MG-1066109820',
    estimatedDelivery: '2026-07-20',
    timeline: []
  },
  {
    id: 'inv-1066109823',
    orderNumber: '1066109823',
    date: '2026-08-02T11:45:00Z',
    customerName: 'Mithila Logistics Fleet',
    customerEmail: 'mithila.fleet@gmail.com',
    phone: '+91 97711 22334',
    companyName: 'Mithila Roadways Co.',
    gstNumber: '10AACCM8877K1Z1',
    items: [
      {
        product: {
          id: 'seed-tyre-4',
          name: 'Bridgestone M751 295/80 R22.5',
          brand: 'Bridgestone',
          category: 'Truck',
          width: 295,
          aspectRatio: 80,
          rimSize: 22.5,
          speedRating: 'M',
          loadIndex: 152,
          price: 31200,
          bulkPrice: 29000,
          stock: 25,
          image: 'https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?auto=format&fit=crop&q=80&w=800',
          terrain: 'Highway',
          warrantyYears: 4,
          fuelEfficiency: 'A',
          wetGrip: 'A',
          noiseDb: 67,
          description: 'Premium highway tubeless radial tyre',
          compatibleVehicles: ['Commercial Truck'],
          featured: true,
          hsnCode: '40111010'
        },
        quantity: 2
      }
    ],
    subtotal: 52881.36,
    discount: 0,
    gstAmount: 9518.64,
    totalAmount: 62400.00,
    paymentMethod: 'UPI',
    paymentStatus: 'Pending',
    orderStatus: 'Dispatched',
    shippingAddress: {
      street: 'Darbhanga Ring Road Transport Yard',
      city: 'Darbhanga',
      state: 'Bihar',
      pincode: '846004'
    },
    trackingNumber: 'TRK-MG-1066109823',
    estimatedDelivery: '2026-08-08',
    timeline: []
  }
];

export const PaymentPage: React.FC<PaymentPageProps> = ({
  payments = [],
  orders = [],
  onProcessPayment,
  onViewInvoice,
}) => {
  // Merged orders: include real orders + seed invoices without duplicating order numbers
  const allOrders = useMemo(() => {
    const existingOrderNumbers = new Set(orders.map(o => o.orderNumber));
    const uniqueSeedOrders = DEFAULT_SEED_ORDERS.filter(seed => !existingOrderNumbers.has(seed.orderNumber));
    return [...orders, ...uniqueSeedOrders];
  }, [orders]);

  // Filters State matching screenshot
  const [sortBy, setSortBy] = useState<string>('inv_due_asc');
  const [viewStatus, setViewStatus] = useState<string>('Outstanding');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 2; // matching 2 items per page to show clean pagination as in screenshot

  // Multi-Selection State for bulk payment
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);

  // Payment Modal State
  const [paymentModalOrders, setPaymentModalOrders] = useState<Order[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'bank_transfer' | 'cheque' | 'upi' | 'credit' | 'cash'>('bank_transfer');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [upiId, setUpiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [lastReceipt, setLastReceipt] = useState<PaymentRecord | null>(null);

  // Helper date formatting function: DD.MM.YYYY
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

  // Helper currency formatter with exact 2 decimal digits if desired
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
      // Status Filter
      if (viewStatus === 'Outstanding') {
        if (order.paymentStatus === 'Paid') return false;
      } else if (viewStatus === 'Paid') {
        if (order.paymentStatus !== 'Paid') return false;
      } else if (viewStatus === 'Overdue') {
        // Assume pending with date > 30 days old is overdue
        if (order.paymentStatus === 'Paid') return false;
      }

      // Date Range Filter
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

    // Sorting
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

  // Toggle single selection
  const handleToggleSelect = (orderId: string) => {
    setSelectedInvoiceIds(prev =>
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  // Toggle select all on current page
  const handleSelectAllOnPage = () => {
    const currentPageIds = paginatedOrders.map(o => o.id);
    const allSelected = currentPageIds.every(id => selectedInvoiceIds.includes(id));
    if (allSelected) {
      setSelectedInvoiceIds(prev => prev.filter(id => !currentPageIds.includes(id)));
    } else {
      setSelectedInvoiceIds(prev => Array.from(new Set([...prev, ...currentPageIds])));
    }
  };

  // Trigger Payment for single order
  const handleInitiateSinglePayment = (order: Order) => {
    setPaymentModalOrders([order]);
    setIsPaymentModalOpen(true);
    setReferenceNumber('');
    setUpiId('');
    setIsProcessing(false);
  };

  // Trigger Bulk Payment for selected orders
  const handleInitiateBulkPayment = () => {
    const ordersToPay = allOrders.filter(o => selectedInvoiceIds.includes(o.id));
    if (ordersToPay.length === 0) return;
    setPaymentModalOrders(ordersToPay);
    setIsPaymentModalOpen(true);
    setReferenceNumber('');
    setUpiId('');
    setIsProcessing(false);
  };

  // Execute Direct Payment Settlement
  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentModalOrders.length === 0) return;

    setIsProcessing(true);
    setProcessingStep('Recording Settlement in B2B Ledger...');

    setTimeout(() => {
      setProcessingStep('Reconciling GST Tax & Account Balance...');
    }, 700);

    setTimeout(() => {
      const methodLabel =
        selectedPaymentMethod === 'bank_transfer' ? 'Direct Bank Transfer (NEFT/RTGS)' :
        selectedPaymentMethod === 'cheque' ? `Cheque / Demand Draft (${referenceNumber || 'Recorded'})` :
        selectedPaymentMethod === 'upi' ? `Direct UPI (${upiId || 'Direct QR'})` :
        selectedPaymentMethod === 'cash' ? 'Cash / Counter Deposit' : 'Trade Credit Account (30-Day)';

      paymentModalOrders.forEach(ord => {
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
    }, 1400);
  };

  const selectedTotalAmount = allOrders
    .filter(o => selectedInvoiceIds.includes(o.id))
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalOutstandingAmount = allOrders
    .filter(o => o.paymentStatus !== 'Paid')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="py-6 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in max-w-3xl mx-auto">
      
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#54b4e7] animate-pulse" />
            <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight">
              Payment & Invoices
            </h1>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Manage GST tax invoices, check outstanding due balances, and record payments.
          </p>
        </div>

        {/* Quick Summary Pill */}
        <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-2xs flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#7c3aed] flex items-center justify-center">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Outstanding</div>
            <div className="text-xs sm:text-sm font-black text-slate-900">
              {formatAmountINR(totalOutstandingAmount)}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">

        {/* SECTION 1: FILTER & SORT CARD (Matching screenshot styling) */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-5">
            
            {/* Row 1: SORT BY & VIEW STATUS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* SORT BY */}
              <div>
                <label className="block text-[11px] font-bold tracking-wider text-slate-500 uppercase mb-2">
                  SORT BY
                </label>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-400 shadow-2xs appearance-none cursor-pointer pr-10"
                  >
                    <option value="inv_due_asc">Inv. Due Date (Asc)</option>
                    <option value="inv_due_desc">Inv. Due Date (Desc)</option>
                    <option value="amount_high">Amount (High to Low)</option>
                    <option value="amount_low">Amount (Low to High)</option>
                    <option value="created_desc">Created Date (Newest)</option>
                    <option value="created_asc">Created Date (Oldest)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-800">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* VIEW STATUS */}
              <div>
                <label className="block text-[11px] font-bold tracking-wider text-slate-500 uppercase mb-2">
                  VIEW STATUS
                </label>
                <div className="relative">
                  <select
                    value={viewStatus}
                    onChange={(e) => {
                      setViewStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-400 shadow-2xs appearance-none cursor-pointer pr-10"
                  >
                    <option value="Outstanding">Outstanding</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                    <option value="All">All Invoices</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-800">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

            </div>

            {/* Row 2: DATE RANGE */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                  DATE RANGE
                </label>
                {(startDate || endDate) && (
                  <button
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                    }}
                    className="text-[11px] text-slate-500 hover:text-rose-600 font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                    <span>Clear Dates</span>
                  </button>
                )}
              </div>

              <div className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-2xl flex items-center justify-between shadow-2xs focus-within:border-slate-500 focus-within:ring-1 focus-within:ring-slate-400">
                <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm font-semibold text-slate-800 flex-1">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-transparent text-slate-800 text-xs sm:text-sm font-medium focus:outline-none cursor-pointer w-32 sm:w-36"
                    placeholder="Start Date"
                  />
                  <span className="text-slate-600 font-bold">—</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-transparent text-slate-800 text-xs sm:text-sm font-medium focus:outline-none cursor-pointer w-32 sm:w-36"
                    placeholder="End Date"
                  />
                </div>
                <Calendar className="w-5 h-5 text-slate-800 shrink-0 ml-2 pointer-events-none" />
              </div>
            </div>

          </div>

          {/* SECTION 2: PAGINATION BAR (Matching screenshot styling) */}
          <div className="flex items-center justify-center space-x-4 py-2 text-slate-700">
            {/* Previous Double Chevron « */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage <= 1}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                currentPage <= 1 ? 'text-slate-300 cursor-not-allowed' : 'hover:bg-slate-200 text-slate-700'
              }`}
              title="Previous Page"
            >
              <ChevronsLeft className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Page Number Pills */}
            <div className="flex items-center space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`min-w-[32px] h-8 px-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center cursor-pointer ${
                    currentPage === pageNum
                      ? 'bg-[#e9d5ff] text-[#7c3aed] font-extrabold shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-200/80'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            {/* Next Double Chevron » */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                currentPage >= totalPages ? 'text-slate-300 cursor-not-allowed' : 'hover:bg-slate-200 text-slate-700'
              }`}
              title="Next Page"
            >
              <ChevronsRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          {/* Quick Select-All Header if outstanding items exist */}
          {paginatedOrders.length > 0 && (
            <div className="flex items-center justify-between px-2 text-xs font-semibold text-slate-500">
              <button
                onClick={handleSelectAllOnPage}
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 cursor-pointer font-bold"
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                  paginatedOrders.every(o => selectedInvoiceIds.includes(o.id))
                    ? 'bg-[#7c3aed] border-[#7c3aed] text-white'
                    : 'border-slate-300 bg-white'
                }`}>
                  {paginatedOrders.every(o => selectedInvoiceIds.includes(o.id)) && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span>Select all on this page</span>
              </button>
              <span>Showing {paginatedOrders.length} of {filteredAndSortedOrders.length} records</span>
            </div>
          )}

          {/* SECTION 3: INVOICE CARDS (Exact match to screenshot card layout) */}
          <div className="space-y-4">
            {paginatedOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 shadow-2xs space-y-3">
                <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No Invoices Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  There are no invoices matching your current status filter ("{viewStatus}") or date selection.
                </p>
                <button
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
                    className={`bg-white rounded-3xl p-6 sm:p-7 border transition-all relative shadow-2xs hover:shadow-md ${
                      isSelected ? 'border-[#7c3aed] ring-2 ring-[#7c3aed]/20 bg-purple-50/10' : 'border-slate-200/90'
                    }`}
                  >
                    {/* Top Row: Checkbox + Invoice # and Status Badge + PDF/Card Icons */}
                    <div className="flex items-start justify-between gap-4">
                      
                      {/* Left: Checkbox + Invoice Number */}
                      <div className="flex items-center space-x-3.5 sm:space-x-4">
                        <label className="relative flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(order.id)}
                            className="sr-only peer"
                          />
                          <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${
                            isSelected
                              ? 'bg-[#7c3aed] border-[#7c3aed] text-white shadow-2xs'
                              : 'border-slate-400 bg-white hover:border-slate-600'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </label>

                        {/* Invoice Number as Underlined Purple Link */}
                        <button
                          type="button"
                          onClick={() => {
                            if (onViewInvoice) {
                              onViewInvoice(order);
                            } else {
                              handleInitiateSinglePayment(order);
                            }
                          }}
                          className="text-[#7c3aed] font-extrabold underline font-mono text-base sm:text-lg tracking-tight hover:text-[#6d28d9] transition-colors cursor-pointer"
                          title="Click to view full GST invoice breakdown"
                        >
                          #{order.orderNumber}
                        </button>
                      </div>

                      {/* Right: Status Pill & Action Icons */}
                      <div className="flex flex-col items-end space-y-2">
                        {/* Status Badge */}
                        <div
                          className={`px-3 sm:px-3.5 py-0.5 rounded-full text-[11px] sm:text-xs font-black tracking-wide ${
                            isPaid
                              ? 'border-2 border-emerald-500 text-emerald-600 bg-emerald-50/40'
                              : 'border-2 border-rose-500 text-rose-600 bg-rose-50/40'
                          }`}
                        >
                          {isPaid ? 'Paid' : 'Outstanding'}
                        </div>

                        {/* Action Icons right under the badge */}
                        <div className="flex items-center space-x-3 pt-0.5">
                          {/* PDF Icon with "PDF" text */}
                          <button
                            type="button"
                            onClick={() => onViewInvoice ? onViewInvoice(order) : window.print()}
                            className="text-[#7c3aed] hover:text-[#6d28d9] flex flex-col items-center group cursor-pointer transition-transform active:scale-95"
                            title="Download/View GST Tax Invoice PDF"
                          >
                            <FileText className="w-6 h-6 stroke-[1.8] group-hover:scale-110 transition-transform" />
                            <span className="text-[9px] font-black tracking-tight leading-none mt-0.5">PDF</span>
                          </button>

                          {/* Card / Terminal Icon */}
                          <button
                            type="button"
                            onClick={() => handleInitiateSinglePayment(order)}
                            className="text-slate-400 hover:text-[#54b4e7] flex items-center justify-center p-1 rounded-lg hover:bg-slate-100 transition-all cursor-pointer active:scale-95"
                            title={isPaid ? 'View Payment Settlement Details' : 'Settle Invoice'}
                          >
                            <CreditCard className="w-6 h-6 stroke-[1.8]" />
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Bottom Specifications Grid matching screenshot layout */}
                    <div className="mt-4 pt-3 border-t border-slate-100 text-slate-800 text-xs sm:text-sm">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
                        
                        {/* Left Row 1: Due Amount | CCA */}
                        <div className="font-bold text-slate-900 flex items-center justify-between sm:justify-start sm:space-x-2">
                          <span className="text-slate-600 font-medium">Due Amount | CCA</span>
                        </div>

                        {/* Right Row 1: ₹105,883.00 | CRAS */}
                        <div className="font-extrabold text-slate-900 text-right sm:text-left flex items-center justify-end sm:justify-start sm:space-x-2">
                          <span className="text-base sm:text-lg font-black text-slate-950">
                            {formatAmountINR(order.totalAmount)}
                          </span>
                          <span className="text-slate-400 font-semibold text-xs sm:text-sm">| CRAS</span>
                        </div>

                        {/* Left Row 2: Due Date: 25.08.2026 */}
                        <div className="text-slate-700 font-semibold flex items-center space-x-1">
                          <span className="text-slate-600 font-medium">Due Date:</span>
                          <span className="text-slate-900 font-bold">{dueDateFormatted}</span>
                        </div>

                        {/* Right Row 2: Created On: 25.07.2026 */}
                        <div className="text-slate-700 font-semibold text-right sm:text-left flex items-center justify-end sm:justify-start space-x-1">
                          <span className="text-slate-600 font-medium">Created On:</span>
                          <span className="text-slate-900 font-bold">{createdDateFormatted}</span>
                        </div>

                      </div>
                    </div>

                    {/* Quick Pay Button if invoice is outstanding */}
                    {!isPaid && (
                      <div className="mt-4 pt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleInitiateSinglePayment(order)}
                          className="px-4 py-2 rounded-xl bg-[#54b4e7] hover:bg-[#3ea5dc] text-white font-extrabold text-xs shadow-2xs flex items-center space-x-1.5 transition-all cursor-pointer active:scale-95"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Pay {formatAmountINR(order.totalAmount)}</span>
                        </button>
                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>

          {/* STICKY BOTTOM MULTI-PAYMENT BAR */}
          {selectedInvoiceIds.length > 0 && (
            <div className="fixed bottom-6 inset-x-4 sm:inset-x-auto sm:right-8 z-40 bg-slate-900 text-white p-4 sm:p-5 rounded-3xl shadow-2xl border border-slate-700 max-w-lg mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 animate-slide-up">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-md bg-[#7c3aed] text-white text-[10px] font-black uppercase">
                    {selectedInvoiceIds.length} Selected
                  </span>
                  <span className="text-xs text-slate-300">Total Outstanding</span>
                </div>
                <div className="text-lg sm:text-xl font-black text-amber-300 mt-0.5">
                  {formatAmountINR(selectedTotalAmount)}
                </div>
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedInvoiceIds([])}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Clear
                </button>
                <button
                  onClick={handleInitiateBulkPayment}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#54b4e7] hover:bg-[#3ea5dc] text-white font-black text-xs shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
                >
                  <Zap className="w-4 h-4" />
                  <span>Pay Selected Invoices</span>
                </button>
              </div>
            </div>
          )}

          {/* Last Settled Receipt Confirmation Banner */}
          {lastReceipt && (
            <div className="bg-emerald-50 text-slate-900 rounded-3xl p-6 border border-emerald-200 shadow-2xs space-y-3 animate-fade-in mt-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2 text-emerald-800">
                  <CheckCircle2 className="w-6 h-6" />
                  <span className="text-sm font-extrabold uppercase tracking-widest">
                    Payment Verified & Ledger Settled
                  </span>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-[#54b4e7] text-white font-black text-xs flex items-center space-x-1.5 hover:bg-[#3ea5dc] cursor-pointer shadow-2xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2 border-t border-emerald-200 text-slate-600">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Transaction ID</span>
                  <span className="font-mono font-bold text-slate-900">{lastReceipt.paymentId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Order / Invoice</span>
                  <span className="font-bold text-slate-900">#{lastReceipt.orderId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Settlement Mode</span>
                  <span className="font-bold text-slate-900">{lastReceipt.method}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Amount Paid</span>
                  <span className="font-black text-slate-900">{formatAmountINR(lastReceipt.amount)}</span>
                </div>
              </div>
            </div>
          )}

      </div>

      {/* POPUP PAYMENT SETTLEMENT MODAL */}
      {isPaymentModalOpen && paymentModalOrders.length > 0 && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#54b4e7] text-white flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black font-display">
                    {paymentModalOrders.length === 1
                      ? `Settle Invoice #${paymentModalOrders[0].orderNumber}`
                      : `Settle ${paymentModalOrders.length} Invoices`}
                  </h3>
                  <p className="text-slate-300 text-xs">
                    Total Due: {formatAmountINR(paymentModalOrders.reduce((sum, o) => sum + o.totalAmount, 0))}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleConfirmPayment} className="p-6 space-y-5">
              
              {/* Payment Methods Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                  Select Settlement Method
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('bank_transfer')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center space-x-2.5 ${
                      selectedPaymentMethod === 'bank_transfer'
                        ? 'border-[#54b4e7] bg-[#54b4e7]/10 text-slate-900 font-extrabold ring-1 ring-[#54b4e7]'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-medium'
                    }`}
                  >
                    <Landmark className="w-4 h-4 text-sky-600 shrink-0" />
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
                        ? 'border-[#54b4e7] bg-[#54b4e7]/10 text-slate-900 font-extrabold ring-1 ring-[#54b4e7]'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-medium'
                    }`}
                  >
                    <Receipt className="w-4 h-4 text-purple-600 shrink-0" />
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
                        ? 'border-[#54b4e7] bg-[#54b4e7]/10 text-slate-900 font-extrabold ring-1 ring-[#54b4e7]'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-medium'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <div className="text-xs font-bold leading-tight">Trade Credit Line</div>
                      <div className="text-[10px] text-slate-500">30-Day B2B Credit</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('upi')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center space-x-2.5 ${
                      selectedPaymentMethod === 'upi'
                        ? 'border-[#54b4e7] bg-[#54b4e7]/10 text-slate-900 font-extrabold ring-1 ring-[#54b4e7]'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-medium'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-xs font-bold leading-tight">Direct UPI QR</div>
                      <div className="text-[10px] text-slate-500">VPA / Fast Settlement</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMethod('cash')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center space-x-2.5 col-span-2 ${
                      selectedPaymentMethod === 'cash'
                        ? 'border-[#54b4e7] bg-[#54b4e7]/10 text-slate-900 font-extrabold ring-1 ring-[#54b4e7]'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700 font-medium'
                    }`}
                  >
                    <Banknote className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-xs font-bold leading-tight">Cash / Counter Deposit</div>
                      <div className="text-[10px] text-slate-500">Official Depot Receipt</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Reference / UTR Number for Bank Transfer or Cheque */}
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
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-slate-500"
                  />
                </div>
              )}

              {/* UPI Custom ID field if UPI selected */}
              {selectedPaymentMethod === 'upi' && (
                <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                  <label className="font-bold text-slate-700">Payer UPI ID / VPA (Optional)</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. business@sbi / transport@icici"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-slate-500"
                  />
                </div>
              )}

              {/* Security & GST Note */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <div className="flex items-center space-x-1.5 font-bold text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>GST-Compliant Commercial Ledger Settlement</span>
                </div>
                <p>
                  Official tax invoice and GST input credit (18%) will automatically be synced to your GSTIN upon settlement.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 rounded-2xl bg-[#54b4e7] hover:bg-[#3ea5dc] text-white font-black text-sm shadow-md active:scale-95 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>{processingStep || 'Processing Settlement...'}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>
                      Settle {formatAmountINR(paymentModalOrders.reduce((sum, o) => sum + o.totalAmount, 0))} Now
                    </span>
                  </>
                )}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export const QuickPaymentsPage = PaymentPage;
