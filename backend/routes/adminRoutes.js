const express = require('express');
const router = express.Router();
const {
    getStudents,
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
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect);
router.use(admin);

router.get('/students', getStudents);
router.delete('/students/:id', deleteStudent);

router.route('/halls').get(getHalls).post(createHall);
router.route('/halls/:id').put(updateHall).delete(deleteHall);

router.route('/exams').get(getExams).post(createExam);
router.route('/exams/:id').put(updateExam).delete(deleteExam);

router.get('/stats', getStats);

module.exports = router;
