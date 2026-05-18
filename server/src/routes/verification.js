const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { body } = require('express-validator');
const prisma = require('../lib/prisma');
const { hashString } = require('../utils/hashString');
const { validateInput } = require('../middleware/validateInput');
const { otpLimiter } = require('../middleware/rateLimiter');


const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

const IDENTICAL_RESPONSE = {
  success: true,
  message: 'If this is a valid university email address, a verification ' +
    'code has been sent. Please check your inbox and spam folder.'
};

// POST /api/verification/request-otp
router.post('/request-otp',
  otpLimiter,
  [body('email').isEmail().normalizeEmail()],
  validateInput,
  async (req, res, next) => {
    try {
      const { email } = req.body;

      // Validate university email pattern
      const pattern = new RegExp(
        process.env.UNIVERSITY_EMAIL_PATTERN ||
        '^[^\\s@]+@[a-zA-Z0-9.-]+\\.edu(\\.[a-z]{2})?$'
      );

      if (!pattern.test(email)) {
        // Return SAME response to prevent enumeration
        return res.status(200).json(IDENTICAL_RESPONSE);
      }

      const otp = crypto.randomInt(100000, 999999).toString();
      const otpHash = hashString(otp);
      const emailHash = hashString(email.toLowerCase());
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Remove any existing unused OTPs for this email
      await prisma.pendingOTP.deleteMany({
        where: { email_hash: emailHash, is_used: false }
      });

      await prisma.pendingOTP.create({
        data: { email_hash: emailHash, otp_hash: otpHash, expires_at: expiresAt }
      });

      // Send OTP — this is the ONLY use of plain email
      try {
        await transporter.sendMail({
          from: '"ASIRS Verification" <noreply@institution.edu>',
          to: email,
          subject: 'Your Anonymous Report Verification Code',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; 
              margin: 0 auto; padding: 20px;">
              <h2 style="color: #1a365d;">Verification Code</h2>
              <p>Your one-time verification code is:</p>
              <div style="font-size: 32px; font-family: monospace; 
                letter-spacing: 8px; color: #2b6cb0; font-weight: bold; 
                padding: 15px; background: #ebf8ff; text-align: center; 
                border-radius: 8px; margin: 20px 0;">
                ${otp}
              </div>
              <p>This code expires in 10 minutes and can only be used once.</p>
              <p style="color: #718096; font-size: 12px; margin-top: 20px;">
                This code verifies only that you are a registered student. 
                It does not reveal your identity to the reporting system 
                or to any institutional administrator.
              </p>
            </div>
          `
        });
      } catch (emailError) {
        console.error('[Verification] Email send failed:', emailError.message);
        // Still return success — prevents revealing if email is valid
      }

      return res.status(200).json(IDENTICAL_RESPONSE);

    } catch (error) {
      // Always return same response — prevents enumeration
      return res.status(200).json(IDENTICAL_RESPONSE);
    }
  }
);

// POST /api/verification/verify-otp
router.post('/verify-otp',
  [
    body('email').isEmail().normalizeEmail(),
    body('otp').isLength({ min: 6, max: 6 }).isNumeric()
  ],
  validateInput,
  async (req, res, next) => {
    try {
      const { email, otp } = req.body;
      const emailHash = hashString(email.toLowerCase());
      const otpHash = hashString(otp);

      const record = await prisma.pendingOTP.findFirst({
        where: {
          email_hash: emailHash,
          is_used: false,
          expires_at: { gt: new Date() }
        }
      });

      if (!record || record.otp_hash !== otpHash) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired verification code. ' +
            'Please request a new one.'
        });
      }

      // Mark OTP as used
      await prisma.pendingOTP.update({
        where: { id: record.id },
        data: { is_used: true }
      });

      // Generate one-time verification token
      const plainToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = hashString(plainToken);

      await prisma.verificationToken.create({
        data: {
          token_hash: tokenHash,
          email_hash: emailHash, // For one-per-email enforcement only
          expires_at: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
        }
      });

      return res.status(200).json({
        success: true,
        token: plainToken, // Shown ONCE — never retrievable again
        message: 'Verification successful. Copy your token now — ' +
          'it expires in 30 minutes and cannot be shown again. ' +
          'Paste it into the optional verification field when submitting your report.'
      });

    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
