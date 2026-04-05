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

// ONE-TIME: Bulk add students — DELETE AFTER USE
app.get('/api/bulk-add-students', async (req, res) => {
    try {
        const User = require('./models/User');
        const students = [];
        
        // Add 250 students to IT first year
        for (let i = 1; i <= 250; i++) {
            const regNo = `7376262IT${301 + i}`;
            students.push({
                name: `IT Student ${i}`,
                email: `itstudent${i}@it.com`,
                password: 'student123',
                role: 'student',
                registerNumber: regNo,
                department: 'Information Technology',
                year: 'I',
            });
        }

        // Add 10 students to each of the other departments
        const otherDepts = [
            'Mechanical Engineering', 'Civil Engineering', 'Mechatronics Engineering',
            'Artificial Intelligence & Data Science', 'Artificial Intelligence & Machine Learning',
            'Computer Science & Engineering', 'Electronics & Communication Engineering',
            'Electrical & Electronics Engineering'
        ];

        otherDepts.forEach((dept, index) => {
            const prefix = dept.split(' ').map(w => w[0]).join('').toUpperCase();
            for (let i = 1; i <= 10; i++) {
                students.push({
                    name: `${prefix} Student ${i}`,
                    email: `${prefix.toLowerCase()}student${i}@${prefix.toLowerCase()}.com`,
                    password: 'student123',
                    role: 'student',
                    registerNumber: `7376262${prefix}${100 + i}`,
                    department: dept,
                    year: 'I',
                });
            }
        });

        // Loop through and create each student to ensure passwords get hashed
        // Using Promise.all with chunks or just a loop for simplicity in a one-time route
        for (const studentData of students) {
            // Check if already exists to avoid errors on duplicate regNo or email
            const exists = await User.findOne({ $or: [{ email: studentData.email }, { registerNumber: studentData.registerNumber }] });
            if (!exists) {
                await User.create(studentData);
            }
        }
        
        res.json({ success: true, message: `✅ Successfully ensured 250 IT students and extra students for other departments exist.` });
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
