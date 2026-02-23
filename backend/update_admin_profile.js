const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

async function updateAdminProfile() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const admin = await User.findOne({ role: 'admin' });
        if (admin) {
            console.log('Old Admin Info:', { name: admin.name, email: admin.email });

            admin.name = 'NAVEEN';
            admin.email = 'nkumar79711@gmail.com';

            await admin.save();
            console.log('✅ Admin profile updated successfully!');
            console.log('New Admin Info:', { name: admin.name, email: admin.email });
        } else {
            console.log('❌ Admin user not found.');
        }
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}
updateAdminProfile();
