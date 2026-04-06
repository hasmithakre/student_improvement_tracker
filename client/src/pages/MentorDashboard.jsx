import React, { useState, useEffect } from 'react';
import { mentorAPI, mentorAttendanceAPI, mentorDashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const TEST_TYPES = ['Semester Exam', 'Internal Assessment', 'Periodical Test', 'Lab Practical'];
const PERIODS    = [1, 2, 3, 4, 5, 6, 7, 8];
const COLORS     = ['#2b6cb0','#276749','#744210','#553c9a','#c53030','#2c7a7b'];

const inp = {
  width:'100%', padding:'9px 12px', fontSize:13,
  border:'1.5px solid #e2e8f0', borderRadius:6, outline:'none',
  color:'#1a202c', background:'#fff', boxSizing:'border-box', transition:'border-color 0.15s',
};
const focus = e => e.target.style.borderColor = '#2b6cb0';
const blur  = e => e.target.style.borderColor = '#e2e8f0';

const StatCard = ({ label, value, sub, color='#1a202c' }) => (
  <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:'18px 20px' }}>
    <div style={{ fontSize:11, color:'#718096', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6 }}>{label}</div>
    <div style={{ fontSize:26, fontWeight:700, color, lineHeight:1 }}>{value}</div>
    {sub && <div style={{ fontSize:12, color:'#a0aec0', marginTop:6 }}>{sub}</div>}
  </div>
);

// ── OVERVIEW TAB ───────────────────────────────────────────────────────
function OverviewTab({ stats, loading }) {
  if (loading) return <div style={{ padding:40, textAlign:'center', color:'#a0aec0', fontSize:13 }}>Loading...</div>;
  if (!stats)  return <div style={{ padding:40, textAlign:'center', color:'#a0aec0', fontSize:13 }}>No data yet.</div>;

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        <StatCard label="Total Students"    value={stats.totalStudents}         sub="Registered" />
        <StatCard label="Avg Performance"   value={`${stats.avgClassPerformance}%`} color="#2b6cb0" sub="Class average" />
        <StatCard label="Needs Attention"   value={stats.needsAttention}        color={stats.needsAttention > 0 ? '#c53030' : '#276749'} sub="Below threshold" />
        <StatCard label="Low Attendance"    value={stats.lowAttendanceCount}    color={stats.lowAttendanceCount > 0 ? '#c53030' : '#276749'} sub="Below 75%" />
      </div>

      <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, overflow:'hidden' }}>
        <div style={{ padding:'14px 20px', borderBottom:'1px solid #e2e8f0', fontSize:13, fontWeight:600, color:'#2d3748' }}>
          All Students Performance
        </div>
        {stats.studentStats.length === 0 && (
          <div style={{ padding:40, textAlign:'center', color:'#a0aec0', fontSize:13 }}>No students registered yet.</div>
        )}
        {stats.studentStats.map((s, i) => (
          <div key={s._id} style={{ display:'flex', alignItems:'center', gap:16, padding:'13px 20px', borderBottom: i < stats.studentStats.length-1 ? '1px solid #f7fafc' : 'none' }}>
            <div style={{ width:34, height:34, borderRadius:'50%', background:'#ebf4ff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#2b6cb0', flexShrink:0 }}>
              {s.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#1a202c' }}>{s.name}</div>
              <div style={{ fontSize:11, color:'#a0aec0' }}>{s.email} · {s.subjectCount} subjects</div>
              {s.weakSubjects.length > 0 && (
                <div style={{ fontSize:11, color:'#c53030', marginTop:2 }}>Weak: {s.weakSubjects.join(', ')}</div>
              )}
            </div>
            <div style={{ textAlign:'center', minWidth:60 }}>
              <div style={{ fontSize:15, fontWeight:700, color: s.overallAverage < 60 ? '#c53030' : '#276749' }}>{s.overallAverage}%</div>
              <div style={{ fontSize:10, color:'#a0aec0' }}>Marks</div>
            </div>
            <div style={{ textAlign:'center', minWidth:60 }}>
              <div style={{ fontSize:15, fontWeight:700, color: s.attendancePercentage < 75 ? '#c53030' : '#276749' }}>{s.attendancePercentage}%</div>
              <div style={{ fontSize:10, color:'#a0aec0' }}>Attend.</div>
            </div>
            {s.needsAttention && (
              <span style={{ fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:20, background:'#fff5f5', color:'#c53030', border:'1px solid #fed7d7' }}>Attention</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MARKS TAB ──────────────────────────────────────────────────────────
function MarksTab() {
  const [students, setStudents]   = useState([]);
  const [selected, setSelected]   = useState(null);
  const [subjects, setSubjects]   = useState([]);
  const [subjectForm, setSubjectForm] = useState({ name:'', code:'', teacher:'', color:'#2b6cb0' });
  const [showAddSubj, setShowAddSubj] = useState(false);
  const [selSubject, setSelSubject]   = useState('');
  const [markForm, setMarkForm]   = useState({ testName:'', testType:'Internal Assessment', marks:'', maxMarks:100 });
  const [msg, setMsg]             = useState('');
  const [saving, setSaving]       = useState(false);

  useEffect(() => { mentorAPI.getStudents().then(r => setStudents(r.data)).catch(() => {}); }, []);

  const pickStudent = async (s) => {
    setSelected(s); setSelSubject(''); setMsg(''); setShowAddSubj(false);
    const r = await mentorAPI.getStudentSubjects(s._id);
    setSubjects(r.data);
  };

  const handleAddSubject = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await mentorAPI.addSubjectForStudent(selected._id, subjectForm);
      const r = await mentorAPI.getStudentSubjects(selected._id);
      setSubjects(r.data);
      setSubjectForm({ name:'', code:'', teacher:'', color:'#2b6cb0' });
      setShowAddSubj(false);
      setMsg('✅ Subject added!');
    } catch(err) { setMsg('❌ ' + (err.response?.data?.message || 'Failed')); }
    setSaving(false);
  };

  const handleAddMark = async (e) => {
    e.preventDefault();
    if (!selSubject) return setMsg('Select a subject first.');
    setSaving(true); setMsg('');
    try {
      await mentorAPI.addMarkForStudent(selected._id, selSubject, {
        testName: markForm.testName, testType: markForm.testType,
        marks: Number(markForm.marks), maxMarks: Number(markForm.maxMarks),
      });
      setMsg(`✅ Marks saved for ${selected.name}!`);
      setMarkForm({ testName:'', testType:'Internal Assessment', marks:'', maxMarks:100 });
      const r = await mentorAPI.getStudentSubjects(selected._id);
      setSubjects(r.data);
    } catch(err) { setMsg('❌ ' + (err.response?.data?.message || 'Failed')); }
    setSaving(false);
  };

  const handleDeleteMark = async (subjectId, markId) => {
    if (!window.confirm('Delete this mark?')) return;
    await mentorAPI.deleteMarkForStudent(selected._id, subjectId, markId);
    const r = await mentorAPI.getStudentSubjects(selected._id);
    setSubjects(r.data);
  };

  return (
    <div style={{ display:'grid', gridTemplateColumns:'260px 1fr', gap:20 }}>
      {/* Student list */}
      <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:14 }}>
        <div style={{ fontSize:11, fontWeight:600, color:'#718096', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:10 }}>Students</div>
        {students.length === 0 && <div style={{ fontSize:13, color:'#a0aec0' }}>No students yet.</div>}
        {students.map(s => (
          <div key={s._id} onClick={() => pickStudent(s)} style={{
            padding:'9px 11px', borderRadius:6, cursor:'pointer', marginBottom:3,
            background: selected?._id === s._id ? '#ebf4ff' : 'transparent',
            border:`1px solid ${selected?._id === s._id ? '#bee3f8' : 'transparent'}`,
          }}>
            <div style={{ fontSize:13, fontWeight:500, color:'#1a202c' }}>{s.name}</div>
            <div style={{ fontSize:11, color:'#a0aec0' }}>{s.email}</div>
          </div>
        ))}
      </div>

      {/* Right panel */}
      {!selected ? (
        <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:'#a0aec0', fontSize:13 }}>
          ← Select a student
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Add Subject */}
          <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:18 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: showAddSubj ? 14 : 0 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#2d3748' }}>Subjects for {selected.name}</div>
              <button onClick={() => setShowAddSubj(!showAddSubj)} style={{ padding:'6px 14px', background:'#2b6cb0', color:'#fff', border:'none', borderRadius:6, fontSize:12, fontWeight:600, cursor:'pointer' }}>
                {showAddSubj ? 'Cancel' : '+ Add Subject'}
              </button>
            </div>
            {showAddSubj && (
              <form onSubmit={handleAddSubject}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#4a5568', marginBottom:5 }}>Subject Name *</label>
                    <input required value={subjectForm.name} placeholder="Mathematics" onChange={e => setSubjectForm({...subjectForm, name:e.target.value})} style={inp} onFocus={focus} onBlur={blur} />
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#4a5568', marginBottom:5 }}>Subject Code</label>
                    <input value={subjectForm.code} placeholder="MA101" onChange={e => setSubjectForm({...subjectForm, code:e.target.value})} style={inp} onFocus={focus} onBlur={blur} />
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#4a5568', marginBottom:5 }}>Teacher Name</label>
                    <input value={subjectForm.teacher} placeholder="Mr. Sharma" onChange={e => setSubjectForm({...subjectForm, teacher:e.target.value})} style={inp} onFocus={focus} onBlur={blur} />
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#4a5568', marginBottom:5 }}>Color</label>
                    <select value={subjectForm.color} onChange={e => setSubjectForm({...subjectForm, color:e.target.value})} style={inp}>
                      {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <button type="submit" disabled={saving} style={{ padding:'8px 20px', background:'#276749', color:'#fff', border:'none', borderRadius:6, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                  {saving ? 'Saving...' : 'Save Subject'}
                </button>
              </form>
            )}

            {/* Subject list */}
            {subjects.length > 0 && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop: showAddSubj ? 14 : 0 }}>
                {subjects.map(s => (
                  <div key={s._id} onClick={() => setSelSubject(s._id)} style={{
                    padding:'6px 14px', borderRadius:20, cursor:'pointer', fontSize:12, fontWeight:500,
                    background: selSubject === s._id ? '#2b6cb0' : '#f7fafc',
                    color: selSubject === s._id ? '#fff' : '#4a5568',
                    border:`1px solid ${selSubject === s._id ? '#2b6cb0' : '#e2e8f0'}`,
                  }}>
                    {s.name} — {s.average}%
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Enter Marks */}
          <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:18 }}>
            <div style={{ fontSize:13, fontWeight:600, color:'#2d3748', marginBottom:14 }}>Enter Marks</div>
            {subjects.length === 0 ? (
              <div style={{ fontSize:13, color:'#a0aec0' }}>Add a subject first before entering marks.</div>
            ) : (
              <form onSubmit={handleAddMark}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#4a5568', marginBottom:5 }}>Subject *</label>
                    <select value={selSubject} onChange={e => setSelSubject(e.target.value)} required style={inp}>
                      <option value="">Select subject</option>
                      {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#4a5568', marginBottom:5 }}>Test Type</label>
                    <select value={markForm.testType} onChange={e => setMarkForm({...markForm, testType:e.target.value})} style={inp}>
                      {TEST_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#4a5568', marginBottom:5 }}>Test Name *</label>
                    <input required value={markForm.testName} placeholder="Unit Test 1" onChange={e => setMarkForm({...markForm, testName:e.target.value})} style={inp} onFocus={focus} onBlur={blur} />
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                    <div>
                      <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#4a5568', marginBottom:5 }}>Marks *</label>
                      <input required type="number" min={0} value={markForm.marks} placeholder="75" onChange={e => setMarkForm({...markForm, marks:e.target.value})} style={inp} onFocus={focus} onBlur={blur} />
                    </div>
                    <div>
                      <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#4a5568', marginBottom:5 }}>Out of</label>
                      <input type="number" min={1} value={markForm.maxMarks} onChange={e => setMarkForm({...markForm, maxMarks:e.target.value})} style={inp} onFocus={focus} onBlur={blur} />
                    </div>
                  </div>
                </div>
                {msg && (
                  <div style={{ padding:'8px 12px', borderRadius:6, fontSize:13, marginBottom:10,
                    background: msg.startsWith('✅') ? '#f0fff4' : '#fff5f5',
                    border:`1px solid ${msg.startsWith('✅') ? '#9ae6b4' : '#feb2b2'}`,
                    color: msg.startsWith('✅') ? '#276749' : '#c53030' }}>{msg}
                  </div>
                )}
                <button type="submit" disabled={saving} style={{ padding:'9px 22px', background: saving ? '#a0aec0' : '#2b6cb0', color:'#fff', border:'none', borderRadius:6, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                  {saving ? 'Saving...' : 'Save Marks'}
                </button>
              </form>
            )}
          </div>

          {/* Marks history per subject */}
          {selSubject && subjects.find(s => s._id === selSubject)?.marks?.length > 0 && (
            <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:18 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#2d3748', marginBottom:12 }}>
                Marks History — {subjects.find(s => s._id === selSubject)?.name}
              </div>
              {subjects.find(s => s._id === selSubject).marks.map((m, i) => {
                const pct = Math.round(m.marks / m.maxMarks * 100);
                return (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid #f7fafc' }}>
                    <div style={{ flex:1, fontSize:13, color:'#1a202c' }}>{m.testName}</div>
                    <div style={{ fontSize:11, color:'#a0aec0' }}>{m.testType}</div>
                    <div style={{ fontSize:14, fontWeight:700, color: pct >= 75 ? '#276749' : pct >= 50 ? '#975a16' : '#c53030' }}>{pct}%</div>
                    <div style={{ fontSize:11, color:'#a0aec0' }}>{m.marks}/{m.maxMarks}</div>
                    <button onClick={() => handleDeleteMark(selSubject, m._id)} style={{ background:'none', border:'none', color:'#c53030', cursor:'pointer', fontSize:12, padding:'2px 6px' }}>✕</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── ATTENDANCE TAB ─────────────────────────────────────────────────────
function AttendanceTab() {
  const [students, setStudents]     = useState([]);
  const [selected, setSelected]     = useState(null);
  const [subjList, setSubjList]     = useState([]);
  const [selSubject, setSelSubject] = useState('');
  const [record, setRecord]         = useState(null);
  const [date, setDate]             = useState(new Date().toISOString().split('T')[0]);
  const [periodStatuses, setPeriodStatuses] = useState({});
  const [msg, setMsg]               = useState('');
  const [saving, setSaving]         = useState(false);

  useEffect(() => { mentorAttendanceAPI.getStudents().then(r => setStudents(r.data)).catch(() => {}); }, []);

  const pickStudent = async (s) => {
    setSelected(s); setSelSubject(''); setRecord(null); setMsg('');
    const r = await mentorAttendanceAPI.getSubjects(s._id);
    setSubjList(r.data);
  };

  const pickSubject = async (subjectId) => {
    setSelSubject(subjectId); setMsg('');
    const r = await mentorAttendanceAPI.getRecord(selected._id, subjectId);
    setRecord(r.data);
  };

  const togglePeriod = (p) => {
    setPeriodStatuses(prev => ({ ...prev, [p]: prev[p] === 'present' ? 'absent' : prev[p] === 'absent' ? undefined : 'present' }));
  };

  const handleSave = async () => {
    const entries = Object.entries(periodStatuses).filter(([, v]) => v);
    if (!entries.length) return setMsg('Mark at least one period.');
    setSaving(true); setMsg('');
    try {
      for (const [period, status] of entries) {
        await mentorAttendanceAPI.markPeriod(selected._id, selSubject, { date, period: Number(period), status });
      }
      setMsg(`✅ Attendance saved for ${selected.name}!`);
      setPeriodStatuses({});
      const r = await mentorAttendanceAPI.getRecord(selected._id, selSubject);
      setRecord(r.data);
    } catch(err) { setMsg('❌ ' + (err.response?.data?.message || 'Failed')); }
    setSaving(false);
  };

  const handleDeletePeriod = async (periodId) => {
    await mentorAttendanceAPI.deletePeriod(selected._id, selSubject, periodId);
    const r = await mentorAttendanceAPI.getRecord(selected._id, selSubject);
    setRecord(r.data);
  };

  // Group by date for history
  const groupByDate = (periods = []) => {
    const map = {};
    periods.forEach(p => {
      const d = new Date(p.date).toDateString();
      if (!map[d]) map[d] = [];
      map[d].push(p);
    });
    return Object.entries(map).sort((a, b) => new Date(b[0]) - new Date(a[0]));
  };

  return (
    <div style={{ display:'grid', gridTemplateColumns:'260px 1fr', gap:20 }}>
      {/* Student list */}
      <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:14 }}>
        <div style={{ fontSize:11, fontWeight:600, color:'#718096', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:10 }}>Students</div>
        {students.length === 0 && <div style={{ fontSize:13, color:'#a0aec0' }}>No students yet.</div>}
        {students.map(s => (
          <div key={s._id} onClick={() => pickStudent(s)} style={{
            padding:'9px 11px', borderRadius:6, cursor:'pointer', marginBottom:3,
            background: selected?._id === s._id ? '#ebf4ff' : 'transparent',
            border:`1px solid ${selected?._id === s._id ? '#bee3f8' : 'transparent'}`,
          }}>
            <div style={{ fontSize:13, fontWeight:500, color:'#1a202c' }}>{s.name}</div>
            <div style={{ fontSize:11, color:'#a0aec0' }}>{s.email}</div>
          </div>
        ))}
      </div>

      {/* Right panel */}
      {!selected ? (
        <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:'#a0aec0', fontSize:13 }}>
          ← Select a student
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Subject selector */}
          <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:18 }}>
            <div style={{ fontSize:13, fontWeight:600, color:'#2d3748', marginBottom:12 }}>Select Subject</div>
            {subjList.length === 0 ? (
              <div style={{ fontSize:13, color:'#a0aec0' }}>No subjects found. Add subjects in the Marks tab first.</div>
            ) : (
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {subjList.map(s => (
                  <div key={s._id} onClick={() => pickSubject(s._id)} style={{
                    padding:'7px 16px', borderRadius:20, cursor:'pointer', fontSize:12, fontWeight:500,
                    background: selSubject === s._id ? '#2b6cb0' : '#f7fafc',
                    color: selSubject === s._id ? '#fff' : '#4a5568',
                    border:`1px solid ${selSubject === s._id ? '#2b6cb0' : '#e2e8f0'}`,
                  }}>{s.name}</div>
                ))}
              </div>
            )}
          </div>

          {/* Mark attendance */}
          {selSubject && (
            <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:18 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#2d3748', marginBottom:14 }}>Mark Attendance</div>

              {/* Date picker */}
              <div style={{ marginBottom:16 }}>
                <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#4a5568', marginBottom:6 }}>Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  style={{ ...inp, width:'180px' }} onFocus={focus} onBlur={blur} />
              </div>

              {/* Period grid */}
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:12, fontWeight:500, color:'#4a5568', marginBottom:8 }}>
                  Periods — click to toggle (green = present, red = absent, grey = not marked)
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {PERIODS.map(p => {
                    const status = periodStatuses[p];
                    return (
                      <div key={p} onClick={() => togglePeriod(p)} style={{
                        width:52, height:52, borderRadius:8, cursor:'pointer',
                        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                        border:`2px solid ${status === 'present' ? '#48bb78' : status === 'absent' ? '#fc8181' : '#e2e8f0'}`,
                        background: status === 'present' ? '#f0fff4' : status === 'absent' ? '#fff5f5' : '#f7fafc',
                        transition:'all 0.15s', userSelect:'none',
                      }}>
                        <div style={{ fontSize:13, fontWeight:700, color: status === 'present' ? '#276749' : status === 'absent' ? '#c53030' : '#a0aec0' }}>P{p}</div>
                        <div style={{ fontSize:9, color: status === 'present' ? '#276749' : status === 'absent' ? '#c53030' : '#cbd5e0', marginTop:1 }}>
                          {status === 'present' ? '✓' : status === 'absent' ? '✕' : '—'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {msg && (
                <div style={{ padding:'8px 12px', borderRadius:6, fontSize:13, marginBottom:10,
                  background: msg.startsWith('✅') ? '#f0fff4' : '#fff5f5',
                  border:`1px solid ${msg.startsWith('✅') ? '#9ae6b4' : '#feb2b2'}`,
                  color: msg.startsWith('✅') ? '#276749' : '#c53030' }}>{msg}
                </div>
              )}

              <button onClick={handleSave} disabled={saving} style={{ padding:'9px 22px', background: saving ? '#a0aec0' : '#276749', color:'#fff', border:'none', borderRadius:6, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                {saving ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          )}

          {/* History */}
          {record && record.periods?.length > 0 && (
            <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:18 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <div style={{ fontSize:13, fontWeight:600, color:'#2d3748' }}>
                  Attendance History — {record.attendedClasses}/{record.totalClasses} periods ({record.percentage}%)
                </div>
                <span style={{ fontSize:12, fontWeight:600, padding:'3px 10px', borderRadius:20,
                  background: record.isLow ? '#fff5f5' : '#f0fff4',
                  color: record.isLow ? '#c53030' : '#276749',
                  border:`1px solid ${record.isLow ? '#fed7d7' : '#9ae6b4'}` }}>
                  {record.isLow ? 'Below threshold' : 'On track'}
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ height:6, background:'#e2e8f0', borderRadius:3, marginBottom:14 }}>
                <div style={{ height:'100%', width:`${record.percentage}%`, background: record.isLow ? '#fc8181' : '#48bb78', borderRadius:3 }} />
              </div>

              <div style={{ maxHeight:240, overflowY:'auto' }}>
                {groupByDate(record.periods).map(([dateStr, periods]) => (
                  <div key={dateStr} style={{ marginBottom:12 }}>
                    <div style={{ fontSize:11, fontWeight:600, color:'#718096', marginBottom:6 }}>{dateStr}</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                      {periods.sort((a,b) => a.period - b.period).map(p => (
                        <div key={p._id} style={{ display:'flex', alignItems:'center', gap:4, padding:'4px 10px', borderRadius:20,
                          background: p.status === 'present' ? '#f0fff4' : '#fff5f5',
                          border:`1px solid ${p.status === 'present' ? '#9ae6b4' : '#fed7d7'}`,
                          fontSize:11, fontWeight:600,
                          color: p.status === 'present' ? '#276749' : '#c53030' }}>
                          P{p.period} — {p.status}
                          <button onClick={() => handleDeletePeriod(p._id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#a0aec0', padding:0, marginLeft:2, fontSize:10 }}>✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────────
export default function MentorDashboard() {
  const { user } = useAuth();
  const [tab, setTab]           = useState('Overview');
  const [stats, setStats]       = useState(null);
  const [loadingStats, setLoading] = useState(true);

  useEffect(() => {
    mentorDashboardAPI.get()
      .then(r => { setStats(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const TABS = ['Overview', 'Marks', 'Attendance'];

  return (
    <div style={{ padding:'28px 32px' }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:20, fontWeight:700, color:'#1a202c', marginBottom:4 }}>
          {greeting}, {user?.name?.split(' ')[0]}.
        </h1>
        <p style={{ fontSize:13, color:'#718096' }}>Mentor Dashboard</p>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:24, background:'#f7fafc', padding:4, borderRadius:8, width:'fit-content' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding:'8px 20px', borderRadius:6, border:'none', fontSize:13, fontWeight:600,
            background: tab === t ? '#fff' : 'transparent',
            color: tab === t ? '#1a202c' : '#718096',
            cursor:'pointer', boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            transition:'all 0.15s',
          }}>{t}</button>
        ))}
      </div>

      {tab === 'Overview'    && <OverviewTab stats={stats} loading={loadingStats} />}
      {tab === 'Marks'       && <MarksTab />}
      {tab === 'Attendance'  && <AttendanceTab />}
    </div>
  );
}
