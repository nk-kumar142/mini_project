const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const departments = [
    { name: 'Electronics & Communication Engineering', code: 'ECE' },
    { name: 'Electrical & Electronics Engineering', code: 'EEE' },
    { name: 'Information Technology', code: 'IT' },
    { name: 'Computer Science & Engineering', code: 'CSE' },
    { name: 'Computer Science & Business System', code: 'CSBS' },
    { name: 'Artificial Intelligence & Machine Learning', code: 'AIML' },
    { name: 'Artificial Intelligence & Data Science', code: 'AIDS' },
    { name: 'Mechanical Engineering', code: 'MECH' },
    { name: 'Mechatronics Engineering', code: 'MCT' },
    { name: 'Civil Engineering', code: 'CIVIL' }
];

const countsByYear = {
    "1": { "ECE": 250, "EEE": 100, "IT": 210, "CSE": 250, "CSBS": 100, "AIML": 90, "AIDS": 150, "MECH": 50, "MCT": 60, "CIVIL": 40 },
    "2": { "ECE": 250, "EEE": 120, "IT": 239, "CSE": 270, "CSBS": 70, "AIML": 70, "AIDS": 250, "MECH": 40, "MCT": 50, "CIVIL": 40 },
    "3": { "ECE": 100, "EEE": 100, "IT": 100, "CSE": 100, "CSBS": 100, "AIML": 100, "AIDS": 100, "MECH": 100, "MCT": 100, "CIVIL": 100 }, // Default for 3rd year
    "4": { "ECE": 200, "EEE": 120, "IT": 200, "CSE": 250, "CSBS": 80, "AIML": 60, "AIDS": 100, "MECH": 50, "MCT": 60, "CIVIL": 30 }
};

const names = ["Abhay", "Balaji", "Chetan", "Dinesh", "Elango", "Faizal", "Ganesh", "Hemant", "Ishwar", "Jatin", "Kiran", "Lalit", "Mohan", "Nithin", "Omkar", "Pranav", "Qasim", "Rishi", "Sanjay", "Tarun", "Uday", "Vijay", "Wasim", "Yash", "Zameer", "Aditi", "Bhavna", "Charu", "Deepa", "Ekta", "Farah", "Gouri", "Heena", "Isha", "Juhi", "Kajal", "Lata", "Meera", "Neha", "Ojaswi", "Pooja", "Rani", "Sonal", "Tanu", "Uma", "Vidya", "Maya", "Zoya"];

const reseedStudentsPrecision = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing students
        await User.deleteMany({ role: 'student' });
        console.log('Cleared existing student database.');

        const collegeCode = "7376";
        const constantDigit = "2";
        const currentYearPrefix = 26; // 2026 Academic context

        for (let year = 1; year <= 4; year++) {
            console.log(`\nGenerating Year ${year} Students...`);
            const yearStr = year.toString();
            const yearCounts = countsByYear[yearStr];
            const admissionYear = currentYearPrefix - (year - 1);

            let yearStudents = [];

            for (const dept of departments) {
                const count = yearCounts[dept.code] || 0;
                process.stdout.write(`  ${dept.code}: ${count} students`);

                for (let i = 1; i <= count; i++) {
                    const seq = (100 + i).toString();
                    const rollNo = `${collegeCode}${admissionYear}${constantDigit}${dept.code}${seq}`;
                    const name = `${names[Math.floor(Math.random() * names.length)]} ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;

                    yearStudents.push({
                        name: name,
                        email: `${rollNo.toLowerCase()}@college.edu`,
                        password: 'password123',
                        role: 'student',
                        registerNumber: rollNo,
                        department: dept.name,
                        year: yearStr
                    });

                    if (yearStudents.length >= 200) {
                        await User.insertMany(yearStudents);
                        yearStudents = [];
                    }
                }
                process.stdout.write(' - Done\n');
            }

            if (yearStudents.length > 0) {
                await User.insertMany(yearStudents);
            }
        }

        const totalCount = await User.countDocuments({ role: 'student' });
        console.log(`\nSuccess! Seeded ${totalCount} students total.`);
        process.exit();
    } catch (error) {
        console.error('Error re-seeding students:', error);
        process.exit(1);
    }
};

reseedStudentsPrecision();
