const express = require('express');
const router = express.Router();
const { authMiddleware: auth } = require('../middleware/auth');
const { goalValidator, goalUpdateValidator, mongoIdValidator } = require('../middleware/validate');
const { getGoals, createGoal, updateGoal, deleteGoal } = require('../controllers/goalController');

router.use(auth);
router.get('/',       getGoals);
router.post('/',      goalValidator,                       createGoal);
router.put('/:id',    mongoIdValidator, goalUpdateValidator, updateGoal);
router.delete('/:id', mongoIdValidator,                    deleteGoal);

module.exports = router;
