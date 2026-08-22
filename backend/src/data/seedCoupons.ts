import { Coupon } from '../types/index.js';

export const SEED_COUPONS: Coupon[] = [
  {
    id: 'coup-magadh10',
    code: 'MAGADH10',
    discountPercent: 10,
    maxDiscount: 5000,
    minOrderValue: 20000,
    active: true,
    description: '10% instant discount on bulk commercial orders above ₹20,000'
  },
  {
    id: 'coup-fleet5',
    code: 'FLEET5',
    discountPercent: 5,
    maxDiscount: 10000,
    minOrderValue: 50000,
    active: true,
    description: '5% fleet discount for logistics and transporter partners'
  }
];
