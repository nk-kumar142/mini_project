require('dotenv').config();
const User = require('./models/User');
const connectDB = require('./config/db');

// NOTE: Pass PLAIN TEXT password — User model pre-save hook hashes it automatically
const DEFAULT_PASSWORD = 'staff@123';

const staffData = [
    // Information Technology (4)
    { name: 'Dr. Arun Kumar', email: 'arun.it@staff.edu', staffId: 'IT001', subject: 'Data Structures' },
    { name: 'Prof. Meena Devi', email: 'meena.it@staff.edu', staffId: 'IT002', subject: 'Database Management' },
    { name: 'Dr. Ravi Shankar', email: 'ravi.it@staff.edu', staffId: 'IT003', subject: 'Operating Systems' },
    { name: 'Prof. Kavitha R', email: 'kavitha.it@staff.edu', staffId: 'IT004', subject: 'Computer Networks' },

    // Computer Science & Engineering (4)
    { name: 'Dr. Suresh Babu', email: 'suresh.cse@staff.edu', staffId: 'CS001', subject: 'Algorithms' },
    { name: 'Prof. Priya S', email: 'priya.cse@staff.edu', staffId: 'CS002', subject: 'Software Engineering' },
    { name: 'Dr. Karthik M', email: 'karthik.cse@staff.edu', staffId: 'CS003', subject: 'Web Technologies' },
    { name: 'Prof. Divya N', email: 'divya.cse@staff.edu', staffId: 'CS004', subject: 'Machine Learning' },

    // Mechanical Engineering (4)
    { name: 'Dr. Balamurugan K', email: 'bala.mech@staff.edu', staffId: 'ME001', subject: 'Thermodynamics' },
    { name: 'Prof. Senthil V', email: 'senthil.mech@staff.edu', staffId: 'ME002', subject: 'Fluid Mechanics' },
    { name: 'Dr. Anand J', email: 'anand.mech@staff.edu', staffId: 'ME003', subject: 'Manufacturing Technology' },
    { name: 'Prof. Vijay P', email: 'vijay.mech@staff.edu', staffId: 'ME004', subject: 'Machine Design' },

    // Civil Engineering (4)
    { name: 'Dr. Rajesh C', email: 'rajesh.civil@staff.edu', staffId: 'CE001', subject: 'Structural Engineering' },
    { name: 'Prof. Geetha M', email: 'geetha.civil@staff.edu', staffId: 'CE002', subject: 'Environmental Engineering' },
    { name: 'Dr. Mohan L', email: 'mohan.civil@staff.edu', staffId: 'CE003', subject: 'Geotechnical Engineering' },
    { name: 'Prof. Saranya T', email: 'saranya.civil@staff.edu', staffId: 'CE004', subject: 'Transportation Engineering' },

    // Electronics & Communication Engineering (4)
    { name: 'Dr. Prakash R', email: 'prakash.ece@staff.edu', staffId: 'EC001', subject: 'Digital Electronics' },
    { name: 'Prof. Nithya S', email: 'nithya.ece@staff.edu', staffId: 'EC002', subject: 'Communication Systems' },
    { name: 'Dr. Manoj K', email: 'manoj.ece@staff.edu', staffId: 'EC003', subject: 'Signal Processing' },
    { name: 'Prof. Lavanya G', email: 'lavanya.ece@staff.edu', staffId: 'EC004', subject: 'VLSI Design' },

    // Electrical & Electronics Engineering (4)
    { name: 'Dr. Selvam A', email: 'selvam.eee@staff.edu', staffId: 'EE001', subject: 'Power Systems' },
    { name: 'Prof. Eswari D', email: 'eswari.eee@staff.edu', staffId: 'EE002', subject: 'Electric Machines' },
    { name: 'Dr. Murugan S', email: 'murugan.eee@staff.edu', staffId: 'EE003', subject: 'Power Electronics' },
    { name: 'Prof. Sudha V', email: 'sudha.eee@staff.edu', staffId: 'EE004', subject: 'Control Systems' },

    // Mechatronics Engineering (4)
    { name: 'Dr. Ganesh R', email: 'ganesh.mct@staff.edu', staffId: 'MCT001', subject: 'Robotics' },
    { name: 'Prof. Rekha N', email: 'rekha.mct@staff.edu', staffId: 'MCT002', subject: 'Automation Engineering' },
    { name: 'Dr. Vignesh T', email: 'vignesh.mct@staff.edu', staffId: 'MCT003', subject: 'PLC & SCADA' },
    { name: 'Prof. Bharathi K', email: 'bharathi.mct@staff.edu', staffId: 'MCT004', subject: 'Embedded Systems' },

    // Artificial Intelligence & Data Science (4)
    { name: 'Dr. Sathish P', email: 'sathish.aids@staff.edu', staffId: 'AIDS001', subject: 'Artificial Intelligence' },
    { name: 'Prof. Nandhini R', email: 'nandhini.aids@staff.edu', staffId: 'AIDS002', subject: 'Data Analytics' },
    { name: 'Dr. Harish G', email: 'harish.aids@staff.edu', staffId: 'AIDS003', subject: 'Deep Learning' },
    { name: 'Prof. Swetha M', email: 'swetha.aids@staff.edu', staffId: 'AIDS004', subject: 'Big Data' },

    // Artificial Intelligence & Machine Learning (4)
    { name: 'Dr. Praveen K', email: 'praveen.aiml@staff.edu', staffId: 'AIML001', subject: 'Neural Networks' },
    { name: 'Prof. Yamini S', email: 'yamini.aiml@staff.edu', staffId: 'AIML002', subject: 'Natural Language Processing' },
    { name: 'Dr. Dinesh T', email: 'dinesh.aiml@staff.edu', staffId: 'AIML003', subject: 'Computer Vision' },
    { name: 'Prof. Keerthana V', email: 'keerthana.aiml@staff.edu', staffId: 'AIML004', subject: 'Reinforcement Learning' },

    // Computer Science & Business System (4)
    { name: 'Dr. Balaji M', email: 'balaji.csbs@staff.edu', staffId: 'CSBS001', subject: 'Business Analytics' },
    { name: 'Prof. Deepika R', email: 'deepika.csbs@staff.edu', staffId: 'CSBS002', subject: 'ERP Systems' },
    { name: 'Dr. Kumaran S', email: 'kumaran.csbs@staff.edu', staffId: 'CSBS003', subject: 'Cloud Computing' },
    { name: 'Prof. Amudha J', email: 'amudha.csbs@staff.edu', staffId: 'CSBS004', subject: 'Information Security' },
];

const seedStaff = async () => {
    try {
        await connectDB();
        console.log('✅ Connected to MongoDB\n');

        // Delete all existing staff to avoid double-hash leftover junk
        const deleted = await User.deleteMany({ role: 'staff' });
        console.log(`🗑️  Cleared ${deleted.deletedCount} old staff records\n`);

        let added = 0;
        for (const s of staffData) {
            // Pass PLAIN TEXT — the pre-save hook in User.js hashes it
            await User.create({
                name: s.name,
                email: s.email,
                password: DEFAULT_PASSWORD,
                role: 'staff',
                staffId: s.staffId,
                subject: s.subject,
            });
            console.log(`✅ ${s.name} (${s.staffId}) — ${s.subject}`);
            added++;
        }

        console.log(`\n🎉 Done! ${added} staff members added.`);
        console.log(`🔑 Login password for ALL staff: staff@123`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed failed:', err.message);
        process.exit(1);
    }
};

seedStaff();
