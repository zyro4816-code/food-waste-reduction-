// server/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All admin routes require valid token and 'admin' role
router.use(authenticateToken, requireAdmin);

// A. Overview metrics
router.get('/metrics', adminController.getOverviewMetrics);

// B. Users management
router.get('/users', adminController.getUsers);
router.put('/users/:id', adminController.updateUser);

// C. Listings management & moderation
router.get('/listings', adminController.getListings);
router.put('/listings/:id/moderate', adminController.moderateListing);

// D. Donations & Requests
router.get('/donations', adminController.getDonations);

// E. Organizations & NGOs
router.get('/organizations', adminController.getOrganizations);
router.put('/organizations/:id/verify', adminController.verifyOrganization);

// F. Categories
router.get('/categories', adminController.getCategories);
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);

// G. Reports & Analytics
router.get('/analytics', adminController.getAnalytics);
router.get('/export/csv', adminController.exportReportCsv);

// K. Audit logs
router.get('/audit-logs', adminController.getAuditLogs);

// Support & Contact
router.get('/contact-messages', adminController.getContactMessages);
router.put('/contact-messages/:id', adminController.updateContactMessage);

module.exports = router;

