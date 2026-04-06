const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const findStudent = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const email = 'it13010@gmail.com';
        const user = await User.findOne({ email });
        
        if (user) {
            console.log('User found:', {
                id: user._id,
                email: user.email,
                role: user.role,
                registerNumber: user.registerNumber,
                hasPassword: !!user.password
            });
        } else {
            console.log('User not found by email:', email);
        }
        
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

findStudent();
