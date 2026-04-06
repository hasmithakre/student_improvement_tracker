const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRoles } = require('../middleware/auth');
const ctrl = require('../controllers/feedbackController');

router.use(authMiddleware);

router.get('/student',          authorizeRoles('student'),        ctrl.getStudentFeedbacks);
router.get('/student/unread',   authorizeRoles('student'),        ctrl.getUnreadCount);
router.get('/mentor',           authorizeRoles('mentor','admin'), ctrl.getMentorFeedbacks);
router.post('/',                authorizeRoles('mentor','admin'), ctrl.createFeedback);
router.delete('/:id',           authorizeRoles('mentor','admin'), ctrl.deleteFeedback);

module.exports = router;
