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
    <section id="home-static-overview-section" className="w-full max-w-[1327px] mx-auto px-4 py-4 sm:py-6 font-sans space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <h1 id="static-overview-heading" className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <span>Static Overview</span>
          {financials.isCreditSuspended && (
            <span className="text-[10px] sm:text-xs uppercase tracking-wider font-extrabold bg-rose-100 text-rose-700 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              Suspended
            </span>
          )}
        </h1>
      </div>

      {/* 2x2 Dashboard Card Grid matching Exact Dimensions: 1327x838 (~1.58:1), 90-100px Corner Radius */}
      <div 
        id="static-overview-card-container" 
        className="w-full aspect-[1327/838] bg-white rounded-[44px] sm:rounded-[68px] md:rounded-[85px] lg:rounded-[96px] border border-gray-200/90 shadow-[0_8px_36px_rgba(0,0,0,0.04)] grid grid-cols-2 grid-rows-2 overflow-hidden transition-all duration-200"
      >
        {/* Quadrant 1 (Top-Left): Upcoming Due */}
        <div 
          id="upcoming-due-card"
          onClick={() => setActiveTab('quick-payments')}
          className="border-r border-b border-gray-200/90 p-5 sm:p-8 md:p-12 lg:p-14 flex flex-col justify-between items-start cursor-pointer hover:bg-slate-50/40 transition-colors select-none"
        >
          <span className="text-[15px] sm:text-[20px] md:text-[24px] lg:text-[28px] font-normal text-[#555d6e] tracking-normal">
            Upcoming Due
          </span>

          <div className="w-full">
            {financials.allDuesCleared ? (
              <span className="text-[18px] sm:text-[26px] md:text-[34px] lg:text-[42px] font-black text-emerald-600 tracking-tight leading-tight block">
                No dues left
              </span>
            ) : (
              <p className="text-[22px] sm:text-[32px] md:text-[42px] lg:text-[50px] font-black text-slate-950 tracking-tight leading-tight">
                {formatCurrency(financials.upcomingDueAmount)}
              </p>
            )}
          </div>
        </div>

        {/* Quadrant 2 (Top-Right): Available Limit */}
        <div 
          id="available-limit-card"
          onClick={() => setActiveTab('account')}
          className="border-b border-gray-200/90 p-5 sm:p-8 md:p-12 lg:p-14 flex flex-col justify-between items-start cursor-pointer hover:bg-slate-50/40 transition-colors select-none"
        >
          <span className="text-[15px] sm:text-[20px] md:text-[24px] lg:text-[28px] font-normal text-[#555d6e] tracking-normal">
            Available Limit
          </span>

          <div className="w-full">
            <p className="text-[22px] sm:text-[32px] md:text-[42px] lg:text-[50px] font-black text-slate-950 tracking-tight leading-tight">
              {formatCurrency(financials.availableLimit)}
            </p>
          </div>
        </div>

        {/* Quadrant 3 (Bottom-Left): Invoice Due */}
        <div 
          id="invoice-due-card"
          onClick={() => setActiveTab('quick-payments')}
          className="border-r border-gray-200/90 p-5 sm:p-8 md:p-12 lg:p-14 flex flex-col justify-between items-start cursor-pointer hover:bg-slate-50/40 transition-colors select-none"
        >
          <span className="text-[15px] sm:text-[20px] md:text-[24px] lg:text-[28px] font-normal text-[#555d6e] tracking-normal">
            Invoice Due
          </span>

          <div className="w-full">
            <p className={`text-[22px] sm:text-[32px] md:text-[42px] lg:text-[50px] font-black tracking-tight leading-tight ${
              financials.totalInvoiceDue === 0 ? 'text-emerald-600' : 'text-[#6e3ff5]'
            }`}>
              {financials.totalInvoiceDue === 0 ? '₹0' : formatCurrency(financials.totalInvoiceDue)}
            </p>
          </div>
        </div>

        {/* Quadrant 4 (Bottom-Right): Credit Score */}
        <div 
          id="credit-score-card"
          onClick={() => setActiveTab('account')}
          className="p-5 sm:p-8 md:p-12 lg:p-14 flex flex-col justify-between items-start cursor-pointer hover:bg-slate-50/40 transition-colors select-none"
        >
          <span className="text-[15px] sm:text-[20px] md:text-[24px] lg:text-[28px] font-normal text-[#555d6e] tracking-normal">
            Credit Score
          </span>

          <div className="w-full flex items-baseline gap-1.5">
            <p className={`text-[22px] sm:text-[32px] md:text-[42px] lg:text-[50px] font-black tracking-tight leading-tight ${
              financials.creditScore < 50 ? 'text-rose-600' : 'text-slate-950'
            }`}>
              {financials.creditScore}
            </p>
            <span className="text-[14px] sm:text-[18px] md:text-[22px] lg:text-[26px] text-slate-400 font-bold">/100</span>
          </div>
        </div>
      </div>
    </section>
  );
};
