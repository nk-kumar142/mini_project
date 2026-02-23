const mongoose = require('mongoose');
const User = require('../models/User');
const Hall = require('../models/Hall');
const Exam = require('../models/Exam');
const Allocation = require('../models/Allocation');

// @desc    Automatically allocate halls
// @route   POST /api/allocation/allocate
// @access  Admin
const allocateHalls = async (req, res) => {
    let { examId, examIds } = req.body;
    console.log(`[ALGO] Starting allocation process...`);

    try {
        let examsToProcess = [];

        if (examId === 'ALL_UPCOMING') {
            // Find all unique upcoming exam dates
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Get all upcoming exams sorted by date
            const upcomingExams = await Exam.find({ examDate: { $gte: today } }).sort({ examDate: 1 });
            examsToProcess = upcomingExams;
        } else if (Array.isArray(examIds) && examIds.length > 0) {
            // Bulk targeted allocation for selected IDs
            const validIds = examIds.filter(id => mongoose.Types.ObjectId.isValid(id));
            if (validIds.length === 0) {
                return res.status(400).json({ message: 'No valid Exam IDs provided.' });
            }
            examsToProcess = await Exam.find({ _id: { $in: validIds } });
        } else if (examId) {
            if (!mongoose.Types.ObjectId.isValid(examId)) {
                return res.status(400).json({ message: `Invalid Exam ID format: "${examId}"` });
            }
            const targetExam = await Exam.findById(examId);
            if (targetExam) examsToProcess.push(targetExam);
        } else {
            // Priority 1 - Earliest upcoming exam
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const targetExam = await Exam.findOne({ examDate: { $gte: today } }).sort({ examDate: 1 });
            if (targetExam) examsToProcess.push(targetExam);
            // Priority 2 - If no upcoming, take the latest past exam
            if (!targetExam && examsToProcess.length === 0) {
                const pastExam = await Exam.findOne().sort({ examDate: -1 });
                if (pastExam) examsToProcess.push(pastExam);
            }
        }

        if (examsToProcess.length === 0) {
            return res.status(404).json({ message: 'No exams found to allocate.' });
        }

        // DE-DUPLICATE SLOTS: Identify unique (Date + Session) combinations
        const uniqueSlots = [];
        const seenSlots = new Set();

        for (const exam of examsToProcess) {
            const dateStr = new Date(exam.examDate).toISOString().split('T')[0];
            const slotKey = `${dateStr}-${exam.session}`;
            if (!seenSlots.has(slotKey)) {
                uniqueSlots.push(exam);
                seenSlots.add(slotKey);
            }
        }

        console.log(`[ALGO] Processing ${uniqueSlots.length} unique exam slots sequentially.`);

        const results = [];
        for (const targetExam of uniqueSlots) {
            const result = await processAllocationForSlot(targetExam);
            results.push(result);
        }

        const successCount = results.filter(r => r.success).length;
        const failCount = results.length - successCount;
        const totalAllocated = results.reduce((sum, r) => sum + (r.allocatedCount || 0), 0);

        if (failCount > 0 && successCount === 0) {
            return res.status(400).json({
                message: `Failed to allocate for all selected exams. First error: ${results.find(r => !r.success).message}`
            });
        }

        res.status(201).json({
            message: `Batch Allocation Complete. Processed ${successCount} slots, ${failCount} failed. Total allocated: ${totalAllocated}.`,
            details: results
        });

    } catch (error) {
        console.error('Allocation Error:', error);
        res.status(500).json({ message: error.message });
    }
};

const normalizeYear = (y) => {
    if (!y) return 0;
    const str = String(y).trim().toUpperCase();
    if (str === 'I' || str === '1') return 1;
    if (str === 'II' || str === '2') return 2;
    if (str === 'III' || str === '3') return 3;
    if (str === 'IV' || str === '4') return 4;
    return 0; // unknown
};

// Helper function to process a single slot
const processAllocationForSlot = async (targetExam) => {
    try {
        console.log(`[ALGO] Triggered for slot: ${targetExam.examName} (${targetExam.examDate})`);

        // 1. Identify all exams in the same time slot (Normalized Date)
        const targetDateStr = new Date(targetExam.examDate).toISOString().split('T')[0];

        const allExams = await Exam.find({ session: targetExam.session });
        const allExamsInSlot = allExams.filter(e => {
            const eDateStr = new Date(e.examDate).toISOString().split('T')[0];
            return eDateStr === targetDateStr;
        });

        const examIdsInSlot = allExamsInSlot.map(e => e._id);
        console.log(`[ALGO] Found ${allExamsInSlot.length} exams in slot ${targetDateStr} ${targetExam.session}`);

        // 2. Fetch all eligible students for all exams in this slot
        const studentsInSlot = [];
        const studentToExamMap = {};

        for (const exam of allExamsInSlot) {
            // Normalize: exam.department may be an Array ['IT','CSE'] or a legacy String "IT, CSE"
            let deptList = [];
            if (Array.isArray(exam.department)) {
                deptList = exam.department
                    .flatMap(d => d.split(',').map(s => s.trim()))
                    .filter(Boolean);
            } else if (typeof exam.department === 'string') {
                deptList = exam.department.split(',').map(s => s.trim()).filter(Boolean);
            }

            const isAllDepts = deptList.includes('All Departments') || deptList.length === 0;

            let query = { role: 'student' };
            if (!isAllDepts) {
                query.department = { $in: deptList };
            }

            const candidates = await User.find(query);

            const targetYear = normalizeYear(exam.year);
            const verifiedStudents = candidates.filter(s => {
                if (!exam.year) return true;
                if (isAllDepts && !exam.year) return true;
                const studentYear = normalizeYear(s.year);
                return studentYear === targetYear;
            });

            verifiedStudents.forEach(s => {
                if (!studentToExamMap[s._id.toString()]) {
                    studentsInSlot.push(s);
                    studentToExamMap[s._id.toString()] = exam._id;
                }
            });
        }

        if (studentsInSlot.length === 0) {
            return { success: false, message: `No eligible students found for slot ${targetDateStr}.` };
        }

        // Group students by department (Global)
        const studentsByDept = {};
        const departmentsInSlot = [...new Set(studentsInSlot.map(s => s.department))];
        departmentsInSlot.forEach(dept => {
            studentsByDept[dept] = studentsInSlot.filter(s => s.department === dept);
        });

        // 3. Clear existing allocations for ALL exams in this slot
        await Allocation.deleteMany({ examId: { $in: examIdsInSlot } });

        // 4. Find available halls
        const availableHalls = await Hall.find({}).sort({ hallName: 1 });
        if (availableHalls.length === 0) {
            return { success: false, message: 'No halls defined in the system.' };
        }

        // 5. Select halls needed
        let totalNeededCapacity = studentsInSlot.length;
        let runningCapacity = 0;
        const selectedHalls = [];
        for (const hall of availableHalls) {
            selectedHalls.push(hall);
            runningCapacity += hall.capacity;
            if (runningCapacity >= totalNeededCapacity) break;
        }

        if (runningCapacity < totalNeededCapacity) {
            return { success: false, message: `Insufficient hall capacity. Need ${totalNeededCapacity}, have ${runningCapacity}.` };
        }

        // 6. Proportional Distribution
        const totalToAllocate = Math.min(studentsInSlot.length, runningCapacity);
        const departmentRatioMap = {};
        departmentsInSlot.forEach(dept => {
            departmentRatioMap[dept] = studentsByDept[dept].length / studentsInSlot.length;
        });

        const remainingStudentsByDept = {};
        departmentsInSlot.forEach(dept => {
            remainingStudentsByDept[dept] = [...studentsByDept[dept]];
        });

        const finalAllocations = [];
        let totalStudentsAllocated = 0;

        for (const hall of selectedHalls) {
            const hallCapacity = hall.capacity;
            const studentsRemainingGlobal = totalToAllocate - totalStudentsAllocated;
            const hallTargetFill = Math.min(hallCapacity, studentsRemainingGlobal);

            const hallDeptTargets = {};
            let hallSum = 0;

            departmentsInSlot.forEach(dept => {
                let count = Math.floor(departmentRatioMap[dept] * hallTargetFill);
                count = Math.min(count, remainingStudentsByDept[dept].length);
                hallDeptTargets[dept] = count;
                hallSum += count;
            });

            while (hallSum < hallTargetFill) {
                const bestDept = departmentsInSlot
                    .filter(d => remainingStudentsByDept[d].length > hallDeptTargets[d])
                    .sort((a, b) => (remainingStudentsByDept[b].length - hallDeptTargets[b]) - (remainingStudentsByDept[a].length - hallDeptTargets[a]))[0];

                if (!bestDept) break;
                hallDeptTargets[bestDept]++;
                hallSum++;
            }

            const studentsForThisHall = {};
            departmentsInSlot.forEach(dept => {
                studentsForThisHall[dept] = remainingStudentsByDept[dept].splice(0, hallDeptTargets[dept]);
            });

            // 7. Strict Checkerboard Seating Logic (Per Hall)
            const COLS = 10;
            const ROWS = Math.ceil(hallCapacity / COLS);
            const grid = Array(ROWS).fill().map(() => Array(COLS).fill(null));

            for (let seatIdx = 0; seatIdx < hallCapacity; seatIdx++) {
                const totalInHall = Object.values(studentsForThisHall).reduce((sum, arr) => sum + arr.length, 0);
                if (totalInHall === 0) break;

                const r = Math.floor(seatIdx / COLS);
                const c = seatIdx % COLS;

                const leftDept = c > 0 ? grid[r][c - 1] : null;
                const topDept = r > 0 ? grid[r - 1][c] : null;

                const availableDepts = departmentsInSlot.filter(d => studentsForThisHall[d].length > 0);
                let chosenDept = null;

                const bestDepts = availableDepts.filter(d => {
                    const dNorm = d.trim();
                    const isLeftMatch = leftDept && (dNorm === leftDept.trim());
                    const isTopMatch = topDept && (dNorm === topDept.trim());
                    return !isLeftMatch && !isTopMatch;
                });

                if (bestDepts.length > 0) {
                    chosenDept = bestDepts.sort((a, b) => studentsForThisHall[b].length - studentsForThisHall[a].length)[0];
                } else {
                    const minorConflictDepts = availableDepts.filter(d => {
                        const dNorm = d.trim();
                        const isLeftMatch = leftDept && (dNorm === leftDept.trim());
                        const isTopMatch = topDept && (dNorm === topDept.trim());
                        return !isLeftMatch || !isTopMatch;
                    });
                    if (minorConflictDepts.length > 0) {
                        chosenDept = minorConflictDepts.sort((a, b) => studentsForThisHall[b].length - studentsForThisHall[a].length)[0];
                    } else {
                        chosenDept = availableDepts.sort((a, b) => studentsForThisHall[b].length - studentsForThisHall[a].length)[0];
                    }
                }

                if (chosenDept) {
                    const student = studentsForThisHall[chosenDept].shift();
                    grid[r][c] = chosenDept;
                    finalAllocations.push({
                        studentId: student._id,
                        hallId: hall._id,
                        examId: studentToExamMap[student._id.toString()],
                        seatNumber: seatIdx + 1,
                    });
                    totalStudentsAllocated++;
                }
                if (totalStudentsAllocated >= totalToAllocate) break;
            }
            if (totalStudentsAllocated >= totalToAllocate) break;
        }

        await Allocation.insertMany(finalAllocations);
        return {
            success: true,
            allocatedCount: finalAllocations.length,
            message: `Allocated ${finalAllocations.length} seats for ${targetDateStr} ${targetExam.session}`
        };

    } catch (error) {
        console.error(`Error processing slot ${targetExam.examDate}:`, error);
        return { success: false, message: error.message };
    }
};

const getAllAllocations = async (req, res) => {
    const allocations = await Allocation.find({})
        .populate('studentId', 'name registerNumber department year')
        .populate('hallId', 'hallName building')
        .populate('examId', 'examName examDate subject session time');
    res.json(allocations);
};

const getMyAllocation = async (req, res) => {
    const allocations = await Allocation.find({ studentId: req.user._id })
        .populate('hallId')
        .populate('examId');
    res.json(allocations);
};

const requestDownload = async (req, res) => {
    try {
        const allocation = await Allocation.findById(req.params.id);
        if (!allocation) {
            return res.status(404).json({ message: 'Allocation not found' });
        }
        if (allocation.studentId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        allocation.downloadRequestStatus = 'requested';
        await allocation.save();
        res.json({ message: 'Download requested and approved successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const approveDownload = async (req, res) => {
    try {
        const allocation = await Allocation.findById(req.params.id);
        if (!allocation) {
            return res.status(404).json({ message: 'Allocation not found' });
        }

        allocation.downloadRequestStatus = 'approved';
        await allocation.save();
        res.json({ message: 'Download approved successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const approveSubjectDownloads = async (req, res) => {
    try {
        const { subject } = req.body;
        if (!subject) {
            return res.status(400).json({ message: 'Subject is required' });
        }

        // Find all exams matching the subject
        const exams = await Exam.find({ subject: subject });
        const examIds = exams.map(e => e._id);

        if (examIds.length === 0) {
            return res.status(404).json({ message: 'No exams found for this subject' });
        }

        // Update all allocations for these exams
        const result = await Allocation.updateMany(
            { examId: { $in: examIds } },
            { $set: { downloadRequestStatus: 'approved' } }
        );

        res.json({
            message: `Successfully approved ${result.modifiedCount} allocations for ${subject}`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getHallAllocations = async (req, res) => {
    try {
        const { hallId, examId } = req.params;
        const requestExam = await Exam.findById(examId);
        if (!requestExam) {
            return res.status(404).json({ message: 'Exam not found' });
        }

        const targetDateStr = new Date(requestExam.examDate).toISOString().split('T')[0];

        const allExams = await Exam.find({ session: requestExam.session });
        const sameSlotExams = allExams.filter(e => {
            const eDateStr = new Date(e.examDate).toISOString().split('T')[0];
            return eDateStr === targetDateStr;
        });
        const examIds = sameSlotExams.map(e => e._id);

        const allocations = await Allocation.find({
            hallId: hallId,
            examId: { $in: examIds }
        })
            .populate('studentId', 'registerNumber department')
            .populate('hallId', 'hallName capacity')
            .populate('examId', 'examName session examDate');

        res.json(allocations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const resetAllocations = async (req, res) => {
    try {
        const result = await Allocation.deleteMany({});
        res.json({ message: `All allocations cleared successfully.`, deletedCount: result.deletedCount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    allocateHalls,
    getAllAllocations,
    getMyAllocation,
    requestDownload,
    approveDownload,
    approveSubjectDownloads,
    getHallAllocations,
    resetAllocations,
};
