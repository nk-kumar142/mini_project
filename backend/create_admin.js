const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const email = 'admin@gmail.com';
        const password = 'admin@123';
        const name = 'Admin';

        // Check if already exists
        const existing = await User.findOne({ email });
        if (existing) {
            console.log('Admin already exists with this email:', existing.email);
            // Optional: update password if needed
            existing.password = password;
            await existing.save();
            console.log('✅ Admin password updated to: admin@123');
            process.exit(0);
        }

        const admin = await User.create({
            name,
            email,
            password, // User model will hash this automatically in pre-save hook
            role: 'admin',
        });

        console.log('✅ Admin created successfully!');
        console.log('   Name    :', admin.name);
        console.log('   Email   :', admin.email);
        console.log('   Role    :', admin.role);
        console.log('   Password: admin@123');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

run();
