// server/routes/listingRoutes.js
const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public browse routes
router.get('/', listingController.getAllListings);
router.get('/:id', listingController.getListingById);

// Protected routes (Donors and Admins)
router.post(
  '/',
  authenticateToken,
  requireRole('donor', 'admin', 'ngo', 'volunteer'),
  upload.single('image'),
  listingController.createListing
);
router.put('/:id', authenticateToken, listingController.updateListing);
router.delete('/:id', authenticateToken, listingController.deleteListing);
router.get('/user/mine', authenticateToken, listingController.getMyListings);

module.exports = router;

