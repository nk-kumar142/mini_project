const mongoose = require('mongoose');

const dutyAllocationSchema = mongoose.Schema(
    {
        staffId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        examId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Exam',
            required: true,
        },
        hallId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Hall',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate duty allocation for the same staff and exam
dutyAllocationSchema.index({ staffId: 1, examId: 1 }, { unique: true });

const DutyAllocation = mongoose.model('DutyAllocation', dutyAllocationSchema);
module.exports = DutyAllocation;
