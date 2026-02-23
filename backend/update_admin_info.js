const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

async function updateAdminInfo() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);

        // Update Admin
        const admin = await User.findOne({ role: 'admin' });
        if (admin) {
            admin.name = 'NAVEEN';
            admin.email = 'nkumar79711@gmail.com';
            await admin.save();
            console.log('✅ Admin profile updated and saved with save() method.');
        } else {
            console.log('Admin not found.');
        }
        process.exit(0);
    } catch (error) {
        console.error('FATAL ERROR:', error);
        process.exit(1);
    }
}
updateAdminInfo();
