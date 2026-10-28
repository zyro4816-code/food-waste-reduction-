// server/controllers/requestController.js
const db = require('../config/db');

/**
 * Recipient submits a request for food with atomic concurrency check
 */
exports.createRequest = async (req, res) => {
  try {
    const { listing_id, requested_quantity, recipient_notes } = req.body;

    if (!listing_id || !requested_quantity) {
      return res.status(400).json({ success: false, message: 'Listing ID and requested quantity are required.' });
    }

    const qty = parseFloat(requested_quantity);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Requested quantity must be greater than zero.' });
    }

    // Execute within atomic database transaction to prevent overclaiming
    const result = await db.transaction(async (tx) => {
      // 1. Fetch listing with current quantity
      const listings = await tx.query(
        `SELECT l.*, p.full_name as donor_name
         FROM food_listings l
         JOIN users u ON l.donor_id = u.id
         JOIN user_profiles p ON u.id = p.user_id
         WHERE l.id = ?`,
        [listing_id]
      );

      if (listings.length === 0) {
        throw new Error('Listing does not exist.');
      }

      const listing = listings[0];

      // Prevent donor from requesting their own food
      if (listing.donor_id === req.user.id) {
        throw new Error('You cannot request your own food listing.');
      }

      if (['closed', 'expired', 'fully_claimed', 'rejected'].includes(listing.status)) {
        throw new Error(`This listing is currently ${listing.status} and cannot accept new requests.`);
      }

      // Check deadline
      if (new Date(listing.pickup_deadline).getTime() < Date.now()) {
        throw new Error('The pickup deadline for this listing has expired.');
      }

      // Check available quantity
      if (qty > listing.remaining_quantity) {
        throw new Error(`Requested amount (${qty} ${listing.unit}) exceeds available surplus (${listing.remaining_quantity} ${listing.unit}).`);
      }

      // Generate pickup verification code
      const verificationCode = 'SP-' + Math.floor(10000 + Math.random() * 90000);

      // 2. Insert request record
      const reqInsert = await tx.execute(
        `INSERT INTO food_requests (
          listing_id, recipient_id, requested_quantity, unit, status,
          recipient_notes, verification_code
        ) VALUES (?, ?, ?, ?, 'pending', ?, ?)`,
        [listing.id, req.user.id, qty, listing.unit, recipient_notes || null, verificationCode]
      );
      const requestId = reqInsert.insertId;

      // 3. Log history
      await tx.execute(
        `INSERT INTO donation_status_history (request_id, changed_by_user_id, previous_status, new_status, notes)
         VALUES (?, ?, NULL, 'pending', 'Recipient submitted request for food.')`,
        [requestId, req.user.id]
      );

      // 4. Notify donor
      await tx.execute(
        `INSERT INTO notifications (user_id, title, message, type, link)
         VALUES (?, 'New Food Request', ?, 'request_received', '/donor/listings')`,
        [listing.donor_id, `${req.user.fullName || 'A recipient'} requested ${qty} ${listing.unit} of "${listing.title}".`]
      );

      return { requestId, verificationCode, listingTitle: listing.title };
    });

    return res.status(201).json({
      success: true,
      message: 'Request submitted successfully. The donor has been notified.',
      ...result
    });
  } catch (err) {
    console.error('[CreateRequest Error]', err.message);
    return res.status(400).json({ success: false, message: err.message || 'Failed to submit food request.' });
  }
};

/**
 * Donor or Admin updates request status (Approve, Reject, Ready for Pickup, Completed, Cancel)
 */
exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, donor_notes } = req.body;

    const validStatuses = ['approved', 'rejected', 'ready_for_pickup', 'collected', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Valid values: ${validStatuses.join(', ')}` });
    }

    const updated = await db.transaction(async (tx) => {
      // Fetch request details
      const requests = await tx.query(
        `SELECT r.*, l.donor_id, l.title as listing_title, l.remaining_quantity, l.unit, l.estimated_servings, l.initial_quantity,
                u.id as recipient_user_id, p.full_name as recipient_name
         FROM food_requests r
         JOIN food_listings l ON r.listing_id = l.id
         JOIN users u ON r.recipient_id = u.id
         JOIN user_profiles p ON u.id = p.user_id
         WHERE r.id = ?`,
        [id]
      );

      if (requests.length === 0) {
        throw new Error('Request not found.');
      }

      const request = requests[0];

      // Authorization check: Only donor of listing or admin
      if (request.donor_id !== req.user.id && req.user.role !== 'admin' && !(status === 'cancelled' && request.recipient_id === req.user.id)) {
        throw new Error('Not authorized to update this request status.');
      }

      const prevStatus = request.status;

      // Handle quantity modifications
      if (status === 'approved' && prevStatus === 'pending') {
        // Deduct quantity from listing
        if (request.remaining_quantity < request.requested_quantity) {
          throw new Error('Cannot approve: remaining available quantity has already been claimed by another request.');
        }

        const newRemaining = request.remaining_quantity - request.requested_quantity;
        const newListingStatus = newRemaining <= 0 ? 'fully_claimed' : 'partially_claimed';

        await tx.execute(
          `UPDATE food_listings
           SET remaining_quantity = ?, status = ?, updated_at = datetime('now')
           WHERE id = ?`,
          [newRemaining, newListingStatus, request.listing_id]
        );
      } else if (['rejected', 'cancelled'].includes(status) && ['approved', 'ready_for_pickup'].includes(prevStatus)) {
        // Restore quantity if an approved request was cancelled/rejected
        const restoredRemaining = request.remaining_quantity + request.requested_quantity;
        const restoredListingStatus = restoredRemaining >= request.initial_quantity ? 'available' : 'partially_claimed';

        await tx.execute(
          `UPDATE food_listings
           SET remaining_quantity = ?, status = ?, updated_at = datetime('now')
           WHERE id = ?`,
          [restoredRemaining, restoredListingStatus, request.listing_id]
        );
      }

      // If marked completed, record to donations table
      if (status === 'completed' && prevStatus !== 'completed') {
        const kgEst = request.unit === 'kg' ? request.requested_quantity : (request.requested_quantity * 0.4);
        const servingsEst = Math.round(request.requested_quantity * (request.estimated_servings / (request.initial_quantity || 1)));

        await tx.execute(
          `INSERT INTO donations (
            listing_id, request_id, donor_id, recipient_id, quantity, unit,
            servings_rescued, kg_rescued, status, completed_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed', datetime('now'))`,
          [request.listing_id, request.id, request.donor_id, request.recipient_id, request.requested_quantity, request.unit, servingsEst, kgEst]
        );
      }

      // Update request status
      await tx.execute(
        `UPDATE food_requests
         SET status = ?, donor_notes = COALESCE(?, donor_notes), updated_at = datetime('now')
         WHERE id = ?`,
        [status, donor_notes || null, id]
      );

      // Log history
      await tx.execute(
        `INSERT INTO donation_status_history (request_id, changed_by_user_id, previous_status, new_status, notes)
         VALUES (?, ?, ?, ?, ?)`,
        [id, req.user.id, prevStatus, status, donor_notes || `Status transitioned to ${status}`]
      );

      // Notify recipient
      const notifMessages = {
        approved: `Your request for ${request.requested_quantity} ${request.unit} of "${request.listing_title}" was APPROVED!`,
        ready_for_pickup: `Good news! Your food from "${request.listing_title}" is packed and READY FOR PICKUP. Verification Code: ${request.verification_code}`,
        completed: `Donation completed! Thank you for rescuing "${request.listing_title}".`,
        rejected: `Your request for "${request.listing_title}" was declined by donor.`,
        cancelled: `Request for "${request.listing_title}" was cancelled.`
      };

      await tx.execute(
        `INSERT INTO notifications (user_id, title, message, type, link)
         VALUES (?, 'Request Status Update', ?, 'request_status_update', '/recipient/requests')`,
        [request.recipient_id, notifMessages[status] || `Request status updated to ${status}.`]
      );

      return { id, previousStatus: prevStatus, newStatus: status };
    });

    return res.json({ success: true, message: `Request successfully marked as ${status}.`, ...updated });
  } catch (err) {
    console.error('[UpdateRequestStatus Error]', err.message);
    return res.status(400).json({ success: false, message: err.message || 'Failed to update request.' });
  }
};

/**
 * Recipient gets their requests
 */
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await db.query(
      `SELECT r.*,
              l.title as listing_title, l.pickup_address, l.city, l.pickup_deadline,
              l.storage_instructions, l.primary_image_url, l.contact_phone as donor_phone,
              p.full_name as donor_name, p.organization_name as donor_org
       FROM food_requests r
       JOIN food_listings l ON r.listing_id = l.id
       JOIN users u ON l.donor_id = u.id
       JOIN user_profiles p ON u.id = p.user_id
       WHERE r.recipient_id = ?
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );

    return res.json({ success: true, requests });
  } catch (err) {
    console.error('[GetMyRequests Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch your requests.' });
  }
};

/**
 * Donor views incoming requests for a specific listing or all their listings
 */
exports.getDonorRequests = async (req, res) => {
  try {
    const { listing_id } = req.query;

    let sql = `
      SELECT r.*,
             l.title as listing_title, l.remaining_quantity, l.pickup_deadline,
             p.full_name as recipient_name, p.phone as recipient_phone,
             p.organization_name as recipient_org, u.role as recipient_role
      FROM food_requests r
      JOIN food_listings l ON r.listing_id = l.id
      JOIN users u ON r.recipient_id = u.id
      JOIN user_profiles p ON u.id = p.user_id
      WHERE l.donor_id = ?
    `;
    const params = [req.user.id];

    if (listing_id) {
      sql += ' AND l.id = ?';
      params.push(listing_id);
    }

    sql += ' ORDER BY r.created_at DESC';

    const requests = await db.query(sql, params);
    return res.json({ success: true, requests });
  } catch (err) {
    console.error('[GetDonorRequests Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch donor requests.' });
  }
};

