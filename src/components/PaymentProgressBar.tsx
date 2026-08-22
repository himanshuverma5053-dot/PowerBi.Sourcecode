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
}

export const PaymentProgressBar: React.FC<PaymentProgressBarProps> = ({
  orders = [],
  payments = [],
  currentCustomerAccount = null,
  currentUser = '',
  currentUserEmail = '',
  isAdmin = false,
  onPayNow
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

  // Total credit period terms in days (e.g. 30 days)
  const totalCreditDays = currentCustomerAccount?.paymentTermsDays || 30;

  // Determine active due date, remaining days, and elapsed days
  const activeFinancialData = useMemo(() => {
    // If all dues cleared or no outstanding invoices, customer has 100% full remaining credit time
    if (financials.allDuesCleared || financials.upcomingDueAmount <= 0) {
      return {
        remainingDays: totalCreditDays,
        elapsedDays: 0,
        totalDays: totalCreditDays,
        dueDateFormatted: 'No Dues Pending',
        status: 'Cleared • 100% Reset',
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

    // Days calculations
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysDiffFromOrder = Math.max(0, Math.floor((now.getTime() - orderDate.getTime()) / msPerDay));
    const daysRemaining = Math.max(0, Math.ceil((dueDateObj.getTime() - now.getTime()) / msPerDay));

    const effectiveRemaining = Math.min(totalCreditDays, daysRemaining);
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
      remainingDays: effectiveRemaining,
      elapsedDays: effectiveElapsed,
      totalDays: totalCreditDays,
      dueDateFormatted,
      status,
      statusType,
      isReset: false
    };
  }, [financials, totalCreditDays, userOrders]);

  // Target target elapsed ratio: 0.0 means 100% remaining (fully reset), 1.0 means 0% remaining
  const targetElapsedRatio = activeFinancialData.isReset
    ? 0
    : Math.min(1, Math.max(0, activeFinancialData.elapsedDays / activeFinancialData.totalDays));

  // Animated interpolated ratio for silky smooth transitions
  const [animatedElapsedRatio, setAnimatedElapsedRatio] = useState(targetElapsedRatio);
  const ratioRef = useRef(targetElapsedRatio);
  const animFrameRef = useRef<number | null>(null);
  const phaseRef = useRef(0);

  // SVG Wave Paths state
  const [wave1Path, setWave1Path] = useState('');
  const [wave2Path, setWave2Path] = useState('');

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

      // Boundary X coordinate where elapsed (light blue) meets remaining (navy blue)
      // When currentRatio is 0 (fully reset), boundary is at x = 0 (light blue is 0, full bar is navy blue)
      // When currentRatio is 1, boundary is at x = width
      const boundaryX = width * currentRatio;

      // Calculate Wave 1 (Front gentle sine wave)
      // Amplitude: 10px, Wavelength along Y axis
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

  return (
    <section 
      id="payment-progress-bar-section" 
      className="w-full max-w-[285px] sm:max-w-[310px] mx-auto px-2 py-1 font-sans select-none"
      aria-label="Payment Credit Progress Bar"
    >
      <div 
        id="payment-progress-card"
        className="w-full"
      >
        {/* Full-Width Rounded Capsule with Dual Animated Water Waves */}
        <div className="relative w-full">
          <div 
            id="payment-progress-capsule"
            className="relative w-full h-7 sm:h-8 rounded-full overflow-hidden bg-white border border-gray-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
          >
            {/* SVG Renderer for Crisp Waves and Dual Gradients */}
            <svg 
              className="w-full h-full block" 
              viewBox="0 0 1000 60" 
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                {/* Clean White Dynamic Bar Gradient for Base/Remaining Credit */}
                <linearGradient id="dynamicBarWhiteGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="50%" stopColor="#f8fafc" />
                  <stop offset="100%" stopColor="#f1f5f9" />
                </linearGradient>

                {/* Vibrant Blue Wave Gradient for Elapsed Time */}
                <linearGradient id="lightBlueWaveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#0ea5e9" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>

                {/* Shimmer Highlight */}
                <linearGradient id="waveHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
                  <stop offset="50%" stopColor="#ffffff" stopOpacity="0.0" />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {/* Background Full Dynamic Bar White (Remaining Credit Period) */}
              <rect x="0" y="0" width="1000" height="60" fill="url(#dynamicBarWhiteGradient)" />

              {/* Secondary Translucent Wave Layer (Back wave) */}
              {animatedElapsedRatio > 0.001 && (
                <path 
                  d={wave2Path} 
                  fill="url(#lightBlueWaveGradient)" 
                  fillOpacity="0.55"
                />
              )}

              {/* Primary Animated Wave Layer (Front wave - Elapsed Time) */}
              {animatedElapsedRatio > 0.001 && (
                <path 
                  d={wave1Path} 
                  fill="url(#lightBlueWaveGradient)" 
                  fillOpacity="0.95"
                />
              )}

              {/* Top Surface Glass/Specular Overlay */}
              <rect x="0" y="0" width="1000" height="60" fill="url(#waveHighlight)" pointerEvents="none" />

              {/* Subtle Milestone Markers */}
              <line x1="250" y1="10" x2="250" y2="50" stroke="rgba(148,163,184,0.3)" strokeDasharray="3,3" strokeWidth="1.5" />
              <line x1="500" y1="8" x2="500" y2="52" stroke="rgba(148,163,184,0.4)" strokeDasharray="3,3" strokeWidth="1.5" />
              <line x1="750" y1="10" x2="750" y2="50" stroke="rgba(148,163,184,0.3)" strokeDasharray="3,3" strokeWidth="1.5" />
            </svg>

            {/* Inner Capsule Floating Text & Badges */}
            <div className="absolute inset-0 flex items-center justify-between px-3 sm:px-3.5 pointer-events-none text-[9px] sm:text-[10px] font-black tracking-wider uppercase drop-shadow-xs">
              <span className="flex items-center space-x-1 text-slate-800">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
                <span>Day 0</span>
              </span>
              <span className="flex items-center space-x-1 text-slate-800">
                <span>Day {totalCreditDays}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
