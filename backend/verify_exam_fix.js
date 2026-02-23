const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function verifyFix() {
    try {
        // 1. Login
        console.log('1. Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@example.com',
            password: 'admin123'
        });
        const token = loginRes.data.token;
        console.log('   Login successful.');

        // 2. Create Exam with Array Department
        console.log('\n2. Creating Multi-Dept Exam...');
        const examData = {
            examName: "Test Multi Dept Exam",
            examDate: "2026-03-20",
            subject: "Test Subject",
            department: ["Information Technology", "Computer Science & Engineering"], // ARRAY
            year: "1",
            session: "FN",
            time: "10:00 AM - 1:00 PM"
        };

        const createRes = await axios.post(`${API_URL}/admin/exams`, examData, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('   Response Status:', createRes.status);
        console.log('   Created Exam:', createRes.data.examName);
        console.log('   Departments:', createRes.data.department);

        if (Array.isArray(createRes.data.department) && createRes.data.department.length === 2) {
            console.log('\nSUCCESS: Exam created with multiple departments!');
        } else {
            console.log('\nFAILURE: Department is not an array or has wrong length.');
        }

    } catch (error) {
        console.error('\nTEST FAILED:', error.response?.data || error.message);
    }
}

verifyFix();
