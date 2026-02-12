const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const adminExists = await User.findOne({ role: 'admin' });

        if (!adminExists) {
            await User.create({
                name: 'System Admin',
                email: 'admin@example.com',
                password: 'admin123', // Will be hashed by pre-save hook
                role: 'admin',
            });
            console.log('Admin user created: admin@example.com / admin123');
        } else {
            console.log('Admin user already exists');
        }

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedAdmin();
