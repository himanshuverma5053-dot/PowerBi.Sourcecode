export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `MT-${year}-${rand}`;
}

export function generateTrackingNumber(): string {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `MGT-EXPRESS-${rand}`;
}

export function generatePaymentId(method: string = 'UPI'): string {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `PAY-${method.toUpperCase().replace(/[^A-Z]/g, '')}-${rand}`;
}
