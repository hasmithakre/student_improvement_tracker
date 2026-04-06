import React, { useState, useEffect } from 'react';
import { feedbackAPI, mentorAPI } from '../../services/api';

const inp = { width:'100%', padding:'9px 12px', fontSize:13, border:'1.5px solid #e2e8f0', borderRadius:6, outline:'none', color:'#1a202c', background:'#fff', boxSizing:'border-box', transition:'border-color 0.15s' };
const focus = e => e.target.style.borderColor = '#2b6cb0';
const blur  = e => e.target.style.borderColor = '#e2e8f0';

export default function MentorFeedbackPage() {
  const [feedbacks, setFeedbacks]             = useState([]);
  const [students, setStudents]               = useState([]);
  const [studentSubjects, setStudentSubjects] = useState([]);
  const [showForm, setShowForm]               = useState(false);
  const [form, setForm]                       = useState({ studentId:'', subject:'', message:'' });
  const [msg, setMsg]                         = useState('');
  const [saving, setSaving]                   = useState(false);
  const [filterStudent, setFilterStudent]     = useState('all');

  const load = () => feedbackAPI.getForMentor().then(r => setFeedbacks(r.data)).catch(() => {});
  useEffect(() => {
    load();
    mentorAPI.getStudents().then(r => setStudents(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!form.studentId) { setStudentSubjects([]); return; }
    mentorAPI.getStudentSubjects(form.studentId)
      .then(r => setStudentSubjects(r.data))
      .catch(() => setStudentSubjects([]));
    setForm(prev => ({ ...prev, subject: '' }));
  }, [form.studentId]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setMsg('');
    try {
      await feedbackAPI.create(form);
      setMsg('✅ Feedback sent!'); // ✅ FIX 2: added ✅ so green style triggers
      setForm({ studentId:'', subject:'', message:'' });
      setShowForm(false);
      load();
    } catch(err) { setMsg('❌ ' + (err.response?.data?.message || 'Failed')); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this feedback?')) return;
    await feedbackAPI.delete(id);
    load();
  };

  const filtered = filterStudent === 'all' ? feedbacks : feedbacks.filter(f => f.student?._id === filterStudent);

  return (
    <div style={{ padding:'28px 32px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:700, color:'#1a202c', marginBottom:4 }}>Feedback</h1>
          <p style={{ fontSize:13, color:'#718096' }}>Send feedback to students on what to improve or praise.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ padding:'9px 20px', background:'#276749', color:'#fff', border:'none', borderRadius:7, fontSize:13, fontWeight:600, cursor:'pointer' }}>
          {showForm ? 'Cancel' : '+ Send Feedback'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:24, marginBottom:24 }}>
          <div style={{ fontSize:14, fontWeight:600, color:'#2d3748', marginBottom:16 }}>New Feedback</div>
          <form onSubmit={handleSubmit}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#4a5568', marginBottom:5 }}>Student *</label>
                <select required value={form.studentId} onChange={e => setForm({...form, studentId:e.target.value})} style={inp}>
                  <option value="">Select student</option>
                  {students.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#4a5568', marginBottom:5 }}>Subject (optional)</label>
                <select
                  value={form.subject}
                  onChange={e => setForm({...form, subject: e.target.value})}
                  disabled={!form.studentId || studentSubjects.length === 0}
                  style={{ ...inp, color: form.subject ? '#1a202c' : '#a0aec0', cursor: !form.studentId ? 'not-allowed' : 'pointer', background: !form.studentId ? '#f7fafc' : '#fff' }}
                >
                  <option value="">{!form.studentId ? 'Select a student first' : studentSubjects.length === 0 ? 'No subjects found' : '— All subjects —'}</option>
                  {studentSubjects.map(s => (
                    <option key={s._id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#4a5568', marginBottom:5 }}>Message *</label>
              <textarea required value={form.message} placeholder="Write your feedback here..."
                onChange={e => setForm({...form, message:e.target.value})}
                style={{ ...inp, minHeight:100, resize:'vertical', fontFamily:'inherit' }}
                onFocus={focus} onBlur={blur} />
            </div>

            {msg && (
              <div style={{ padding:'8px 12px', borderRadius:6, fontSize:13, marginBottom:12,
                background: msg.startsWith('✅') ? '#f0fff4' : '#fff5f5',
                border:`1px solid ${msg.startsWith('✅') ? '#9ae6b4' : '#feb2b2'}`,
                color: msg.startsWith('✅') ? '#276749' : '#c53030' }}>{msg}</div>
            )}

            <button type="submit" disabled={saving} style={{ padding:'9px 24px', background: saving ? '#a0aec0' : '#276749', color:'#fff', border:'none', borderRadius:6, fontSize:13, fontWeight:600, cursor:'pointer' }}>
              {saving ? 'Sending...' : 'Send Feedback'}
            </button>
          </form>
        </div>
      )}

      {/* Filter by student */}
      <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
        <div onClick={() => setFilterStudent('all')} style={{ padding:'6px 14px', borderRadius:20, cursor:'pointer', fontSize:12, fontWeight:500, background: filterStudent==='all'?'#1a202c':'#fff', color: filterStudent==='all'?'#fff':'#4a5568', border:'1px solid #e2e8f0' }}>All</div>
        {students.map(s => (
          <div key={s._id} onClick={() => setFilterStudent(s._id)} style={{ padding:'6px 14px', borderRadius:20, cursor:'pointer', fontSize:12, fontWeight:500, background: filterStudent===s._id?'#2b6cb0':'#fff', color: filterStudent===s._id?'#fff':'#4a5568', border:'1px solid #e2e8f0' }}>{s.name}</div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:'60px 0', textAlign:'center', color:'#a0aec0' }}>
          <div style={{ fontSize:14, fontWeight:500 }}>No feedback sent yet.</div>
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {filtered.map(f => (
          <div key={f._id} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:'16px 20px', borderLeft:'4px solid #2b6cb0' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:32, height:32, borderRadius:'50%', background:'#ebf4ff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#2b6cb0' }}>
                  {f.student?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:'#1a202c' }}>{f.student?.name}</div>
                  {f.subject && <div style={{ fontSize:11, color:'#718096' }}>{f.subject}</div>}
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:11, color:'#a0aec0' }}>{new Date(f.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span>
                <button onClick={() => handleDelete(f._id)} style={{ background:'none', border:'none', color:'#c53030', cursor:'pointer', fontSize:13 }}>✕</button>
              </div>
            </div>
            <div style={{ fontSize:13, color:'#2d3748', lineHeight:1.6 }}>{f.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
