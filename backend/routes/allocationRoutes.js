const express = require('express');
const router = express.Router();
const {
    allocateHalls,
    getAllAllocations,
    getMyAllocation,
    requestDownload,
    approveDownload,
    getHallAllocations,
    resetAllocations,
    approveSubjectDownloads,
} = require('../controllers/allocationController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/my-allocation', protect, getMyAllocation);
router.get('/hall/:hallId/exam/:examId', protect, getHallAllocations);
router.get('/', protect, getAllAllocations);

router.post('/allocate', protect, admin, allocateHalls);
router.delete('/reset', protect, admin, resetAllocations);
router.put('/:id/request-download', protect, requestDownload);
router.put('/:id/approve-download', protect, admin, approveDownload);
router.put('/approve-subject', protect, admin, approveSubjectDownloads);

module.exports = router;
