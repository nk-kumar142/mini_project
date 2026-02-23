const mongoose = require('mongoose');

const examSchema = mongoose.Schema(
    {
        examName: {
            type: String,
            required: true,
        },
        examDate: {
            type: Date,
            required: true,
        },
        subject: {
            type: String,
            required: true,
        },
        department: {
            type: [String],
            required: true,
        },
        year: {
            type: String,
            required: true,
        },
        session: {
            type: String,
            enum: ['FN', 'AN'],
            required: true,
        },
        time: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Exam = mongoose.model('Exam', examSchema);
module.exports = Exam;
