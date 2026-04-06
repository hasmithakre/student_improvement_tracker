const Attendance = require('../models/Attendance');
const Subject    = require('../models/Subject');
const User       = require('../models/User');

// ── STUDENT: view own attendance ──────────────────────────────────────
exports.getMyAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ student: req.user.id });
    res.json(records);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── MENTOR/ADMIN: get all students list ───────────────────────────────
exports.getStudentsList = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('_id name email');
    res.json(students);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── MENTOR/ADMIN: get a student's subjects (to pick which subject to mark) ──
exports.getStudentSubjectsForAttendance = async (req, res) => {
  try {
    const subjects = await Subject.find({ user: req.params.studentId }).select('_id name code');
    res.json(subjects);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── MENTOR/ADMIN: get attendance record for a student+subject ─────────
exports.getStudentAttendance = async (req, res) => {
  try {
    const { studentId, subjectId } = req.params;
    let record = await Attendance.findOne({ student: studentId, subject: subjectId });
    res.json(record || null);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── MENTOR/ADMIN: mark a period (present/absent) for a student ────────
exports.markPeriod = async (req, res) => {
  try {
    const { studentId, subjectId } = req.params;
    const { date, period, status } = req.body;

    if (!date || !period || !status)
      return res.status(400).json({ message: 'date, period and status are required' });

    // Get subject name for denormalization
    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    // Check student exists and is a student
    const student = await User.findOne({ _id: studentId, role: 'student' });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    let record = await Attendance.findOne({ student: studentId, subject: subjectId });

    if (!record) {
      record = new Attendance({
        student: studentId,
        subject: subjectId,
        subjectName: subject.name,
        periods: [],
      });
    }

    const periodDate = new Date(date);
    // Check if this exact date+period already marked — update if so
    const existing = record.periods.find(
      p => p.period === Number(period) &&
           new Date(p.date).toDateString() === periodDate.toDateString()
    );

    if (existing) {
      existing.status   = status;
      existing.markedBy = req.user.id;
    } else {
      record.periods.push({ date: periodDate, period: Number(period), status, markedBy: req.user.id });
    }

    record.updatedAt = new Date();
    await record.save();
    res.json(record);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── MENTOR/ADMIN: bulk mark a whole day for a student ─────────────────
exports.markDay = async (req, res) => {
  try {
    const { studentId, subjectId } = req.params;
    const { date, periods } = req.body; // periods = [{ period: 1, status: 'present' }, ...]

    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    let record = await Attendance.findOne({ student: studentId, subject: subjectId });
    if (!record) {
      record = new Attendance({ student: studentId, subject: subjectId, subjectName: subject.name, periods: [] });
    }

    const dayDate = new Date(date);
    periods.forEach(({ period, status }) => {
      const existing = record.periods.find(
        p => p.period === Number(period) &&
             new Date(p.date).toDateString() === dayDate.toDateString()
      );
      if (existing) { existing.status = status; existing.markedBy = req.user.id; }
      else record.periods.push({ date: dayDate, period: Number(period), status, markedBy: req.user.id });
    });

    record.updatedAt = new Date();
    await record.save();
    res.json(record);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── MENTOR/ADMIN: delete a single period entry ────────────────────────
exports.deletePeriod = async (req, res) => {
  try {
    const { studentId, subjectId, periodId } = req.params;
    const record = await Attendance.findOne({ student: studentId, subject: subjectId });
    if (!record) return res.status(404).json({ message: 'Record not found' });
    record.periods = record.periods.filter(p => p._id.toString() !== periodId);
    record.updatedAt = new Date();
    await record.save();
    res.json(record);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
