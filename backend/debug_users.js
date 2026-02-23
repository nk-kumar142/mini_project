const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

async function debugUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({}, 'name email role registerNumber staffId');
        console.log('--- USER LIST ---');
        console.table(users.map(u => ({
            name: u.name,
            email: u.email,
            role: u.role,
            id: u.registerNumber || u.staffId || 'N/A'
        })));
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}
debugUsers();
