const Exam = require('../models/Exam');
const Allocation = require('../models/Allocation');
const Hall = require('../models/Hall');
const User = require('../models/User');
const DutyAllocation = require('../models/DutyAllocation');

// @desc   Get staff dashboard stats
// @route  GET /api/staff/stats
// @access Private/Staff
const getStaffStats = async (req, res) => {
    const staff = req.user;

    const totalExams = await Exam.countDocuments({});
    const upcomingExams = await Exam.countDocuments({ examDate: { $gte: new Date() } });
    const totalAllocations = await Allocation.countDocuments({});
    const totalHalls = await Hall.countDocuments({});
    const totalStudents = await User.countDocuments({ role: 'student' });

    res.json({ totalExams, upcomingExams, totalAllocations, totalHalls, totalStudents });
};

// @desc   Get all exams (staff can view all to monitor)
// @route  GET /api/staff/exams
// @access Private/Staff
const getStaffExams = async (req, res) => {
    const exams = await Exam.find({}).sort({ examDate: 1 });
    res.json(exams);
};

// @desc   Get all allocations (for hall monitoring)
// @route  GET /api/staff/allocations
// @access Private/Staff
const getStaffAllocations = async (req, res) => {
    const allocations = await Allocation.find({})
        .populate('studentId', 'name registerNumber department year profileImage')
        .populate('hallId', 'hallName building capacity')
        .populate('examId', 'examName examDate subject session time department year');
    res.json(allocations);
};

// @desc   Get all halls
// @route  GET /api/staff/halls
// @access Private/Staff
const getStaffHalls = async (req, res) => {
    const halls = await Hall.find({});
    res.json(halls);
};
// @desc   Get staff duty allocations
// @route  GET /api/staff/duty-allocations
// @access Private/Staff
const getStaffDutyAllocations = async (req, res) => {
    const allocations = await DutyAllocation.find({ staffId: req.user._id })
        .populate('examId', 'examName examDate subject session time')
        .populate('hallId', 'hallName building capacity')
        .sort({ createdAt: -1 });
    res.json(allocations);
};

module.exports = { getStaffStats, getStaffExams, getStaffAllocations, getStaffHalls, getStaffDutyAllocations };
