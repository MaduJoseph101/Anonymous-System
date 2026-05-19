const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const prisma = require('../lib/prisma');
const { validateInput } = require('../middleware/validateInput');
const { authLimiter } = require('../middleware/rateLimiter');

// POST /api/auth/login
router.post('/login',
  authLimiter,
  [
    body('email')
      .isEmail().withMessage('Valid email address required')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 }).withMessage('Password is required')
  ],
  validateInput,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const admin = await prisma.adminUser.findUnique({
        where: { email }
      });

      // CRITICAL: Return IDENTICAL error for wrong email AND wrong password
      // This prevents user enumeration; attacker cannot tell if 
      // the email exists in the system
      if (!admin || !admin.is_active) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const passwordMatch = await bcrypt.compare(password, admin.password);
      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Update last login timestamp
      await prisma.adminUser.update({
        where: { id: admin.id },
        data: { last_login: new Date() }
      });

      const token = jwt.sign(
        { id: admin.id, role: admin.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
      );

      return res.status(200).json({
        success: true,
        token,
        admin: {
          id: admin.id,
          fullName: admin.full_name,
          email: admin.email,
          role: admin.role
        }
      });

    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
