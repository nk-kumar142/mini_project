const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Enable CORS
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS policy: Origin ${origin} not allowed`));
        }
    },
    credentials: true,
};
app.use(cors(corsOptions));

// Import Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const allocationRoutes = require('./routes/allocationRoutes');
const pdfRoutes = require('./routes/pdfRoutes');
const staffRoutes = require('./routes/staffRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/allocation', allocationRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/staff', staffRoutes);

// Root route
app.get('/', (req, res) => {
    res.send('Server is live');
});

// ONE-TIME: Create new admin account — DELETE AFTER USE
app.get('/api/create-admin', async (req, res) => {
    try {
        const User = require('./models/User');
        const existing = await User.findOne({ email: 'admin@gmail.com' });
        if (existing) {
            return res.json({ message: 'Admin already exists', email: existing.email });
        }
        // Pass plain password — pre-save hook hashes it correctly
        const admin = await User.create({
            name: 'Admin',
            email: 'admin@gmail.com',
            password: 'admin@123',
            role: 'admin',
        });
        res.json({ success: true, message: '✅ Admin created!', email: admin.email, password: 'admin@123' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ONE-TIME: Perfect cleanup & bulk add (150 students for ALL 10 departments) — DELETE AFTER USE
app.get('/api/bulk-add-students', async (req, res) => {
    try {
        const User = require('./models/User');
        const bcrypt = require('bcryptjs');
        
        const firstNames = ['Aaditya', 'Arjun', 'Akash', 'Bhavya', 'Chaitanya', 'Deepak', 'Faisal', 'Gautam', 'Harsh', 'Ishaan', 'Jatin', 'Kavya', 'Lakshya', 'Manish', 'Nikhil', 'Omkar', 'Parth', 'Rahul', 'Sameer', 'Tanmay', 'Utkarsh', 'Varun', 'Yash', 'Zaid', 'Amit', 'Ankit', 'Brijesh', 'Chandra', 'Dinesh', 'Ganesh', 'Hemant', 'Inder', 'Jitendra', 'Kamal', 'Lokesh', 'Mahendra', 'Nitin', 'Pankaj', 'Rajesh', 'Suresh', 'Tarun', 'Umesh', 'Vijay', 'Yogesh', 'Abhinav', 'Alok', 'Aman', 'Arpan', 'Ayush', 'Bharat', 'Chirag', 'Darshan', 'Divyansh', 'Eshwar', 'Gaurav', 'Hardik', 'Ishwar', 'Jai', 'Kartik', 'Mayank', 'Navin', 'Pranav', 'Rishabh', 'Saurabh', 'Tushar', 'Vaibhav', 'Vivek'];
        const lastNames = ['Kumar', 'Singh', 'Sharma', 'Verma', 'Gupta', 'Malhotra', 'Bhardwaj', 'Choudhary', 'Thakur', 'Yadav', 'Patel', 'Reddy', 'Nair', 'Iyer', 'Pillai', 'Joshi', 'Kulkarni', 'Deshmukh', 'Mehta', 'Shah', 'Agarwal', 'Bansal', 'Goel', 'Mittal', 'Pandey', 'Mishra', 'Trivedi', 'Chaturvedi', 'Saxena', 'Srivastava', 'Rao', 'Kaur', 'Gill', 'Sandhu', 'Sidhu'];

        const getRandomName = () => {
            const f = firstNames[Math.floor(Math.random() * firstNames.length)];
            const l = lastNames[Math.floor(Math.random() * lastNames.length)];
            return `${f} ${l}`;
        };

        const departments = [
            { name: 'Information Technology', prefix: 'IT' },
            { name: 'Mechanical Engineering', prefix: 'MECH' },
            { name: 'Civil Engineering', prefix: 'CIVIL' },
            { name: 'Mechatronics Engineering', prefix: 'MCT' },
            { name: 'Artificial Intelligence & Data Science', prefix: 'AIDS' },
            { name: 'Artificial Intelligence & Machine Learning', prefix: 'AIML' },
            { name: 'Computer Science & Engineering', prefix: 'CSE' },
            { name: 'Electronics & Communication Engineering', prefix: 'ECE' },
            { name: 'Electrical & Electronics Engineering', prefix: 'EEE' },
            { name: 'Computer Science & Business System', prefix: 'CSBS' }
        ];

        // 1. DELETE ALL EXISTING STUDENTS FIRST to ensure exactly 150 per dept
        await User.deleteMany({ role: 'student' });

        // 2. Prepare bulk insert
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('student123', salt);
        const studentsToCreate = [];

        for (const dept of departments) {
            for (let i = 1; i <= 150; i++) {
                const regNo = `7376262${dept.prefix}${2000 + i}`;
                const email = `${dept.prefix.toLowerCase()}${2000 + i}@gmail.com`;
                
                studentsToCreate.push({
                    name: getRandomName(),
                    email: email,
                    password: hashedPassword,
                    role: 'student',
                    registerNumber: regNo,
                    department: dept.name,
                    year: 'I',
                });
            }
        }

        // 3. Optimized Bulk Create
        if (studentsToCreate.length > 0) {
            await User.insertMany(studentsToCreate);
        }
        
        res.json({ 
            success: true, 
            message: `✅ Perfect population complete! Each department now has exactly 150 students with unique names. Total students: ${studentsToCreate.length}` 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Error Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

module.exports = app;
