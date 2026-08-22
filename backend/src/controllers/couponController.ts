import { Request, Response } from 'express';
import { memoryStore } from '../store/memoryStore.js';

export function getAllCoupons(_req: Request, res: Response) {
  const coupons = memoryStore.getCoupons();
  res.json({ success: true, count: coupons.length, data: coupons });
}

export function validateCoupon(req: Request, res: Response) {
  const { code, orderValue } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, message: 'Coupon code is required.' });
  }

  const coupon = memoryStore.getCouponByCode(code);
  if (!coupon) {
    return res.status(404).json({ success: false, message: 'Invalid or expired coupon code.' });
  }

  const value = Number(orderValue) || 0;
  if (value < coupon.minOrderValue) {
    return res.status(400).json({
      success: false,
      message: `Coupon requires minimum order value of ₹${coupon.minOrderValue.toLocaleString('en-IN')}`
    });
  }

  const discount = Math.min((value * coupon.discountPercent) / 100, coupon.maxDiscount);
  res.json({
    success: true,
    message: 'Coupon applied successfully',
    data: {
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      discountAmount: discount,
      finalAmount: value - discount
    }
  });
}
