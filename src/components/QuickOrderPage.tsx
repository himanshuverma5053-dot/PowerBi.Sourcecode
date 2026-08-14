import React, { useState } from 'react';
import { Order, TyreProduct } from '../types';
import {
  FileText, Download, Truck, Search, CheckCircle2,
  Clock, Package, AlertCircle, Calendar, ArrowRight, ShieldCheck, Filter
} from 'lucide-react';

interface QuickOrderPageProps {
  products: TyreProduct[];
  orders: Order[];
  onPlaceQuickOrder: (newOrder: Partial<Order>) => void;
  onViewInvoice: (order: Order) => void;
  onTrackOrder: (orderNumber: string) => void;
  setActiveTab: (tab: string) => void;
}

export const QuickOrderPage: React.FC<QuickOrderPageProps> = ({
  orders,
  onViewInvoice,
  onTrackOrder,
  setActiveTab
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.gstNumber && order.gstNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.companyName && order.companyName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'All' || order.orderStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Order['orderStatus']) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Dispatched':
      case 'Out for Delivery':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'Confirmed':
      case 'Warehouse Processing':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-900 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-900 border-slate-300';
    }
  };

  return (
    <div className="space-y-8 py-6">
      {/* Page Banner Header */}
      <div className="bg-white text-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
            <span>Fast Dispatch & GST Tax Invoice Records</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-slate-900">
            My Orders
          </h1>
          <p className="text-slate-600 text-sm mt-1 max-w-xl">
            Track real-time delivery timelines, download GST-ready 18% tax invoices, and review order payment statuses.
          </p>
        </div>
      </div>

      {/* Main Order History Section */}
      <div className="space-y-6">
        {/* Filters and Search Bar */}
        <div className="bg-white border border-slate-200 shadow-2xs rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by order #, name, or GSTIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <Filter className="w-4 h-4 text-slate-500 flex-shrink-0" />
            {['All', 'Confirmed', 'Dispatched', 'Out for Delivery', 'Delivered'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === status
                    ? 'bg-slate-900 text-white border border-slate-900 shadow-2xs'
                    : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-2xs">
            <Package className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-xl font-bold text-slate-900">No Orders Found</h3>
            <p className="text-slate-600 text-sm max-w-md mx-auto">
              We couldn't find any orders matching your criteria. Explore our catalogue to place a new tyre order.
            </p>
            <button
              onClick={() => setActiveTab('catalogue')}
              className="mt-2 inline-flex items-center space-x-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-colors cursor-pointer"
            >
              <span>Explore Tyre Store</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredOrders.map((order, idx) => (
              <div
                key={`${order.id}-${order.orderNumber}-${idx}`}
                className="bg-white border border-slate-200 hover:border-slate-300 transition-all rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xs"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-4">
                  <div>
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-black font-display text-slate-900">
                        {order.orderNumber}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(
                          order.orderStatus
                        )}`}
                      >
                        {order.orderStatus}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-slate-600 mt-1">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{order.date}</span>
                      </span>
                      <span>Customer: <strong className="text-slate-900">{order.customerName}</strong></span>
                      {order.gstNumber && (
                        <span className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-mono font-bold">
                          GSTIN: {order.gstNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => onViewInvoice(order)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-900 flex items-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-700" />
                      <span>GST Tax Invoice</span>
                    </button>
                    <button
                      onClick={() => onTrackOrder(order.orderNumber)}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold flex items-center space-x-1.5 transition-colors shadow-2xs cursor-pointer"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Track Shipment</span>
                    </button>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-12 h-12 object-contain rounded-lg bg-white border border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {item.product.name}
                        </p>
                        <p className="text-[11px] text-slate-600 font-semibold">
                          Qty: {item.quantity} × ₹{item.product.price.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Totals */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs border-t border-slate-200 text-slate-600">
                  <div className="flex items-center space-x-4">
                    <span>
                      Payment: <strong className="text-slate-900">{order.paymentMethod}</strong> ({order.paymentStatus})
                    </span>
                    {order.trackingNumber && (
                      <span>
                        Tracking #: <strong className="text-slate-900 font-mono font-bold">{order.trackingNumber}</strong>
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500">Total (incl. 18% GST): </span>
                    <span className="text-base font-black font-display text-slate-900">
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
