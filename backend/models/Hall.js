const mongoose = require('mongoose');

const hallSchema = mongoose.Schema(
    {
        hallName: {
            type: String,
            required: true,
            unique: true,
        },
        building: {
            type: String,
            required: true,
        },
        capacity: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Hall = mongoose.model('Hall', hallSchema);
module.exports = Hall;
