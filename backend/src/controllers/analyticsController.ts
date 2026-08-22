import { Request, Response } from 'express';
import { memoryStore } from '../store/memoryStore.js';

export function getDashboardMetrics(_req: Request, res: Response) {
  const products = memoryStore.getProducts();
  const orders = memoryStore.getOrders();
  const payments = memoryStore.getPayments();

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalStockUnits = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const lowStockItems = products.filter(p => (p.stock || 0) <= (p.minStockLevel || 5));

  const totalPaymentsCollected = payments
    .filter(p => p.status === 'Success')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  res.json({
    success: true,
    data: {
      metrics: {
        totalRevenue,
        totalOrders: orders.length,
        totalProducts: products.length,
        totalStockUnits,
        lowStockAlertsCount: lowStockItems.length,
        totalPaymentsCollected
      },
      lowStockProducts: lowStockItems,
      recentOrders: orders.slice(0, 5)
    }
  });
}
