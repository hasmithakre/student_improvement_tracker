const express = require('express');
const router  = express.Router();
const { authMiddleware, authorizeRoles } = require('../middleware/auth');
const ctrl = require('../controllers/attendanceController');

router.use(authMiddleware);

// Student — read only
router.get('/my', authorizeRoles('student'), ctrl.getMyAttendance);

// Mentor / Admin — full control
router.get('/students',                                           authorizeRoles('mentor','admin'), ctrl.getStudentsList);
router.get('/students/:studentId/subjects',                       authorizeRoles('mentor','admin'), ctrl.getStudentSubjectsForAttendance);
router.get('/students/:studentId/subjects/:subjectId',            authorizeRoles('mentor','admin'), ctrl.getStudentAttendance);
router.post('/students/:studentId/subjects/:subjectId/period',    authorizeRoles('mentor','admin'), ctrl.markPeriod);
router.post('/students/:studentId/subjects/:subjectId/day',       authorizeRoles('mentor','admin'), ctrl.markDay);
router.delete('/students/:studentId/subjects/:subjectId/periods/:periodId', authorizeRoles('mentor','admin'), ctrl.deletePeriod);

module.exports = router;
