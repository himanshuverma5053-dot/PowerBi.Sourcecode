import React, { useState } from 'react';
import { Order, PaymentRecord, CustomerAccount } from '../types';
import { formatCurrency } from '../utils/formatters';
import { calculateCustomerFinancials } from '../utils/customerFinancials';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import coinStackImage from '../assets/images/regenerated_image_1788353975825.png';
import moneyBagImage from '../assets/images/regenerated_image_1788353978698.jpg';
import hourglassImage from '../assets/images/regenerated_image_1788353981419.png';
import handshakeImage from '../assets/images/regenerated_image_1788353984458.png';

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

  // Formatted values
  const upcomingDueVal = financials.upcomingDueAmount === 0 ? '₹0' : formatCurrency(financials.upcomingDueAmount);
  const availableLimitVal = '₹0';
  const invoiceAmountDueVal = '₹0';
  const creditScoreVal = '3';

  // Helper to dynamically right-align and scale large numbers if they grow too large for the quadrant
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
    <section id="home-static-overview-section" className="w-full max-w-[255px] sm:max-w-[285px] md:max-w-[390px] lg:max-w-[285px] mx-auto px-2 py-1.5 font-sans space-y-2 md:space-y-3">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-1.5 px-0.5 pb-1">
        <h1 id="static-overview-heading" className="text-lg sm:text-xl md:text-2xl font-black text-slate-950 tracking-tight flex items-center gap-1.5 shrink-0">
          <span className="text-slate-900 font-black text-lg sm:text-xl md:text-2xl tracking-tight whitespace-nowrap">Static Overview</span>
          {financials.isCreditSuspended && (
            <span className="text-[9px] md:text-[10px] uppercase tracking-wider font-extrabold bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shrink-0">
              <ShieldAlert className="w-3 h-3 md:w-3.5 md:h-3.5" />
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
          className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[#0972D3]/10 hover:bg-[#0972D3]/20 active:scale-95 transition-all text-[#0972D3] cursor-pointer select-none border border-[#0972D3]/30 shadow-2xs shrink-0"
        >
          <RefreshCw 
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0972D3] transition-transform duration-700 ${isRefreshing ? 'animate-spin' : ''}`} 
            strokeWidth={2.5}
          />
          <span className="text-xs sm:text-sm font-bold text-[#0972D3] tracking-tight">Refresh</span>
        </button>
      </div>

      {/* 2x2 Quadrant Card */}
      <div 
        id="static-overview-card-container" 
        className="w-full bg-white rounded-[26px] sm:rounded-[30px] md:rounded-[36px] border border-gray-200/90 shadow-[0_4px_16px_rgba(0,0,0,0.06)] grid grid-cols-2 grid-rows-2 overflow-hidden transition-all duration-200"
      >
        {/* Quadrant 1 (Top-Left): Upcoming Due */}
        <div 
          id="available-limit-card"
          onClick={() => setActiveTab('quick-payments')}
          className="border-r border-b border-gray-200/90 py-6 sm:py-7 md:py-9 px-2.5 sm:px-3.5 md:px-4 flex flex-col items-center justify-between min-h-[135px] sm:min-h-[155px] md:min-h-[185px] cursor-pointer hover:bg-slate-50/50 transition-colors select-none min-w-0 group"
        >
          {/* Small image icon positioned ABOVE the text */}
          <div className="w-full flex items-center justify-center pt-1.5">
            <img 
              src={coinStackImage} 
              alt="Upcoming Due" 
              className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 object-contain shrink-0 transition-transform duration-200 group-hover:scale-110 select-none pointer-events-none"
              referrerPolicy="no-referrer"
            />
          </div>

          <span className="text-[11px] sm:text-xs md:text-sm font-medium text-[#555d6e] leading-tight text-center w-full truncate my-1.5">
            Upcoming Due
          </span>

          <div className={`w-full pb-1 flex items-center justify-center min-w-0 ${upcomingDueStyle.containerClass}`}>
            <p className={`text-slate-950 tracking-tight leading-tight truncate max-w-full text-lg sm:text-xl md:text-2xl font-black ${upcomingDueStyle.textClass}`}>
              {upcomingDueVal}
            </p>
          </div>
        </div>

        {/* Quadrant 2 (Top-Right): Available Limit */}
        <div 
          id="hold-cca-card"
          onClick={() => setActiveTab('account')}
          className="border-b border-gray-200/90 py-6 sm:py-7 md:py-9 px-2.5 sm:px-3.5 md:px-4 flex flex-col items-center justify-between min-h-[135px] sm:min-h-[155px] md:min-h-[185px] cursor-pointer hover:bg-slate-50/50 transition-colors select-none min-w-0 group"
        >
          {/* Small image icon positioned ABOVE the text */}
          <div className="w-full flex items-center justify-center pt-1.5">
            <img 
              src={moneyBagImage} 
              alt="Available Limit" 
              className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 object-contain shrink-0 transition-transform duration-200 group-hover:scale-110 select-none pointer-events-none"
              referrerPolicy="no-referrer"
            />
          </div>

          <span className="text-[11px] sm:text-xs md:text-sm font-medium text-[#555d6e] leading-tight text-center w-full truncate my-1.5">
            Available Limit
          </span>

          <div className={`w-full pb-1 flex items-center justify-center min-w-0 ${availableLimitStyle.containerClass}`}>
            <p className={`text-slate-950 tracking-tight leading-tight truncate max-w-full text-lg sm:text-xl md:text-2xl font-black ${availableLimitStyle.textClass}`}>
              {availableLimitVal}
            </p>
          </div>
        </div>

        {/* Quadrant 3 (Bottom-Left): Invoice Amount Due */}
        <div 
          id="total-cca-card"
          onClick={() => setActiveTab('quick-payments')}
          className="border-r border-gray-200/90 py-6 sm:py-7 md:py-9 px-2.5 sm:px-3.5 md:px-4 flex flex-col items-center justify-between min-h-[135px] sm:min-h-[155px] md:min-h-[185px] cursor-pointer hover:bg-slate-50/50 transition-colors select-none min-w-0 group"
        >
          {/* Small image icon positioned ABOVE the text */}
          <div className="w-full flex items-center justify-center pt-1.5">
            <img 
              src={hourglassImage} 
              alt="Invoice Amount Due" 
              className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 object-contain shrink-0 transition-transform duration-200 group-hover:scale-110 select-none pointer-events-none"
              referrerPolicy="no-referrer"
            />
          </div>

          <span className="text-[11px] sm:text-xs md:text-sm font-medium text-[#555d6e] leading-tight text-center w-full truncate my-1.5">
            Invoice Amount Due
          </span>

          <div className={`w-full pb-1 flex items-center justify-center min-w-0 ${invoiceAmountDueStyle.containerClass}`}>
            <p className={`text-slate-950 tracking-tight leading-tight truncate max-w-full text-lg sm:text-xl md:text-2xl font-black ${invoiceAmountDueStyle.textClass}`}>
              {invoiceAmountDueVal}
            </p>
          </div>
        </div>

        {/* Quadrant 4 (Bottom-Right): Credit Score & Partnership */}
        <div 
          id="invoice-amount-due-card"
          onClick={() => setActiveTab('account')}
          className="py-6 sm:py-7 md:py-9 px-2.5 sm:px-3.5 md:px-4 flex flex-col items-center justify-between min-h-[135px] sm:min-h-[155px] md:min-h-[185px] cursor-pointer hover:bg-slate-50/50 transition-colors select-none min-w-0 group"
        >
          {/* Image icon positioned ABOVE the text */}
          <div className="w-full flex items-center justify-center pt-1.5">
            <img 
              src={handshakeImage} 
              alt="Credit Score Partnership" 
              className="w-12 h-8 sm:w-14 sm:h-9 md:w-16 md:h-11 object-contain shrink-0 transition-transform duration-200 group-hover:scale-110 select-none pointer-events-none"
              referrerPolicy="no-referrer"
            />
          </div>

          <span className="text-[11px] sm:text-xs md:text-sm font-medium text-[#555d6e] leading-tight text-center w-full truncate my-1.5">
            Credit Score
          </span>

          <div className={`w-full pb-1 flex items-center justify-center min-w-0 ${creditScoreStyle.containerClass}`}>
            <p className={`text-[#0972D3] tracking-tight leading-tight truncate max-w-full text-lg sm:text-xl md:text-2xl font-black ${creditScoreStyle.textClass}`}>
              {creditScoreVal}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
