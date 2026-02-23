const mongoose = require('mongoose');
async function run() {
    await mongoose.connect('mongodb://localhost:27017/exam_hall_db');
    const Exam = require('./models/Exam');
    const User = require('./models/User');
    const exam = await Exam.findOne({ department: { $size: 2 } }) || await Exam.findOne();
    const students = await User.find({ role: 'student', department: { $in: exam.department }, year: exam.year });
    const counts = {};
    students.forEach(s => counts[s.department] = (counts[s.department] || 0) + 1);
    console.log('--- DATA DUMP ---');
    console.log('Exam:', exam.examName);
    console.log('Exam Depts Array:', JSON.stringify(exam.department));
    console.log('Student Depts Found:', JSON.stringify(Object.keys(counts)));
    console.log('Counts:', JSON.stringify(counts, null, 2));
    process.exit();
}
run();
