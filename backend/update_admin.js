const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

async function updateAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const admin = await User.findOne({ role: 'admin' });
        if (admin) {
            admin.password = 'admin@123';
            await admin.save();
            console.log('✅ Admin password updated to: admin@123');
        } else {
            console.log('❌ Admin user not found.');
        }
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}
updateAdmin();
