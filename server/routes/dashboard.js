const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRoles } = require('../middleware/auth');
const { getDashboard, getMentorDashboard, getAdminDashboard } = require('../controllers/dashboardController');

router.get('/',       authMiddleware, authorizeRoles('student'),        getDashboard);
router.get('/mentor', authMiddleware, authorizeRoles('mentor', 'admin'), getMentorDashboard);
router.get('/admin',  authMiddleware, authorizeRoles('admin'),           getAdminDashboard);

module.exports = router;
