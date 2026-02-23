const express = require('express');
const router = express.Router();
const { registerUser, authUser, forgotPassword, resetPassword, changePassword, getUserProfile, updateUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.put('/change-password', protect, changePassword);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);

module.exports = router;
