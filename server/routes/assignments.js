const express = require('express');
const router = express.Router();
const { authMiddleware: auth } = require('../middleware/auth');
const { assignmentValidator, assignmentUpdateValidator, mongoIdValidator } = require('../middleware/validate');
const { getAssignments, createAssignment, updateAssignment, deleteAssignment } = require('../controllers/assignmentController');

router.use(auth);
router.get('/',      getAssignments);
router.post('/',     assignmentValidator,       createAssignment);
router.put('/:id',   mongoIdValidator, assignmentUpdateValidator, updateAssignment);
router.delete('/:id', mongoIdValidator,         deleteAssignment);

module.exports = router;
