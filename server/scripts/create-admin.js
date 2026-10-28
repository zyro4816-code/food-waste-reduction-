// server/scripts/create-admin.js
// Secure administrator provisioning script
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function provisionAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@saveplate.org';
  const password = process.env.ADMIN_PASSWORD || 'Admin@SavePlate2026!';
  const fullName = process.env.ADMIN_NAME || 'Platform Administrator';

  console.log(`[Admin Setup] Provisioning administrator for: ${email}`);

  if (!password || password.length < 8) {
    console.error('[Admin Setup Error] Admin password must be at least 8 characters.');
    process.exit(1);
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  try {
    const existingUsers = await db.query('SELECT id, role, email FROM users WHERE email = ?', [email]);

    let adminId;
    if (existingUsers.length > 0) {
      const user = existingUsers[0];
      await db.execute("UPDATE users SET password_hash = ?, role = 'admin', status = 'active' WHERE id = ?", [passwordHash, user.id]);
      adminId = user.id;
      console.log(`[Admin Setup] Existing account (${email}) updated and granted administrator privileges.`);
    } else {
      const res = await db.execute(
        "INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, 'admin', 'active')",
        [email, passwordHash]
      );
      adminId = res.insertId;
      console.log(`[Admin Setup] Created new administrator user ID: ${adminId}`);
    }

    // Ensure user_profile exists
    const profiles = await db.query('SELECT id FROM user_profiles WHERE user_id = ?', [adminId]);
    if (profiles.length === 0) {
      await db.execute(
        "INSERT INTO user_profiles (user_id, full_name, account_type, organization_name, bio) VALUES (?, ?, 'admin', 'SavePlate Central', 'System Administrator')",
        [adminId, fullName]
      );
    } else {
      await db.execute('UPDATE user_profiles SET full_name = ? WHERE user_id = ?', [fullName, adminId]);
    }

    // Log the action to audit_logs
    await db.execute(
      "INSERT INTO audit_logs (admin_id, action, target_type, target_id, details, ip_address) VALUES (?, 'ADMIN_PROVISIONED', 'user', ?, 'Admin account initialized via secure CLI script', '127.0.0.1')",
      [adminId, adminId]
    );

    console.log('[Admin Setup] Success! Administrator account is ready.');
    console.log(`Email: ${email}`);
    console.log(`Password: (configured in .env)`);
    process.exit(0);
  } catch (err) {
    console.error('[Admin Setup Error]', err);
    process.exit(1);
  }
}

provisionAdmin();
