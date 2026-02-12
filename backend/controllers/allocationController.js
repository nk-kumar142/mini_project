const User = require('../models/User');
const Hall = require('../models/Hall');
const Exam = require('../models/Exam');
const Allocation = require('../models/Allocation');

// @desc    Automatically allocate halls
// @route   POST /api/allocation/allocate
// @access  Admin
// @desc    Automatically allocate halls
// @route   POST /api/allocation/allocate
// @access  Admin
const allocateHalls = async (req, res) => {
    const { examId } = req.body;

    try {
        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        const examDate = exam.examDate;

        // 1. Fetch students based on department and year from the exam
        const students = await User.find({
            role: 'student',
            department: exam.department,
            year: exam.year,
        });

        if (students.length === 0) {
            return res.status(400).json({ message: 'No students found for this exam group' });
        }

        // 2. Clear existing allocations for THIS exam before calculating fresh halls
        await Allocation.deleteMany({ examId });

        // 3. Find other exams on the same date to avoid hall collisions
        const otherExamsOnSameDate = await Exam.find({ examDate });
        const otherExamIds = otherExamsOnSameDate.map(e => e._id);

        // 4. Find all existing allocations on this date (across all exams)
        const dateAllocations = await Allocation.find({ examId: { $in: otherExamIds } });

        // Identify halls occupied by OTHER departments/exams on the same date
        const occupiedHallIds = [...new Set(dateAllocations.map(a => a.hallId.toString()))];

        // 5. Fetch available halls that are NOT occupied by other departments on this date
        const availableHalls = await Hall.find({
            _id: { $nin: occupiedHallIds }
        }).sort({ hallName: 1 });

        if (availableHalls.length === 0) {
            return res.status(400).json({
                message: 'No available halls left on this date. All halls are occupied by other departments or already full.'
            });
        }

        // 6. Allocation Logic
        let studentIndex = 0;
        const allocations = [];

        for (const hall of availableHalls) {
            const capacity = hall.capacity;
            for (let seat = 1; seat <= capacity; seat++) {
                if (studentIndex >= students.length) break;

                allocations.push({
                    studentId: students[studentIndex]._id,
                    hallId: hall._id,
                    examId: examId,
                    seatNumber: seat,
                });

                studentIndex++;
            }
            if (studentIndex >= students.length) break;
        }

        if (studentIndex < students.length) {
            return res.status(400).json({
                message: `Insufficient hall capacity for ${exam.department}. Allocated ${studentIndex} students, ${students.length - studentIndex} remaining. Please add more halls.`,
            });
        }

        // 7. Save allocations
        await Allocation.insertMany(allocations);

        res.status(201).json({
            message: `Halls allocated successfully for ${exam.department}. Used ${allocations.length} seats across ${[...new Set(allocations.map(a => a.hallId))].length} halls.`,
            allocatedCount: allocations.length,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all allocations
// @route   GET /api/allocation
// @access  Admin
const getAllAllocations = async (req, res) => {
    const allocations = await Allocation.find({})
        .populate('studentId', 'name registerNumber department year')
        .populate('hallId', 'hallName building')
        .populate('examId', 'examName examDate subject');
    res.json(allocations);
};

// @desc    Get student's own allocation
// @route   GET /api/allocation/my-allocation
// @access  Student
const getMyAllocation = async (req, res) => {
    const allocations = await Allocation.find({ studentId: req.user._id })
        .populate('hallId')
        .populate('examId');
    res.json(allocations);
};

// @desc    Request hall ticket download
// @route   PUT /api/allocation/:id/request-download
// @access  Student
const requestDownload = async (req, res) => {
    try {
        const allocation = await Allocation.findById(req.params.id);
        if (!allocation) {
            return res.status(404).json({ message: 'Allocation not found' });
        }
        if (allocation.studentId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        allocation.downloadRequestStatus = 'approved';
        await allocation.save();
        res.json({ message: 'Download requested and approved successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve hall ticket download
// @route   PUT /api/allocation/:id/approve-download
// @access  Admin
const approveDownload = async (req, res) => {
    try {
        const allocation = await Allocation.findById(req.params.id);
        if (!allocation) {
            return res.status(404).json({ message: 'Allocation not found' });
        }

        allocation.downloadRequestStatus = 'approved';
        await allocation.save();
        res.json({ message: 'Download approved successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    allocateHalls,
    getAllAllocations,
    getMyAllocation,
    requestDownload,
    approveDownload,
};
