const Subject    = require('../models/Subject');
const Assignment = require('../models/Assignment');
const Attendance = require('../models/Attendance');
const Goal       = require('../models/Goal');

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const [subjects, assignments, attendanceRecords, goals] = await Promise.all([
      Subject.find({ user: userId }),
      Assignment.find({ user: userId }),
      Attendance.find({ user: userId }),
      Goal.find({ user: userId }),
    ]);

    // Per-subject performance with trend + sparkline + target
    let totalAvg = 0;
    const subjectPerformance = subjects.map(s => {
      const avg = s.average;
      totalAvg += avg;
      return {
        name:        s.name,
        average:     avg,
        color:       s.color,
        trend:       s.trend,        // 'up' | 'down' | 'neutral'
        sparkline:   s.sparkline,    // last 5 scores
        targetScore: s.targetScore,  // null or number
        marksCount:  s.marks.length,
      };
    });
    const overallAverage = subjects.length > 0 ? Math.round(totalAvg / subjects.length) : 0;

    // Focus areas — below 60% OR trending down
    const focusAreas = subjectPerformance.filter(s =>
      (s.average < 60 && s.average > 0) || s.trend === 'down'
    );

    // Improving subjects — trend up AND above 60%
    const improvingSubjects = subjectPerformance.filter(s => s.trend === 'up');

    // Weak subjects (below 60%)
    const weakSubjects = subjectPerformance.filter(s => s.average < 60 && s.average > 0);

    // Attendance
    let totalClasses = 0, attendedClasses = 0;
    attendanceRecords.forEach(a => {
      totalClasses    += a.totalClasses;
      attendedClasses += a.attendedClasses;
    });
    const attendancePercentage = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;
    const lowAttendance = attendanceRecords.filter(a => a.isLow);

    // Upcoming assignments
    const now      = new Date();
    const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingAssignments = assignments
      .filter(a => a.status === 'pending' && new Date(a.dueDate) <= weekLater)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);

    // Goals
    const activeGoals    = goals.filter(g => g.status === 'active');
    const completedGoals = goals.filter(g => g.status === 'completed');

    // Performance score
    const performanceScore = Math.round(
      (overallAverage * 0.5) + (attendancePercentage * 0.3) +
      (completedGoals.length > 0 ? Math.min(completedGoals.length * 5, 20) : 0)
    );

    // Improvement summary
    const improvementSummary = {
      improving: improvingSubjects.length,
      declining: subjectPerformance.filter(s => s.trend === 'down').length,
      stable:    subjectPerformance.filter(s => s.trend === 'neutral').length,
      targetsSet: subjectPerformance.filter(s => s.targetScore !== null).length,
      targetsHit: subjectPerformance.filter(s => s.targetScore !== null && s.average >= s.targetScore).length,
    };

    const motivationalQuotes = [
      "Success is the sum of small efforts repeated day in and day out.",
      "The secret of getting ahead is getting started.",
      "Don't watch the clock; do what it does. Keep going.",
      "Education is the passport to the future.",
      "The expert in anything was once a beginner.",
      "Push yourself, because no one else is going to do it for you.",
      "Great things never come from comfort zones.",
      "Dream it. Wish it. Do it.",
    ];

    res.json({
      performanceScore, overallAverage, attendancePercentage,
      weakSubjects, focusAreas, improvingSubjects,
      subjectPerformance, upcomingAssignments, lowAttendance,
      goals: { active: activeGoals.length, completed: completedGoals.length },
      totalAssignments: assignments.length,
      pendingAssignments: assignments.filter(a => a.status === 'pending').length,
      improvementSummary,
      motivationalQuote: motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)],
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── MENTOR dashboard ──────────────────────────────────────────────────────
exports.getMentorDashboard = async (req, res) => {
  try {
    const User = require('../models/User');
    const students = await User.find({ role: 'student' }).select('_id name email');

    const studentStats = await Promise.all(students.map(async (student) => {
      const subjects    = await Subject.find({ user: student._id });
      const attendance  = await Attendance.find({ user: student._id });

      let totalAvg = 0;
      subjects.forEach(s => { totalAvg += s.average; });
      const overallAverage = subjects.length > 0 ? Math.round(totalAvg / subjects.length) : 0;

      let totalClasses = 0, attendedClasses = 0;
      attendance.forEach(a => { totalClasses += a.totalClasses; attendedClasses += a.attendedClasses; });
      const attendancePercentage = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;

      const weakSubjects      = subjects.filter(s => s.average < 60 && s.average > 0).map(s => s.name);
      const improvingSubjects = subjects.filter(s => s.trend === 'up').map(s => s.name);
      const decliningSubjects = subjects.filter(s => s.trend === 'down').map(s => s.name);

      // Improvement score: % of subjects trending up
      const improvementScore = subjects.length > 0
        ? Math.round((subjects.filter(s => s.trend === 'up').length / subjects.length) * 100)
        : null;

      return {
        _id: student._id,
        name: student.name,
        email: student.email,
        overallAverage,
        attendancePercentage,
        subjectCount: subjects.length,
        weakSubjects,
        improvingSubjects,
        decliningSubjects,
        improvementScore,
        needsAttention: overallAverage < 60 || attendancePercentage < 75 || decliningSubjects.length > 0,
      };
    }));

    const totalStudents       = students.length;
    const needsAttention      = studentStats.filter(s => s.needsAttention).length;
    const avgClassPerformance = totalStudents > 0
      ? Math.round(studentStats.reduce((s, st) => s + st.overallAverage, 0) / totalStudents) : 0;
    const lowAttendanceCount  = studentStats.filter(s => s.attendancePercentage < 75).length;
    const improvingCount      = studentStats.filter(s => s.improvementScore !== null && s.improvementScore > 50).length;

    res.json({ totalStudents, needsAttention, avgClassPerformance, lowAttendanceCount, improvingCount, studentStats });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── ADMIN dashboard ───────────────────────────────────────────────────────
exports.getAdminDashboard = async (req, res) => {
  try {
    const User = require('../models/User');
    const [allUsers, allSubjects, allAssignments, allAttendance] = await Promise.all([
      User.find().select('-password'),
      Subject.find(),
      Assignment.find(),
      Attendance.find(),
    ]);

    const studentCount = allUsers.filter(u => u.role === 'student').length;
    const mentorCount  = allUsers.filter(u => u.role === 'mentor').length;
    const adminCount   = allUsers.filter(u => u.role === 'admin').length;

    const totalMarksEntered  = allSubjects.reduce((sum, s) => sum + s.marks.length, 0);
    const pendingAssignments = allAssignments.filter(a => a.status === 'pending').length;

    const recentUsers = [...allUsers]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(u => ({ _id: u._id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt }));

    let totalClasses = 0, attendedClasses = 0;
    allAttendance.forEach(a => { totalClasses += a.totalClasses; attendedClasses += a.attendedClasses; });
    const platformAttendance = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;

    res.json({
      userCounts: { student: studentCount, mentor: mentorCount, admin: adminCount, total: allUsers.length },
      totalMarksEntered, pendingAssignments,
      totalSubjects: allSubjects.length,
      platformAttendance, recentUsers,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
