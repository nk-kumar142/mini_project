const User = require('../models/User');
const Hall = require('../models/Hall');
const Exam = require('../models/Exam');
const Allocation = require('../models/Allocation');

// --- Student Management ---
const getStudents = async (req, res) => {
    const students = await User.find({ role: 'student' });
    res.json(students);
};

const deleteStudent = async (req, res) => {
    const student = await User.findById(req.params.id);
    if (student) {
        await student.remove();
        res.json({ message: 'Student removed' });
    } else {
        res.status(404);
        throw new Error('Student not found');
    }
};

// --- Hall Management ---
const getHalls = async (req, res) => {
    const halls = await Hall.find({});
    res.json(halls);
};

const createHall = async (req, res) => {
    const { hallName, building, capacity } = req.body;
    const hallExists = await Hall.findOne({ hallName });
    if (hallExists) {
        res.status(400);
        throw new Error('Hall already exists');
    }
    const hall = await Hall.create({ hallName, building, capacity });
    res.status(201).json(hall);
};

const updateHall = async (req, res) => {
    const { hallName, building, capacity } = req.body;
    const hall = await Hall.findById(req.params.id);
    if (hall) {
        hall.hallName = hallName || hall.hallName;
        hall.building = building || hall.building;
        hall.capacity = capacity || hall.capacity;
        const updatedHall = await hall.save();
        res.json(updatedHall);
    } else {
        res.status(404);
        throw new Error('Hall not found');
    }
};

const deleteHall = async (req, res) => {
    const hall = await Hall.findById(req.params.id);
    if (hall) {
        await hall.remove();
        res.json({ message: 'Hall removed' });
    } else {
        res.status(404);
        throw new Error('Hall not found');
    }
};

// --- Exam Management ---
const getExams = async (req, res) => {
    const exams = await Exam.find({});
    res.json(exams);
};

const createExam = async (req, res) => {
    const { examName, examDate, subject, department, year } = req.body;
    const exam = await Exam.create({ examName, examDate, subject, department, year });
    res.status(201).json(exam);
};

const updateExam = async (req, res) => {
    const { examName, examDate, subject, department, year } = req.body;
    const exam = await Exam.findById(req.params.id);
    if (exam) {
        exam.examName = examName || exam.examName;
        exam.examDate = examDate || exam.examDate;
        exam.subject = subject || exam.subject;
        exam.department = department || exam.department;
        exam.year = year || exam.year;
        const updatedExam = await exam.save();
        res.json(updatedExam);
    } else {
        res.status(404);
        throw new Error('Exam not found');
    }
};

const deleteExam = async (req, res) => {
    const exam = await Exam.findById(req.params.id);
    if (exam) {
        await exam.remove();
        res.json({ message: 'Exam removed' });
    } else {
        res.status(404);
        throw new Error('Exam not found');
    }
};

// --- Statistics ---
const getStats = async (req, res) => {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalHalls = await Hall.countDocuments({});
    const totalExams = await Exam.countDocuments({});
    const totalAllocations = await Allocation.countDocuments({});

    res.json({
        totalStudents,
        totalHalls,
        totalExams,
        totalAllocations,
    });
};

module.exports = {
    getStudents,
    deleteStudent,
    getHalls,
    createHall,
    updateHall,
    deleteHall,
    getExams,
    createExam,
    updateExam,
    deleteExam,
    getStats,
};
