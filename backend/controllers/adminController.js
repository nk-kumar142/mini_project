const User = require('../models/User');
const Hall = require('../models/Hall');
const Exam = require('../models/Exam');
const Allocation = require('../models/Allocation');

// --- Email Auto-Generation Helper ---
const DEPT_CODE_MAP = {
    'information technology': 'it',
    'computer science': 'cs',
    'computer science and engineering': 'cs',
    'electronics': 'ec',
    'electronics and communication': 'ec',
    'electronics and communication engineering': 'ec',
    'mechanical': 'me',
    'mechanical engineering': 'me',
    'civil': 'ce',
    'civil engineering': 'ce',
    'electrical': 'ee',
    'electrical and electronics engineering': 'ee',
    'electrical engineering': 'ee',
};

const generateStudentEmail = (name, department, year) => {
    const firstName = (name || 'student').trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, '');
    const lower = (department || '').toLowerCase().trim();
    const deptCode = DEPT_CODE_MAP[lower] || lower.replace(/[^a-z]/g, '').slice(0, 2) || 'xx';
    const batchYear = (26 - parseInt(year || 1, 10)).toString();
    return `${firstName}.${deptCode}${batchYear}@gmail.com`;
};

// --- Student Management ---
const getStudents = async (req, res) => {
    const students = await User.find({ role: 'student' });
    res.json(students);
};

const createStudent = async (req, res) => {
    const { name, password, registerNumber, department, year } = req.body;
    let { email } = req.body;

    // Auto-generate email if not provided
    if (!email || !email.trim()) {
        let baseEmail = generateStudentEmail(name, department, year);
        // Ensure uniqueness
        let counter = 0;
        let candidate = baseEmail;
        while (await User.findOne({ email: candidate })) {
            counter++;
            candidate = baseEmail.replace('@', `${counter}@`);
        }
        email = candidate;
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }
    const student = await User.create({
        name,
        email,
        password: password || registerNumber || 'password123',
        role: 'student',
        registerNumber,
        department,
        year,
    });
    res.status(201).json(student);
};

const bulkCreateStudents = async (req, res) => {
    const { students } = req.body;
    if (!Array.isArray(students) || students.length === 0) {
        return res.status(400).json({ message: 'No student data provided.' });
    }
    let created = 0;
    let skipped = 0;
    const errors = [];
    for (const s of students) {
        try {
            // Auto-generate email if missing
            let email = s.email;
            if (!email || !email.trim()) {
                email = generateStudentEmail(s.name, s.department, s.year);
            }
            // Ensure uniqueness
            let counter = 0;
            let candidate = email;
            while (await User.findOne({ email: candidate })) {
                counter++;
                candidate = email.replace('@', `${counter}@`);
            }
            email = candidate;

            await User.create({
                name: s.name,
                email,
                password: s.password || s.registerNumber || 'password123',
                role: 'student',
                registerNumber: s.registerNumber,
                department: s.department,
                year: s.year,
            });
            created++;
        } catch (err) {
            skipped++;
            errors.push(`${s.name || s.email}: ${err.message}`);
        }
    }
    res.status(201).json({ message: `Import complete. ${created} created, ${skipped} skipped.`, created, skipped, errors });
};

const updateStudent = async (req, res) => {
    const { name, email, password, registerNumber, department, year } = req.body;
    console.log(`Updating student ${req.params.id}:`, req.body);
    const student = await User.findById(req.params.id);
    if (student) {
        student.name = name || student.name;
        student.registerNumber = registerNumber || student.registerNumber;
        student.department = department || student.department;
        student.year = year || student.year;
        // Update email if provided and different
        if (email && email.trim() && email !== student.email) {
            const emailExists = await User.findOne({ email: email.trim(), _id: { $ne: student._id } });
            if (emailExists) {
                res.status(400);
                throw new Error('Email already in use by another student');
            }
            student.email = email.trim();
        }
        // Reset password if provided
        if (password && password.trim()) {
            student.password = password.trim();
        }
        const updatedStudent = await student.save();
        console.log('Student updated successfully');
        res.json(updatedStudent);
    } else {
        console.error('Student not found:', req.params.id);
        res.status(404);
        throw new Error('Student not found');
    }
};

const deleteStudent = async (req, res) => {
    const student = await User.findById(req.params.id);
    if (student) {
        // Cascade delete allocations
        await Allocation.deleteMany({ studentId: req.params.id });
        await student.deleteOne();
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
    console.log(`Updating Hall ${req.params.id}:`, req.body);
    const hall = await Hall.findById(req.params.id);
    if (hall) {
        hall.hallName = hallName || hall.hallName;
        hall.building = building || hall.building;
        hall.capacity = capacity || hall.capacity;
        const updatedHall = await hall.save();
        console.log('Hall updated successfully:', updatedHall);
        res.json(updatedHall);
    } else {
        console.error('Hall not found:', req.params.id);
        res.status(404);
        throw new Error('Hall not found');
    }
};

const deleteHall = async (req, res) => {
    const hall = await Hall.findById(req.params.id);
    if (hall) {
        // Cascade delete allocations
        await Allocation.deleteMany({ hallId: req.params.id });
        await hall.deleteOne();
        res.json({ message: 'Hall removed' });
    } else {
        res.status(404);
        throw new Error('Hall not found');
    }
};

// --- Exam Management ---
// Normalize department: accepts string ("IT, CSE") or array, always returns Array of trimmed strings
const normalizeDept = (dept) => {
    if (!dept) return [];
    if (Array.isArray(dept)) {
        // Could be ['IT, CSE'] (one element with commas) or already split
        const flat = dept.flatMap(d => d.split(',').map(s => s.trim())).filter(Boolean);
        return flat;
    }
    // String
    return dept.split(',').map(s => s.trim()).filter(Boolean);
};

const getExams = async (req, res) => {
    const exams = await Exam.find({});
    res.json(exams);
};

const createExam = async (req, res) => {
    console.log("Create Exam Request Body:", req.body);
    const { examName, examDate, subject, year, session, time } = req.body;
    const department = normalizeDept(req.body.department);

    if (!department || department.length === 0) {
        res.status(400);
        throw new Error('Please select at least one department');
    }

    const exam = await Exam.create({ examName, examDate, subject, department, year, session, time });
    console.log("Exam created successfully, departments:", department);
    res.status(201).json(exam);
};

const updateExam = async (req, res) => {
    const { examName, examDate, subject, year, session, time } = req.body;
    const department = normalizeDept(req.body.department);
    const exam = await Exam.findById(req.params.id);
    if (exam) {
        exam.examName = examName || exam.examName;
        exam.examDate = examDate || exam.examDate;
        exam.subject = subject || exam.subject;
        exam.department = department.length > 0 ? department : exam.department;
        exam.year = year || exam.year;
        exam.session = session || exam.session;
        exam.time = time || exam.time;
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
        // Cascade delete allocations
        await Allocation.deleteMany({ examId: req.params.id });
        await exam.deleteOne();
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

// ─── Staff Management (Admin) ────────────────────────────────────────────────

const getStaffList = async (req, res) => {
    const staff = await User.find({ role: 'staff' }).select('-password').sort({ createdAt: -1 });
    res.json(staff);
};

const createStaffMember = async (req, res) => {
    const { name, email, password, staffId, subject, department } = req.body;
    const exists = await User.findOne({ email });
    if (exists) { res.status(400); throw new Error('Email already registered'); }
    const staff = await User.create({ name, email, password, role: 'staff', staffId, subject, department });
    res.status(201).json({ _id: staff._id, name: staff.name, email: staff.email, staffId: staff.staffId, subject: staff.subject, department: staff.department });
};

const updateStaffMember = async (req, res) => {
    const staff = await User.findById(req.params.id);
    if (!staff || staff.role !== 'staff') { res.status(404); throw new Error('Staff not found'); }
    staff.name = req.body.name || staff.name;
    staff.email = req.body.email || staff.email;
    staff.staffId = req.body.staffId || staff.staffId;
    staff.subject = req.body.subject || staff.subject;
    staff.department = req.body.department || staff.department;
    if (req.body.password) staff.password = req.body.password;
    const updated = await staff.save();
    res.json({ _id: updated._id, name: updated.name, email: updated.email, staffId: updated.staffId, subject: updated.subject, department: updated.department });
};

const deleteStaffMember = async (req, res) => {
    const staff = await User.findById(req.params.id);
    if (!staff || staff.role !== 'staff') { res.status(404); throw new Error('Staff not found'); }
    await staff.deleteOne();
    res.json({ message: 'Staff deleted' });
};

module.exports = {
    getStudents,
    createStudent,
    bulkCreateStudents,
    updateStudent,
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
    getStaffList,
    createStaffMember,
    updateStaffMember,
    deleteStaffMember,
};
