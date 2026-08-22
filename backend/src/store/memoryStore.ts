import { TyreProduct, Order, PaymentRecord, Coupon } from '../types/index.js';
import { SEED_PRODUCTS } from '../data/seedProducts.js';
import { SEED_ORDERS } from '../data/seedOrders.js';
import { SEED_PAYMENTS } from '../data/seedPayments.js';
import { SEED_COUPONS } from '../data/seedCoupons.js';
import { syncRecordToAWS } from '../config/awsAmplify.js';

class MemoryDataStore {
  private products: TyreProduct[] = [...SEED_PRODUCTS];
  private orders: Order[] = [...SEED_ORDERS];
  private payments: PaymentRecord[] = [...SEED_PAYMENTS];
  private coupons: Coupon[] = [...SEED_COUPONS];

  // PRODUCTS
  public getProducts(filterFn?: (p: TyreProduct) => boolean): TyreProduct[] {
    if (filterFn) return this.products.filter(filterFn);
    return [...this.products];
  }

  public getProductById(id: string): TyreProduct | undefined {
    return this.products.find(p => p.id === id || p.sku === id);
  }

  public upsertProduct(product: TyreProduct): TyreProduct {
    const idx = this.products.findIndex(p => p.id === product.id || p.sku === product.sku);
    if (idx !== -1) {
      this.products[idx] = { ...this.products[idx], ...product, updatedAt: new Date().toISOString() };
      syncRecordToAWS('Products', 'UPDATE', this.products[idx]);
      return this.products[idx];
    } else {
      const newProd = {
        ...product,
        id: product.id || `tyre-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.products.unshift(newProd);
      syncRecordToAWS('Products', 'CREATE', newProd);
      return newProd;
    }
  }

  public deleteProduct(id: string): boolean {
    const initialLen = this.products.length;
    this.products = this.products.filter(p => p.id !== id && p.sku !== id);
    const deleted = this.products.length < initialLen;
    if (deleted) {
      syncRecordToAWS('Products', 'DELETE', { id });
    }
    return deleted;
  }

  public updateProductStock(id: string, newStock: number): boolean {
    const prod = this.getProductById(id);
    if (prod) {
      prod.stock = Math.max(0, newStock);
      prod.updatedAt = new Date().toISOString();
      syncRecordToAWS('Products', 'UPDATE', prod);
      return true;
    }
    return false;
  }

  // ORDERS
  public getOrders(filterFn?: (o: Order) => boolean): Order[] {
    if (filterFn) return this.orders.filter(filterFn);
    return [...this.orders];
  }

  public getOrderById(idOrNumber: string): Order | undefined {
    const query = idOrNumber.trim().toLowerCase();
    return this.orders.find(o => o.id.toLowerCase() === query || o.orderNumber.toLowerCase() === query);
  }

  public searchOrders(query: string): Order[] {
    const q = query.trim().toLowerCase().replaceAll(' ', '');
    return this.orders.filter(o =>
      o.orderNumber.toLowerCase().includes(q) ||
      o.trackingNumber.toLowerCase().includes(q) ||
      o.phone.replaceAll(' ', '').includes(q) ||
      o.customerName.toLowerCase().includes(q)
    );
  }

  public createOrder(order: Order): Order {
    this.orders.unshift(order);
    syncRecordToAWS('Orders', 'CREATE', order);
    return order;
  }

  public updateOrderStatus(idOrNumber: string, status: Order['orderStatus']): Order | null {
    const order = this.getOrderById(idOrNumber);
    if (!order) return null;

    order.orderStatus = status;
    const tIdx = order.timeline.findIndex(t => t.status === status);
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (tIdx !== -1) {
      order.timeline[tIdx].done = true;
      order.timeline[tIdx].time = nowTime;
    } else {
      order.timeline.push({
        status,
        time: nowTime,
        done: true,
        location: 'Patna Logistics Hub'
      });
    }

    syncRecordToAWS('Orders', 'UPDATE', order);
    return order;
  }

  // PAYMENTS
  public getPayments(): PaymentRecord[] {
    return [...this.payments];
  }

  public recordPayment(payment: PaymentRecord): PaymentRecord {
    this.payments.unshift(payment);
    syncRecordToAWS('Payments', 'CREATE', payment);
    return payment;
  }

  // COUPONS
  public getCoupons(): Coupon[] {
    return [...this.coupons];
  }

  public getCouponByCode(code: string): Coupon | undefined {
    return this.coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase() && c.active);
  }
}

export const memoryStore = new MemoryDataStore();
