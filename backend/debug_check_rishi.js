const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Allocation = require('./models/Allocation');
const User = require('./models/User');

dotenv.config();

const checkAllocations = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const user = await User.findOne({ name: /Rishi/i });
        if (!user) {
            console.log('User Rishi not found');
            process.exit(1);
        }
        console.log(`Found User: ${user.name} (${user._id})`);

        const allocations = await Allocation.find({ studentId: user._id })
            .populate('examId')
            .populate('hallId');

        console.log(`Found ${allocations.length} allocations for ${user.name}`);
        allocations.forEach((alc, i) => {
            console.log(`${i + 1}. Exam: ${alc.examId?.examName}, Subject: ${alc.examId?.subject}, Hall: ${alc.hallId?.hallName}, Seat: ${alc.seatNumber}`);
        });

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkAllocations();
