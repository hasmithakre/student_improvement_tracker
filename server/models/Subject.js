const mongoose = require('mongoose');

const markSchema = new mongoose.Schema({
  testName:  { type: String, required: true },
  testType:  { type: String, enum: ['Semester Exam','Internal Assessment','Periodical Test','Lab Practical'], required: true },
  marks:     { type: Number, required: true },
  maxMarks:  { type: Number, required: true, default: 100 },
  date:      { type: Date, default: Date.now },
  enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const subjectSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:        { type: String, required: true, trim: true },
  code:        { type: String, trim: true },
  teacher:     { type: String, trim: true },
  color:       { type: String, default: '#2b6cb0' },
  targetScore: { type: Number, min: 0, max: 100, default: null }, // ← NEW
  marks:       [markSchema],
  createdAt:   { type: Date, default: Date.now },
});

subjectSchema.virtual('average').get(function() {
  if (!this.marks || this.marks.length === 0) return 0;
  const total = this.marks.reduce((sum, m) => sum + (m.marks / m.maxMarks) * 100, 0);
  return Math.round(total / this.marks.length);
});

// ← NEW: trend based on last 2 test scores
subjectSchema.virtual('trend').get(function() {
  if (!this.marks || this.marks.length < 2) return 'neutral';
  const sorted = [...this.marks].sort((a, b) => new Date(a.date) - new Date(b.date));
  const last  = (sorted[sorted.length - 1].marks / sorted[sorted.length - 1].maxMarks) * 100;
  const prev  = (sorted[sorted.length - 2].marks / sorted[sorted.length - 2].maxMarks) * 100;
  const diff  = last - prev;
  if (diff >= 5)  return 'up';
  if (diff <= -5) return 'down';
  return 'neutral';
});

// ← NEW: last 5 test scores as percentages for sparkline
subjectSchema.virtual('sparkline').get(function() {
  if (!this.marks || this.marks.length === 0) return [];
  return [...this.marks]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-5)
    .map(m => Math.round((m.marks / m.maxMarks) * 100));
});

subjectSchema.set('toJSON',   { virtuals: true });
subjectSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Subject', subjectSchema);
