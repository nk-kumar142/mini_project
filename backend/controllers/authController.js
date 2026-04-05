const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, role, registerNumber, department, year, staffId, subject, adminKey } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Block admin self-registration without the secret key
    if (role === 'admin') {
        const secretKey = process.env.ADMIN_SECRET_KEY;
        if (!secretKey || adminKey !== secretKey) {
            res.status(403);
            throw new Error('Invalid admin secret key. Access denied.');
        }
    }

    const userData = {
        name,
        email,
        password,
        role: role || 'student',
    };

    if (role === 'student') {
        userData.registerNumber = registerNumber;
        userData.department = department;
        userData.year = year;
    } else if (role === 'staff') {
        userData.staffId = staffId;
        userData.subject = subject;
    }

    const user = await User.create(userData);

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            registerNumber: user.registerNumber,
            department: user.department,
            year: user.year,
            staffId: user.staffId,
            subject: user.subject,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
    const { identifier, password, role } = req.body;

    // Build query based on role
    // Student  → login with email,     password = roll number
    // Staff    → login with email,     password = registered password
    // Admin    → login with email,     password = admin password
    let query;
    if (role === 'student') {
        query = { email: identifier, role: 'student' };
    } else if (role === 'staff') {
        query = { email: identifier, role: 'staff' };
    } else {
        query = { email: identifier, role: 'admin' };
    }

    const user = await User.findOne(query);

    if (!user) {
        res.status(401);
        if (role === 'student') {
            throw new Error('No student found with this email address');
        } else if (role === 'staff') {
            throw new Error('No staff account found with this email');
        } else {
            throw new Error('No admin account found with this email');
        }
    }

    const passwordMatch = await user.matchPassword(password);
    if (!passwordMatch) {
        res.status(401);
        if (role === 'student') {
            throw new Error('Incorrect password. For students, password is your Roll Number (e.g. 7376262IT102)');
        }
        throw new Error('Incorrect password. Please try again');
    }

    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        registerNumber: user.registerNumber,
        department: user.department,
        year: user.year,
        staffId: user.staffId,
        subject: user.subject,
        token: generateToken(user._id),
    });
};

// @desc    Identify user for password reset
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    const { identifier } = req.body;
    const user = await User.findOne({
        $or: [
            { email: identifier },
            { registerNumber: identifier }
        ]
    });

    if (user) {
        res.json({
            message: 'User verified. You can now reset your password.',
            email: user.email,
            id: user._id
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

// @desc    Reset user password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    const { id, newPassword } = req.body;
    const user = await User.findById(id);

    if (user) {
        user.password = newPassword;
        await user.save();
        res.json({ message: 'Password reset successful' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

// @desc    Change password (logged-in user)
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) { res.status(404); throw new Error('User not found'); }
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) { res.status(401); throw new Error('Current password is incorrect'); }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully' });
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        if (req.body.profileImage) {
            user.profileImage = req.body.profileImage;
        }

        if (req.body.newPassword) {
            if (!req.body.currentPassword) {
                return res.status(400).json({ message: 'Current password is required to set a new password' });
            }
            const isMatch = await user.matchPassword(req.body.currentPassword);
            if (!isMatch) {
                return res.status(401).json({ message: 'Incorrect current password' });
            }
            user.password = req.body.newPassword;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            profileImage: updatedUser.profileImage,
            token: generateToken(updatedUser._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Error updating profile' });
    }
};

module.exports = { registerUser, authUser, forgotPassword, resetPassword, changePassword, getUserProfile, updateUserProfile };
