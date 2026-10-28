// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'saveplate_super_secret_jwt_key_2026_food_waste_reduction_system';

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const users = await db.query(
      `SELECT u.id, u.email, u.role, u.status, p.full_name, p.organization_name, p.avatar_url
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE u.id = ?`,
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'User account not found.' });
    }

    const user = users[0];
    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your account has been suspended by an administrator. Please contact support.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired session token.' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Authorized roles: ${roles.join(', ')}. Current role: ${req.user.role}`
      });
    }

    next();
  };
}

const requireAdmin = requireRole('admin');

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin
};

