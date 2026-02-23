const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

async function testPassword() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const admin = await User.findOne({ role: 'admin' });
        if (admin) {
            console.log('Admin found:', admin.email);
            const isMatch = await bcrypt.compare('admin@123', admin.password);
            console.log('Direct Bcrypt Match ("admin@123"):', isMatch);

            if (!isMatch) {
                console.log('Updating password to admin@123...');
                const salt = await bcrypt.genSalt(10);
                const hashed = await bcrypt.hash('admin@123', salt);
                admin.password = hashed;
                await admin.save();
                console.log('Password updated and saved.');

                const reCheck = await bcrypt.compare('admin@123', admin.password);
                console.log('After update, Match:', reCheck);
            }
        } else {
            console.log('Admin user NOT FOUND in database.');
        }
        process.exit(0);
    } catch (error) {
        console.error('FATAL ERROR:', error);
        process.exit(1);
    }
}
testPassword();
