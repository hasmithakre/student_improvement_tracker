const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (userId, role) =>
  jwt.sign({ id: userId, role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
    const allowedRoles = ['student', 'mentor', 'admin'];
    const userRole = allowedRoles.includes(role) ? role : 'student';
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });
    const user = new User({ name, email, password, role: userRole });
    await user.save();
    const token = generateToken(user._id, user.role);
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, studyStreak: user.studyStreak } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const now = new Date();
    const diffDays = Math.floor((now - user.lastLogin) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) user.studyStreak += 1;
    else if (diffDays > 1) user.studyStreak = 1;
    user.lastLogin = now;
    await user.save();
    const token = generateToken(user._id, user.role);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, studyStreak: user.studyStreak } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
