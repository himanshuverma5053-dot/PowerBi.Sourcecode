import React from 'react';
import { Order } from '../types';

interface OrderTrackerProps {
  orders?: Order[];
  initialSearchQuery?: string;
  onViewInvoice?: (order: Order) => void;
}

export const OrderTracker: React.FC<OrderTrackerProps> = () => {
  return null;
};

