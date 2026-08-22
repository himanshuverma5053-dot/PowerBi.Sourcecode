import { Request, Response } from 'express';
import { memoryStore } from '../store/memoryStore.js';
import { generatePaymentId } from '../utils/formatters.js';

export function getAllPayments(_req: Request, res: Response) {
  const payments = memoryStore.getPayments();
  res.json({
    success: true,
    count: payments.length,
    data: payments
  });
}

export function processPayment(req: Request, res: Response) {
  const { orderId, amount, paymentMethod, customerName, gstNumber } = req.body;

  const paymentRecord = {
    id: `pay-${Date.now()}`,
    paymentId: generatePaymentId(paymentMethod || 'UPI'),
    orderId: orderId || `MT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    customerName: customerName || 'Valued Customer',
    amount: Number(amount) || 5000,
    gstNumber,
    method: paymentMethod || 'UPI',
    status: 'Success' as const,
    date: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };

  const recorded = memoryStore.recordPayment(paymentRecord);
  res.json({
    success: true,
    message: 'Payment processed and verified successfully',
    receipt: recorded,
    data: recorded
  });
}
