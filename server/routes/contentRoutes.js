// server/routes/contentRoutes.js
const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const { authenticateToken } = require('../middleware/auth');

// Public endpoints
router.get('/stats', contentController.getPublicStats);
router.get('/faqs', contentController.getFaqs);
router.get('/articles', contentController.getArticles);
router.get('/announcements', contentController.getAnnouncements);
router.post('/contact', contentController.submitContact);

// Authenticated notifications
router.get('/notifications', authenticateToken, contentController.getNotifications);
router.put('/notifications/:id/read', authenticateToken, contentController.markNotificationRead);

module.exports = router;

