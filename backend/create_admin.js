const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const User = require('./models/User');

    const existing = await User.findOne({ email: 'naveen@admin.com' });
    if (existing) {
        console.log('Admin already exists:', existing.email);
        process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('naveen1013', salt);

    const admin = await User.create({
        name: 'naveen',
        email: 'naveen@admin.com',
        password: hashedPassword,
        role: 'admin',
    });

    console.log('✅ Admin created successfully!');
    console.log('   Name    :', admin.name);
    console.log('   Email   :', admin.email);
    console.log('   Role    :', admin.role);
    console.log('   Password: naveen1013  (use this to login)');
    process.exit(0);
};

run().catch((err) => {
    console.error('Error:', err.message);
    process.exit(1);
});
