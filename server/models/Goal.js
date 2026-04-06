const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  type: { type: String, enum: ['short-term', 'long-term'], required: true },
  targetDate: { type: Date },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  status: { type: String, enum: ['active', 'completed', 'paused'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Goal', goalSchema);
