const express = require('express');
const router = express.Router();
const {
    allocateHalls,
    getAllAllocations,
    getMyAllocation,
    requestDownload,
    approveDownload,
} = require('../controllers/allocationController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/my-allocation', protect, getMyAllocation);
router.post('/allocate', protect, admin, allocateHalls);
router.get('/', protect, admin, getAllAllocations);
router.put('/:id/request-download', protect, requestDownload);
router.put('/:id/approve-download', protect, admin, approveDownload);

module.exports = router;
