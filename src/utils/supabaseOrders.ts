import { supabase } from '../supabaseClient';
import { Order } from '../types';

/**
 * Normalizes a row returned from Supabase into a strongly-typed Order object.
 */
function normalizeOrderRow(row: any): Order {
  // If the row stores a raw JSON payload under 'payload', 'data', or 'details', prefer that
  if (row.payload && typeof row.payload === 'object' && row.payload.id) {
    return row.payload as Order;
  }
  if (row.data && typeof row.data === 'object' && row.data.id) {
    return row.data as Order;
  }

  // Parse items if stored as JSON string
  let items = row.items;
  if (typeof items === 'string') {
    try {
      items = JSON.parse(items);
    } catch (e) {
      items = [];
    }
  }

  // Parse shippingAddress if stored as JSON string
  let shippingAddress = row.shipping_address || row.shippingAddress;
  if (typeof shippingAddress === 'string') {
    try {
      shippingAddress = JSON.parse(shippingAddress);
    } catch (e) {
      shippingAddress = { street: '', city: '', state: '', pincode: '' };
    }
  }

  // Parse timeline if stored as JSON string
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
 * Fetch all orders from Supabase order database.
 */
export async function fetchOrdersFromSupabase(): Promise<Order[]> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.warn('Supabase fetch orders error (falling back to local state):', error.message || error);
      return [];
    }

    if (Array.isArray(data) && data.length > 0) {
      return data.map(normalizeOrderRow);
    }
  } catch (err) {
    console.warn('Error connecting to Supabase orders table:', err);
  }
  return [];
}

/**
 * Save an order to Supabase order database.
 * Supports flexible table structures (snake_case, camelCase, or JSON payload).
 */
export async function saveOrderToSupabase(order: Order): Promise<{ success: boolean; data?: any; error?: any }> {
  const nameParts = (order.customerName || '').trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  const streetAddress = typeof order.shippingAddress === 'object' && order.shippingAddress
    ? [order.shippingAddress.street, order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.pincode].filter(Boolean).join(', ')
    : (typeof order.shippingAddress === 'string' ? order.shippingAddress : '');
  const productName = Array.isArray(order.items)
    ? order.items.map(item => `${item.product?.name || item.product?.brand || (item as any).name || 'Tyre'} (x${item.quantity})`).join(', ')
    : '';

  const payload = {
    // Standard and requested form field mappings
    id: order.id,
    order_number: order.orderNumber,
    orderNumber: order.orderNumber,
    date: order.date,
    created_at: order.date || new Date().toISOString(),
    customer_name: order.customerName,
    customerName: order.customerName,
    first_name: firstName,
    firstName: firstName,
    last_name: lastName,
    lastName: lastName,
    customer_email: order.customerEmail,
    customerEmail: order.customerEmail,
    email: order.customerEmail,
    phone: order.phone,
    company_name: order.companyName || null,
    companyName: order.companyName || null,
    gst_number: order.gstNumber || null,
    gstNumber: order.gstNumber || null,
    street_address: streetAddress,
    streetAddress: streetAddress,
    product_name: productName,
    productName: productName,
    items: order.items,
    subtotal: order.subtotal,
    discount: order.discount,
    gst_amount: order.gstAmount,
    gstAmount: order.gstAmount,
    total_amount: order.totalAmount,
    totalAmount: order.totalAmount,
    payment_method: order.paymentMethod,
    paymentMethod: order.paymentMethod,
    payment_status: order.paymentStatus,
    paymentStatus: order.paymentStatus,
    order_status: order.orderStatus,
    orderStatus: order.orderStatus,
    shipping_address: order.shippingAddress,
    shippingAddress: order.shippingAddress,
    tracking_number: order.trackingNumber,
    trackingNumber: order.trackingNumber,
    estimated_delivery: order.estimatedDelivery,
    estimatedDelivery: order.estimatedDelivery,
    timeline: order.timeline,
    payload: order,
    data: order
  };

  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([payload]);

    if (error) {
      console.warn('First insert attempt error, retrying with minimalist schema...', error.message);
      
      // Attempt fallback insert with strictly standard columns
      const fallbackPayload = {
        id: order.id,
        order_number: order.orderNumber,
        customer_name: order.customerName,
        first_name: firstName,
        last_name: lastName,
        customer_email: order.customerEmail,
        email: order.customerEmail,
        phone: order.phone,
        company_name: order.companyName,
        gst_number: order.gstNumber,
        street_address: streetAddress,
        product_name: productName,
        items: JSON.stringify(order.items),
        subtotal: order.subtotal,
        discount: order.discount,
        gst_amount: order.gstAmount,
        total_amount: order.totalAmount,
        payment_method: order.paymentMethod,
        payment_status: order.paymentStatus,
        order_status: order.orderStatus,
        shipping_address: JSON.stringify(order.shippingAddress),
        tracking_number: order.trackingNumber,
        estimated_delivery: order.estimatedDelivery,
        timeline: JSON.stringify(order.timeline)
      };

      const fallbackResult = await supabase
        .from('orders')
        .insert([fallbackPayload]);

      if (fallbackResult.error) {
        console.error('Failed to save order to Supabase:', fallbackResult.error);
        return { success: false, error: fallbackResult.error };
      }
      return { success: true, data: fallbackResult.data };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Exception saving order to Supabase:', err);
    return { success: false, error: err };
  }
}

/**
 * Update an order's status or payment status in Supabase.
 */
export async function updateOrderStatusInSupabase(
  orderId: string,
  orderStatus: Order['orderStatus'],
  paymentStatus?: Order['paymentStatus']
): Promise<{ success: boolean; data?: any; error?: any }> {
  try {
    const updatePayload: any = {
      order_status: orderStatus,
      orderStatus: orderStatus,
      updated_at: new Date().toISOString()
    };

    if (paymentStatus) {
      updatePayload.payment_status = paymentStatus;
      updatePayload.paymentStatus = paymentStatus;
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', orderId);

    if (error) {
      // Fallback attempt with snake_case only
      const fallbackPayload: any = { order_status: orderStatus };
      if (paymentStatus) fallbackPayload.payment_status = paymentStatus;

      const fallbackRes = await supabase
        .from('orders')
        .update(fallbackPayload)
        .eq('id', orderId);

      if (fallbackRes.error) {
        console.error('Error updating order status in Supabase:', fallbackRes.error);
        return { success: false, error: fallbackRes.error };
      }
    }

    return { success: true, data };
  } catch (err) {
    console.error('Exception updating order status in Supabase:', err);
    return { success: false, error: err };
  }
}
