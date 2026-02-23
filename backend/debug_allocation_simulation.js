const mongoose = require('mongoose');
const User = require('./models/User');
const Exam = require('./models/Exam');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const normalizeYear = (y) => {
    if (!y) return 0;
    const str = String(y).trim().toUpperCase();
    if (str === 'I' || str === '1') return 1;
    if (str === 'II' || str === '2') return 2;
    if (str === 'III' || str === '3') return 3;
    if (str === 'IV' || str === '4') return 4;
    return 0; // unknown
};

const simulateLogic = async () => {
    await connectDB();

    console.log('\n--- EXAMS ANALYSIS ---');
    // Simulate auto-select exam logic
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let targetExam = await Exam.findOne({ examDate: { $gte: today } }).sort({ examDate: 1 });
    if (!targetExam) {
        console.log("No upcoming exam found. Trying past exam for debug...");
        targetExam = await Exam.findOne().sort({ examDate: -1 });
    }

    if (!targetExam) {
        console.error("NO EXAMS FOUND IN SYSTEM.");
        process.exit();
    }

    console.log(`Target Exam: ${targetExam.examName} (${targetExam.subject}) | Date: ${targetExam.examDate}`);
    console.log(`Raw Depts:`, targetExam.department);
    console.log(`Raw Year: "${targetExam.year}" (Normalized: ${normalizeYear(targetExam.year)})`);

    // Parse depts exactly like controller
    let deptList = [];
    if (Array.isArray(targetExam.department)) {
        deptList = targetExam.department
            .flatMap(d => d.split(',').map(s => s.trim()))
            .filter(Boolean);
    } else if (typeof targetExam.department === 'string') {
        deptList = targetExam.department.split(',').map(s => s.trim()).filter(Boolean);
    }
    const isAllDepts = deptList.includes('All Departments') || deptList.length === 0;
    console.log(`Parsed Dept List: ${JSON.stringify(deptList)} | isAllDepts: ${isAllDepts}`);

    console.log('\n--- QUERY LOGIC ---');
    let query = { role: 'student' };
    if (!isAllDepts) {
        query.department = { $in: deptList };
    }
    console.log(`Mongoose Query:`, JSON.stringify(query));

    console.log('\n--- CANDIDATE CHECK ---');
    const candidates = await User.find(query);
    console.log(`Candidates Found by Query: ${candidates.length}`);

    if (candidates.length === 0) {
        console.log("!!! NO CANDIDATES FOUND BY MONGO QUERY !!!");
        console.log("Checking ALL students in DB regardless of query...");
        const allStudents = await User.find({ role: 'student' });
        console.log(`Total Students in DB: ${allStudents.length}`);
        if (allStudents.length > 0) {
            console.log("Sample Student Dept:", allStudents[0].department);
            console.log("Does it match list?", deptList.includes(allStudents[0].department));
        }
    } else {
        console.log("Running in-memory year filter...");
        const targetYear = normalizeYear(targetExam.year);

        let passed = 0;
        let failed = 0;
        candidates.forEach(s => {
            const studentYear = normalizeYear(s.year);
            const matches = (isAllDepts && !targetExam.year) || studentYear === targetYear;
            if (matches) passed++;
            else {
                failed++;
                if (failed <= 3) console.log(`[FAIL] Student ${s.name} (Year: "${s.year}" -> ${studentYear}) != Target ${targetYear}`);
            }
        });
        console.log(`\nFINAL RESULTS: Passed: ${passed} | Failed: ${failed}`);
    }

    process.exit();
};

simulateLogic();
