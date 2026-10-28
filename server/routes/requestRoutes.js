// server/routes/requestRoutes.js
const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, requestController.createRequest);
router.get('/mine', authenticateToken, requestController.getMyRequests);
router.get('/donor', authenticateToken, requestController.getDonorRequests);
router.put('/:id/status', authenticateToken, requestController.updateRequestStatus);

module.exports = router;

