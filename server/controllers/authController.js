// server/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'saveplate_super_secret_jwt_key_2026_food_waste_reduction_system';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

exports.register = async (req, res) => {
  try {
    const { email, password, fullName, role, phone, organizationName, accountType, address, city, postalCode, bio } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ success: false, message: 'Email, password, and full name are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    // Role security check: Public registration CANNOT register as admin
    const allowedRoles = ['donor', 'recipient', 'ngo', 'volunteer'];
    const assignedRole = allowedRoles.includes(role) ? role : 'recipient';

    // Check if email already exists
    const existing = await db.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const userResult = await db.execute(
      'INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, ?, "active")',
      [email.trim().toLowerCase(), passwordHash, assignedRole]
    );
    const userId = userResult.insertId;

    // Insert user profile
    await db.execute(
      `INSERT INTO user_profiles (user_id, full_name, phone, organization_name, account_type, address, city, postal_code, bio)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        fullName.trim(),
        phone || null,
        organizationName || null,
        accountType || 'individual',
        address || null,
        city || null,
        postalCode || null,
        bio || null
      ]
    );

    // If registered as NGO or business donor with organization name, create organization record
    if ((assignedRole === 'ngo' || accountType === 'business_donor') && organizationName) {
      await db.execute(
        `INSERT INTO organizations (user_id, org_name, org_type, contact_person, contact_email, contact_phone, is_verified, verification_status)
         VALUES (?, ?, ?, ?, ?, ?, 0, 'pending')`,
        [userId, organizationName, assignedRole === 'ngo' ? 'ngo' : 'restaurant', fullName, email, phone || null]
      );
    }

    // Generate token
    const token = jwt.sign({ id: userId, email, role: assignedRole }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: userId,
        email: email.trim().toLowerCase(),
        role: assignedRole,
        fullName: fullName.trim(),
        organizationName: organizationName || null
      }
    });
  } catch (err) {
    console.error('[Registration Error]', err);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const users = await db.query(
      `SELECT u.id, u.email, u.password_hash, u.role, u.status,
              p.full_name, p.phone, p.organization_name, p.avatar_url, p.city
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE u.email = ?`,
      [email.trim().toLowerCase()]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = users[0];

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'This account has been suspended by an administrator.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        fullName: user.full_name,
        phone: user.phone,
        organizationName: user.organization_name,
        avatarUrl: user.avatar_url,
        city: user.city
      }
    });
  } catch (err) {
    console.error('[Login Error]', err);
    return res.status(500).json({ success: false, message: 'Server error during authentication.' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const users = await db.query(
      `SELECT u.id, u.email, u.role, u.status, u.created_at,
              p.full_name, p.phone, p.organization_name, p.account_type, p.avatar_url, p.address, p.city, p.postal_code, p.bio
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = users[0];

    // Get unread notifications count
    const notifs = await db.query(
      'SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = ? AND is_read = 0',
      [user.id]
    );

    return res.json({
      success: true,
      user: {
        ...user,
        unreadNotifications: notifs[0]?.unread_count || 0
      }
    });
  } catch (err) {
    console.error('[GetMe Error]', err);
    return res.status(500).json({ success: false, message: 'Server error fetching user profile.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { fullName, phone, organizationName, address, city, postalCode, bio, avatarUrl } = req.body;

    await db.execute(
      `UPDATE user_profiles
       SET full_name = COALESCE(?, full_name),
           phone = COALESCE(?, phone),
           organization_name = COALESCE(?, organization_name),
           address = COALESCE(?, address),
           city = COALESCE(?, city),
           postal_code = COALESCE(?, postal_code),
           bio = COALESCE(?, bio),
           avatar_url = COALESCE(?, avatar_url),
           updated_at = datetime('now')
       WHERE user_id = ?`,
      [fullName, phone, organizationName, address, city, postalCode, bio, avatarUrl, req.user.id]
    );

    return res.json({ success: true, message: 'Profile updated successfully.' });
  } catch (err) {
    console.error('[UpdateProfile Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

