const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('CONNECTED');
        const students = await User.find({ role: 'student' }).limit(5);
        console.log('Total students found:', students.length);
        if (students.length > 0) {
            console.log('SAMPLE STUDENT YEAR:', JSON.stringify(students[0].year));
            console.log('SAMPLE STUDENT DEPT:', JSON.stringify(students[0].department));
        } else {
            console.log('NO STUDENTS!');
        }
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
