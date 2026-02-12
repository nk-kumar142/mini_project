const mongoose = require('mongoose');

const allocationSchema = mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        hallId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Hall',
            required: true,
        },
        examId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Exam',
            required: true,
        },
        seatNumber: {
            type: Number,
            required: true,
        },
        downloadRequestStatus: {
            type: String,
            enum: ['none', 'requested', 'approved'],
            default: 'none',
        },
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate allocation for the same student and exam
allocationSchema.index({ studentId: 1, examId: 1 }, { unique: true });

const Allocation = mongoose.model('Allocation', allocationSchema);
module.exports = Allocation;
