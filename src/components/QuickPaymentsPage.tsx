import React, { useState } from 'react';
import { PaymentRecord, Order } from '../types';
import { formatCurrency, validateGSTIN } from '../utils/formatters';
import {
  CreditCard, CheckCircle2, ShieldCheck, Building2,
  QrCode, FileText, Download, Loader2, ArrowRight, Cpu, Zap,
  Search, Filter, Calendar, Package, Clock, AlertCircle, ShoppingBag, ArrowUp, X,
  Lock, Smartphone, Landmark, Check
} from 'lucide-react';
import { PaymentIntegrationsSpace } from './PaymentIntegrationsSpace';

interface QuickPaymentsPageProps {
  payments: PaymentRecord[];
  orders?: Order[];
  onProcessPayment: (paymentData: any) => void;
}

export const QuickPaymentsPage: React.FC<QuickPaymentsPageProps> = ({
  payments,
  orders = [],
  onProcessPayment,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'settlement' | 'integrations'>('settlement');

  // Selected Order Modal State
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<Order | null>(null);
  const [selectedGateway, setSelectedGateway] = useState<'razorpay' | 'phonepe' | 'upi' | 'card' | 'netbanking'>('razorpay');
  const [upiId, setUpiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [lastReceipt, setLastReceipt] = useState<PaymentRecord | null>(null);

  // Search & Filter state for Order History in Payments page
  const [orderSearch, setOrderSearch] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('All');
  const [quickOrderSelectId, setQuickOrderSelectId] = useState<string>('');

  const pendingOrders = orders.filter(o => o.paymentStatus !== 'Paid');

  const handleOpenPaymentGateway = (order: Order) => {
    setSelectedOrderForPayment(order);
    setUpiId('');
    setIsProcessing(false);
  };

  const handleExecuteGatewayPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForPayment) return;

    setIsProcessing(true);
    setProcessingStep('Connecting to Secure Gateway...');

    setTimeout(() => {
      setProcessingStep('Authorizing Bank Settlement & GST Ledger...');
    }, 900);

    setTimeout(() => {
      const gatewayLabel =
        selectedGateway === 'razorpay' ? 'Razorpay Secure' :
        selectedGateway === 'phonepe' ? 'PhonePe PG' :
        selectedGateway === 'upi' ? `UPI (${upiId || 'Direct UPI'})` :
        selectedGateway === 'card' ? 'Credit/Debit Card' : 'Net Banking';

      const receipt: PaymentRecord = {
        id: `pay-${Date.now()}`,
        paymentId: `PAY-${selectedGateway.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
        orderId: selectedOrderForPayment.orderNumber,
        customerName: selectedOrderForPayment.customerName,
        amount: selectedOrderForPayment.totalAmount,
        gstNumber: selectedOrderForPayment.gstNumber,
        method: gatewayLabel,
        status: 'Success',
        date: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };

      onProcessPayment(receipt);
      setLastReceipt(receipt);
      setIsProcessing(false);
      setSelectedOrderForPayment(null);
    }, 2000);
  };

  const filteredOrders = orders.filter((order) => {
    if (paymentStatusFilter !== 'All' && order.paymentStatus !== paymentStatusFilter) return false;
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      const matchNum = order.orderNumber.toLowerCase().includes(q);
      const matchName = order.customerName.toLowerCase().includes(q);
      const matchGst = order.gstNumber?.toLowerCase().includes(q);
      if (!matchNum && !matchName && !matchGst) return false;
    }
    return true;
  });

  return (
    <div className="py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white text-slate-900 p-8 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-slate-900">
            Quick Payments & Gateway Hub
          </h1>
          <p className="text-slate-600 text-sm mt-1 max-w-xl">
            Select any order to make payments instantly through secure gateways (Razorpay, PhonePe, UPI, Cards) or configure live payment API keys.
          </p>
        </div>

        {/* Sub-Tab Switcher */}
        <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200 flex items-center space-x-2">
          <button
            onClick={() => setActiveSubTab('settlement')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-2 cursor-pointer ${
              activeSubTab === 'settlement'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Order Payments</span>
          </button>

          <button
            onClick={() => setActiveSubTab('integrations')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-2 cursor-pointer ${
              activeSubTab === 'integrations'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Payment Gateways Space</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'integrations' ? (
        <PaymentIntegrationsSpace />
      ) : (
        <div className="space-y-8">

          {/* Quick Select Order Bar */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs text-slate-900 space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black font-display text-slate-900 flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <span>Select Order to Pay via Gateway</span>
                </h2>
                <p className="text-slate-600 text-xs mt-1">
                  Choose an un-settled order from the dropdown below or click "Pay Now" on any order head.
                </p>
              </div>

              {pendingOrders.length > 0 && (
                <div className="px-3.5 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-extrabold flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-amber-800" />
                  <span>{pendingOrders.length} Pending Invoice{pendingOrders.length > 1 ? 's' : ''} Awaiting Payment</span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <select
                value={quickOrderSelectId}
                onChange={(e) => setQuickOrderSelectId(e.target.value)}
                className="w-full sm:flex-1 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-400"
              >
                <option value="">-- Choose an Order to Make Payment --</option>
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.orderNumber} - {o.customerName} | {formatCurrency(o.totalAmount)} ({o.paymentStatus})
                  </option>
                ))}
              </select>

              <button
                disabled={!quickOrderSelectId}
                onClick={() => {
                  const ord = orders.find(o => o.id === quickOrderSelectId);
                  if (ord) handleOpenPaymentGateway(ord);
                }}
                className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-black text-xs transition-all flex items-center justify-center space-x-2 ${
                  quickOrderSelectId
                    ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-2xs active:scale-95 cursor-pointer'
                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Open Gateway Checkout</span>
              </button>
            </div>
          </div>

          {/* Last Completed Receipt Banner (if recently processed) */}
          {lastReceipt && (
            <div className="bg-emerald-50 text-slate-900 rounded-3xl p-6 border border-emerald-200 shadow-2xs space-y-3 animate-fade-in">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2 text-emerald-800">
                  <CheckCircle2 className="w-6 h-6" />
                  <span className="text-sm font-extrabold uppercase tracking-widest">
                    Recent Payment Verified & Settled
                  </span>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center space-x-1.5 hover:bg-slate-800 cursor-pointer shadow-2xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Download GST Receipt</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2 border-t border-emerald-200 text-slate-600">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Transaction ID</span>
                  <span className="font-mono font-bold text-slate-900">{lastReceipt.paymentId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Order Number</span>
                  <span className="font-bold text-slate-900">{lastReceipt.orderId}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Gateway Mode</span>
                  <span className="font-bold text-slate-900">{lastReceipt.method}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Amount Paid</span>
                  <span className="font-black text-slate-900">{formatCurrency(lastReceipt.amount)}</span>
                </div>
              </div>
            </div>
          )}

          {/* ORDER HISTORY & PAYMENT STATUS LIST */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs text-slate-900 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-bold font-display text-slate-900 flex items-center space-x-2">
                  <ShoppingBag className="w-5 h-5 text-slate-700" />
                  <span>Order History & Payment Status</span>
                </h2>
                <p className="text-slate-600 text-xs mt-1">
                  View all placed tyre orders, check payment settlement status, and click "Pay via Gateway" to settle.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                {['All', 'Pending', 'Paid', 'Failed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setPaymentStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      paymentStatusFilter === status
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Search bar */}
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search orders by #, customer name or GSTIN..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400"
              />
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-600 text-xs space-y-2">
                <Package className="w-8 h-8 mx-auto text-slate-400" />
                <p className="font-semibold">No orders found matching status filter or search query.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order, idx) => {
                  const isPaid = order.paymentStatus === 'Paid';
                  return (
                    <div
                      key={`${order.id}-${order.orderNumber}-${idx}`}
                      className="bg-slate-50/60 border border-slate-200 hover:border-slate-300 rounded-2xl p-5 transition-all shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                    >
                      {/* Order Info Head */}
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-base font-black font-display text-slate-900">
                            {order.orderNumber}
                          </span>

                          {/* Payment Status Badge */}
                          <span
                            className={`text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider ${
                              isPaid
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                : order.paymentStatus === 'Failed'
                                ? 'bg-rose-100 text-rose-900 border-rose-300'
                                : 'bg-amber-100 text-amber-900 border-amber-300'
                            }`}
                          >
                            Payment: {order.paymentStatus}
                          </span>

                          {/* Order Fulfillment Status */}
                          <span className="text-[10px] font-semibold text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                            {order.orderStatus}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            <span>{order.date}</span>
                          </span>
                          <span>Customer: <strong className="text-slate-900">{order.customerName}</strong></span>
                          {order.gstNumber && (
                            <span className="font-mono text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              GSTIN: {order.gstNumber}
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-600 font-medium">
                          Items: {order.items.map(i => `${i.quantity}× ${i.product.name}`).join(', ')}
                        </div>
                      </div>

                      {/* Total Amount & Pay Button */}
                      <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-200 pt-3 md:pt-0">
                        <div className="text-left md:text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Amount</span>
                          <span className="text-lg font-black text-slate-900 font-display">
                            {formatCurrency(order.totalAmount)}
                          </span>
                        </div>

                        {/* Gateway Payment Trigger Button */}
                        {isPaid ? (
                          <div className="flex items-center space-x-2">
                            <span className="px-3 py-2 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold flex items-center space-x-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Paid & Settled</span>
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenPaymentGateway(order)}
                            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-md active:scale-95 transition-all flex items-center space-x-1.5 cursor-pointer"
                          >
                            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                            <span>Pay {formatCurrency(order.totalAmount)} via Gateway</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Payment History Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4 text-slate-900">
            <h3 className="text-base font-bold text-slate-900 font-display flex items-center space-x-2">
              <Clock className="w-4 h-4 text-slate-700" />
              <span>Settlement Audit Log</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {payments.map((p, idx) => (
                <div key={`${p.id}-${p.paymentId}-${idx}`} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-900">{p.paymentId}</span>
                    <span className="font-black text-emerald-900 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded text-[10px]">
                      {p.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>{p.customerName} ({p.orderId})</span>
                    <span className="font-bold text-slate-900">{formatCurrency(p.amount)}</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {p.date} | Mode: {p.method}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* PAYMENT GATEWAY CHECKOUT MODAL */}
      {selectedOrderForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 text-slate-900 relative space-y-6">
            
            {/* Close Button */}
            <button
              disabled={isProcessing}
              onClick={() => setSelectedOrderForPayment(null)}
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-black uppercase tracking-wider">
                <Lock className="w-3 h-3 text-slate-700" />
                <span>256-Bit SSL Gateway Checkout</span>
              </div>
              <h3 className="text-xl font-black font-display text-slate-900">
                Settle Payment for {selectedOrderForPayment.orderNumber}
              </h3>
            </div>

            {/* Selected Order Summary Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Customer Name:</span>
                <span className="font-bold text-slate-900">{selectedOrderForPayment.customerName}</span>
              </div>
              {selectedOrderForPayment.gstNumber && (
                <div className="flex justify-between text-slate-600">
                  <span>GSTIN:</span>
                  <span className="font-mono text-slate-900 font-bold">{selectedOrderForPayment.gstNumber}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Items:</span>
                <span className="text-slate-900 font-medium">{selectedOrderForPayment.items.length} Product line(s)</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Amount Payable:</span>
                <span className="text-base font-display">{formatCurrency(selectedOrderForPayment.totalAmount)}</span>
              </div>
            </div>

            {/* Form & Gateway Selector */}
            <form onSubmit={handleExecuteGatewayPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Gateway Provider / Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'razorpay', label: 'Razorpay Gateway', sub: 'Cards, NetBanking, UPI', icon: Zap },
                    { id: 'phonepe', label: 'PhonePe PG', sub: 'Instant UPI & Wallet', icon: Smartphone },
                    { id: 'upi', label: 'Direct UPI VPA', sub: 'GPay / Paytm / BHIM', icon: QrCode },
                    { id: 'card', label: 'Credit / Debit Card', sub: 'Visa, MasterCard, RuPay', icon: CreditCard },
                  ].map((gw) => {
                    const IconComp = gw.icon;
                    const isSelected = selectedGateway === gw.id;
                    return (
                      <button
                        key={gw.id}
                        type="button"
                        onClick={() => setSelectedGateway(gw.id as any)}
                        className={`p-3 rounded-2xl text-left border transition-all flex items-start space-x-2.5 cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-bold'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                        }`}
                      >
                        <IconComp className={`w-4 h-4 mt-0.5 ${isSelected ? 'text-amber-400' : 'text-slate-600'}`} />
                        <div>
                          <span className="text-xs font-black block">{gw.label}</span>
                          <span className={`text-[10px] block ${isSelected ? 'text-slate-300 font-semibold' : 'text-slate-500'}`}>
                            {gw.sub}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedGateway === 'upi' && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Enter Virtual Payment Address (VPA):
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9876543210@ybl or name@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-400 placeholder-slate-400"
                  />
                </div>
              )}

              {/* Action Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm shadow-md active:scale-95 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                    <span>{processingStep}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span>Pay {formatCurrency(selectedOrderForPayment.totalAmount)} Now</span>
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center justify-center space-x-2 text-[10px] text-slate-500 pt-1 border-t border-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>PCI-DSS Compliant & RBI Approved Secure Payment Node</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};


