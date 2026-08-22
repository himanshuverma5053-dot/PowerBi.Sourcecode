import { Router } from 'express';
import { handleSignIn, handlePasswordReset, handleResendVerification } from '../controllers/authController.js';

const router = Router();

router.post('/auth/signin', handleSignIn);
router.post('/auth/reset-password', handlePasswordReset);
router.post('/auth/resend-verification', handleResendVerification);

export default router;
