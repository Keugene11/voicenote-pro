import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Resend } from 'resend';
import { generateToken, authenticateToken, AuthRequest } from '../middleware/auth';
import { findUserByEmail, findUserById, createUser } from '../services/database';

const router = Router();

// Initialize Resend (set RESEND_API_KEY in .env)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// OTP store (in-memory is fine for OTPs as they're short-lived)
const otpStore: Map<string, { otp: string; expiresAt: Date }> = new Map();

/**
 * POST /auth/firebase
 * Exchange Firebase ID token for local JWT
 */
router.post('/firebase', async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      res.status(400).json({ error: 'Firebase ID token required' });
      return;
    }

    // Decode Firebase token (base64 decode the payload)
    // In production, use firebase-admin to properly verify
    const parts = idToken.split('.');
    if (parts.length !== 3) {
      res.status(400).json({ error: 'Invalid token format' });
      return;
    }

    let payload;
    try {
      const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
    } catch (e) {
      res.status(400).json({ error: 'Failed to decode token' });
      return;
    }

    const email = payload.email;
    const firebaseUid = payload.user_id || payload.sub;
    const displayName = payload.name || email?.split('@')[0];

    if (!email) {
      res.status(400).json({ error: 'Email not found in token' });
      return;
    }

    // Find or create user in DATABASE
    let user = await findUserByEmail(email);

    if (!user) {
      user = await createUser({
        id: firebaseUid || uuidv4(),
        email,
        displayName,
      });
      console.log('Created new user from Firebase:', email);
    }

    // Generate local JWT
    const token = generateToken(user.id, user.email);

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        subscriptionTier: user.subscription_tier,
        monthlyUsage: user.monthly_usage,
        createdAt: user.created_at,
      },
      token,
    });
  } catch (error) {
    console.error('Firebase auth error:', error);
    res.status(500).json({ error: 'Failed to authenticate with Firebase' });
  }
});

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

    // Log OTP for debugging
    console.log(`OTP for ${email}: ${otp}`);

    // Send email if Resend is configured
    if (resend) {
      try {
        await resend.emails.send({
          from: 'VoiceNote Pro <onboarding@resend.dev>',
          to: email,
          subject: 'Your VoiceNote Pro Login Code',
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #0F172A; margin-bottom: 20px;">Your Login Code</h2>
              <p style="color: #64748B; margin-bottom: 20px;">Enter this code to sign in to VoiceNote Pro:</p>
              <div style="background: #0F172A; color: #00BFA6; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 12px; letter-spacing: 8px;">
                ${otp}
              </div>
              <p style="color: #94A3B8; font-size: 14px; margin-top: 20px;">This code expires in 10 minutes. If you didn't request this code, you can safely ignore this email.</p>
            </div>
          `,
        });
        console.log(`Email sent to ${email}`);
      } catch (emailError) {
        console.error('Email send error:', emailError);
        // Continue even if email fails in development
      }
    }

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

    // Find or create user in DATABASE
    let user = await findUserByEmail(email);

    if (!user) {
      user = await createUser({
        id: uuidv4(),
        email,
        displayName: email.split('@')[0],
      });
    }

    // Generate token
    const token = generateToken(user.id, user.email);

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        subscriptionTier: user.subscription_tier,
        monthlyUsage: user.monthly_usage,
        createdAt: user.created_at,
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
    const user = await findUserById(req.userId!);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        subscriptionTier: user.subscription_tier,
        monthlyUsage: user.monthly_usage,
        createdAt: user.created_at,
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
