import { Request, Response } from 'express';
import { ADMIN_EMAILS } from '../middlewares/authMiddleware.js';

export function handleSignIn(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'A valid email address is required.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const isAdmin = ADMIN_EMAILS.includes(cleanEmail);
  const username = cleanEmail.split('@')[0];

  const user = {
    id: `usr_${Date.now()}`,
    email: cleanEmail,
    name: username,
    username,
    role: isAdmin ? 'admin' : 'customer'
  };

  const session = {
    accessToken: `jwt_token_${Date.now()}`,
    idToken: `id_token_${Date.now()}`
  };

  res.json({
    success: true,
    message: `Signed in successfully as ${username}`,
    data: { user, session }
  });
}

export function handlePasswordReset(req: Request, res: Response) {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Valid email required for password reset.' });
  }
  res.json({
    success: true,
    message: `Password reset instructions dispatched to ${email}`
  });
}

export function handleResendVerification(req: Request, res: Response) {
  const { email } = req.body;
  res.json({
    success: true,
    message: `Verification link resent to ${email || 'registered address'}`
  });
}
