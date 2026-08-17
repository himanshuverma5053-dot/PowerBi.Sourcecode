export interface OrderInstallment {
  id: string;
  installmentNumber: number;
  totalInstallments: number;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: 'Pending' | 'Paid' | 'Partially Paid' | 'Overdue';
  paidAt?: string;
  isLate?: boolean;
}
