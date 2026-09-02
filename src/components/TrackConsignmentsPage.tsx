import React from 'react';
import { Order } from '../types';

interface TrackConsignmentsPageProps {
  orders?: Order[];
  onViewInvoice?: (order: Order) => void;
}

export const TrackConsignmentsPage: React.FC<TrackConsignmentsPageProps> = () => {
  return (
    <div className="min-h-[70vh] w-full" />
  );
};

