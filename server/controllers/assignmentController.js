const Assignment = require('../models/Assignment');

exports.getAssignments = async (req, res) => {
  try {
    const filter = { user: req.user.id };
    if (req.query.status) filter.status = req.query.status;
    const assignments = await Assignment.find(filter).sort({ dueDate: 1 });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createAssignment = async (req, res) => {
  try {
    const assignment = new Assignment({ user: req.user.id, ...req.body });
    await assignment.save();
    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateAssignment = async (req, res) => {
  try {
    if (req.body.status === 'completed') req.body.completedAt = new Date();
    const assignment = await Assignment.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    res.json({ message: 'Assignment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
