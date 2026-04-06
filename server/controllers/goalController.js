const Goal = require('../models/Goal');

exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createGoal = async (req, res) => {
  try {
    const goal = new Goal({ user: req.user.id, ...req.body });
    await goal.save();
    res.status(201).json(goal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateGoal = async (req, res) => {
  try {
    if (req.body.progress === 100) req.body.status = 'completed';
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.json(goal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteGoal = async (req, res) => {
  try {
    await Goal.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    res.json({ message: 'Goal deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
