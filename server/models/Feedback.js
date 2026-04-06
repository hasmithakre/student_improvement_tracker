const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  mentor:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  student:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject:  { type: String, trim: true },
  message:  { type: String, required: true, trim: true },
  type:     { type: String, enum: ['improvement', 'praise', 'general'], default: 'general' },
  isRead:   { type: Boolean, default: false },
  createdAt:{ type: Date, default: Date.now },
});

module.exports = mongoose.model('Feedback', feedbackSchema);
