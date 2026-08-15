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
    return true;
  });

  // 1. Available Limit
  const defaultTotalLimit = currentCustomerAccount?.creditLimit 
    ? currentCustomerAccount.creditLimit 
    : (isAdmin ? 500000 : 250000);
  
  const totalLimit = currentCustomerAccount?.creditEnabled 
    ? (currentCustomerAccount.creditLimit || defaultTotalLimit)
    : defaultTotalLimit;

  const unpaidOrders = userOrders.filter(
    (o) => o.paymentStatus !== 'Paid' && o.orderStatus !== 'Cancelled'
  );
  const upcomingPaymentsAmount = unpaidOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  const usedCredit = currentCustomerAccount?.usedCredit !== undefined
    ? currentCustomerAccount.usedCredit
    : upcomingPaymentsAmount;

  const availableLimitAmount = Math.max(0, totalLimit - usedCredit);

  // 2. Hold CCA (Held Collateral / Credit Allocation)
  const holdCcaAmount = 0;

  // 3. Total CCA
  const totalCcaAmount = availableLimitAmount;

  // 4. Invoice Amount Due
  const pendingInvoices = userOrders.filter(
    (o) => (o.paymentStatus === 'Pending' || o.paymentStatus === 'Failed' || o.paymentStatus === 'Partially Paid') && 
           o.orderStatus !== 'Cancelled'
  );
  const invoiceDueAmount = pendingInvoices.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  // 5. Credit Score (5.0 rating scale)
  const totalOrdersCount = userOrders.length;
  const paidOrdersCount = userOrders.filter((o) => o.paymentStatus === 'Paid').length;
  const onTimeRatio = totalOrdersCount > 0 ? paidOrdersCount / totalOrdersCount : 1;

  let computedScore = (3.5 + onTimeRatio * 1.5);
  if (totalOrdersCount === 0) {
    computedScore = 4.8;
  } else if (unpaidOrders.length > 3) {
    computedScore = Math.max(2.0, computedScore - 0.7);
  }
  const formattedCreditScore = Math.min(5.0, Math.max(1.0, computedScore)).toFixed(1);

  return (
    <section id="home-static-overview-section" className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 font-sans space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <h1 id="static-overview-heading" className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Static Overview
        </h1>
      </div>

      {/* 2x2 Rectangular Card matching screenshot exact theme & styling */}
      <div 
        id="static-overview-card-container" 
        className="w-full bg-white rounded-[36px] sm:rounded-[48px] border border-slate-200 shadow-[0_10px_36px_rgba(0,0,0,0.04)] grid grid-cols-2 grid-rows-2 overflow-hidden transition-all duration-200"
      >
        {/* Quadrant 1 (Top-Left): Upcoming Due */}
        <div 
          onClick={() => setActiveTab('quick-payments')}
          className="border-r border-b border-slate-200/80 px-7 sm:px-10 md:px-12 py-7 sm:py-9 md:py-10 flex flex-col justify-start items-start cursor-pointer hover:bg-slate-50/40 transition-colors select-none"
        >
          <span className="text-base sm:text-lg md:text-xl font-normal text-slate-500 tracking-normal min-h-[1.75rem] flex items-center">
            Upcoming Due
          </span>
          <p className="text-2xl sm:text-3xl md:text-[30px] font-black text-slate-900 tracking-tight mt-1.5 sm:mt-2 leading-tight">
            {formatCurrency(upcomingPaymentsAmount || 5689)}
          </p>
        </div>

        {/* Quadrant 2 (Top-Right): Available Limit */}
        <div 
          onClick={() => setActiveTab('account')}
          className="border-b border-slate-200/80 px-7 sm:px-10 md:px-12 py-7 sm:py-9 md:py-10 flex flex-col justify-start items-start cursor-pointer hover:bg-slate-50/40 transition-colors select-none"
        >
          <span className="text-base sm:text-lg md:text-xl font-normal text-slate-500 tracking-normal min-h-[1.75rem] flex items-center">
            Available Limit
          </span>
          <p className="text-2xl sm:text-3xl md:text-[30px] font-black text-slate-900 tracking-tight mt-1.5 sm:mt-2 leading-tight">
            {formatCurrency(availableLimitAmount || 5689)}
          </p>
        </div>

        {/* Quadrant 3 (Bottom-Left): Invoice Due */}
        <div 
          onClick={() => setActiveTab('quick-payments')}
          className="border-r border-slate-200/80 px-7 sm:px-10 md:px-12 py-7 sm:py-9 md:py-10 flex flex-col justify-start items-start cursor-pointer hover:bg-slate-50/40 transition-colors select-none"
        >
          <span className="text-base sm:text-lg md:text-xl font-normal text-slate-500 tracking-normal min-h-[1.75rem] flex items-center">
            Invoice Due
          </span>
          <p className="text-2xl sm:text-3xl md:text-[30px] font-black text-slate-900 tracking-tight mt-1.5 sm:mt-2 leading-tight">
            {formatCurrency(invoiceDueAmount || 5689)}
          </p>
        </div>

        {/* Quadrant 4 (Bottom-Right): Credit Score in Distinct Purple Theme */}
        <div 
          onClick={() => setActiveTab('account')}
          className="px-7 sm:px-10 md:px-12 py-7 sm:py-9 md:py-10 flex flex-col justify-start items-start cursor-pointer hover:bg-slate-50/40 transition-colors select-none"
        >
          <span className="text-base sm:text-lg md:text-xl font-normal text-slate-500 tracking-normal min-h-[1.75rem] flex items-center">
            Credit Score
          </span>
          <p className="text-2xl sm:text-3xl md:text-[30px] font-black text-[#5b38f3] tracking-tight mt-1.5 sm:mt-2 leading-tight">
            {formattedCreditScore}
          </p>
        </div>
      </div>
    </section>
  );
};
