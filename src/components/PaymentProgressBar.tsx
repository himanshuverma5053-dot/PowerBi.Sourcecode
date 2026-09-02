import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Order, PaymentRecord, CustomerAccount } from '../types';
import { calculateCustomerFinancials } from '../utils/customerFinancials';
import { Clock, Calendar, CheckCircle2, ShieldCheck, Zap, AlertTriangle, RefreshCw } from 'lucide-react';

interface PaymentProgressBarProps {
  orders?: Order[];
  payments?: PaymentRecord[];
  currentCustomerAccount?: CustomerAccount | null;
  currentUser?: string;
  currentUserEmail?: string;
  isAdmin?: boolean;
  onPayNow?: () => void;
  onRefresh?: () => void;
}

export const PaymentProgressBar: React.FC<PaymentProgressBarProps> = ({
  orders = [],
  payments = [],
  currentCustomerAccount = null,
  currentUser = '',
  currentUserEmail = '',
  isAdmin = false,
  onPayNow,
  onRefresh
}) => {
  // Filter relevant orders for current customer
  const userOrders = useMemo(() => {
    return orders.filter((o) => {
      if (isAdmin) return true;
      if (currentUserEmail && o.customerEmail?.toLowerCase() === currentUserEmail.toLowerCase()) return true;
      if (currentUser && o.customerName?.toLowerCase().includes(currentUser.toLowerCase())) return true;
      return true;
    });
  }, [orders, isAdmin, currentUserEmail, currentUser]);

  const userPayments = useMemo(() => {
    return payments.filter((p) => {
      if (isAdmin) return true;
      if (currentUser && p.customerName?.toLowerCase().includes(currentUser.toLowerCase())) return true;
      return true;
    });
  }, [payments, isAdmin, currentUser]);

  const financials = useMemo(() => {
    return calculateCustomerFinancials(userOrders, userPayments, currentCustomerAccount, isAdmin);
  }, [userOrders, userPayments, currentCustomerAccount, isAdmin]);

  // Total credit period terms in days (default 60 days)
  const totalCreditDays = currentCustomerAccount?.paymentTermsDays || 60;

  // Determine active due date, remaining days, and elapsed days
  const activeFinancialData = useMemo(() => {
    // If all dues cleared or no outstanding invoices, customer has cleared dues
    if (financials.allDuesCleared || financials.upcomingDueAmount <= 0) {
      return {
        remainingDays: 0,
        elapsedDays: totalCreditDays,
        totalDays: totalCreditDays,
        dueDateFormatted: 'No Dues Pending',
        status: 'Cleared • 100% Paid',
        statusType: 'success' as const,
        isReset: true
      };
    }

    // Find earliest active unpaid order
    const unpaidOrders = userOrders.filter(o => o.orderStatus !== 'Cancelled' && o.paymentStatus !== 'Paid' && o.paymentStatus !== 'Refunded');
    const targetOrder = unpaidOrders[0];

    const orderDate = targetOrder?.date ? new Date(targetOrder.date) : new Date();
    const now = new Date();

    let dueDateObj: Date;
    if (financials.upcomingDueDate) {
      dueDateObj = new Date(financials.upcomingDueDate);
    } else if (targetOrder?.estimatedDelivery) {
      dueDateObj = new Date(targetOrder.estimatedDelivery);
    } else {
      dueDateObj = new Date(orderDate.getTime() + totalCreditDays * 24 * 60 * 60 * 1000);
    }

    // Days calculations starting from 60 days and decreasing
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysDiffFromOrder = Math.max(0, Math.floor((now.getTime() - orderDate.getTime()) / msPerDay));
    const daysRemaining = Math.max(0, Math.ceil((dueDateObj.getTime() - now.getTime()) / msPerDay));

    const effectiveRemaining = Math.min(totalCreditDays, daysRemaining > 0 ? daysRemaining : totalCreditDays - daysDiffFromOrder);
    const effectiveElapsed = Math.min(totalCreditDays, Math.max(0, totalCreditDays - effectiveRemaining));

    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
    const dueDateFormatted = isNaN(dueDateObj.getTime()) ? '25 Sep 2026' : dueDateObj.toLocaleDateString('en-GB', options);

    let status = 'On Track';
    let statusType: 'success' | 'warning' | 'danger' = 'success';

    if (daysRemaining <= 0) {
      status = 'Due Today / Grace Period';
      statusType = 'danger';
    } else if (daysRemaining <= 5) {
      status = 'Payment Due Soon';
      statusType = 'warning';
    } else {
      status = 'On Track • On-Time Active';
      statusType = 'success';
    }

    return {
      remainingDays: effectiveRemaining > 0 ? effectiveRemaining : totalCreditDays,
      elapsedDays: effectiveElapsed,
      totalDays: totalCreditDays,
      dueDateFormatted,
      status,
      statusType,
      isReset: false
    };
  }, [financials, totalCreditDays, userOrders]);

  // Dynamic progress ratio (1.0 = full 60 days / unpaid, decreasing towards 0 as days pass and payments are made)
  const dynamicRatio = useMemo(() => {
    if (activeFinancialData.isReset) return 0;
    
    // Day ratio (from 60 down to 0)
    const dayRatio = Math.max(0, Math.min(1, activeFinancialData.remainingDays / totalCreditDays));
    
    // If invoice payment info is available, payment reduction also decreases the blue bar
    if (financials.totalInvoicedAmount > 0) {
      const unpaidInvoiceRatio = Math.max(0, Math.min(1, financials.totalInvoiceDue / financials.totalInvoicedAmount));
      // Blend day remaining with outstanding unpaid invoice ratio
      return Math.max(0.05, Math.min(1, (dayRatio * 0.5) + (unpaidInvoiceRatio * 0.5)));
    }
    
    return Math.max(0.05, dayRatio);
  }, [activeFinancialData, totalCreditDays, financials]);

  // Target target elapsed ratio: animated ratio tracking dynamic ratio
  const targetElapsedRatio = dynamicRatio;

  // Animated interpolated ratio for silky smooth transitions
  const [animatedElapsedRatio, setAnimatedElapsedRatio] = useState(targetElapsedRatio);
  const ratioRef = useRef(targetElapsedRatio);
  const animFrameRef = useRef<number | null>(null);
  const phaseRef = useRef(0);

  // SVG Wave Paths state
  const [wave1Path, setWave1Path] = useState('');
  const [wave2Path, setWave2Path] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    // Trigger temporary micro-bump in wave to show active recalculation
    ratioRef.current = Math.max(0, targetElapsedRatio - 0.05);
    if (onRefresh) {
      onRefresh();
    }
    setTimeout(() => {
      setIsRefreshing(false);
    }, 700);
  };

  // Smooth lerp transition when targetElapsedRatio changes
  useEffect(() => {
    let active = true;
    const updateAnimation = () => {
      if (!active) return;

      // Smooth exponential lerp
      const diff = targetElapsedRatio - ratioRef.current;
      if (Math.abs(diff) > 0.001) {
        ratioRef.current += diff * 0.08;
      } else {
        ratioRef.current = targetElapsedRatio;
      }
      setAnimatedElapsedRatio(ratioRef.current);

      // Increment wave phase for continuous gentle low-amplitude sine-wave motion
      phaseRef.current += 0.035;
      const phase = phaseRef.current;

      // Geometry for the SVG horizontal wave separator
      // Width: 1000, Height: 60
      const width = 1000;
      const height = 60;
      const currentRatio = ratioRef.current;

      // Boundary X coordinate where blue progress meets white background
      const boundaryX = width * currentRatio;

      // Calculate Wave 1 (Front gentle sine wave)
      const amp1 = currentRatio > 0.01 && currentRatio < 0.99 ? 12 : 0;
      const freq1 = 0.06;
      let d1 = `M 0 0`;
      d1 += ` L ${boundaryX} 0`;
      for (let y = 0; y <= height; y += 4) {
        const xOffset = Math.sin(y * freq1 + phase) * amp1;
        d1 += ` L ${boundaryX + xOffset} ${y}`;
      }
      d1 += ` L 0 ${height} Z`;
      setWave1Path(d1);

      // Calculate Wave 2 (Secondary translucent wave with slight phase & wavelength offset)
      const amp2 = currentRatio > 0.01 && currentRatio < 0.99 ? 8 : 0;
      const freq2 = 0.09;
      let d2 = `M 0 0`;
      d2 += ` L ${boundaryX} 0`;
      for (let y = 0; y <= height; y += 4) {
        const xOffset = Math.sin(y * freq2 - phase * 1.2) * amp2;
        d2 += ` L ${boundaryX + xOffset} ${y}`;
      }
      d2 += ` L 0 ${height} Z`;
      setWave2Path(d2);

      animFrameRef.current = requestAnimationFrame(updateAnimation);
    };

    animFrameRef.current = requestAnimationFrame(updateAnimation);

    return () => {
      active = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [targetElapsedRatio]);

  // Remaining percentage calculated
  const remainingPercent = Math.round((activeFinancialData.remainingDays / activeFinancialData.totalDays) * 100);
  const elapsedPercent = 100 - remainingPercent;

  // Active days count tracking starting from 60 and decreasing
  const displayDays = Math.max(1, Math.round(animatedElapsedRatio * totalCreditDays));

  return (
    <section 
      id="payment-progress-bar-section" 
      className="w-full max-w-[285px] sm:max-w-[320px] md:max-w-[430px] lg:max-w-[330px] xl:max-w-[360px] mx-auto px-2 pt-1 pb-10 sm:pb-11 md:pb-12 font-sans select-none"
      aria-label="Payment Credit Progress Bar"
    >
      <div 
        id="payment-progress-card"
        className="relative w-full"
      >
        {/* Single Unified Container with Continuous White Background extending to Refresh Tab */}
        <div className="relative w-full filter drop-shadow-[0_10px_28px_rgba(0,0,0,0.10)] drop-shadow-[0_2px_5px_rgba(0,0,0,0.05)]">
          
          {/* Top Capsule Frame */}
          <div className="relative w-full p-[10px] sm:p-[12px] md:p-3.5 rounded-full bg-white border border-slate-200/90 z-10">
            <div 
              id="payment-progress-capsule"
              className="relative z-10 w-full h-8 sm:h-9 md:h-11 rounded-full overflow-hidden bg-slate-50 ring-1 ring-slate-200/90 shadow-[inset_0_2px_5px_rgba(0,0,0,0.08)]"
            >
              {/* SVG Renderer for Crisp Waves and Dual Gradients */}
              <svg 
                className="w-full h-full block" 
                viewBox="0 0 1000 60" 
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  {/* Clean White Dynamic Bar Gradient for Base/Remaining Credit with Subtle Depth */}
                  <linearGradient id="dynamicBarWhiteGradient" x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="35%" stopColor="#f8fafc" />
                    <stop offset="70%" stopColor="#f1f5f9" />
                    <stop offset="100%" stopColor="#e2e8f0" />
                  </linearGradient>

                  {/* Animated Shimmer Stripe pattern for dynamic background bar */}
                  <linearGradient id="bgShimmerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                    <stop offset="45%" stopColor="#ffffff" stopOpacity="0" />
                    <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.08" />
                    <stop offset="55%" stopColor="#ffffff" stopOpacity="0.25" />
                    <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.08" />
                    <stop offset="65%" stopColor="#ffffff" stopOpacity="0" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                    <animate attributeName="x1" from="-100%" to="100%" dur="3.5s" repeatCount="indefinite" />
                    <animate attributeName="x2" from="0%" to="200%" dur="3.5s" repeatCount="indefinite" />
                  </linearGradient>

                  {/* Water Wave Gradient with #0972D3 */}
                  <linearGradient id="lightBlueWaveGradient" x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="40%" stopColor="#0ea5e9" />
                    <stop offset="75%" stopColor="#0972D3" />
                    <stop offset="100%" stopColor="#075ea8" />
                  </linearGradient>

                  {/* Internal Flow Shimmer for the Blue Fluid Wave */}
                  <linearGradient id="blueFluidShimmer" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
                    <stop offset="30%" stopColor="#ffffff" stopOpacity="0.0" />
                    <stop offset="70%" stopColor="#ffffff" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#0f172a" stopOpacity="0.12" />
                  </linearGradient>

                  {/* Top Surface Specular Gloss Overlay */}
                  <linearGradient id="waveHighlight" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
                    <stop offset="40%" stopColor="#ffffff" stopOpacity="0.05" />
                    <stop offset="100%" stopColor="#0f172a" stopOpacity="0.06" />
                  </linearGradient>
                </defs>

                {/* Background Full Dynamic Bar (Remaining Credit Period) */}
                <rect x="0" y="0" width="1000" height="60" fill="url(#dynamicBarWhiteGradient)" />
                
                {/* Dynamic Animated Background Shimmer Beam */}
                <rect x="0" y="0" width="1000" height="60" fill="url(#bgShimmerGradient)" pointerEvents="none" />

                {/* Secondary Translucent Wave Layer (Back wave) */}
                {animatedElapsedRatio > 0.001 && (
                  <path 
                    d={wave2Path} 
                    fill="url(#lightBlueWaveGradient)" 
                    fillOpacity="0.45"
                  />
                )}

                {/* Primary Animated Wave Layer (Front wave - Elapsed Time) */}
                {animatedElapsedRatio > 0.001 && (
                  <>
                    <path 
                      d={wave1Path} 
                      fill="url(#lightBlueWaveGradient)" 
                      fillOpacity="0.95"
                      stroke="#ffffff"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                      className="filter drop-shadow-[0_1px_3px_rgba(0,115,187,0.25)]"
                    />
                    {/* Internal Liquid Sheen */}
                    <path 
                      d={wave1Path} 
                      fill="url(#blueFluidShimmer)" 
                      pointerEvents="none"
                    />
                  </>
                )}

                {/* Top Surface Glass/Specular Overlay */}
                <rect x="0" y="0" width="1000" height="60" fill="url(#waveHighlight)" pointerEvents="none" />

                {/* Subtle Milestone Markers (Black Dotted Lines) */}
                <line x1="250" y1="10" x2="250" y2="50" stroke="#000000" strokeDasharray="3,3" strokeWidth="2" strokeOpacity="0.9" />
                <line x1="500" y1="8" x2="500" y2="52" stroke="#000000" strokeDasharray="3,3" strokeWidth="2" strokeOpacity="0.95" />
                <line x1="750" y1="10" x2="750" y2="50" stroke="#000000" strokeDasharray="3,3" strokeWidth="2" strokeOpacity="0.9" />

                {/* Thin Inner Tube Border Line (Clean Vector Outline) */}
                <rect 
                  x="1" 
                  y="1" 
                  width="998" 
                  height="58" 
                  rx="29" 
                  ry="29" 
                  fill="none" 
                  stroke="#94a3b8" 
                  strokeWidth="2.2" 
                  strokeOpacity="0.75" 
                  pointerEvents="none" 
                />
              </svg>

              {/* Inner Tube Subtle Glass Bevel & Highlight */}
              <div className="absolute inset-0 rounded-full border border-slate-300/80 pointer-events-none shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.1)]">
                <div className="w-full h-[45%] rounded-t-full bg-gradient-to-b from-white/35 to-transparent pointer-events-none" />
              </div>

              {/* Movable Dynamic Days Text with Dot aligned smoothly to the tip as the blue wave shrinks */}
              <div 
                className="absolute inset-y-0 flex items-center pointer-events-none transition-transform duration-75 z-30"
                style={{ 
                  left: `${Math.max(2, Math.min(97, animatedElapsedRatio * 100))}%`, 
                  transform: animatedElapsedRatio >= 0.22 
                    ? 'translateX(-100%)' 
                    : `translateX(-${Math.max(0, (animatedElapsedRatio - 0.04) / 0.18 * 100)}%)`
                }}
              >
                <div className="flex items-center space-x-1.5 pr-1.5 text-slate-800 text-[10px] sm:text-[11px] md:text-[13px] font-black tracking-wider uppercase drop-shadow-xs whitespace-nowrap select-none">
                  <span>{displayDays} {displayDays === 1 ? 'Day' : 'Days'}</span>
                  <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#0972D3] animate-pulse shrink-0 ring-1 ring-white/60"></span>
                </div>
              </div>
            </div>
          </div>

          {/* Continuous Downward White Tab located directly beneath the progress bar capsule */}
          <div className="absolute right-3 sm:right-4 md:right-5 top-full -mt-2 w-9 h-11 sm:w-10 sm:h-12 md:w-11 md:h-13 bg-white rounded-b-full border-b border-x border-slate-200/90 flex flex-col justify-end items-center pb-1 sm:pb-1.5 z-10 pointer-events-auto">
            {/* Smooth Concave Fillet Curve on the Left of Tab */}
            <svg 
              className="absolute -left-3.5 top-0 w-3.5 h-5 pointer-events-none overflow-visible z-10" 
              viewBox="0 0 14 20"
            >
              <path d="M0,0 Q14,0 14,20 L14,0 Z" fill="#ffffff" />
              <path d="M0,0 Q14,0 14,20" fill="none" stroke="#e2e8f0" strokeWidth="1.2" strokeLinecap="round" />
            </svg>

            {/* Refresh Button seated comfortably inside the tab under the progress bar */}
            <button
              id="progress-bar-refresh-button"
              type="button"
              onClick={handleRefresh}
              title="Refresh Progress"
              aria-label="Refresh Payment Progress Bar"
              className="group relative z-20 flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full hover:bg-slate-50 active:scale-90 transition-all text-[#0972D3] focus:outline-none"
            >
              <svg 
                className={`w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 text-[#0972D3] transition-transform duration-500 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M4 12C4 7.58172 7.58172 4 12 4C15.0537 4 17.6974 5.71359 19.0357 8.23238M20 12C20 16.4183 16.4183 20 12 20C8.94627 20 6.30263 18.2864 4.96426 15.7676" 
                  stroke="#0972D3" 
                  strokeWidth="2.6" 
                  strokeLinecap="round" 
                />
                <path 
                  d="M15 8.5H19.5V4M9 15.5H4.5V20" 
                  stroke="#0972D3" 
                  strokeWidth="2.6" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
