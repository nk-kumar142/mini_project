const express = require('express');
const router = express.Router();
const { downloadHallTicket, downloadAllocationList, downloadUnifiedHallTicket } = require('../controllers/pdfController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/hall-ticket/:allocationId', protect, downloadHallTicket);
router.get('/my-hall-ticket', protect, downloadUnifiedHallTicket);
router.get('/allocations', protect, admin, downloadAllocationList);

module.exports = router;
