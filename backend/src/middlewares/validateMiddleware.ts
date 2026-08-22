import { Request, Response, NextFunction } from 'express';

export function validateOrderInput(req: Request, res: Response, next: NextFunction) {
  const { customerName, phone, items } = req.body;

  if (!customerName || typeof customerName !== 'string' || customerName.trim() === '') {
    return res.status(400).json({ success: false, message: 'Customer name is required.' });
  }

  if (!phone || typeof phone !== 'string' || phone.trim() === '') {
    return res.status(400).json({ success: false, message: 'Contact phone number is required.' });
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Order must contain at least one item.' });
  }

  next();
}

export function validateProductInput(req: Request, res: Response, next: NextFunction) {
  const { name, brand, width, aspectRatio, rimSize } = req.body;

  if (!name || !brand || width === undefined || aspectRatio === undefined || rimSize === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Product name, brand, width, aspect ratio, and rim size are required.'
    });
  }

  next();
}
