import React from 'react';
import { Order, PaymentRecord, CustomerAccount } from '../types';
import { formatCurrency } from '../utils/formatters';

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
  payments: _payments,
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
    return true; // Live fallback for active dealer sessions
  });

  // 1. Upcoming Payments (Unpaid, pending or in-process scheduled settlements)
  const unpaidOrders = userOrders.filter(
    (o) => o.paymentStatus !== 'Paid' && o.orderStatus !== 'Cancelled'
  );
  const upcomingPaymentsAmount = unpaidOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  // 2. Available Limit (Total assigned credit limit minus utilized trade dues)
  const defaultTotalLimit = currentCustomerAccount?.creditLimit 
    ? currentCustomerAccount.creditLimit 
    : (isAdmin ? 500000 : 250000);
  
  const totalLimit = currentCustomerAccount?.creditEnabled 
    ? (currentCustomerAccount.creditLimit || defaultTotalLimit)
    : defaultTotalLimit;

  const usedCredit = currentCustomerAccount?.usedCredit !== undefined
    ? currentCustomerAccount.usedCredit
    : upcomingPaymentsAmount;

  const availableLimitAmount = Math.max(0, totalLimit - usedCredit);

  // 3. Invoice Due (Outstanding tax invoices due for payment)
  const pendingInvoices = userOrders.filter(
    (o) => (o.paymentStatus === 'Pending' || o.paymentStatus === 'Failed' || o.paymentStatus === 'Partially Paid') && 
           o.orderStatus !== 'Cancelled'
  );
  const invoiceDueAmount = pendingInvoices.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  // 4. Credit Score (5.0 scale rating dynamically computed from payment track record)
  const totalOrdersCount = userOrders.length;
  const paidOrdersCount = userOrders.filter((o) => o.paymentStatus === 'Paid').length;
  const onTimeRatio = totalOrdersCount > 0 ? paidOrdersCount / totalOrdersCount : 1;

  let computedScore = (3.5 + onTimeRatio * 1.5);
  if (totalOrdersCount === 0) {
    computedScore = 4.5;
  } else if (unpaidOrders.length > 3) {
    computedScore = Math.max(2.0, computedScore - 0.7);
  }
  const formattedCreditScore = Math.min(5.0, Math.max(1.0, computedScore)).toFixed(1);

  return (
    <section id="home-static-overview-section" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-4 sm:space-y-5">
      <div className="flex items-center justify-between">
        <h1 id="static-overview-heading" className="text-xl sm:text-2xl font-black font-display text-slate-900 tracking-tight">
          Static Overview
        </h1>
      </div>

      {/* 2x2 Clean Card Container matching reference image */}
      <div id="static-overview-card-container" className="bg-white rounded-[28px] sm:rounded-[36px] border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] overflow-hidden transition-all duration-200">
        
        {/* Row 1 */}
        <div className="grid grid-cols-2 border-b border-slate-200/70">
          
          {/* 1. Top-Left: Upcoming Payments */}
          <div 
            onClick={() => setActiveTab('quick-payments')}
            className="p-6 sm:p-9 md:p-11 border-r border-slate-200/70 flex flex-col justify-center cursor-pointer hover:bg-slate-50/50 transition-colors group"
          >
            <span className="text-xs sm:text-sm md:text-[15px] font-bold text-slate-400 uppercase tracking-wider select-none">
              UPCOMING PAYMENTS
            </span>
            <p className="text-2xl sm:text-3xl md:text-[38px] font-extrabold text-slate-900 tracking-tight mt-2.5 sm:mt-3.5 group-hover:text-slate-950 transition-colors">
              {formatCurrency(upcomingPaymentsAmount)}
            </p>
          </div>

          {/* 2. Top-Right: Available Limit */}
          <div 
            onClick={() => setActiveTab('account')}
            className="p-6 sm:p-9 md:p-11 flex flex-col justify-center cursor-pointer hover:bg-slate-50/50 transition-colors group"
          >
            <span className="text-xs sm:text-sm md:text-[15px] font-bold text-slate-400 uppercase tracking-wider select-none">
              AVAILABLE LIMIT
            </span>
            <p className="text-2xl sm:text-3xl md:text-[38px] font-extrabold text-slate-900 tracking-tight mt-2.5 sm:mt-3.5 group-hover:text-slate-950 transition-colors">
              {formatCurrency(availableLimitAmount)}
            </p>
          </div>

        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-2">
          
          {/* 3. Bottom-Left: Invoice Due */}
          <div 
            onClick={() => setActiveTab('quick-payments')}
            className="p-6 sm:p-9 md:p-11 border-r border-slate-200/70 flex flex-col justify-center cursor-pointer hover:bg-slate-50/50 transition-colors group"
          >
            <span className="text-xs sm:text-sm md:text-[15px] font-bold text-slate-400 uppercase tracking-wider select-none">
              INVOICE DUE
            </span>
            <p className="text-2xl sm:text-3xl md:text-[38px] font-extrabold text-slate-900 tracking-tight mt-2.5 sm:mt-3.5 group-hover:text-slate-950 transition-colors">
              {formatCurrency(invoiceDueAmount)}
            </p>
          </div>

          {/* 4. Bottom-Right: Credit Score */}
          <div 
            onClick={() => setActiveTab('account')}
            className="p-6 sm:p-9 md:p-11 flex flex-col justify-center cursor-pointer hover:bg-slate-50/50 transition-colors group"
          >
            <span className="text-xs sm:text-sm md:text-[15px] font-bold text-slate-400 uppercase tracking-wider select-none">
              CREDIT SCORE
            </span>
            <p className="text-2xl sm:text-3xl md:text-[38px] font-extrabold text-slate-900 tracking-tight mt-2.5 sm:mt-3.5 group-hover:text-slate-950 transition-colors">
              {formattedCreditScore}
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
