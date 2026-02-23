/**
 * reset_student_passwords.js
 * 
 * Resets ALL student passwords to their register number.
 * This is needed because the email generation script only updated emails,
 * not passwords. Students can then change their password from the dashboard.
 * 
 * Run: node reset_student_passwords.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function resetPasswords() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const students = await User.find({ role: 'student', registerNumber: { $exists: true, $ne: '' } });
    console.log(`📋 Found ${students.length} students to update\n`);

    let updated = 0;
    let failed = 0;

    for (const student of students) {
        try {
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(student.registerNumber, salt);
            await User.updateOne({ _id: student._id }, { password: hashed });
            updated++;
            if (updated <= 10 || updated % 500 === 0) {
                console.log(`  ✏️  ${student.name} → password = ${student.registerNumber}`);
            }
        } catch (err) {
            failed++;
            console.error(`  ❌ Failed for ${student.name}: ${err.message}`);
        }
    }

    console.log(`\n🎉 Done!`);
    console.log(`   Updated : ${updated}`);
    console.log(`   Failed  : ${failed}`);
    console.log(`\nStudents can now login with:`);
    console.log(`   Email    : firstname.deptcode+batchyear@gmail.com`);
    console.log(`   Password : their register number (e.g. 7376262IT101)`);
    await mongoose.disconnect();
}

resetPasswords().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
