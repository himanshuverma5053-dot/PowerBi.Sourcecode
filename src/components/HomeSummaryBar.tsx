import React from 'react';
import { Order, PaymentRecord, CustomerAccount } from '../types';
import { formatCurrency } from '../utils/formatters';
import { calculateCustomerFinancials } from '../utils/customerFinancials';
import { ShieldAlert } from 'lucide-react';

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
  onRefreshData: _onRefreshData
}) => {
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
    <section id="home-static-overview-section" className="w-full max-w-[340px] mx-auto px-4 py-4 sm:py-5 font-sans space-y-2.5">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <h1 id="static-overview-heading" className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <span>Overview</span>
          {financials.isCreditSuspended && (
            <span className="text-[10px] uppercase tracking-wider font-extrabold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" />
              Suspended
            </span>
          )}
        </h1>
      </div>

      {/* 2x2 Professional Compact Dashboard Card Grid */}
      <div 
        id="static-overview-card-container" 
        className="w-full aspect-[10/8] bg-white rounded-3xl border border-slate-200 shadow-xs grid grid-cols-2 grid-rows-2 overflow-hidden transition-all duration-200"
      >
        {/* Quadrant 1 (Top-Left): Upcoming Due */}
        <div 
          id="upcoming-due-card"
          onClick={() => setActiveTab('quick-payments')}
          className="border-r border-b border-slate-200/80 px-3.5 py-3 sm:px-4 sm:py-3.5 flex flex-col justify-between items-start cursor-pointer hover:bg-slate-50/70 transition-colors select-none relative group"
        >
          <div className="w-full flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 tracking-normal truncate">
              Upcoming Due
            </span>
          </div>

          <div className="w-full my-auto">
            {financials.allDuesCleared ? (
              <div className="flex flex-col">
                <span className="text-sm sm:text-base font-bold text-emerald-600 tracking-tight leading-tight flex items-center gap-1">
                  No dues left
                </span>
              </div>
            ) : (
              <div className="flex flex-col">
                <p className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
                  {formatCurrency(financials.upcomingDueAmount)}
                </p>
                <span className="text-[10px] text-amber-600 font-bold truncate leading-none mt-0.5">
                  {financials.upcomingDueLabel}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Quadrant 2 (Top-Right): Available Limit */}
        <div 
          id="available-limit-card"
          onClick={() => setActiveTab('account')}
          className="border-b border-slate-200/80 px-3.5 py-3 sm:px-4 sm:py-3.5 flex flex-col justify-between items-start cursor-pointer hover:bg-slate-50/70 transition-colors select-none relative group"
        >
          <div className="w-full flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 tracking-normal truncate">
              Available Limit
            </span>
          </div>

          <div className="w-full my-auto flex flex-col">
            <p className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
              {formatCurrency(financials.availableLimit)}
            </p>
          </div>
        </div>

        {/* Quadrant 3 (Bottom-Left): Invoice Due */}
        <div 
          id="invoice-due-card"
          onClick={() => setActiveTab('quick-payments')}
          className="border-r border-slate-200/80 px-3.5 py-3 sm:px-4 sm:py-3.5 flex flex-col justify-between items-start cursor-pointer hover:bg-slate-50/70 transition-colors select-none relative group"
        >
          <div className="w-full flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 tracking-normal truncate">
              Invoice Due
            </span>
          </div>

          <div className="w-full my-auto flex flex-col">
            <p className={`text-base sm:text-lg font-bold tracking-tight leading-tight ${
              financials.totalInvoiceDue === 0 ? 'text-emerald-600' : 'text-slate-900'
            }`}>
              {financials.totalInvoiceDue === 0 ? '₹0.00' : formatCurrency(financials.totalInvoiceDue)}
            </p>
          </div>
        </div>

        {/* Quadrant 4 (Bottom-Right): Credit Score */}
        <div 
          id="credit-score-card"
          onClick={() => setActiveTab('account')}
          className="px-3.5 py-3 sm:px-4 sm:py-3.5 flex flex-col justify-between items-start cursor-pointer hover:bg-slate-50/70 transition-colors select-none relative group"
        >
          <div className="w-full flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 tracking-normal truncate">
              Credit Score
            </span>
          </div>

          <div className="w-full my-auto flex flex-col">
            <div className="flex items-baseline gap-1">
              <p className={`text-base sm:text-lg font-black tracking-tight leading-tight ${
                financials.creditScore < 50 ? 'text-rose-600' : 'text-[#5b38f3]'
              }`}>
                {financials.creditScore}
              </p>
              <span className="text-[10px] text-slate-400 font-semibold">/100</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
