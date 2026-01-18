import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { generateToken, authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// In-memory store for demo (use database in production)
const users: Map<string, {
  id: string;
  email: string;
  displayName?: string;
  subscriptionTier: 'free' | 'premium';
  monthlyUsage: number;
  createdAt: Date;
}> = new Map();

const otpStore: Map<string, { otp: string; expiresAt: Date }> = new Map();

/**
 * POST /auth/send-otp
 * Send OTP to email for passwordless login
 */
router.post('/send-otp', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      res.status(400).json({ error: 'Valid email required' });
      return;
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP
    otpStore.set(email, { otp, expiresAt });

    // In production, send email here
    // For development, log the OTP
    console.log(`OTP for ${email}: ${otp}`);

    res.json({
      success: true,
      message: 'OTP sent to email',
      // Only include in development
      ...(process.env.NODE_ENV === 'development' && { devOtp: otp }),
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

/**
 * POST /auth/verify-otp
 * Verify OTP and login/register user
 */
router.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({ error: 'Email and OTP required' });
      return;
    }

    const storedOtp = otpStore.get(email);

    if (!storedOtp) {
      res.status(400).json({ error: 'No OTP found. Please request a new one.' });
      return;
    }

    if (new Date() > storedOtp.expiresAt) {
      otpStore.delete(email);
      res.status(400).json({ error: 'OTP expired. Please request a new one.' });
      return;
    }

    if (storedOtp.otp !== otp) {
      res.status(400).json({ error: 'Invalid OTP' });
      return;
    }

    // OTP verified, clear it
    otpStore.delete(email);

    // Find or create user
    let user = users.get(email);

    if (!user) {
      // Create new user
      user = {
        id: uuidv4(),
        email,
        displayName: email.split('@')[0],
        subscriptionTier: 'free',
        monthlyUsage: 0,
        createdAt: new Date(),
      };
      users.set(email, user);
    }

    // Generate token
    const token = generateToken(user.id, user.email);

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        subscriptionTier: user.subscriptionTier,
        monthlyUsage: user.monthlyUsage,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

/**
 * GET /auth/me
 * Get current user info
 */
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = Array.from(users.values()).find(u => u.id === req.userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        subscriptionTier: user.subscriptionTier,
        monthlyUsage: user.monthlyUsage,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

/**
 * POST /auth/logout
 * Logout (client-side token removal)
 */
router.post('/logout', (req: Request, res: Response) => {
  // In a production app with refresh tokens, you'd invalidate them here
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
