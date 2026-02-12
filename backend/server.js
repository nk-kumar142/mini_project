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
app.use(express.json());

// Enable CORS
app.use(cors());

// Import Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const allocationRoutes = require('./routes/allocationRoutes');
const pdfRoutes = require('./routes/pdfRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/allocation', allocationRoutes);
app.use('/api/pdf', pdfRoutes);

// Root route
app.get('/', (req, res) => {
    res.send('Exam Hall Allocation API is running...');
});

// Error Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
