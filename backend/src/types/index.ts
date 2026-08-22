export type TyreCategory = 'Car' | 'SUV' | 'Bike' | 'Truck' | 'Bus' | 'Tractor' | 'OTR' | 'EV';
export type TyreBrand = 'Apollo' | 'MRF' | 'CEAT' | 'Bridgestone' | 'Michelin' | 'Goodyear' | 'JK Tyre' | 'Yokohama' | 'Continental' | 'BKT' | 'Pirelli';
export type TyreTerrain = 'Highway' | 'All-Terrain' | 'Mud-Terrain' | 'City' | 'Performance' | 'Commercial' | 'Off-Road';
export type TireType = 'Radial' | 'Non-Radial';

export interface TyreProduct {
  id: string;
  name: string;
  brand: TyreBrand | string;
  category: TyreCategory | string;
  width: number;
  aspectRatio: number;
  rimSize: number;
  speedRating: string;
  loadIndex: number;
  price: number;
  bulkPrice: number;
  mrp?: number;
  dealerPrice?: number;
  stock: number;
  minStockLevel?: number;
  gstRate?: number;
  image: string;
  images?: string[];
  terrain: TyreTerrain | string;
  warrantyYears: number;
  fuelEfficiency: 'A' | 'B' | 'C' | 'D' | 'E';
  wetGrip: 'A' | 'B' | 'C' | 'D' | 'E';
  noiseDb: number;
  description: string;
  compatibleVehicles: string[];
  featured: boolean;
  evReady: boolean;
  hsnCode?: string;
  sku?: string;
  productCode?: string;
  pattern?: string;
  status?: 'Active' | 'Inactive' | 'Draft';
  tags?: string[];
  components?: string[];
  includedComponents?: string;
  tireType?: TireType;
  tire_type?: TireType;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  product: TyreProduct;
  quantity: number;
}

export interface OrderTimeline {
  status: 'Order Placed' | 'Confirmed' | 'Warehouse Processing' | 'Dispatched' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  time: string;
  done: boolean;
  location?: string;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  userId?: string;
  orderNumber: string;
  date: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  companyName?: string;
  gstNumber?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  gstAmount: number;
  totalAmount: number;
  paymentMethod: 'UPI' | 'NEFT/RTGS' | 'Credit Card' | 'Cheque' | 'Credit Line (30 Days)' | 'Cash on Delivery';
  paymentStatus: 'Paid' | 'Pending' | 'Credit' | 'Failed';
  orderStatus: 'Confirmed' | 'Dispatched' | 'Delivered' | 'Cancelled' | 'Order Placed' | 'Warehouse Processing' | 'Out for Delivery';
  shippingAddress: ShippingAddress;
  trackingNumber: string;
  estimatedDelivery: string;
  timeline: OrderTimeline[];
}

export interface PaymentRecord {
  id: string;
  paymentId: string;
  orderId: string;
  customerName: string;
  amount: number;
  gstNumber?: string;
  method: string;
  status: 'Success' | 'Pending' | 'Failed';
  date: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  maxDiscount: number;
  minOrderValue: number;
  active: boolean;
  description: string;
  validUntil?: string;
}

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'customer' | 'dealer' | 'admin';
  companyName?: string;
  gstNumber?: string;
  creditLimit?: number;
  creditUsed?: number;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  error?: string;
}
