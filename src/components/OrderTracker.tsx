import React, { useState } from 'react';
import { Order } from '../types';
import { formatCurrency } from '../utils/formatters';
import {
  Truck, Search, CheckCircle2, Clock, MapPin,
  FileText, ShieldCheck, AlertCircle, PackageCheck
} from 'lucide-react';

interface OrderTrackerProps {
  orders: Order[];
  initialSearchQuery?: string;
  onViewInvoice: (order: Order) => void;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({
  orders,
  initialSearchQuery = '',
  onViewInvoice,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || 'MT-2026-8841');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(
    orders.find(o => o.orderNumber === searchQuery) || orders[0] || null
  );

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim().toLowerCase();
    const match = orders.find(o =>
      o.orderNumber.toLowerCase() === q ||
      o.phone.replaceAll(' ', '').includes(q.replaceAll(' ', '')) ||
      o.trackingNumber.toLowerCase() === q
    );

    if (match) {
      setSearchedOrder(match);
    } else {
      setSearchedOrder(null);
    }
  };

  return (
    <div className="py-8 space-y-8 max-w-5xl mx-auto">
      {/* Header & Search Bar */}
      <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 text-white p-8 rounded-3xl border border-purple-800/60 shadow-2xl text-center space-y-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black">
          <Truck className="w-3.5 h-3.5" />
          <span>Real-Time Express Cargo Tracking</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-display text-white">
          Track Your Tyre Dispatch Status
        </h1>
        <p className="text-purple-200 text-sm max-w-lg mx-auto">
          Enter your Magadh Order ID (e.g. MT-2026-8841) or registered mobile number to trace live shipment coordinates.
        </p>

        <form onSubmit={handleTrack} className="max-w-xl mx-auto flex items-center gap-2 pt-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="e.g. MT-2026-8841 or 9835122345..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-white text-slate-900 font-bold text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <Search className="w-5 h-5 text-purple-600 absolute left-3.5 top-3.5" />
          </div>

          <button
            type="submit"
            className="px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-lg active:scale-95 transition-all"
          >
            Track Order
          </button>
        </form>
      </div>

      {/* Searched Order Results */}
      {searchedOrder ? (
        <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-purple-800/50 shadow-2xl space-y-8 animate-fade-in text-white">
          
          {/* Top Info Banner */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-purple-800/50">
            <div>
              <div className="flex items-center space-x-3">
                <span className="text-2xl font-black font-display text-white">
                  {searchedOrder.orderNumber}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950">
                  {searchedOrder.orderStatus}
                </span>
              </div>
              <p className="text-xs text-purple-200 mt-1">
                AWB Tracking: <span className="font-mono font-bold text-amber-300">{searchedOrder.trackingNumber}</span> | Estimated Delivery: <span className="font-bold text-white">{searchedOrder.estimatedDelivery}</span>
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => onViewInvoice(searchedOrder)}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold shadow-md flex items-center space-x-1.5"
              >
                <FileText className="w-4 h-4 text-slate-950" />
                <span>View GST Invoice</span>
              </button>
            </div>
          </div>

          {/* Interactive Step-by-Step Timeline */}
          <div className="space-y-6">
            <h3 className="text-base font-bold text-white font-display">
              Shipment Journey Timeline
            </h3>

            <div className="relative pl-6 border-l-2 border-purple-800/60 space-y-8">
              {searchedOrder.timeline.map((item, idx) => (
                <div key={idx} className="relative group">
                  {/* Circle Indicator */}
                  <div
                    className={`absolute -left-[31px] top-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      item.done
                        ? 'bg-amber-400 border-amber-400 text-slate-950 shadow-md'
                        : 'bg-slate-950 border-purple-800 text-purple-400'
                    }`}
                  >
                    {item.done ? <CheckCircle2 className="w-4 h-4 text-slate-950" /> : <Clock className="w-3.5 h-3.5" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-extrabold ${item.done ? 'text-white' : 'text-purple-400/80'}`}>
                        {item.status}
                      </span>
                      <span className="text-xs text-purple-300 font-semibold">{item.time}</span>
                    </div>
                    {item.location && (
                      <div className="flex items-center text-xs text-amber-300 font-medium space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        <span>{item.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Items Summary in this shipment */}
          <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/50 space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
              Items in this Shipment ({searchedOrder.items.length})
            </span>
            <div className="divide-y divide-purple-800/40 text-xs">
              {searchedOrder.items.map((it, i) => (
                <div key={i} className="py-2 flex justify-between items-center">
                  <span className="font-bold text-white">{it.product.name}</span>
                  <span className="font-extrabold text-amber-300">Qty: {it.quantity}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : (
        <div className="bg-slate-900/90 rounded-3xl p-12 text-center border border-purple-800/50 shadow-2xl space-y-3 text-white">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">No matching order found</h3>
          <p className="text-xs text-purple-200 max-w-sm mx-auto">
            Please double check your Order Number or Phone Number. Sample valid Order ID: <span className="font-bold font-mono text-amber-300">MT-2026-8841</span>
          </p>
        </div>
      )}
    </div>
  );
};
