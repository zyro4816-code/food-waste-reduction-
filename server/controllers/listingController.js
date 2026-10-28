// server/controllers/listingController.js
const db = require('../config/db');

exports.getAllListings = async (req, res) => {
  try {
    const { q, category, city, status = 'available', sort = 'newest' } = req.query;

    // First auto-expire overdue listings
    await db.execute(
      `UPDATE food_listings
       SET status = 'expired', updated_at = datetime('now')
       WHERE status IN ('available', 'partially_claimed')
         AND pickup_deadline < datetime('now')`
    );

    let sql = `
      SELECT l.*,
             c.name as category_name, c.slug as category_slug, c.icon as category_icon,
             p.full_name as donor_name, p.organization_name, o.is_verified as org_verified
      FROM food_listings l
      JOIN food_categories c ON l.category_id = c.id
      JOIN users u ON l.donor_id = u.id
      JOIN user_profiles p ON u.id = p.user_id
      LEFT JOIN organizations o ON u.id = o.user_id
      WHERE l.moderation_status = 'approved'
    `;
    const params = [];

    if (status && status !== 'all') {
      if (status === 'available') {
        sql += ` AND l.status IN ('available', 'partially_claimed')`;
      } else {
        sql += ` AND l.status = ?`;
        params.push(status);
      }
    }

    if (category && category !== 'all') {
      sql += ` AND (c.slug = ? OR c.id = ?)`;
      params.push(category, category);
    }

    if (city) {
      sql += ` AND LOWER(l.city) LIKE ?`;
      params.push(`%${city.toLowerCase()}%`);
    }

    if (q) {
      sql += ` AND (LOWER(l.title) LIKE ? OR LOWER(l.description) LIKE ? OR LOWER(l.pickup_address) LIKE ?)`;
      const queryPattern = `%${q.toLowerCase()}%`;
      params.push(queryPattern, queryPattern, queryPattern);
    }

    // Sort order
    if (sort === 'ending_soon') {
      sql += ` ORDER BY l.pickup_deadline ASC`;
    } else if (sort === 'servings_desc') {
      sql += ` ORDER BY l.estimated_servings DESC`;
    } else if (sort === 'quantity_desc') {
      sql += ` ORDER BY l.remaining_quantity DESC`;
    } else {
      sql += ` ORDER BY l.created_at DESC`;
    }

    const listings = await db.query(sql, params);
    return res.json({ success: true, count: listings.length, listings });
  } catch (err) {
    console.error('[GetAllListings Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve food listings.' });
  }
};

exports.getListingById = async (req, res) => {
  try {
    const { id } = req.params;

    const listings = await db.query(
      `SELECT l.*,
              c.name as category_name, c.slug as category_slug, c.icon as category_icon,
              p.full_name as donor_name, p.organization_name, p.phone as donor_phone,
              p.avatar_url as donor_avatar, o.is_verified as org_verified, o.org_type
       FROM food_listings l
       JOIN food_categories c ON l.category_id = c.id
       JOIN users u ON l.donor_id = u.id
       JOIN user_profiles p ON u.id = p.user_id
       LEFT JOIN organizations o ON u.id = o.user_id
       WHERE l.id = ?`,
      [id]
    );

    if (listings.length === 0) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    const listing = listings[0];

    // Fetch images
    const images = await db.query(
      'SELECT id, image_url, is_primary, caption FROM food_images WHERE listing_id = ? ORDER BY is_primary DESC',
      [id]
    );

    listing.images = images;

    return res.json({ success: true, listing });
  } catch (err) {
    console.error('[GetListingById Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch listing details.' });
  }
};

exports.createListing = async (req, res) => {
  try {
    const {
      title,
      description,
      category_id,
      quantity,
      unit = 'kg',
      estimated_servings = 0,
      prep_time,
      expiry_time,
      pickup_deadline,
      storage_instructions = 'Keep refrigerated',
      allergens = 'None',
      pickup_address,
      city,
      postal_code,
      contact_phone,
      primary_image_url
    } = req.body;

    if (!title || !quantity || !pickup_deadline || !pickup_address || !city || !contact_phone) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: Title, quantity, pickup deadline, address, city, and phone are mandatory.'
      });
    }

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive number.' });
    }

    // Determine image URL
    let imageUrl = primary_image_url;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (!imageUrl) {
      // High-res curated fallback based on category
      imageUrl = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80';
    }

    // Check platform settings for moderation
    const settingRows = await db.query("SELECT setting_value FROM platform_settings WHERE setting_key = 'auto_approve_listings'");
    const autoApprove = settingRows.length === 0 || settingRows[0].setting_value === 'true';

    const moderationStatus = autoApprove ? 'approved' : 'pending_review';

    const result = await db.execute(
      `INSERT INTO food_listings (
        donor_id, category_id, title, description, initial_quantity, remaining_quantity,
        unit, estimated_servings, prep_time, expiry_time, pickup_deadline,
        storage_instructions, allergens, pickup_address, city, postal_code,
        contact_phone, primary_image_url, status, moderation_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', ?)`,
      [
        req.user.id,
        category_id || 1,
        title.trim(),
        description ? description.trim() : 'Wholesome surplus food available for pickup.',
        qty,
        qty,
        unit,
        parseInt(estimated_servings) || 0,
        prep_time || null,
        expiry_time || null,
        pickup_deadline,
        storage_instructions,
        allergens,
        pickup_address.trim(),
        city.trim(),
        postal_code || null,
        contact_phone.trim(),
        imageUrl,
        moderationStatus
      ]
    );

    const listingId = result.insertId;

    // Also add to food_images table
    await db.execute(
      'INSERT INTO food_images (listing_id, image_url, is_primary, caption) VALUES (?, ?, 1, ?)',
      [listingId, imageUrl, title]
    );

    return res.status(201).json({
      success: true,
      message: autoApprove ? 'Food listing published successfully!' : 'Listing submitted for moderation review.',
      listingId
    });
  } catch (err) {
    console.error('[CreateListing Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to create food listing.' });
  }
};

exports.updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, remaining_quantity, pickup_deadline, storage_instructions, allergens, status } = req.body;

    const listings = await db.query('SELECT donor_id FROM food_listings WHERE id = ?', [id]);
    if (listings.length === 0) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    if (listings[0].donor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this listing.' });
    }

    await db.execute(
      `UPDATE food_listings
       SET title = COALESCE(?, title),
           description = COALESCE(?, description),
           remaining_quantity = COALESCE(?, remaining_quantity),
           pickup_deadline = COALESCE(?, pickup_deadline),
           storage_instructions = COALESCE(?, storage_instructions),
           allergens = COALESCE(?, allergens),
           status = COALESCE(?, status),
           updated_at = datetime('now')
       WHERE id = ?`,
      [title, description, remaining_quantity, pickup_deadline, storage_instructions, allergens, status, id]
    );

    return res.json({ success: true, message: 'Listing updated successfully.' });
  } catch (err) {
    console.error('[UpdateListing Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to update listing.' });
  }
};

exports.deleteListing = async (req, res) => {
  try {
    const { id } = req.params;

    const listings = await db.query('SELECT donor_id, status FROM food_listings WHERE id = ?', [id]);
    if (listings.length === 0) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    if (listings[0].donor_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this listing.' });
    }

    // Soft close or delete
    await db.execute("UPDATE food_listings SET status = 'closed', updated_at = datetime('now') WHERE id = ?", [id]);

    return res.json({ success: true, message: 'Listing marked as closed.' });
  } catch (err) {
    console.error('[DeleteListing Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to close listing.' });
  }
};

exports.getMyListings = async (req, res) => {
  try {
    const listings = await db.query(
      `SELECT l.*,
              c.name as category_name,
              COUNT(r.id) as total_requests,
              SUM(CASE WHEN r.status = 'pending' THEN 1 ELSE 0 END) as pending_requests
       FROM food_listings l
       JOIN food_categories c ON l.category_id = c.id
       LEFT JOIN food_requests r ON l.id = r.listing_id
       WHERE l.donor_id = ?
       GROUP BY l.id
       ORDER BY l.created_at DESC`,
      [req.user.id]
    );

    return res.json({ success: true, listings });
  } catch (err) {
    console.error('[GetMyListings Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve your listings.' });
  }
};
