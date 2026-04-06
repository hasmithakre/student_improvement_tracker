const { body, param, validationResult } = require('express-validator');

// ── Helper: run result check after any validator chain ──────────────
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

// ── Auth validators ──────────────────────────────────────────────────
const registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Enter a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/\d/).withMessage('Password must contain at least one number'),
  validate,
];

const loginValidator = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

// ── Subject validators ───────────────────────────────────────────────
const subjectValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Subject name is required')
    .isLength({ min: 1, max: 100 }).withMessage('Subject name must be under 100 characters'),
  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color must be a valid hex code like #6366f1'),
  validate,
];

const markValidator = [
  body('testName').trim().notEmpty().withMessage('Test name is required'),
  body('testType').notEmpty().withMessage('Test type is required').isIn(['Semester Exam','Internal Assessment','Periodical Test','Lab Practical']).withMessage('Invalid test type'),
  body('marks')
    .notEmpty().withMessage('Marks are required')
    .isNumeric().withMessage('Marks must be a number')
    .custom((val, { req }) => {
      if (Number(val) < 0) throw new Error('Marks cannot be negative');
      if (req.body.maxMarks && Number(val) > Number(req.body.maxMarks)) throw new Error('Marks cannot exceed max marks');
      return true;
    }),
  body('maxMarks')
    .optional()
    .isNumeric().withMessage('Max marks must be a number')
    .custom(val => { if (Number(val) <= 0) throw new Error('Max marks must be greater than 0'); return true; }),
  validate,
];

// ── Assignment validators ────────────────────────────────────────────
const assignmentValidator = [
  body('title').trim().notEmpty().withMessage('Assignment title is required').isLength({ max: 200 }).withMessage('Title too long'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('dueDate')
    .notEmpty().withMessage('Due date is required')
    .isISO8601().withMessage('Due date must be a valid date'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
  validate,
];

const assignmentUpdateValidator = [
  body('status')
    .optional()
    .isIn(['pending', 'completed']).withMessage('Status must be pending or completed'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
  validate,
];

// ── Attendance validators ────────────────────────────────────────────
const attendanceValidator = [
  body('subject').trim().notEmpty().withMessage('Subject name is required'),
  body('totalClasses')
    .notEmpty().withMessage('Total classes is required')
    .isInt({ min: 0 }).withMessage('Total classes must be a non-negative integer'),
  body('attendedClasses')
    .notEmpty().withMessage('Attended classes is required')
    .isInt({ min: 0 }).withMessage('Attended classes must be a non-negative integer')
    .custom((val, { req }) => {
      if (Number(val) > Number(req.body.totalClasses)) throw new Error('Attended classes cannot exceed total classes');
      return true;
    }),
  body('threshold')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Threshold must be between 0 and 100'),
  validate,
];

// ── Goal validators ──────────────────────────────────────────────────
const goalValidator = [
  body('title').trim().notEmpty().withMessage('Goal title is required').isLength({ max: 200 }).withMessage('Title too long'),
  body('type').notEmpty().withMessage('Goal type is required').isIn(['short-term', 'long-term']).withMessage('Type must be short-term or long-term'),
  body('progress')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100'),
  body('targetDate').optional().isISO8601().withMessage('Target date must be a valid date'),
  validate,
];

const goalUpdateValidator = [
  body('progress')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100'),
  body('status')
    .optional()
    .isIn(['active', 'completed', 'paused']).withMessage('Status must be active, completed, or paused'),
  validate,
];

// ── MongoDB ID param validator ────────────────────────────────────────
const mongoIdValidator = [
  param('id').isMongoId().withMessage('Invalid ID format'),
  validate,
];

module.exports = {
  registerValidator,
  loginValidator,
  subjectValidator,
  markValidator,
  assignmentValidator,
  assignmentUpdateValidator,
  attendanceValidator,
  goalValidator,
  goalUpdateValidator,
  mongoIdValidator,
  validate,
};
