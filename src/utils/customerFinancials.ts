import { Order, PaymentRecord, CustomerAccount } from '../types';

export interface CustomerFinancialSummary {
  // 1. Upcoming Due
  hasUpcomingDue: boolean;
  upcomingDueAmount: number;
  upcomingDueLabel: string;
  upcomingDueDate?: string;
  upcomingInstallmentIndex?: number;
  totalInstallmentsCount?: number;
  allDuesCleared: boolean;

  // 2. Available Limit
  totalCreditLimit: number;
  usedCreditAmount: number;
  availableLimit: number;
  limitUtilizationPercent: number;
  isCreditSuspended: boolean;

  // 3. Invoice Due
  totalInvoiceDue: number;
  unpaidInvoicesCount: number;
  totalInvoicedAmount: number;
  totalPaidAmount: number;
  invoiceDuePercent: number;

  // 4. Credit Score
  creditScore: number; // 0 - 100
  canPlaceCreditOrder: boolean;
  onTimePaymentsCount: number;
  latePaymentsCount: number;
  creditTier: 'Excellent' | 'Good' | 'Fair' | 'Suspended';
}

/**
 * Calculates accurate real-time dynamic customer financial metrics:
 * - Upcoming Due: customer's next unpaid installment, moving 1 -> 2 -> 3 -> 4, or "No dues left" when cleared.
 * - Available Limit: total credit limit minus outstanding/used credit, adjusted for payments, refunds, and cancellations.
 * - Invoice Due: total outstanding amount from unpaid invoices/installments, decreasing on payment and reaching 0 when cleared.
 * - Credit Score: starts at 100, +1 per on-time payment, -2 per late payment (capped at 100, clamped >= 0). Suspended if < 50.
 */
export function calculateCustomerFinancials(
  orders: Order[],
  payments: PaymentRecord[],
  customerAccount: CustomerAccount | null,
  isAdmin: boolean = false
): CustomerFinancialSummary {
  // Base Credit Limit
  const baseLimit = customerAccount?.creditLimit 
    ? customerAccount.creditLimit 
    : (isAdmin ? 500000 : 250000);
  
  const totalCreditLimit = customerAccount?.creditEnabled !== false ? baseLimit : 0;

  // Filter valid non-cancelled orders for financial evaluation
  const activeOrders = orders.filter(o => o.orderStatus !== 'Cancelled');

  // Track invoice amounts & installments
  let totalOutstanding = 0;
  let totalInvoiced = 0;
  let totalPaidAcrossOrders = 0;
  let unpaidInvoicesCount = 0;

  // Upcoming installment tracker across all active orders
  interface PendingInstallmentItem {
    orderNumber: string;
    installmentNumber: number;
    totalInstallments: number;
    amount: number;
    dueDate: string;
    orderDate: string;
  }

  const pendingInstallments: PendingInstallmentItem[] = [];

  // Track payments on-time vs late
  let onTimePaymentsCount = 0;
  let latePaymentsCount = 0;

  activeOrders.forEach(order => {
    const orderTotal = Number(order.totalAmount) || 0;
    totalInvoiced += orderTotal;

    // Direct paid / refund calculations
    const refundAmt = Number(order.refundAmount) || 0;
    const isPaidInFull = order.paymentStatus === 'Paid';
    const isRefunded = order.paymentStatus === 'Refunded';

    // Calculate effective paid for this order from payments or order status
    let orderPaid = Number(order.paidAmount);
    if (isNaN(orderPaid) || orderPaid === undefined) {
      if (isPaidInFull) {
        orderPaid = orderTotal;
      } else {
        // Aggregate matching payments
        const matchingPayments = payments.filter(
          p => (p.orderId === order.orderNumber || p.orderId === order.id) && p.status === 'Success'
        );
        orderPaid = matchingPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      }
    }

    // Subtract refunds
    const effectivePaid = Math.max(0, Math.min(orderTotal, orderPaid - refundAmt));
    const effectiveRemaining = isRefunded ? 0 : Math.max(0, orderTotal - effectivePaid);

    totalPaidAcrossOrders += effectivePaid;
    if (effectiveRemaining > 0.01) {
      totalOutstanding += effectiveRemaining;
      unpaidInvoicesCount += 1;
    }

    // Check installments
    if (order.installments && order.installments.length > 0) {
      // Find first unpaid installment in serial order
      const sortedInst = [...order.installments].sort((a, b) => a.installmentNumber - b.installmentNumber);
      for (const inst of sortedInst) {
        if (inst.status !== 'Paid' && (inst.amount - (inst.paidAmount || 0)) > 0.01) {
          pendingInstallments.push({
            orderNumber: order.orderNumber,
            installmentNumber: inst.installmentNumber,
            totalInstallments: inst.totalInstallments || sortedInst.length,
            amount: inst.amount - (inst.paidAmount || 0),
            dueDate: inst.dueDate,
            orderDate: order.date
          });
          break; // only take the next immediate installment for this order
        }
      }
    } else if (effectiveRemaining > 0.01) {
      // Generate default single or multi-part installment for orders without explicit plan
      pendingInstallments.push({
        orderNumber: order.orderNumber,
        installmentNumber: 1,
        totalInstallments: 1,
        amount: effectiveRemaining,
        dueDate: order.estimatedDelivery || order.date,
        orderDate: order.date
      });
    }
  });

  // Evaluate Payments for Credit Score calculation
  payments.forEach(payment => {
    if (payment.status === 'Success') {
      // Check if payment was made on-time or late
      const targetOrder = orders.find(o => o.orderNumber === payment.orderId || o.id === payment.orderId);
      if (targetOrder) {
        const orderDate = new Date(targetOrder.date).getTime();
        const paymentDate = new Date(payment.date).getTime();
        const termsDays = customerAccount?.paymentTermsDays || 30;
        const dueLimit = orderDate + termsDays * 24 * 3600 * 1000;

        if (!isNaN(paymentDate) && !isNaN(dueLimit) && paymentDate > dueLimit) {
          latePaymentsCount += 1;
        } else {
          onTimePaymentsCount += 1;
        }
      } else {
        onTimePaymentsCount += 1;
      }
    }
  });

  // Calculate Credit Score:
  // Starts at 100.
  // Increases by 1 point for every on-time payment.
  // Decreases by 2 points for every late payment.
  // Capped at 100 maximum, minimum 0.
  let calculatedCreditScore = 100 + (onTimePaymentsCount * 1) - (latePaymentsCount * 2);
  calculatedCreditScore = Math.min(100, Math.max(0, calculatedCreditScore));

  const isCreditScoreRestricted = calculatedCreditScore < 50;
  const isCreditSuspended = isCreditScoreRestricted || (customerAccount?.accountStatus === 'Suspended');
  const canPlaceCreditOrder = !isCreditSuspended && calculatedCreditScore >= 50;

  let creditTier: 'Excellent' | 'Good' | 'Fair' | 'Suspended' = 'Excellent';
  if (calculatedCreditScore < 50) {
    creditTier = 'Suspended';
  } else if (calculatedCreditScore < 70) {
    creditTier = 'Fair';
  } else if (calculatedCreditScore < 90) {
    creditTier = 'Good';
  }

  // Calculate Available Limit
  const usedCreditAmount = customerAccount?.usedCredit !== undefined
    ? Math.max(0, customerAccount.usedCredit)
    : totalOutstanding;

  const availableLimit = Math.max(0, totalCreditLimit - usedCreditAmount);
  const limitUtilizationPercent = totalCreditLimit > 0 
    ? Math.min(100, Math.round((usedCreditAmount / totalCreditLimit) * 100))
    : 0;

  // Sort pending installments by due date / order date to find customer's NEXT immediate upcoming installment
  pendingInstallments.sort((a, b) => new Date(a.dueDate || a.orderDate).getTime() - new Date(b.dueDate || b.orderDate).getTime());

  const nextInstallment = pendingInstallments[0];
  const allDuesCleared = totalOutstanding <= 0.01;

  let upcomingDueAmount = 0;
  let upcomingDueLabel = 'No dues left';
  let upcomingDueDate: string | undefined = undefined;
  let upcomingInstallmentIndex: number | undefined = undefined;
  let totalInstallmentsCount: number | undefined = undefined;

  if (!allDuesCleared && nextInstallment) {
    upcomingDueAmount = nextInstallment.amount;
    upcomingInstallmentIndex = nextInstallment.installmentNumber;
    totalInstallmentsCount = nextInstallment.totalInstallments;
    upcomingDueDate = nextInstallment.dueDate;

    if (nextInstallment.totalInstallments > 1) {
      upcomingDueLabel = `Installment ${nextInstallment.installmentNumber} of ${nextInstallment.totalInstallments}`;
    } else {
      upcomingDueLabel = `Next Due (Inv #${nextInstallment.orderNumber.slice(-4)})`;
    }
  }

  const invoiceDuePercent = totalInvoiced > 0 
    ? Math.min(100, Math.round((totalOutstanding / totalInvoiced) * 100))
    : 0;

  return {
    hasUpcomingDue: !allDuesCleared && upcomingDueAmount > 0,
    upcomingDueAmount,
    upcomingDueLabel,
    upcomingDueDate,
    upcomingInstallmentIndex,
    totalInstallmentsCount,
    allDuesCleared,

    totalCreditLimit,
    usedCreditAmount,
    availableLimit,
    limitUtilizationPercent,
    isCreditSuspended,

    totalInvoiceDue: totalOutstanding,
    unpaidInvoicesCount,
    totalInvoicedAmount: totalInvoiced,
    totalPaidAmount: totalPaidAcrossOrders,
    invoiceDuePercent,

    creditScore: calculatedCreditScore,
    canPlaceCreditOrder,
    onTimePaymentsCount,
    latePaymentsCount,
    creditTier
  };
}
