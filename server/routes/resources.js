const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRoles } = require('../middleware/auth');
const ctrl = require('../controllers/resourceController');

router.use(authMiddleware);

router.get('/student',          authorizeRoles('student'),        ctrl.getStudentResources);
router.get('/mentor',           authorizeRoles('mentor','admin'), ctrl.getMentorResources);
router.post('/',                authorizeRoles('mentor','admin'), ctrl.createResource);
router.delete('/:id',           authorizeRoles('mentor','admin'), ctrl.deleteResource);

module.exports = router;
