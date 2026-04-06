const Subject = require('../models/Subject');
const User    = require('../models/User');

// ── STUDENT: view own subjects ────────────────────────────────────────
exports.getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(subjects);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── MENTOR/ADMIN: get all students ───────────────────────────────────
exports.getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('_id name email');
    res.json(students);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── MENTOR/ADMIN: get a student's subjects ───────────────────────────
exports.getStudentSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ user: req.params.studentId }).sort({ createdAt: -1 });
    res.json(subjects);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── MENTOR/ADMIN: create subject for a student ───────────────────────
exports.createSubjectForStudent = async (req, res) => {
  try {
    const { name, code, teacher, color } = req.body;
    const subject = new Subject({ user: req.params.studentId, name, code, teacher, color });
    await subject.save();
    res.status(201).json(subject);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── MENTOR/ADMIN: update subject for a student ───────────────────────
exports.updateSubjectForStudent = async (req, res) => {
  try {
    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, user: req.params.studentId },
      req.body, { new: true }
    );
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.json(subject);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── MENTOR/ADMIN: delete subject for a student ───────────────────────
exports.deleteSubjectForStudent = async (req, res) => {
  try {
    const subject = await Subject.findOneAndDelete({ _id: req.params.id, user: req.params.studentId });
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.json({ message: 'Subject deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── MENTOR/ADMIN: add mark for a student's subject ───────────────────
exports.addMarkForStudent = async (req, res) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id, user: req.params.studentId });
    if (!subject) return res.status(404).json({ message: 'Subject not found for this student' });
    subject.marks.push({ ...req.body, enteredBy: req.user.id });
    await subject.save();
    res.json(subject);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── MENTOR/ADMIN: delete mark ─────────────────────────────────────────
exports.deleteMarkForStudent = async (req, res) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id, user: req.params.studentId });
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    subject.marks = subject.marks.filter(m => m._id.toString() !== req.params.markId);
    await subject.save();
    res.json(subject);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── ADMIN: get all users ─────────────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── ADMIN: update user role ───────────────────────────────────────────
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['student','mentor','admin'].includes(role))
      return res.status(400).json({ message: 'Invalid role' });
    const user = await User.findByIdAndUpdate(req.params.userId, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Mentor/Admin: add a subject for a student
exports.addSubjectForStudent = async (req, res) => {
  try {
    const { name, code, teacher, color } = req.body;
    const subject = new Subject({ user: req.params.studentId, name, code, teacher, color });
    await subject.save();
    res.status(201).json(subject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Student: set target score for their own subject
exports.setTargetScore = async (req, res) => {
  try {
    const { targetScore } = req.body;
    if (targetScore === undefined || targetScore < 0 || targetScore > 100)
      return res.status(400).json({ message: 'Target score must be between 0 and 100' });
    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { targetScore },
      { new: true }
    );
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.json(subject);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
