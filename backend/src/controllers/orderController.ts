import { Request, Response } from 'express';
import { memoryStore } from '../store/memoryStore.js';
import { Order, OrderItem } from '../types/index.js';
import { generateOrderNumber, generateTrackingNumber, generatePaymentId } from '../utils/formatters.js';

export function getAllOrders(_req: Request, res: Response) {
  const orders = memoryStore.getOrders();
  res.json({
    success: true,
    count: orders.length,
    data: orders
  });
}

export function createOrder(req: Request, res: Response) {
  try {
    const {
      customerName,
      customerEmail,
      phone,
      companyName,
      gstNumber,
      items,
      couponCode,
      paymentMethod,
      shippingAddress
    } = req.body;

    let subtotal = 0;
    const orderItems: OrderItem[] = (items || []).map((item: { productId?: string; id?: string; quantity: number; product?: any }) => {
      const prodId = item.productId || item.id || item.product?.id;
      const product = memoryStore.getProductById(prodId) || item.product;
      if (!product) {
        throw new Error(`Product not found with ID ${prodId}`);
      }

      const qty = Number(item.quantity) || 1;
      const price = qty >= 4 ? (product.bulkPrice || product.price) : product.price;
      subtotal += price * qty;

      // Update inventory
      memoryStore.updateProductStock(product.id, (product.stock || 0) - qty);

      return { product, quantity: qty };
    });

    let discount = 0;
    if (couponCode) {
      const coupon = memoryStore.getCouponByCode(couponCode);
      if (coupon && subtotal >= coupon.minOrderValue) {
        discount = Math.min((subtotal * coupon.discountPercent) / 100, coupon.maxDiscount);
      }
    }

    const discountedSubtotal = subtotal - discount;
    const totalAmount = Math.round(discountedSubtotal);
    const gstAmount = Math.round((totalAmount - totalAmount / 1.18) * 100) / 100;

    const orderNumber = generateOrderNumber();
    const trackingNumber = generateTrackingNumber();

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      customerName,
      customerEmail: customerEmail || 'customer@magadhtyres.com',
      phone,
      companyName,
      gstNumber,
      items: orderItems,
      subtotal,
      discount,
      gstAmount,
      totalAmount,
      paymentMethod: paymentMethod || 'UPI',
      paymentStatus: 'Paid',
      orderStatus: 'Confirmed',
      shippingAddress: shippingAddress || {
        street: 'Main Road',
        city: 'Patna',
        state: 'Bihar',
        pincode: '800001'
      },
      trackingNumber,
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
      timeline: [
        { status: 'Order Placed', time: 'Just Now', done: true, location: 'Magadh Customer Portal' },
        { status: 'Confirmed', time: 'Just Now', done: true, location: 'Magadh Payment System' },
        { status: 'Warehouse Processing', time: 'Pending', done: false, location: 'Patna Central Hub' },
        { status: 'Dispatched', time: 'Pending', done: false },
        { status: 'Out for Delivery', time: 'Pending', done: false },
        { status: 'Delivered', time: 'Pending', done: false }
      ]
    };

    const savedOrder = memoryStore.createOrder(newOrder);

    // Auto-record corresponding payment receipt
    memoryStore.recordPayment({
      id: `pay-${Date.now()}`,
      paymentId: generatePaymentId(paymentMethod || 'UPI'),
      orderId: orderNumber,
      customerName,
      amount: totalAmount,
      gstNumber,
      method: paymentMethod || 'UPI',
      status: 'Success',
      date: new Date().toISOString().replace('T', ' ').substring(0, 16)
    });

    res.json({
      success: true,
      message: 'Order created successfully',
      order: savedOrder,
      data: savedOrder
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to create order.' });
  }
}

export function trackOrders(req: Request, res: Response) {
  const { query } = req.params;
  const matches = memoryStore.searchOrders(query || '');

  if (matches.length === 0) {
    return res.status(404).json({ success: false, message: 'No matching order found.' });
  }

  res.json({ success: true, count: matches.length, data: matches });
}

export function updateOrderStatus(req: Request, res: Response) {
  const { orderId, newStatus } = req.body;
  if (!orderId || !newStatus) {
    return res.status(400).json({ success: false, message: 'orderId and newStatus are required.' });
  }

  const updated = memoryStore.updateOrderStatus(orderId, newStatus);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  res.json({
    success: true,
    message: `Order status updated to ${newStatus}`,
    order: updated,
    data: updated
  });
}
