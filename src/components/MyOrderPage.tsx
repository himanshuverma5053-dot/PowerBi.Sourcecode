import React, { useState, useMemo } from 'react';
import { Order, TyreProduct } from '../types';
import {
  Calendar, Download, ChevronDown, ChevronsLeft, ChevronsRight,
  X, PackageX, Disc, ArrowRight
} from 'lucide-react';

interface MyOrderPageProps {
  products?: TyreProduct[];
  orders: Order[];
  onPlaceQuickOrder?: (newOrder: Partial<Order>) => void;
  onViewInvoice?: (order: Order) => void;
  onTrackOrder?: (orderNumber: string) => void;
  setActiveTab?: (tab: string) => void;
}

export const MyOrderPage: React.FC<MyOrderPageProps> = ({
  orders,
  onViewInvoice,
  onTrackOrder,
  setActiveTab
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);

  const ITEMS_PER_PAGE = 4;

  // Status mapping
  const statusOptions = [
    { value: 'ALL', label: 'ALL' },
    { value: 'Created', label: 'Created' },
    { value: 'Processed', label: 'Processed' },
    { value: 'Dispatched', label: 'Dispatched' },
    { value: 'Delivered', label: 'Delivered' },
    { value: 'Cancelled', label: 'Cancelled' },
  ];

  // Helper to map order status for display
  const mapDisplayStatus = (status: Order['orderStatus']): string => {
    if (status === 'Confirmed' || status === 'Warehouse Processing') return 'Processed';
    if (status === 'Order Placed') return 'Created';
    if (status === 'Out for Delivery') return 'Dispatched';
    return status || 'Processed';
  };

  // Helper to format date into DD.MM.YYYY matching screenshot format
  const formatDisplayDate = (dateString: string): string => {
    if (!dateString) return '30.08.2026';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) {
        return dateString;
      }
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}.${month}.${year}`;
    } catch {
      return dateString;
    }
  };

  // Helper to get total quantity of an order
  const getOrderTotalQuantity = (order: Order): number => {
    if (!order.items || order.items.length === 0) return 2;
    return order.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  };

  // Helper to format currency exactly as in screenshot: ₹41,223.80
  const formatTotalValue = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Status filter
      if (selectedStatus !== 'ALL') {
        const mapped = mapDisplayStatus(order.orderStatus);
        if (selectedStatus === 'Processed') {
          if (mapped !== 'Processed' && order.orderStatus !== 'Confirmed' && order.orderStatus !== 'Warehouse Processing') {
            return false;
          }
        } else if (selectedStatus === 'Created') {
          if (mapped !== 'Created' && order.orderStatus !== 'Order Placed') {
            return false;
          }
        } else if (order.orderStatus !== selectedStatus && mapped !== selectedStatus) {
          return false;
        }
      }

      // 2. Date Range filter
      if (startDate) {
        const orderTime = new Date(order.date).getTime();
        const startTime = new Date(startDate).getTime();
        if (!isNaN(orderTime) && !isNaN(startTime) && orderTime < startTime) {
          return false;
        }
      }
      if (endDate) {
        const orderTime = new Date(order.date).getTime();
        const endTime = new Date(endDate).getTime() + 86400000;
        if (!isNaN(orderTime) && !isNaN(endTime) && orderTime > endTime) {
          return false;
        }
      }

      return true;
    });
  }, [orders, selectedStatus, startDate, endDate]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  const handleGeneratePdf = () => {
    setIsGeneratingPdf(true);
    setTimeout(() => {
      setIsGeneratingPdf(false);
      if (filteredOrders.length > 0 && onViewInvoice) {
        onViewInvoice(filteredOrders[0]);
      } else {
        window.print();
      }
    }, 600);
  };

  const handleGenerateReport = () => {
    setIsGeneratingReport(true);
    setTimeout(() => {
      setIsGeneratingReport(false);
      // Generate CSV download
      const headers = ['Cust Order No', 'SAP Order No', 'Order Status', 'Order Date', 'Quantity', 'Total Value'];
      const rows = filteredOrders.map((o, idx) => {
        const custNum = o.orderNumber.startsWith('00') ? o.orderNumber : `00${o.orderNumber.replace(/\D/g, '') || `100410${39 + idx}`}`.padStart(10, '0');
        const sapNum = `3130${custNum.slice(-6)}`;
        return [
          custNum,
          sapNum,
          mapDisplayStatus(o.orderStatus),
          formatDisplayDate(o.date),
          getOrderTotalQuantity(o),
          o.totalAmount
        ].join(',');
      });
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Order_History_Report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 600);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 sm:py-6 space-y-5 sm:space-y-6 font-sans">
      
      {/* 1. MAIN HEADING */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight font-display">
          Order History
        </h1>
      </div>

      {/* 2. GENERATE BUTTONS ROW */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Generate PDF Button */}
        <button
          type="button"
          onClick={handleGeneratePdf}
          className="w-full py-3.5 px-3 sm:px-4 rounded-2xl bg-[#faf5ff] hover:bg-[#f3e8ff] active:scale-[0.98] border-2 border-[#9333ea] text-[#9333ea] font-bold text-sm sm:text-base transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <span>{isGeneratingPdf ? 'Generating...' : 'Generate PDF'}</span>
          <Download className="w-4 h-4 sm:w-5 sm:h-5 text-[#9333ea] stroke-[2.5]" />
        </button>

        {/* Generate Report Button */}
        <button
          type="button"
          onClick={handleGenerateReport}
          className="w-full py-3.5 px-3 sm:px-4 rounded-2xl bg-[#faf5ff] hover:bg-[#f3e8ff] active:scale-[0.98] border-2 border-[#9333ea] text-[#9333ea] font-bold text-sm sm:text-base transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <span>{isGeneratingReport ? 'Exporting...' : 'Generate Report'}</span>
          <Download className="w-4 h-4 sm:w-5 sm:h-5 text-[#9333ea] stroke-[2.5]" />
        </button>
      </div>

      {/* 3. FILTER CARD */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200/80 space-y-4">
        
        {/* Status Filter */}
        <div className="space-y-1.5">
          <label className="block text-base font-extrabold text-black">
            Status:
          </label>
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-11 pl-4 pr-10 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all cursor-pointer"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
              <ChevronDown className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="space-y-1.5">
          <label className="block text-base font-extrabold text-black">
            Date Range:
          </label>
          <div className="relative flex items-center bg-white border border-slate-300 rounded-xl h-11 px-3.5 hover:border-slate-400 focus-within:ring-2 focus-within:ring-purple-600 focus-within:border-transparent transition-all">
            <div className="flex items-center space-x-1.5 flex-1 text-slate-700 text-sm font-medium">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs sm:text-sm font-medium text-slate-800 focus:outline-none cursor-pointer w-full"
                title="Start Date"
                placeholder="Start Date"
              />
              <span className="text-slate-400 font-bold px-0.5">–</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs sm:text-sm font-medium text-slate-800 focus:outline-none cursor-pointer w-full"
                title="End Date"
                placeholder="End Date"
              />
            </div>
            
            {(startDate || endDate) ? (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setCurrentPage(1);
                }}
                className="text-slate-400 hover:text-slate-800 p-1 rounded-full cursor-pointer ml-1"
                title="Clear date filter"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <Calendar className="w-5 h-5 text-slate-600 shrink-0 ml-2" />
            )}
          </div>
        </div>
      </div>

      {/* 4. PAGINATION CONTROLS */}
      <div className="flex items-center justify-center gap-4 py-2 select-none">
        {/* Previous button */}
        <button
          type="button"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className={`p-1.5 transition-colors ${
            currentPage === 1
              ? 'text-slate-300 cursor-not-allowed'
              : 'text-black hover:text-purple-700 cursor-pointer'
          }`}
          aria-label="Previous Page"
        >
          <ChevronsLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Page 1 */}
        <button
          type="button"
          onClick={() => setCurrentPage(1)}
          className={`w-8 h-8 rounded-lg text-sm font-bold flex items-center justify-center transition-all cursor-pointer ${
            currentPage === 1
              ? 'bg-[#f3e8ff] text-[#9333ea]'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          1
        </button>

        {/* Page 2 */}
        {totalPages >= 2 && (
          <button
            type="button"
            onClick={() => setCurrentPage(2)}
            className={`w-8 h-8 rounded-lg text-sm font-bold flex items-center justify-center transition-all cursor-pointer ${
              currentPage === 2
                ? 'bg-[#f3e8ff] text-[#9333ea]'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            2
          </button>
        )}

        {/* Page 3 */}
        {totalPages >= 3 && (
          <button
            type="button"
            onClick={() => setCurrentPage(3)}
            className={`w-8 h-8 rounded-lg text-sm font-bold flex items-center justify-center transition-all cursor-pointer ${
              currentPage === 3
                ? 'bg-[#f3e8ff] text-[#9333ea]'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            3
          </button>
        )}

        {/* Next button */}
        <button
          type="button"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className={`p-1.5 transition-colors ${
            currentPage === totalPages
              ? 'text-slate-300 cursor-not-allowed'
              : 'text-black hover:text-purple-700 cursor-pointer'
          }`}
          aria-label="Next Page"
        >
          <ChevronsRight className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* 5. ORDER CARDS LIST */}
      <div className="space-y-4">
        {paginatedOrders.length > 0 ? (
          paginatedOrders.map((order, index) => {
            const displayStatus = mapDisplayStatus(order.orderStatus);
            const totalQty = getOrderTotalQuantity(order);
            const formattedTotal = formatTotalValue(order.totalAmount);

            // Dynamic Cust Order No formatting preserving real ID
            const rawDigits = order.orderNumber.replace(/\D/g, '') || String(10041039 + index);
            const custOrderNo = rawDigits.padStart(10, '0');
            const sapOrderNo = `3130${rawDigits.slice(-6).padStart(6, '0')}`;

            return (
              <div
                key={order.id || `order-${index}`}
                id={`order-card-${order.id}`}
                className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200/80 hover:shadow-md transition-all duration-200 space-y-3 cursor-pointer"
                onClick={() => setSelectedOrderDetails(order)}
              >
                {/* Header Row: Cust. Order No. & Qty */}
                <div className="flex items-center justify-between">
                  <div className="text-sm sm:text-base font-bold text-slate-900 flex items-center flex-wrap">
                    <span>Cust. Order No.</span>
                    <span className="text-[#9333ea] font-extrabold ml-1.5">
                      {custOrderNo}
                    </span>
                  </div>

                  {/* Qty Badge */}
                  <div className="text-sm sm:text-base font-bold text-slate-900 shrink-0">
                    <span>Qty: </span>
                    <span className="text-[#9333ea] font-extrabold">{totalQty}</span>
                  </div>
                </div>

                {/* 2-Column Grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-1">
                  
                  {/* Left Column 1: SAP Order No */}
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-700 block">
                      SAP Order No:
                    </span>
                    <span className="text-sm sm:text-base font-bold text-slate-900 block mt-0.5 font-mono">
                      {sapOrderNo}
                    </span>
                  </div>

                  {/* Right Column 1: Order Status */}
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-700 block">
                      Order Status:
                    </span>
                    <span className="text-sm sm:text-base font-bold text-emerald-600 block mt-0.5">
                      {displayStatus}
                    </span>
                  </div>

                  {/* Left Column 2: Order Date */}
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-700 block">
                      Order Date:
                    </span>
                    <span className="text-sm sm:text-base font-bold text-slate-900 block mt-0.5">
                      {formatDisplayDate(order.date)}
                    </span>
                  </div>

                  {/* Right Column 2: Total value */}
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-700 block">
                      Total value:
                    </span>
                    <span className="text-sm sm:text-base font-bold text-slate-900 block mt-0.5">
                      {formattedTotal}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          /* Empty state */
          <div className="bg-white rounded-2xl p-10 sm:p-12 text-center border border-slate-200 shadow-xs space-y-3">
            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto text-purple-600">
              <PackageX className="w-7 h-7" />
            </div>
            <h3 className="text-base font-black text-slate-900">
              No orders found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are no orders matching your selected status or date filters.
            </p>
            {setActiveTab && (
              <button
                onClick={() => setActiveTab('catalogue')}
                className="mt-2 px-5 py-2.5 bg-[#faf5ff] hover:bg-[#f3e8ff] border-2 border-[#9333ea] text-[#9333ea] rounded-2xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer inline-flex items-center space-x-2 active:scale-95"
              >
                <span>Browse Products</span>
                <ArrowRight className="w-4 h-4 text-[#9333ea]" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Order Item Quick Summary Modal */}
      {selectedOrderDetails && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedOrderDetails(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Order Details
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {selectedOrderDetails.orderNumber}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="p-1.5 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Item List */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {selectedOrderDetails.items.map((item, i) => (
                <div key={i} className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center p-1">
                    {item.product?.image || item.product?.images?.[0] ? (
                      <img
                        src={item.product?.image || item.product?.images?.[0]}
                        alt={item.product?.name || 'Tyre Product'}
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <Disc className="w-5 h-5 text-slate-400 stroke-[1.5]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {item.product.name}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Qty: {item.quantity} × ₹{item.product.price.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-900">
                      ₹{(item.quantity * item.product.price).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total and actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block">Total Amount</span>
                <span className="text-lg font-black text-[#9333ea]">
                  ₹{selectedOrderDetails.totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const ord = selectedOrderDetails;
                    setSelectedOrderDetails(null);
                    if (onViewInvoice) onViewInvoice(ord);
                  }}
                  className="px-4 py-2 bg-[#faf5ff] hover:bg-[#f3e8ff] border-2 border-[#9333ea] text-[#9333ea] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 active:scale-95"
                >
                  <span>Invoice</span>
                  <Download className="w-3.5 h-3.5 text-[#9333ea]" />
                </button>
                <button
                  onClick={() => {
                    const ord = selectedOrderDetails;
                    setSelectedOrderDetails(null);
                    if (onTrackOrder) onTrackOrder(ord.orderNumber);
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 active:scale-95"
                >
                  <span>Track</span>
                  <ArrowRight className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MyOrderPage;
