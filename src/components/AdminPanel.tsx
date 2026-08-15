import React from 'react';
import { TyreProduct, Order, PaymentRecord, Coupon, CustomerAccount } from '../types';

interface AdminPanelProps {
  products?: TyreProduct[];
  isProductsLoading?: boolean;
  orders?: Order[];
  payments?: PaymentRecord[];
  coupons?: Coupon[];
  customerAccounts?: CustomerAccount[];
  onUpdateCustomerAccounts?: (accounts: CustomerAccount[]) => void;
  onAddOrUpdateProduct?: (product: Partial<TyreProduct>) => void;
  onDeleteProduct?: (productId: string) => void;
  onArchiveProduct?: (productId: string, newStatus?: 'Active' | 'Inactive' | 'Archived') => void;
  onUpdateOrderStatus?: (orderId: string, newStatus: Order['orderStatus']) => void;
  onViewInvoice?: (order: Order) => void;
  showToast?: (msg: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = () => {
  return null;
};
