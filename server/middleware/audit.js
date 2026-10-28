// server/middleware/audit.js
const db = require('../config/db');

async function logAudit(adminId, action, targetType, targetId = null, details = '', ip = '127.0.0.1') {
  try {
    await db.execute(
      `INSERT INTO audit_logs (admin_id, action, target_type, target_id, details, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [adminId, action, targetType, targetId, details, ip]
    );
  } catch (err) {
    console.error('[Audit Log Error]', err.message);
  }
}

module.exports = { logAudit };

