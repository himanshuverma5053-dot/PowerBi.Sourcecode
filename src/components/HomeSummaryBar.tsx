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
    <section id="home-static-overview-section" className="w-full max-w-[540px] mx-auto px-4 py-4 sm:py-5 font-sans space-y-3">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <h1 id="static-overview-heading" className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <span>Static Overview</span>
          {financials.isCreditSuspended && (
            <span className="text-[10px] uppercase tracking-wider font-extrabold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" />
              Suspended
            </span>
          )}
        </h1>
      </div>

      {/* 2x2 Dashboard Card Grid matching Reference Style */}
      <div 
        id="static-overview-card-container" 
        className="w-full bg-white rounded-[32px] sm:rounded-[36px] border border-gray-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] grid grid-cols-2 grid-rows-2 overflow-hidden transition-all duration-200"
      >
        {/* Quadrant 1 (Top-Left): Upcoming Due */}
        <div 
          id="upcoming-due-card"
          onClick={() => setActiveTab('quick-payments')}
          className="border-r border-b border-gray-200/80 p-5 sm:p-6 md:p-7 flex flex-col justify-between items-start cursor-pointer hover:bg-slate-50/40 transition-colors select-none min-h-[115px] sm:min-h-[130px]"
        >
          <span className="text-[15px] sm:text-[17px] font-normal text-[#555d6e] tracking-normal">
            Upcoming Due
          </span>

          <div className="w-full mt-2">
            {financials.allDuesCleared ? (
              <span className="text-[18px] sm:text-[22px] font-extrabold text-emerald-600 tracking-tight leading-tight block">
                No dues left
              </span>
            ) : (
              <p className="text-[22px] sm:text-[26px] font-extrabold text-slate-950 tracking-tight leading-tight">
                {formatCurrency(financials.upcomingDueAmount)}
              </p>
            )}
          </div>
        </div>

        {/* Quadrant 2 (Top-Right): Available Limit */}
        <div 
          id="available-limit-card"
          onClick={() => setActiveTab('account')}
          className="border-b border-gray-200/80 p-5 sm:p-6 md:p-7 flex flex-col justify-between items-start cursor-pointer hover:bg-slate-50/40 transition-colors select-none min-h-[115px] sm:min-h-[130px]"
        >
          <span className="text-[15px] sm:text-[17px] font-normal text-[#555d6e] tracking-normal">
            Available Limit
          </span>

          <div className="w-full mt-2">
            <p className="text-[22px] sm:text-[26px] font-extrabold text-slate-950 tracking-tight leading-tight">
              {formatCurrency(financials.availableLimit)}
            </p>
          </div>
        </div>

        {/* Quadrant 3 (Bottom-Left): Invoice Due */}
        <div 
          id="invoice-due-card"
          onClick={() => setActiveTab('quick-payments')}
          className="border-r border-gray-200/80 p-5 sm:p-6 md:p-7 flex flex-col justify-between items-start cursor-pointer hover:bg-slate-50/40 transition-colors select-none min-h-[115px] sm:min-h-[130px]"
        >
          <span className="text-[15px] sm:text-[17px] font-normal text-[#555d6e] tracking-normal">
            Invoice Due
          </span>

          <div className="w-full mt-2">
            <p className={`text-[22px] sm:text-[26px] font-extrabold tracking-tight leading-tight ${
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
          className="p-5 sm:p-6 md:p-7 flex flex-col justify-between items-start cursor-pointer hover:bg-slate-50/40 transition-colors select-none min-h-[115px] sm:min-h-[130px]"
        >
          <span className="text-[15px] sm:text-[17px] font-normal text-[#555d6e] tracking-normal">
            Credit Score
          </span>

          <div className="w-full mt-2 flex items-baseline gap-1">
            <p className={`text-[22px] sm:text-[26px] font-extrabold tracking-tight leading-tight ${
              financials.creditScore < 50 ? 'text-rose-600' : 'text-slate-950'
            }`}>
              {financials.creditScore}
            </p>
            <span className="text-[13px] text-slate-400 font-semibold">/100</span>
          </div>
        </div>
      </div>
    </section>
  );
};
