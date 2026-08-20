import React, { useState } from 'react';
import { Order, PaymentRecord, CustomerAccount } from '../types';
import { formatCurrency } from '../utils/formatters';
import { calculateCustomerFinancials } from '../utils/customerFinancials';
import { ShieldAlert, RefreshCw } from 'lucide-react';

interface HomeSummaryBarProps {
  orders: Order[];
  payments: PaymentRecord[];
  currentCustomerAccount: CustomerAccount | null;
  currentUser: string;
  currentUserEmail: string;
  isAdmin: boolean;
  setActiveTab: (tab: string) => void;
  onRefreshData?: () => void;
}

export const HomeSummaryBar: React.FC<HomeSummaryBarProps> = ({
  orders,
  payments,
  currentCustomerAccount,
  currentUser,
  currentUserEmail,
  isAdmin,
  setActiveTab,
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
  // Filter relevant orders for current customer / trade dealer account
  const userOrders = orders.filter((o) => {
    if (isAdmin) return true;
    if (currentUserEmail && o.customerEmail?.toLowerCase() === currentUserEmail.toLowerCase()) return true;
    if (currentUser && o.customerName?.toLowerCase().includes(currentUser.toLowerCase())) return true;
    return true;
  });

  const userPayments = payments.filter((p) => {
    if (isAdmin) return true;
    if (currentUser && p.customerName?.toLowerCase().includes(currentUser.toLowerCase())) return true;
    return true;
  });

  // Calculate dynamic metrics strictly using real customer, order, invoice, installment & payment data
  const financials = calculateCustomerFinancials(
    userOrders,
    userPayments,
    currentCustomerAccount,
    isAdmin
  );

  return (
    <section id="home-static-overview-section" className="w-full max-w-[285px] sm:max-w-[310px] mx-auto px-2 py-1 font-sans space-y-1.5">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-1.5 px-1 pb-1">
        <h1 id="static-overview-heading" className="text-lg sm:text-xl font-black text-slate-950 tracking-tight flex items-center gap-1.5 min-w-0">
          <span className="text-slate-900 font-black text-lg sm:text-xl tracking-tight truncate">Static Overview</span>
          {financials.isCreditSuspended && (
            <span className="text-[9px] uppercase tracking-wider font-extrabold bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shrink-0">
              <ShieldAlert className="w-3 h-3" />
              Suspended
            </span>
          )}
        </h1>

        {/* Refresh Bar */}
        <button
          type="button"
          id="static-overview-refresh-bar"
          onClick={handleRefresh}
          aria-label="Refresh overview metrics"
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f2e7fe] hover:bg-[#ebd5fc] active:scale-95 transition-all text-[#6b21a8] cursor-pointer select-none border border-purple-200/60 shadow-2xs shrink-0 -translate-x-1 sm:-translate-x-1.5"
        >
          <RefreshCw 
            className={`w-3.5 h-3.5 text-[#7c3aed] transition-transform duration-700 ${isRefreshing ? 'animate-spin' : ''}`} 
            strokeWidth={2.5}
          />
          <span className="text-xs sm:text-sm font-semibold text-[#6b21a8] tracking-tight">Refresh</span>
        </button>
      </div>

      {/* 2x2 Quadrant Card */}
      <div 
        id="static-overview-card-container" 
        className="w-full bg-white rounded-[24px] sm:rounded-[26px] border border-gray-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)] grid grid-cols-2 grid-rows-2 overflow-hidden transition-all duration-200"
      >
        {/* Quadrant 1 (Top-Left): Upcoming Due */}
        <div 
          id="available-limit-card"
          onClick={() => setActiveTab('quick-payments')}
          className="border-r border-b border-gray-200/90 p-2.5 sm:p-3 flex flex-col justify-between items-start min-h-[72px] sm:min-h-[78px] cursor-pointer hover:bg-slate-50/50 transition-colors select-none"
        >
          <span className="text-[11px] sm:text-[12px] font-normal text-[#555d6e] leading-tight">
            Upcoming Due
          </span>

          <div className="w-full mt-1">
            <p className="text-[16px] sm:text-[18px] font-black text-slate-950 tracking-tight leading-tight">
              {financials.upcomingDueAmount === 0 ? '₹0' : formatCurrency(financials.upcomingDueAmount)}
            </p>
          </div>
        </div>

        {/* Quadrant 2 (Top-Right): Available Limit */}
        <div 
          id="hold-cca-card"
          onClick={() => setActiveTab('account')}
          className="border-b border-gray-200/90 p-2.5 sm:p-3 flex flex-col justify-between items-start min-h-[72px] sm:min-h-[78px] cursor-pointer hover:bg-slate-50/50 transition-colors select-none"
        >
          <span className="text-[11px] sm:text-[12px] font-normal text-[#555d6e] leading-tight">
            Available Limit
          </span>

          <div className="w-full mt-1">
            <p className="text-[16px] sm:text-[18px] font-black text-slate-950 tracking-tight leading-tight">
              ₹0
            </p>
          </div>
        </div>

        {/* Quadrant 3 (Bottom-Left): Invoice Amount Due */}
        <div 
          id="total-cca-card"
          onClick={() => setActiveTab('quick-payments')}
          className="border-r border-gray-200/90 p-2.5 sm:p-3 flex flex-col justify-between items-start min-h-[72px] sm:min-h-[78px] cursor-pointer hover:bg-slate-50/50 transition-colors select-none"
        >
          <span className="text-[11px] sm:text-[12px] font-normal text-[#555d6e] leading-tight">
            Invoice Amount Due
          </span>

          <div className="w-full mt-1">
            <p className="text-[16px] sm:text-[18px] font-black text-slate-950 tracking-tight leading-tight">
              ₹0
            </p>
          </div>
        </div>

        {/* Quadrant 4 (Bottom-Right): Credit Score */}
        <div 
          id="invoice-amount-due-card"
          onClick={() => setActiveTab('account')}
          className="p-2.5 sm:p-3 flex flex-col justify-between items-start min-h-[72px] sm:min-h-[78px] cursor-pointer hover:bg-slate-50/50 transition-colors select-none"
        >
          <span className="text-[11px] sm:text-[12px] font-normal text-[#555d6e] leading-tight">
            Credit Score
          </span>

          <div className="w-full mt-1">
            <p className="text-center text-[16px] sm:text-[18px] font-black text-[#6e3ff5] tracking-tight leading-tight">
              3
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
