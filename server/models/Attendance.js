const mongoose = require('mongoose');

// Each period record = one class session
const periodSchema = new mongoose.Schema({
  date:      { type: Date, required: true },
  period:    { type: Number, required: true }, // period number e.g. 1,2,3...
  status:    { type: String, enum: ['present', 'absent'], required: true },
  markedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // teacher who marked
});

const attendanceSchema = new mongoose.Schema({
  student:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject:   { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  subjectName: { type: String, required: true }, // denormalized for easy display
  threshold: { type: Number, default: 75 },
  periods:   [periodSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

attendanceSchema.virtual('totalClasses').get(function () {
  return this.periods.length;
});

attendanceSchema.virtual('attendedClasses').get(function () {
  return this.periods.filter(p => p.status === 'present').length;
});

attendanceSchema.virtual('percentage').get(function () {
  if (this.periods.length === 0) return 0;
  return Math.round((this.attendedClasses / this.totalClasses) * 100);
});

attendanceSchema.virtual('isLow').get(function () {
  return this.percentage < this.threshold;
});

attendanceSchema.set('toJSON', { virtuals: true });
attendanceSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
