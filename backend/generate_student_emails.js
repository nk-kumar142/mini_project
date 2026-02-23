/**
 * generate_student_emails.js
 * 
 * Auto-generates email IDs for ALL students using the pattern:
 *   firstname.deptcode+batchyear@gmail.com
 * 
 * Examples:
 *   Jatin N, IT, Year 1 → jatin.it25@gmail.com
 *   Dinesh K, IT, Year 2 → dinesh.it24@gmail.com
 *   Pranav S, IT, Year 3 → pranav.it23@gmail.com
 *   Maya R,  IT, Year 4  → maya.it22@gmail.com
 * 
 * Dept codes:
 *   Information Technology → it
 *   Computer Science       → cs
 *   Electronics            → ec
 *   Mechanical             → me
 *   Civil                  → ce
 *   Electrical             → ee
 * 
 * Default password = registerNumber (student can change from dashboard)
 * 
 * Run: node generate_student_emails.js
 * Add --force flag to overwrite ALL emails (even existing ones):
 *   node generate_student_emails.js --force
 */

const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const FORCE = process.argv.includes('--force');

const DEPT_CODE_MAP = {
    'information technology': 'it',
    'computer science': 'cs',
    'computer science and engineering': 'cs',
    'electronics': 'ec',
    'electronics and communication': 'ec',
    'electronics and communication engineering': 'ec',
    'mechanical': 'me',
    'mechanical engineering': 'me',
    'civil': 'ce',
    'civil engineering': 'ce',
    'electrical': 'ee',
    'electrical and electronics engineering': 'ee',
    'electrical engineering': 'ee',
};

function getDeptCode(department) {
    if (!department) return 'xx';
    const lower = department.toLowerCase().trim();
    if (DEPT_CODE_MAP[lower]) return DEPT_CODE_MAP[lower];
    return lower.replace(/[^a-z]/g, '').slice(0, 2) || 'xx';
}

function getFirstName(name) {
    if (!name) return 'student';
    return name.trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, '') || 'student';
}

function getBatchYear(year) {
    const y = parseInt(year, 10);
    return isNaN(y) ? '25' : (26 - y).toString();
}

async function generateEmails() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const students = await User.find({ role: 'student' });
    console.log(`📋 Found ${students.length} students`);
    console.log(FORCE ? '⚡ FORCE mode: overwriting ALL emails' : '🔄 Normal mode: only updating missing/register-number-style emails\n');

    let updated = 0;
    let skipped = 0;

    // Track generated emails to handle duplicates
    const usedEmails = new Set();

    for (const student of students) {
        const firstName = getFirstName(student.name);
        const deptCode = getDeptCode(student.department);
        const batchYear = getBatchYear(student.year);

        let baseEmail = `${firstName}.${deptCode}${batchYear}@gmail.com`;

        // Handle duplicates
        let finalEmail = baseEmail;
        let counter = 1;
        while (usedEmails.has(finalEmail)) {
            finalEmail = `${firstName}.${deptCode}${batchYear}.${counter}@gmail.com`;
            counter++;
        }
        usedEmails.add(finalEmail);

        const currentEmail = (student.email || '').toLowerCase();

        // Decide whether to update
        const shouldUpdate = FORCE || !currentEmail || currentEmail === student.registerNumber?.toLowerCase();

        if (shouldUpdate) {
            await User.updateOne({ _id: student._id }, { email: finalEmail });
            updated++;
            if (updated <= 20 || updated % 500 === 0) {
                console.log(`  ✏️  ${student.name} (${student.department}, Yr${student.year}) → ${finalEmail}`);
            }
        } else {
            skipped++;
        }
    }

    console.log(`\n🎉 Done!`);
    console.log(`   Updated : ${updated}`);
    console.log(`   Skipped : ${skipped} (already had proper email)`);
    console.log(`\nStudents can now login with:`);
    console.log(`   Email    : firstname.deptcode+batchyear@gmail.com`);
    console.log(`   Password : their register number (e.g. 7376262IT101)`);
    await mongoose.disconnect();
}

generateEmails().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
