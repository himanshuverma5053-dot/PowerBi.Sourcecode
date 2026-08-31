import { OrderInstallment } from './types/installment';
export type { OrderInstallment };

export type VehicleCategory = 'Car' | 'SUV' | 'Bike' | 'Truck' | 'EV';

export type TerrainType = 'City' | 'Highway' | 'All-Terrain' | 'Mud-Terrain' | 'Performance';

export interface ProductComponentConfig {
  id: string;
  productId: string;
  productName?: string;
  brand?: string;
  price?: number;
  quantity: number;
  isMandatory: boolean;
  defaultSelected?: boolean;
}

export interface TyreProduct {
  id: string;
  name: string;
  brand: 'MRF' | 'Apollo' | 'CEAT' | 'Michelin' | 'Bridgestone' | 'Goodyear' | 'JK Tyre' | 'Pirelli' | string;
  category: VehicleCategory;
  width: number;
  aspectRatio: number;
  rimSize: number;
  speedRating: string;
  loadIndex: number;
  price: number;
  bulkPrice: number; // For 4+ tyres / Dealer Price
  stock: number;
  image: string;
  terrain: TerrainType;
  warrantyYears: number;
  fuelEfficiency: 'A' | 'B' | 'C' | 'D';
  wetGrip: 'A' | 'B' | 'C' | 'D';
  noiseDb: number;
  description: string;
  compatibleVehicles: string[];
  featured?: boolean;
  evReady?: boolean;
  hsnCode: string;

  // Dedicated Product Management fields
  sku?: string;
  productCode?: string;
  pattern?: string;
  mrp?: number;
  dealerPrice?: number;
  gstRate?: number; // default 18%
  minStockLevel?: number; // default 5
  images?: string[];
  status?: 'Active' | 'Inactive' | 'Archived';
  tags?: string[];
  components?: ProductComponentConfig[];
  includedComponents?: string;
  tireType?: 'Radial' | 'Non-Radial';
  tire_type?: 'Radial' | 'Non-Radial';
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: TyreProduct;
  quantity: number;
  parentProductId?: string;
  parentProductName?: string;
  isComponent?: boolean;
}

export function getCartItemPrices(item: CartItem) {
  const basePrice = (item.quantity >= 4 && item.product.bulkPrice) ? item.product.bulkPrice : item.product.price;
  const bundleUnitPrice = basePrice;
  const itemSubtotal = bundleUnitPrice * item.quantity;
  return {
    basePrice,
    componentsPriceSum: 0,
    bundleUnitPrice,
    itemSubtotal
  };
}

export interface OrderTimeline {
  status: 'Order Placed' | 'Confirmed' | 'Warehouse Processing' | 'Dispatched' | 'Out for Delivery' | 'Delivered';
  time: string;
  location?: string;
  done: boolean;
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
  items: CartItem[];
  subtotal: number;
  discount: number;
  gstAmount: number; // 18% included GST for tyres
  totalAmount: number;
  paymentMethod: 'UPI' | 'Card' | 'NetBanking' | 'EMI' | 'Pay on Delivery';
  paymentStatus: 'Paid' | 'Pending' | 'Failed' | 'Refunded';
  orderStatus: 'Order Placed' | 'Confirmed' | 'Warehouse Processing' | 'Dispatched' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  trackingNumber: string;
  estimatedDelivery: string;
  timeline: OrderTimeline[];
  paidAmount?: number;
  refundAmount?: number;
  installments?: OrderInstallment[];
  isCreditOrder?: boolean;
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
  code: string;
  discountPercent: number;
  maxDiscount: number;
  minOrderValue: number;
  active: boolean;
}

export interface Review {
  id: string;
  userName: string;
  vehicle: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
  tyreName: string;
}

export interface UserProfile {
  uid?: string;
  email: string;
  customerName: string;
  companyName?: string;
  phone?: string;
  gstNumber?: string;
  deliveryLocation?: string;
  address?: string | {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  role?: 'customer' | 'admin';
  createdAt?: string;
}

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  orderId: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  companyName?: string;
  gstNumber?: string;
  date: string;
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
  items: CartItem[];
  tallySyncStatus: 'Pending' | 'Synced' | 'Error';
  tallyVoucherNumber?: string;
}

export type CustomerPricingType = 'gst' | 'credit' | 'custom';

export interface CustomerProductOverride {
  productId: string;
  customPrice?: number;
  discountPercent?: number;
  discountFlat?: number;
  isExcluded?: boolean;
}

export interface CustomerAccount {
  id: string;
  username: string;
  customerName?: string;
  companyName: string;
  email: string;
  phone: string;
  gstNumber: string;
  gstType?: 'Regular' | 'Composition' | 'Unregistered';
  billingState?: string;
  deliveryLocation: string;
  address: string;
  accountStatus: 'Active' | 'Suspended' | 'VIP' | 'Pending';
  pricingType: CustomerPricingType;
  overallDiscountPercent?: number;
  productVisibilityMode?: 'all' | 'selected';
  allowedProductIds?: string[];
  productOverrides?: Record<string, CustomerProductOverride>;
  creditEnabled: boolean;
  creditLimit: number;
  usedCredit?: number;
  paymentTermsDays: number;
  dueDaysGrace?: number;
  createdAt: string;
  updatedAt?: string;
}

export type RequestType =
  | 'Complaint Request'
  | 'Warranty Claim'
  | 'Damaged / Quality Issue'
  | 'Missing Item / Dispatch Issue'
  | 'Billing / GST Issue'
  | 'General Inquiries';

export type RequestStatus =
  | 'Pending Review'
  | 'In Progress'
  | 'Technician Assigned'
  | 'Approved'
  | 'Resolved'
  | 'Rejected';

export interface RequestTimelineEvent {
  id: string;
  timestamp: string;
  author: string;
  role: 'Customer' | 'Support Executive' | 'Warehouse Manager' | 'Quality Engineer' | 'System';
  message: string;
  statusChange?: RequestStatus;
}

export interface ComplaintRequest {
  id: string;
  requestNumber: string;
  type: RequestType;
  title: string;
  description: string;
  category: string;
  orderNumber?: string;
  invoiceNumber?: string;
  productName?: string;
  tyreBrand?: string;
  tyreSize?: string;
  quantity?: number;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  companyName?: string;
  assignedTo?: string;
  resolutionSummary?: string;
  timeline: RequestTimelineEvent[];
}


