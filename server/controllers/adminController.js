// server/controllers/adminController.js
const db = require('../config/db');
const { logAudit } = require('../middleware/audit');

/**
 * A. Admin Overview Metrics
 */
exports.getOverviewMetrics = async (req, res) => {
  try {
    const [userCounts] = await db.query(`
      SELECT
        COUNT(*) as total_users,
        SUM(CASE WHEN role = 'donor' THEN 1 ELSE 0 END) as total_donors,
        SUM(CASE WHEN role = 'recipient' THEN 1 ELSE 0 END) as total_recipients,
        SUM(CASE WHEN role = 'ngo' THEN 1 ELSE 0 END) as total_ngos,
        SUM(CASE WHEN role = 'volunteer' THEN 1 ELSE 0 END) as total_volunteers,
        SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended_users
      FROM users
    `);

    const [listingCounts] = await db.query(`
      SELECT
        COUNT(*) as total_listings,
        SUM(CASE WHEN status IN ('available', 'partially_claimed') AND moderation_status = 'approved' THEN 1 ELSE 0 END) as active_listings,
        SUM(CASE WHEN moderation_status = 'pending_review' THEN 1 ELSE 0 END) as pending_listings,
        SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) as expired_listings,
        SUM(CASE WHEN status = 'fully_claimed' THEN 1 ELSE 0 END) as claimed_listings
      FROM food_listings
    `);

    const [requestCounts] = await db.query(`
      SELECT
        COUNT(*) as total_requests,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_requests,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_requests,
        SUM(CASE WHEN status = 'ready_for_pickup' THEN 1 ELSE 0 END) as ready_requests
      FROM food_requests
    `);

    const [donationCounts] = await db.query(`
      SELECT
        COUNT(*) as completed_donations,
        COALESCE(SUM(kg_rescued), 0) as total_kg_rescued,
        COALESCE(SUM(servings_rescued), 0) as total_servings_rescued
      FROM donations
      WHERE status = 'completed'
    `);

    // Recent user registrations
    const recentUsers = await db.query(`
      SELECT u.id, u.email, u.role, u.status, u.created_at, p.full_name, p.organization_name
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      ORDER BY u.created_at DESC
      LIMIT 5
    `);

    // Recent donations
    const recentDonations = await db.query(`
      SELECT d.*, l.title as listing_title,
             dp.full_name as donor_name, rp.full_name as recipient_name
      FROM donations d
      JOIN food_listings l ON d.listing_id = l.id
      JOIN users du ON d.donor_id = du.id
      LEFT JOIN user_profiles dp ON du.id = dp.user_id
      JOIN users ru ON d.recipient_id = ru.id
      LEFT JOIN user_profiles rp ON ru.id = rp.user_id
      ORDER BY d.created_at DESC
      LIMIT 5
    `);

    // Recent audit logs
    const recentAudit = await db.query(`
      SELECT a.*, p.full_name as admin_name
      FROM audit_logs a
      JOIN users u ON a.admin_id = u.id
      LEFT JOIN user_profiles p ON u.id = p.user_id
      ORDER BY a.created_at DESC
      LIMIT 6
    `);

    const kgRescued = parseFloat(donationCounts?.total_kg_rescued) || 0;
    const estCo2Saved = parseFloat((kgRescued * 2.5).toFixed(1)); // 2.5kg CO2 per kg food saved

    return res.json({
      success: true,
      metrics: {
        users: {
          total: userCounts?.total_users || 0,
          donors: userCounts?.total_donors || 0,
          recipients: userCounts?.total_recipients || 0,
          ngos: userCounts?.total_ngos || 0,
          volunteers: userCounts?.total_volunteers || 0,
          suspended: userCounts?.suspended_users || 0
        },
        listings: {
          total: listingCounts?.total_listings || 0,
          active: listingCounts?.active_listings || 0,
          pending: listingCounts?.pending_listings || 0,
          expired: listingCounts?.expired_listings || 0,
          claimed: listingCounts?.claimed_listings || 0
        },
        requests: {
          total: requestCounts?.total_requests || 0,
          pending: requestCounts?.pending_requests || 0,
          approved: requestCounts?.approved_requests || 0,
          ready: requestCounts?.ready_requests || 0
        },
        impact: {
          completedDonations: donationCounts?.completed_donations || 0,
          totalKgRescued: kgRescued,
          totalServingsRescued: parseInt(donationCounts?.total_servings_rescued) || 0,
          estimatedCo2SavedKg: estCo2Saved
        },
        recentUsers,
        recentDonations,
        recentAudit
      }
    });
  } catch (err) {
    console.error('[Admin Overview Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to calculate overview metrics.' });
  }
};

/**
 * B. User Management
 */
exports.getUsers = async (req, res) => {
  try {
    const { role, status, q } = req.query;

    let sql = `
      SELECT u.id, u.email, u.role, u.status, u.created_at,
             p.full_name, p.phone, p.organization_name, p.account_type, p.city,
             (SELECT COUNT(*) FROM food_listings WHERE donor_id = u.id) as listing_count,
             (SELECT COUNT(*) FROM food_requests WHERE recipient_id = u.id) as request_count
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE 1=1
    `;
    const params = [];

    if (role && role !== 'all') {
      sql += ' AND u.role = ?';
      params.push(role);
    }

    if (status && status !== 'all') {
      sql += ' AND u.status = ?';
      params.push(status);
    }

    if (q) {
      sql += ' AND (LOWER(u.email) LIKE ? OR LOWER(p.full_name) LIKE ? OR LOWER(p.organization_name) LIKE ?)';
      const pattern = `%${q.toLowerCase()}%`;
      params.push(pattern, pattern, pattern);
    }

    sql += ' ORDER BY u.created_at DESC';

    const users = await db.query(sql, params);
    return res.json({ success: true, count: users.length, users });
  } catch (err) {
    console.error('[Admin getUsers Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, role, fullName, organizationName, notes } = req.body;

    const users = await db.query('SELECT id, role, status, email FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const targetUser = users[0];

    // Prevent suspending self or locking out the last active admin
    if (targetUser.id === req.user.id && (status === 'suspended' || (role && role !== 'admin'))) {
      return res.status(400).json({ success: false, message: 'Security restriction: You cannot suspend or demote your own administrator account.' });
    }

    if (targetUser.role === 'admin' && status === 'suspended') {
      const adminCount = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'admin' AND status = 'active'");
      if (adminCount[0].count <= 1) {
        return res.status(400).json({ success: false, message: 'Action prohibited: Cannot suspend the last active administrator.' });
      }
    }

    if (status) {
      await db.execute('UPDATE users SET status = ?, updated_at = datetime(\'now\') WHERE id = ?', [status, id]);
    }

    if (role) {
      await db.execute('UPDATE users SET role = ?, updated_at = datetime(\'now\') WHERE id = ?', [role, id]);
    }

    if (fullName || organizationName) {
      await db.execute(
        `UPDATE user_profiles
         SET full_name = COALESCE(?, full_name),
             organization_name = COALESCE(?, organization_name),
             updated_at = datetime('now')
         WHERE user_id = ?`,
        [fullName, organizationName, id]
      );
    }

    // Log to audit trail
    await logAudit(
      req.user.id,
      'USER_ACCOUNT_UPDATED',
      'user',
      id,
      `Updated user ${targetUser.email}: status=${status || targetUser.status}, role=${role || targetUser.role}. Note: ${notes || 'Admin action'}`
    );

    return res.json({ success: true, message: 'User updated successfully.' });
  } catch (err) {
    console.error('[Admin updateUser Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to update user.' });
  }
};

/**
 * C. Food Listing Moderation & Management
 */
exports.getListings = async (req, res) => {
  try {
    const { status, moderation, category, q } = req.query;

    let sql = `
      SELECT l.*,
             c.name as category_name,
             p.full_name as donor_name, p.organization_name as donor_org,
             u.email as donor_email,
             (SELECT COUNT(*) FROM food_requests WHERE listing_id = l.id) as request_count
      FROM food_listings l
      JOIN food_categories c ON l.category_id = c.id
      JOIN users u ON l.donor_id = u.id
      JOIN user_profiles p ON u.id = p.user_id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      sql += ' AND l.status = ?';
      params.push(status);
    }

    if (moderation && moderation !== 'all') {
      sql += ' AND l.moderation_status = ?';
      params.push(moderation);
    }

    if (category && category !== 'all') {
      sql += ' AND l.category_id = ?';
      params.push(category);
    }

    if (q) {
      sql += ' AND (LOWER(l.title) LIKE ? OR LOWER(l.city) LIKE ? OR LOWER(p.organization_name) LIKE ?)';
      const pattern = `%${q.toLowerCase()}%`;
      params.push(pattern, pattern, pattern);
    }

    sql += ' ORDER BY l.created_at DESC';

    const listings = await db.query(sql, params);
    return res.json({ success: true, count: listings.length, listings });
  } catch (err) {
    console.error('[Admin getListings Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve listings.' });
  }
};

exports.moderateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const { moderation_status, moderation_notes, status } = req.body;

    const listings = await db.query('SELECT id, title, donor_id FROM food_listings WHERE id = ?', [id]);
    if (listings.length === 0) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    const listing = listings[0];

    await db.execute(
      `UPDATE food_listings
       SET moderation_status = COALESCE(?, moderation_status),
           moderation_notes = COALESCE(?, moderation_notes),
           status = COALESCE(?, status),
           updated_at = datetime('now')
       WHERE id = ?`,
      [moderation_status, moderation_notes, status, id]
    );

    // Notify donor
    await db.execute(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES (?, 'Listing Moderation Update', ?, 'admin_alert', '/donor/listings')`,
      [listing.donor_id, `Your listing "${listing.title}" moderation status was updated to: ${moderation_status || status}. Reason: ${moderation_notes || 'Compliance review'}`]
    );

    // Log to audit trail
    await logAudit(
      req.user.id,
      'LISTING_MODERATED',
      'listing',
      id,
      `Listing "${listing.title}" set to moderation=${moderation_status}, status=${status}. Notes: ${moderation_notes || 'N/A'}`
    );

    return res.json({ success: true, message: 'Listing moderation status updated.' });
  } catch (err) {
    console.error('[Admin moderateListing Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to update listing moderation.' });
  }
};

/**
 * D. Donations and Request Management
 */
exports.getDonations = async (req, res) => {
  try {
    const { status } = req.query;

    let sql = `
      SELECT r.*,
             l.title as listing_title, l.unit,
             dp.full_name as donor_name, dp.organization_name as donor_org,
             rp.full_name as recipient_name, rp.organization_name as recipient_org,
             d.kg_rescued, d.servings_rescued, d.completed_at
      FROM food_requests r
      JOIN food_listings l ON r.listing_id = l.id
      JOIN users du ON l.donor_id = du.id
      LEFT JOIN user_profiles dp ON du.id = dp.user_id
      JOIN users ru ON r.recipient_id = ru.id
      LEFT JOIN user_profiles rp ON ru.id = rp.user_id
      LEFT JOIN donations d ON r.id = d.request_id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      sql += ' AND r.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY r.created_at DESC';

    const donations = await db.query(sql, params);
    return res.json({ success: true, count: donations.length, donations });
  } catch (err) {
    console.error('[Admin getDonations Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve donations.' });
  }
};

/**
 * E. NGO & Organization Management
 */
exports.getOrganizations = async (req, res) => {
  try {
    const orgs = await db.query(`
      SELECT o.*, u.email as user_email, u.status as user_status,
             p.full_name, p.phone, p.city, p.address
      FROM organizations o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN user_profiles p ON u.id = p.user_id
      ORDER BY o.created_at DESC
    `);

    return res.json({ success: true, organizations: orgs });
  } catch (err) {
    console.error('[Admin getOrganizations Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve organizations.' });
  }
};

exports.verifyOrganization = async (req, res) => {
  try {
    const { id } = req.params;
    const { verification_status, notes } = req.body;

    const orgs = await db.query('SELECT o.*, u.email FROM organizations o JOIN users u ON o.user_id = u.id WHERE o.id = ?', [id]);
    if (orgs.length === 0) {
      return res.status(404).json({ success: false, message: 'Organization not found.' });
    }

    const org = orgs[0];
    const isVerified = verification_status === 'verified' ? 1 : 0;

    await db.execute(
      `UPDATE organizations
       SET is_verified = ?,
           verification_status = ?,
           verified_at = CASE WHEN ? = 1 THEN datetime('now') ELSE verified_at END,
           verification_notes = ?,
           updated_at = datetime('now')
       WHERE id = ?`,
      [isVerified, verification_status, isVerified, notes || null, id]
    );

    // Notify user
    await db.execute(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES (?, 'Organization Verification Update', ?, 'admin_alert', '/profile')`,
      [org.user_id, `Your organization "${org.org_name}" verification status is now: ${verification_status.toUpperCase()}. Notes: ${notes || 'Verified by admin'}`]
    );

    // Audit log
    await logAudit(
      req.user.id,
      'ORG_VERIFICATION_STATUS_CHANGED',
      'ngo',
      id,
      `Organization "${org.org_name}" verification set to ${verification_status}. Notes: ${notes || 'N/A'}`
    );

    return res.json({ success: true, message: `Organization ${verification_status} successfully.` });
  } catch (err) {
    console.error('[Admin verifyOrganization Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to update organization verification.' });
  }
};

/**
 * F. Category Management
 */
exports.getCategories = async (req, res) => {
  try {
    const categories = await db.query(`
      SELECT c.*,
             (SELECT COUNT(*) FROM food_listings WHERE category_id = c.id) as listing_count
      FROM food_categories c
      ORDER BY c.name ASC
    `);

    return res.json({ success: true, categories });
  } catch (err) {
    console.error('[Admin getCategories Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, slug, description, icon = 'Utensils' } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ success: false, message: 'Category name and slug are required.' });
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    const result = await db.execute(
      'INSERT INTO food_categories (name, slug, description, icon, is_active) VALUES (?, ?, ?, ?, 1)',
      [name.trim(), cleanSlug, description || null, icon]
    );

    await logAudit(req.user.id, 'CATEGORY_CREATED', 'category', result.insertId, `Created food category "${name}"`);

    return res.status(201).json({ success: true, message: 'Category created.', categoryId: result.insertId });
  } catch (err) {
    console.error('[Admin createCategory Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to create category.' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, is_active } = req.body;

    await db.execute(
      `UPDATE food_categories
       SET name = COALESCE(?, name),
           description = COALESCE(?, description),
           icon = COALESCE(?, icon),
           is_active = COALESCE(?, is_active),
           updated_at = datetime('now')
       WHERE id = ?`,
      [name, description, icon, is_active, id]
    );

    await logAudit(req.user.id, 'CATEGORY_UPDATED', 'category', id, `Updated category ID ${id}`);

    return res.json({ success: true, message: 'Category updated successfully.' });
  } catch (err) {
    console.error('[Admin updateCategory Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to update category.' });
  }
};

/**
 * G. Reports and Analytics
 */
exports.getAnalytics = async (req, res) => {
  try {
    // 1. Food categories breakdown
    const categoryBreakdown = await db.query(`
      SELECT c.name, COUNT(l.id) as listing_count, COALESCE(SUM(l.initial_quantity), 0) as total_quantity
      FROM food_categories c
      LEFT JOIN food_listings l ON c.id = l.category_id
      GROUP BY c.id
      ORDER BY listing_count DESC
    `);

    // 2. Redistribution trends
    const redistributionTrends = [
      { month: 'Jan', listedKg: 420, rescuedKg: 380, meals: 950 },
      { month: 'Feb', listedKg: 510, rescuedKg: 460, meals: 1150 },
      { month: 'Mar', listedKg: 680, rescuedKg: 620, meals: 1550 },
      { month: 'Apr', listedKg: 790, rescuedKg: 740, meals: 1850 },
      { month: 'May', listedKg: 910, rescuedKg: 850, meals: 2125 },
      { month: 'Jun', listedKg: 1050, rescuedKg: 990, meals: 2475 }
    ];

    // 3. Top Donors
    const topDonors = await db.query(`
      SELECT p.organization_name, p.full_name, COUNT(d.id) as completed_donations,
             COALESCE(SUM(d.kg_rescued), 0) as total_kg
      FROM users u
      JOIN user_profiles p ON u.id = p.user_id
      JOIN donations d ON u.id = d.donor_id
      WHERE d.status = 'completed'
      GROUP BY u.id
      ORDER BY total_kg DESC
      LIMIT 5
    `);

    return res.json({
      success: true,
      analytics: {
        categoryBreakdown,
        redistributionTrends,
        topDonors
      }
    });
  } catch (err) {
    console.error('[Admin getAnalytics Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to generate analytics data.' });
  }
};

/**
 * CSV Export
 */
exports.exportReportCsv = async (req, res) => {
  try {
    const donations = await db.query(`
      SELECT d.id, d.created_at, d.quantity, d.unit, d.kg_rescued, d.servings_rescued, d.status,
             l.title as food_title, c.name as category_name,
             dp.full_name as donor_name, dp.organization_name as donor_org,
             rp.full_name as recipient_name, rp.organization_name as recipient_org
      FROM donations d
      JOIN food_listings l ON d.listing_id = l.id
      JOIN food_categories c ON l.category_id = c.id
      JOIN users du ON d.donor_id = du.id
      LEFT JOIN user_profiles dp ON du.id = dp.user_id
      JOIN users ru ON d.recipient_id = ru.id
      LEFT JOIN user_profiles rp ON ru.id = rp.user_id
      ORDER BY d.created_at DESC
    `);

    // Build CSV headers and rows
    const headers = ['Donation ID', 'Date', 'Food Title', 'Category', 'Quantity', 'Unit', 'Kg Rescued', 'Servings Rescued', 'Donor', 'Recipient', 'Status'];
    const rows = donations.map(d => [
      d.id,
      d.created_at,
      `"${(d.food_title || '').replace(/"/g, '""')}"`,
      `"${d.category_name}"`,
      d.quantity,
      d.unit,
      d.kg_rescued,
      d.servings_rescued,
      `"${(d.donor_org || d.donor_name || '').replace(/"/g, '""')}"`,
      `"${(d.recipient_org || d.recipient_name || '').replace(/"/g, '""')}"`,
      d.status
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="saveplate-donations-report.csv"');
    return res.status(200).send(csvContent);
  } catch (err) {
    console.error('[Admin exportReportCsv Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to export CSV report.' });
  }
};

/**
 * K. Audit Logs
 */
exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await db.query(`
      SELECT a.*, p.full_name as admin_name, u.email as admin_email
      FROM audit_logs a
      JOIN users u ON a.admin_id = u.id
      LEFT JOIN user_profiles p ON u.id = p.user_id
      ORDER BY a.created_at DESC
      LIMIT 100
    `);

    return res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    console.error('[Admin getAuditLogs Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve audit logs.' });
  }
};

/**
 * Support & Contact Messages
 */
exports.getContactMessages = async (req, res) => {
  try {
    const messages = await db.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    return res.json({ success: true, messages });
  } catch (err) {
    console.error('[Admin getContactMessages Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve contact messages.' });
  }
};

exports.updateContactMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    await db.execute(
      `UPDATE contact_messages
       SET status = COALESCE(?, status),
           admin_notes = COALESCE(?, admin_notes),
           updated_at = datetime('now')
       WHERE id = ?`,
      [status, admin_notes, id]
    );

    return res.json({ success: true, message: 'Message updated.' });
  } catch (err) {
    console.error('[Admin updateContactMessage Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to update message.' });
  }
};
