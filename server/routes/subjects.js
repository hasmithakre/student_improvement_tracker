const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRoles } = require('../middleware/auth');
const { subjectValidator, markValidator } = require('../middleware/validate');
const ctrl = require('../controllers/subjectController');

router.use(authMiddleware);

// Student: view + set target score
router.get('/',                authorizeRoles('student'), ctrl.getSubjects);
router.put('/:id/target',      authorizeRoles('student'), ctrl.setTargetScore);

// Mentor + Admin: full control over students
router.get('/mentor/students',                                                          authorizeRoles('mentor','admin'), ctrl.getAllStudents);
router.get('/mentor/students/:studentId/subjects',                                      authorizeRoles('mentor','admin'), ctrl.getStudentSubjects);
router.post('/mentor/students/:studentId/subjects',             subjectValidator,       authorizeRoles('mentor','admin'), ctrl.addSubjectForStudent);
router.post('/mentor/students/:studentId/subjects/:id/marks',   markValidator,          authorizeRoles('mentor','admin'), ctrl.addMarkForStudent);
router.delete('/mentor/students/:studentId/subjects/:id/marks/:markId',                 authorizeRoles('mentor','admin'), ctrl.deleteMarkForStudent);

// Admin only
router.get('/admin/users',               authorizeRoles('admin'), ctrl.getAllUsers);
router.put('/admin/users/:userId/role',  authorizeRoles('admin'), ctrl.updateUserRole);

module.exports = router;
