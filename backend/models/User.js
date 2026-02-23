const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            required: true,
            enum: ['admin', 'student', 'staff'],
            default: 'student',
        },
        staffId: {
            type: String,
            required: function () { return this.role === 'staff'; },
            unique: true,
            sparse: true,
        },
        subject: {
            type: String,
            required: function () { return this.role === 'staff'; },
        },
        registerNumber: {
            type: String,
            required: function () { return this.role === 'student'; },
            unique: true,
            sparse: true,
        },
        department: {
            type: String,
            required: function () { return this.role === 'student' || this.role === 'staff'; },
        },
        year: {
            type: String,
            required: function () { return this.role === 'student'; },
        },
        profileImage: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
module.exports = User;
