const Feedback = require('../models/Feedback');
const User = require('../models/User');

// Mentor: give feedback to a student
exports.createFeedback = async (req, res) => {
  try {
    const { studentId, subject, message, type } = req.body;
    if (!studentId || !message) return res.status(400).json({ message: 'Student and message are required' });
    const student = await User.findOne({ _id: studentId, role: 'student' });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const feedback = new Feedback({
      mentor: req.user.id, student: studentId,
      subject, message, type: type || 'general',
    });
    await feedback.save();
    const populated = await feedback.populate('mentor', 'name');
    res.status(201).json(populated);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Mentor: get all feedback they gave
exports.getMentorFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ mentor: req.user.id })
      .populate('student', 'name email')
      .sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Mentor: delete feedback
exports.deleteFeedback = async (req, res) => {
  try {
    await Feedback.findOneAndDelete({ _id: req.params.id, mentor: req.user.id });
    res.json({ message: 'Feedback deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Student: get their own feedback
exports.getStudentFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ student: req.user.id })
      .populate('mentor', 'name')
      .sort({ createdAt: -1 });
    // Mark all as read
    await Feedback.updateMany({ student: req.user.id, isRead: false }, { isRead: true });
    res.json(feedbacks);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Student: count unread feedbacks
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Feedback.countDocuments({ student: req.user.id, isRead: false });
    res.json({ count });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
