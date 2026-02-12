const express = require('express');
const router = express.Router();
const { downloadHallTicket, downloadAllocationList } = require('../controllers/pdfController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/hall-ticket/:allocationId', protect, downloadHallTicket);
router.get('/allocations', protect, admin, downloadAllocationList);

module.exports = router;
