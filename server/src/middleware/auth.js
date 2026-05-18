const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');


const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.'
      });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token. Please log in again.'
      });
    }

    const admin = await prisma.adminUser.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        is_active: true
      }
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Account not found.'
      });
    }

    if (!admin.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Contact your administrator.'
      });
    }

    req.admin = admin;
    next();

  } catch (error) {
    next(error);
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.'
      });
    }

    next();
  };
};

module.exports = { requireAuth, requireRole };
