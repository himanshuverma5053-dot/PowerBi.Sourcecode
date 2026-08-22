import { Request, Response, NextFunction } from 'express';

export const ADMIN_EMAILS = [
  'admin@magadhtyres.com',
  'himanshu.verma5053@gmail.com',
  'director@magadhtyres.com'
];

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'admin' | 'dealer' | 'customer';
  };
}

/**
 * Ensures request is from an authorized admin for management operations
 */
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const userRole = req.headers['x-user-role'];
  const userEmail = req.headers['x-user-email'];

  // Check role header or authorization
  const isAdmin = userRole === 'admin' ||
    (typeof userEmail === 'string' && ADMIN_EMAILS.includes(userEmail.toLowerCase().trim())) ||
    authHeader?.includes('admin-token');

  if (!isAdmin && process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrator credentials required for this operation.'
    });
  }

  next();
}

/**
 * Prevents admin portal from placing retail customer orders or checkout processing directly
 */
export function restrictAdminOrderCreation(req: Request, res: Response, next: NextFunction) {
  if (
    req.headers['x-admin-console'] === 'true' ||
    req.headers['x-user-role'] === 'admin' ||
    req.body?.fromAdmin === true ||
    req.body?.isAdmin === true
  ) {
    return res.status(403).json({
      success: false,
      message: 'Order & payment creation is disabled in the Admin Console. Orders must originate from the customer portal.'
    });
  }
  next();
}
