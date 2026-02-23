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

const inspectData = async () => {
    await connectDB();

    try {
        console.log('\n--- EXAMS ---');
        const exams = await Exam.find({});
        if (exams.length === 0) console.log('No exams found.');
        exams.forEach(e => {
            console.log(`ExamID: ${e._id} | Subject: ${e.subject} | Date: ${e.examDate} | Year: "${e.year}" | Depts: ${JSON.stringify(e.department)}`);
        });

        console.log('\n--- STUDENTS ANALYSIS ---');
        const students = await User.find({ role: 'student' });
        console.log(`Total Students: ${students.length}`);

        if (students.length > 0) {
            const sample = students[0];
            console.log('Sample Student Full Object:', JSON.stringify(sample, null, 2));

            const years = [...new Set(students.map(s => s.year))];
            console.log('Unique Student Years (raw values):', years);

            const depts = [...new Set(students.map(s => s.department))];
            console.log('Unique Student Departments:', depts);
        } else {
            console.log('No students found!');
        }

    } catch (err) {
        console.error("Error during inspection:", err);
    } finally {
        console.log('Done.');
        setTimeout(() => process.exit(0), 1000);
    }
};

inspectData();
