import React, { useState } from 'react';
import { Order, PaymentRecord, CustomerAccount } from '../types';
import { formatCurrency } from '../utils/formatters';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import {
  WhiteCoinStackIcon,
  WhiteMoneyBagIcon,
  WhiteHourglassIcon,
  WhiteHandshakeIcon
} from './AdminSummaryIcons';

interface AdminSummaryBarProps {
  orders: Order[];
  payments: PaymentRecord[];
  customerAccounts: CustomerAccount[];
  onSelectTab?: (tab: 'overview' | 'products' | 'orders' | 'customers' | 'payments') => void;
  onRefreshData?: () => void;
}

export const AdminSummaryBar: React.FC<AdminSummaryBarProps> = ({
  orders,
  payments,
  customerAccounts,
  onSelectTab,
  onRefreshData
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRefreshing(true);
    if (onRefreshData) {
      onRefreshData();
    }
    setTimeout(() => {
      setIsRefreshing(false);
    }, 750);
  };

  // Calculate high-level admin metrics matching the 4-quadrant layout
  const pendingOrdersRevenue = orders
    .filter(o => o.paymentStatus === 'Pending')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalCreditLimitAllocated = customerAccounts.reduce(
    (sum, c) => sum + (c.creditLimit || 0),
    0
  );

  const totalInvoiceAmountDue = orders
    .filter(o => o.orderStatus !== 'Cancelled' && o.paymentStatus !== 'Paid')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const activePartnersCount = customerAccounts.filter(
    c => c.accountStatus === 'Active'
  ).length;

  const upcomingDueVal = pendingOrdersRevenue === 0 ? '₹0' : formatCurrency(pendingOrdersRevenue);
  const availableLimitVal = totalCreditLimitAllocated === 0 ? '₹0' : formatCurrency(totalCreditLimitAllocated);
  const invoiceAmountDueVal = totalInvoiceAmountDue === 0 ? '₹0' : formatCurrency(totalInvoiceAmountDue);
  const creditScoreVal = activePartnersCount > 0 ? `${activePartnersCount}` : '3';

  // Helper to dynamically adjust number styling
  const getNumberStyle = (text: string) => {
    const isLarge = text.length > 7;
    const isVeryLarge = text.length > 10;
    
    return {
      containerClass: isLarge ? 'justify-end pr-1 text-right' : 'justify-center text-center',
      textClass: isVeryLarge
        ? 'text-right text-[13px] sm:text-[14px] font-black'
        : isLarge
        ? 'text-right text-[14px] sm:text-[16px] font-black'
        : 'text-center text-[16px] sm:text-[18px] font-black'
    };
  };

  const upcomingDueStyle = getNumberStyle(upcomingDueVal);
  const availableLimitStyle = getNumberStyle(availableLimitVal);
  const invoiceAmountDueStyle = getNumberStyle(invoiceAmountDueVal);
  const creditScoreStyle = getNumberStyle(creditScoreVal);

  return (
    <section id="admin-static-overview-section" className="w-full max-w-[285px] sm:max-w-[310px] md:max-w-[460px] lg:max-w-[310px] mx-auto px-2 py-1 font-sans space-y-1.5 md:space-y-2.5">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-1.5 px-1 pb-1">
        <h1 id="admin-static-overview-heading" className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-1.5 min-w-0">
          <span className="text-white font-black text-lg sm:text-xl md:text-2xl tracking-tight truncate">Static Overview</span>
          <span className="text-[9px] md:text-[10px] uppercase tracking-wider font-extrabold bg-purple-900/60 text-purple-200 border border-purple-700/50 px-1.5 md:px-2 py-0.5 rounded-full flex items-center gap-0.5 shrink-0">
            <ShieldCheck className="w-3 h-3 md:w-3.5 md:h-3.5 text-purple-300" />
            Admin
          </span>
        </h1>

        {/* Refresh Bar with Premium Styling */}
        <button
          type="button"
          id="admin-static-overview-refresh-bar"
          onClick={handleRefresh}
          aria-label="Refresh admin metrics"
          className="inline-flex items-center gap-1 px-2.5 md:px-3.5 py-1 md:py-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white cursor-pointer select-none border border-white/20 shadow-sm shrink-0 -translate-x-1 sm:-translate-x-1.5"
        >
          <RefreshCw 
            className={`w-3.5 h-3.5 md:w-4 md:h-4 text-white transition-transform duration-700 ${isRefreshing ? 'animate-spin' : ''}`} 
            strokeWidth={2.5}
          />
          <span className="text-xs sm:text-sm md:text-base font-semibold text-white tracking-tight">Refresh</span>
        </button>
      </div>

      {/* 2x2 Quadrant Card with Luxury Black Background & High-Contrast Separators */}
      <div 
        id="admin-overview-card-container" 
        className="w-full bg-black rounded-[24px] sm:rounded-[26px] md:rounded-[32px] border border-neutral-800 shadow-[0_4px_24px_rgba(0,0,0,0.6)] grid grid-cols-2 grid-rows-2 overflow-hidden transition-all duration-200"
      >
        {/* Quadrant 1 (Top-Left): Upcoming Due */}
        <div 
          id="admin-upcoming-due-card"
          onClick={() => onSelectTab && onSelectTab('payments')}
          className="border-r border-b border-neutral-800 py-5 sm:py-6 md:py-8 px-2 sm:px-2.5 md:px-3 flex flex-col items-center justify-between min-h-[120px] sm:min-h-[135px] md:min-h-[165px] cursor-pointer hover:bg-neutral-900/70 transition-colors select-none min-w-0 group"
        >
          {/* White icon positioned ABOVE the text */}
          <div className="w-full flex items-center justify-center pt-1.5">
            <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110">
              <WhiteCoinStackIcon className="w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)]" />
            </div>
          </div>

          <span className="text-[10px] sm:text-[11px] md:text-xs font-medium text-neutral-400 leading-tight text-center w-full truncate my-1.5">
            Upcoming Due
          </span>

          <div className={`w-full pb-1 flex items-center justify-center min-w-0 ${upcomingDueStyle.containerClass}`}>
            <p className={`text-white tracking-tight leading-tight truncate max-w-full md:text-xl font-bold ${upcomingDueStyle.textClass}`}>
              {upcomingDueVal}
            </p>
          </div>
        </div>

        {/* Quadrant 2 (Top-Right): Available Limit */}
        <div 
          id="admin-available-limit-card"
          onClick={() => onSelectTab && onSelectTab('customers')}
          className="border-b border-neutral-800 py-5 sm:py-6 md:py-8 px-2 sm:px-2.5 md:px-3 flex flex-col items-center justify-between min-h-[120px] sm:min-h-[135px] md:min-h-[165px] cursor-pointer hover:bg-neutral-900/70 transition-colors select-none min-w-0 group"
        >
          {/* White icon positioned ABOVE the text */}
          <div className="w-full flex items-center justify-center pt-1.5">
            <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110">
              <WhiteMoneyBagIcon className="w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)]" />
            </div>
          </div>

          <span className="text-[10px] sm:text-[11px] md:text-xs font-medium text-neutral-400 leading-tight text-center w-full truncate my-1.5">
            Available Limit
          </span>

          <div className={`w-full pb-1 flex items-center justify-center min-w-0 ${availableLimitStyle.containerClass}`}>
            <p className={`text-white tracking-tight leading-tight truncate max-w-full md:text-xl font-bold ${availableLimitStyle.textClass}`}>
              {availableLimitVal}
            </p>
          </div>
        </div>

        {/* Quadrant 3 (Bottom-Left): Invoice Amount Due */}
        <div 
          id="admin-invoice-amount-due-card"
          onClick={() => onSelectTab && onSelectTab('orders')}
          className="border-r border-neutral-800 py-5 sm:py-6 md:py-8 px-2 sm:px-2.5 md:px-3 flex flex-col items-center justify-between min-h-[120px] sm:min-h-[135px] md:min-h-[165px] cursor-pointer hover:bg-neutral-900/70 transition-colors select-none min-w-0 group"
        >
          {/* White icon positioned ABOVE the text */}
          <div className="w-full flex items-center justify-center pt-1.5">
            <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110">
              <WhiteHourglassIcon className="w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)]" />
            </div>
          </div>

          <span className="text-[10px] sm:text-[11px] md:text-xs font-medium text-neutral-400 leading-tight text-center w-full truncate my-1.5">
            Invoice Amount Due
          </span>

          <div className={`w-full pb-1 flex items-center justify-center min-w-0 ${invoiceAmountDueStyle.containerClass}`}>
            <p className={`text-white tracking-tight leading-tight truncate max-w-full md:text-xl font-bold ${invoiceAmountDueStyle.textClass}`}>
              {invoiceAmountDueVal}
            </p>
          </div>
        </div>

        {/* Quadrant 4 (Bottom-Right): Credit Score / Partner Network */}
        <div 
          id="admin-credit-score-card"
          onClick={() => onSelectTab && onSelectTab('customers')}
          className="py-5 sm:py-6 md:py-8 px-2 sm:px-2.5 md:px-3 flex flex-col items-center justify-between min-h-[120px] sm:min-h-[135px] md:min-h-[165px] cursor-pointer hover:bg-neutral-900/70 transition-colors select-none min-w-0 group"
        >
          {/* White image/icon positioned ABOVE the text */}
          <div className="w-full flex items-center justify-center pt-1.5">
            <div className="w-10 h-7 sm:w-12 sm:h-8 md:w-14 md:h-9 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110">
              <WhiteHandshakeIcon className="w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)]" />
            </div>
          </div>

          <span className="text-[10px] sm:text-[11px] md:text-xs font-medium text-neutral-400 leading-tight text-center w-full truncate my-1.5">
            Credit Score
          </span>

          <div className={`w-full pb-1 flex items-center justify-center min-w-0 ${creditScoreStyle.containerClass}`}>
            <p className={`text-purple-400 tracking-tight leading-tight truncate max-w-full md:text-xl font-bold ${creditScoreStyle.textClass}`}>
              {creditScoreVal}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminSummaryBar;
