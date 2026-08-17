import React, { useState, useMemo } from 'react';
import { Order, TyreProduct } from '../types';
import {
  Calendar, FileText, Truck, Search, X, PackageX,
  ChevronDown, ExternalLink, ShieldCheck, CheckCircle2, ArrowRight
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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

  // Status mapping
  const statusOptions = [
    { value: 'ALL', label: 'ALL' },
    { value: 'Processed', label: 'Processed' },
    { value: 'Confirmed', label: 'Confirmed' },
    { value: 'Warehouse Processing', label: 'In Progress' },
    { value: 'Dispatched', label: 'Dispatched' },
    { value: 'Out for Delivery', label: 'Out for Delivery' },
    { value: 'Delivered', label: 'Delivered' },
    { value: 'Cancelled', label: 'Cancelled' },
  ];

  // Helper to map order status
  const mapDisplayStatus = (status: Order['orderStatus']): string => {
    if (status === 'Confirmed' || status === 'Warehouse Processing') return 'Processed';
    return status;
  };

  // Helper to format date into DD.MM.YYYY
  const formatDisplayDate = (dateString: string): string => {
    if (!dateString) return '31.07.2026';
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
    if (!order.items || order.items.length === 0) return 1;
    return order.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
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
        const endTime = new Date(endDate).getTime() + 86400000; // inclusive of end day
        if (!isNaN(orderTime) && !isNaN(endTime) && orderTime > endTime) {
          return false;
        }
      }

      // 3. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const orderNum = (order.orderNumber || '').toLowerCase();
        const sapNum = (order.trackingNumber || order.orderNumber.replace(/\D/g, '') || '').toLowerCase();
        const customer = (order.customerName || '').toLowerCase();
        if (!orderNum.includes(q) && !sapNum.includes(q) && !customer.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [orders, selectedStatus, startDate, endDate, searchQuery]);

  return (
    <div className="max-w-xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      
      {/* 1. TOP FILTER CARD (Exact Design Matching Screenshot) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-100/90 space-y-5">
        
        {/* Status Section */}
        <div className="space-y-2">
          <label className="block text-sm sm:text-base font-bold text-slate-900">
            Status:
          </label>
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full h-12 pl-4 pr-10 bg-slate-100/80 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-[#9800ff] transition-all cursor-pointer"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Date Range Section */}
        <div className="space-y-2">
          <label className="block text-sm sm:text-base font-bold text-slate-900">
            Date Range:
          </label>
          <div className="relative flex items-center bg-white border border-slate-300 rounded-lg h-12 px-3.5 shadow-2xs hover:border-slate-400 transition-colors">
            <div className="flex items-center space-x-1.5 flex-1 text-slate-600 text-sm font-medium">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-medium text-slate-800 focus:outline-none cursor-pointer"
                title="Start Date"
              />
              <span className="text-slate-400 font-bold px-1">–</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-medium text-slate-800 focus:outline-none cursor-pointer"
                title="End Date"
              />
            </div>
            
            {(startDate || endDate) ? (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
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

        {/* Optional Quick Search / Filter Clear */}
        <div className="pt-1 flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>Showing {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}</span>
          {(selectedStatus !== 'ALL' || startDate || endDate || searchQuery) && (
            <button
              onClick={() => {
                setSelectedStatus('ALL');
                setStartDate('');
                setEndDate('');
                setSearchQuery('');
              }}
              className="text-[#9800ff] hover:underline cursor-pointer font-bold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 2. ORDERS LIST (Exact Card Style as in Screenshot) */}
      <div className="space-y-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order, index) => {
            const displayStatus = mapDisplayStatus(order.orderStatus);
            const totalQty = getOrderTotalQuantity(order);
            const formattedTotal = new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
              maximumFractionDigits: 2,
              minimumFractionDigits: 2,
            }).format(order.totalAmount);

            // Customer Order No e.g. M_3130445197
            const custOrderNo = order.orderNumber.startsWith('M_')
              ? order.orderNumber
              : `M_${order.orderNumber.replace(/\D/g, '') || `3130445${197 + index}`}`;

            // SAP Order No e.g. 3130445197
            const sapOrderNo = custOrderNo.replace('M_', '');

            return (
              <div
                key={order.id || `order-${index}`}
                id={`order-card-${order.id}`}
                className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-100/90 hover:shadow-md hover:border-slate-200 transition-all duration-200 space-y-4 cursor-pointer"
                onClick={() => setSelectedOrderDetails(order)}
              >
                {/* Header Row: Cust. Order No. & Qty */}
                <div className="flex items-center justify-between">
                  <div className="text-sm sm:text-base font-bold text-slate-900 flex items-center flex-wrap gap-1">
                    <span>Cust. Order No.</span>
                    <span className="text-[#8a14d4] font-extrabold tracking-tight font-display ml-1">
                      {custOrderNo}
                    </span>
                  </div>

                  {/* Qty Badge */}
                  <div className="text-sm sm:text-base font-bold text-slate-900 shrink-0">
                    <span>Qty: </span>
                    <span className="text-[#8a14d4] font-black">{totalQty}</span>
                  </div>
                </div>

                {/* Grid Rows: SAP Order No & Order Status / Order Date & Total value */}
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 pt-1">
                  
                  {/* Row 1 Left: SAP Order No */}
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 block">
                      SAP Order No:
                    </span>
                    <span className="text-sm sm:text-base font-extrabold text-slate-900 block mt-0.5 tracking-tight font-mono">
                      {sapOrderNo}
                    </span>
                  </div>

                  {/* Row 1 Right: Order Status */}
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 block">
                      Order Status:
                    </span>
                    <span className="text-sm sm:text-base font-bold text-emerald-600 block mt-0.5">
                      {displayStatus}
                    </span>
                  </div>

                  {/* Row 2 Left: Order Date */}
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 block">
                      Order Date:
                    </span>
                    <span className="text-sm sm:text-base font-bold text-slate-900 block mt-0.5">
                      {formatDisplayDate(order.date)}
                    </span>
                  </div>

                  {/* Row 2 Right: Total value */}
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 block">
                      Total value:
                    </span>
                    <span className="text-sm sm:text-base font-extrabold text-slate-900 block mt-0.5">
                      {formattedTotal}
                    </span>
                  </div>
                </div>

                {/* Action Buttons: Invoice & Track */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onViewInvoice) onViewInvoice(order);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-600" />
                    <span>Tax Invoice</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onTrackOrder) onTrackOrder(order.orderNumber);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#9800ff] hover:bg-[#8500e0] text-white text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 shadow-2xs cursor-pointer"
                  >
                    <Truck className="w-3.5 h-3.5 text-white" />
                    <span>Track Order</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          /* Empty state */
          <div className="bg-white rounded-3xl p-10 sm:p-12 text-center border border-slate-200 shadow-2xs space-y-3">
            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto text-[#8a14d4]">
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
                className="mt-2 px-5 py-2.5 bg-[#9800ff] hover:bg-[#8500e0] text-white rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer inline-flex items-center space-x-1.5"
              >
                <span>Browse Products</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Order Item Quick Summary Modal (When clicking on a card) */}
      {selectedOrderDetails && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedOrderDetails(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-5"
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
                <div key={i} className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <img
                    src={item.product?.image || item.product?.images?.[0] || 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&q=80&w=800'}
                    alt={item.product?.name || 'Tyre Product'}
                    className="w-12 h-12 object-contain rounded-lg bg-white border border-slate-200 shrink-0"
                    referrerPolicy="no-referrer"
                  />
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
                <span className="text-lg font-black text-[#8a14d4]">
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
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Invoice
                </button>
                <button
                  onClick={() => {
                    const ord = selectedOrderDetails;
                    setSelectedOrderDetails(null);
                    if (onTrackOrder) onTrackOrder(ord.orderNumber);
                  }}
                  className="px-4 py-2 bg-[#9800ff] hover:bg-[#8500e0] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Track
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
