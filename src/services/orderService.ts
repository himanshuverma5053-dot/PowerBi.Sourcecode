import { Order } from '../types';
import { safeGetLocalStorage, safeSetLocalStorage } from '../utils/storage';

/**
 * Normalizes an order record into a strongly-typed Order object.
 */
export function normalizeOrderRow(row: any): Order {
  if (row.payload && typeof row.payload === 'object' && row.payload.id) {
    return row.payload as Order;
  }
  if (row.data && typeof row.data === 'object' && row.data.id) {
    return row.data as Order;
  }

  let items = row.items;
  if (typeof items === 'string') {
    try {
      items = JSON.parse(items);
    } catch (e) {
      items = [];
    }
  }

  let shippingAddress = row.shipping_address || row.shippingAddress;
  if (typeof shippingAddress === 'string') {
    try {
      shippingAddress = JSON.parse(shippingAddress);
    } catch (e) {
      shippingAddress = { street: '', city: '', state: '', pincode: '' };
    }
  }

  let timeline = row.timeline;
  if (typeof timeline === 'string') {
    try {
      timeline = JSON.parse(timeline);
    } catch (e) {
      timeline = [];
    }
  }

  return {
    id: row.id || `ord-${Date.now()}`,
    userId: row.user_id || row.userId || undefined,
    orderNumber: row.order_number || row.orderNumber || `MT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    date: row.date || row.created_at || new Date().toISOString(),
    customerName: row.customer_name || row.customerName || 'Valued Customer',
    customerEmail: row.customer_email || row.customerEmail || 'customer@magadhtyres.com',
    phone: row.phone || '',
    companyName: row.company_name || row.companyName || undefined,
    gstNumber: row.gst_number || row.gstNumber || undefined,
    items: Array.isArray(items) ? items : [],
    subtotal: Number(row.subtotal) || 0,
    discount: Number(row.discount) || 0,
    gstAmount: Number(row.gst_amount ?? row.gstAmount ?? 0),
    totalAmount: Number(row.total_amount ?? row.totalAmount ?? 0),
    paymentMethod: row.payment_method || row.paymentMethod || 'UPI',
    paymentStatus: row.payment_status || row.paymentStatus || 'Paid',
    orderStatus: row.order_status || row.orderStatus || 'Confirmed',
    shippingAddress: shippingAddress || { street: 'Main Road', city: 'Patna', state: 'Bihar', pincode: '800001' },
    trackingNumber: row.tracking_number || row.trackingNumber || `MGT-EXPRESS-${Math.floor(100000 + Math.random() * 900000)}`,
    estimatedDelivery: row.estimated_delivery || row.estimatedDelivery || new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
    timeline: Array.isArray(timeline) ? timeline : []
  };
}

/**
 * Fetch all orders from Backend REST API (with local cache fallback)
 */
export async function fetchOrdersFromBackend(): Promise<Order[]> {
  try {
    const res = await fetch('/api/orders');
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        const normalized = json.data.map(normalizeOrderRow);
        safeSetLocalStorage('magadh_orders_db', normalized);
        return normalized;
      }
    }
  } catch (apiErr) {
    console.warn('Backend API orders fetch notice, checking local cache:', apiErr);
  }

  try {
    const orders = safeGetLocalStorage<Order[]>('magadh_orders_db', []);
    return orders.map(normalizeOrderRow);
  } catch (err) {
    console.warn('Backend orders fetch notice:', err);
    return [];
  }
}

/**
 * Save an order via Backend API
 */
export async function saveOrderToBackend(order: Order): Promise<{ success: boolean; data?: any; error?: any }> {
  try {
    const normalized = normalizeOrderRow(order);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalized)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && (json.order || json.data)) {
          const saved = normalizeOrderRow(json.order || json.data);
          const existing = safeGetLocalStorage<Order[]>('magadh_orders_db', []);
          const updated = [saved, ...existing.filter(o => o.id !== saved.id && o.orderNumber !== saved.orderNumber)];
          safeSetLocalStorage('magadh_orders_db', updated);
          return { success: true, data: saved };
        }
      }
    } catch (apiErr) {
      console.warn('API order save fallback to local:', apiErr);
    }

    const existing = safeGetLocalStorage<Order[]>('magadh_orders_db', []);
    const updated = [normalized, ...existing.filter(o => o.id !== order.id && o.orderNumber !== order.orderNumber)];
    safeSetLocalStorage('magadh_orders_db', updated);
    return { success: true, data: normalized };
  } catch (err) {
    console.error('Exception saving order to backend:', err);
    return { success: false, error: err };
  }
}

/**
 * Update an order's status or payment status via Backend API
 */
export async function updateOrderStatusInBackend(
  orderId: string,
  orderStatus: Order['orderStatus'],
  paymentStatus?: Order['paymentStatus']
): Promise<{ success: boolean; data?: any; error?: any }> {
  try {
    try {
      await fetch('/api/admin/orders/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'admin'
        },
        body: JSON.stringify({ orderId, newStatus: orderStatus })
      });
    } catch (apiErr) {
      console.warn('API status update fallback to local:', apiErr);
    }

    const existing = safeGetLocalStorage<Order[]>('magadh_orders_db', []);
    const idx = existing.findIndex(o => o.id === orderId || o.orderNumber === orderId);
    if (idx !== -1) {
      existing[idx] = {
        ...existing[idx],
        orderStatus,
        ...(paymentStatus ? { paymentStatus } : {})
      };
      safeSetLocalStorage('magadh_orders_db', existing);
    }
    return { success: true };
  } catch (err) {
    console.error('Exception updating order status in backend:', err);
    return { success: false, error: err };
  }
}
