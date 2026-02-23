const express = require('express');
const router = express.Router();
const {
    getStudents,
    createStudent,
    bulkCreateStudents,
    updateStudent,
    deleteStudent,
    getHalls,
    createHall,
    updateHall,
    deleteHall,
    getExams,
    createExam,
    updateExam,
    deleteExam,
    getStats,
    getStaffList,
    createStaffMember,
    updateStaffMember,
    deleteStaffMember,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/exams').get(getExams);

router.use(admin);

router.route('/students').get(getStudents).post(createStudent);
router.post('/students/bulk', bulkCreateStudents);
router.route('/students/:id').put(updateStudent).delete(deleteStudent);

router.route('/halls').get(getHalls).post(createHall);
router.route('/halls/:id').put(updateHall).delete(deleteHall);

router.post('/exams', createExam);
router.route('/exams/:id').put(updateExam).delete(deleteExam);

router.get('/stats', getStats);

router.route('/staff').get(getStaffList).post(createStaffMember);
router.route('/staff/:id').put(updateStaffMember).delete(deleteStaffMember);

module.exports = router;
