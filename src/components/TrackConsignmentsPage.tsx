import React from 'react';
import { OrderTracker } from './OrderTracker';
import { Order } from '../types';

interface TrackConsignmentsPageProps {
  orders?: Order[];
  onViewInvoice?: (order: Order) => void;
}

export const TrackConsignmentsPage: React.FC<TrackConsignmentsPageProps> = ({
  orders = [],
  onViewInvoice = () => {},
}) => {
  return (
    <div className="min-h-[70vh] w-full">
      <OrderTracker orders={orders} onViewInvoice={onViewInvoice} />
    </div>
  );
};

