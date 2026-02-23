const express = require('express');
const router = express.Router();
const { getStaffStats, getStaffExams, getStaffAllocations, getStaffHalls } = require('../controllers/staffController');
const { protect, staff } = require('../middleware/authMiddleware');

router.use(protect);
router.use(staff);

router.get('/stats', getStaffStats);
router.get('/exams', getStaffExams);
router.get('/allocations', getStaffAllocations);
router.get('/halls', getStaffHalls);

module.exports = router;
