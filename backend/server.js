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

// ONE-TIME ADMIN SETUP ROUTE — DELETE AFTER USE
app.get('/api/setup-admin', async (req, res) => {
    try {
        const User = require('./models/User');
        const bcrypt = require('bcryptjs');

        const existing = await User.findOne({ role: 'admin', name: 'naveen' });
        if (existing) {
            return res.json({ message: 'Admin already exists', email: existing.email });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('naveen1013', salt);

        const admin = await User.create({
            name: 'naveen',
            email: 'naveen@admin.com',
            password: hashedPassword,
            role: 'admin',
        });

        res.json({
            success: true,
            message: '✅ Admin created successfully!',
            email: admin.email,
            password: 'naveen1013',
            note: 'DELETE THIS ROUTE FROM server.js after use!'
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
