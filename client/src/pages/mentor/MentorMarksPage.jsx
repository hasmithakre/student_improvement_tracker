import React, { useState, useEffect } from 'react';
import { mentorAPI } from '../../services/api';

const TEST_TYPES = ['Semester Exam','Internal Assessment','Periodical Test','Lab Practical'];
const COLORS = ['#2b6cb0','#276749','#744210','#553c9a','#c53030','#2c7a7b'];
const inp = { width:'100%', padding:'9px 12px', fontSize:13, border:'1.5px solid #e2e8f0', borderRadius:6, outline:'none', color:'#1a202c', background:'#fff', boxSizing:'border-box', transition:'border-color 0.15s' };
const focus = e => e.target.style.borderColor='#2b6cb0';
const blur  = e => e.target.style.borderColor='#e2e8f0';

export default function MentorMarksPage() {
  const [students, setStudents]     = useState([]);
  const [selected, setSelected]     = useState(null);
  const [subjects, setSubjects]     = useState([]);
  const [selSubject, setSelSubject] = useState('');
  const [showAddSubj, setShowAddSubj] = useState(false);
  const [subjectForm, setSubjectForm] = useState({ name:'', code:'', teacher:'', color:'#2b6cb0' });
  const [markForm, setMarkForm]     = useState({ testName:'', testType:'Internal Assessment', marks:'', maxMarks:100 });
  const [msg, setMsg]               = useState('');
  const [saving, setSaving]         = useState(false);

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
      setShowAddSubj(false); setMsg('✅ Subject added!');
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
      setMsg(`✅ Marks saved!`);
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
    <div style={{ padding:'28px 32px' }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:20, fontWeight:700, color:'#1a202c', marginBottom:4 }}>Marks</h1>
        <p style={{ fontSize:13, color:'#718096' }}>Add subjects and enter test marks for students.</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'240px 1fr', gap:20 }}>
        {/* Student list */}
        <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:14 }}>
          <div style={{ fontSize:11, fontWeight:600, color:'#718096', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:10 }}>Students</div>
          {students.length === 0 && <div style={{ fontSize:13, color:'#a0aec0' }}>No students yet.</div>}
          {students.map(s => (
            <div key={s._id} onClick={() => pickStudent(s)} style={{
              padding:'9px 11px', borderRadius:6, cursor:'pointer', marginBottom:3,
              background: selected?._id===s._id ? '#ebf4ff' : 'transparent',
              border:`1px solid ${selected?._id===s._id ? '#bee3f8' : 'transparent'}`,
            }}>
              <div style={{ fontSize:13, fontWeight:500, color:'#1a202c' }}>{s.name}</div>
              <div style={{ fontSize:11, color:'#a0aec0' }}>{s.email}</div>
            </div>
          ))}
        </div>

        {!selected ? (
          <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:'#a0aec0', fontSize:13 }}>← Select a student</div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {/* Add Subject */}
            <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:18 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: showAddSubj?14:0 }}>
                <div style={{ fontSize:13, fontWeight:600, color:'#2d3748' }}>Subjects — {selected.name}</div>
                <button onClick={() => setShowAddSubj(!showAddSubj)} style={{ padding:'6px 14px', background:'#2b6cb0', color:'#fff', border:'none', borderRadius:6, fontSize:12, fontWeight:600, cursor:'pointer' }}>
                  {showAddSubj ? 'Cancel' : '+ Add Subject'}
                </button>
              </div>
              {showAddSubj && (
                <form onSubmit={handleAddSubject}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                    <div>
                      <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#4a5568', marginBottom:5 }}>Subject Name *</label>
                      <input required value={subjectForm.name} placeholder="Mathematics" onChange={e => setSubjectForm({...subjectForm,name:e.target.value})} style={inp} onFocus={focus} onBlur={blur} />
                    </div>
                    <div>
                      <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#4a5568', marginBottom:5 }}>Code</label>
                      <input value={subjectForm.code} placeholder="MA101" onChange={e => setSubjectForm({...subjectForm,code:e.target.value})} style={inp} onFocus={focus} onBlur={blur} />
                    </div>
                    <div>
                      <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#4a5568', marginBottom:5 }}>Teacher Name</label>
                      <input value={subjectForm.teacher} placeholder="Mr. Sharma" onChange={e => setSubjectForm({...subjectForm,teacher:e.target.value})} style={inp} onFocus={focus} onBlur={blur} />
                    </div>
                    <div>
                      <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#4a5568', marginBottom:5 }}>Color</label>
                      <select value={subjectForm.color} onChange={e => setSubjectForm({...subjectForm,color:e.target.value})} style={inp}>
                        {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <button type="submit" disabled={saving} style={{ padding:'8px 20px', background:'#276749', color:'#fff', border:'none', borderRadius:6, fontSize:13, fontWeight:600, cursor:'pointer' }}>{saving ? 'Saving...' : 'Save Subject'}</button>
                </form>
              )}
              {subjects.length > 0 && (
                <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop: showAddSubj?14:0 }}>
                  {subjects.map(s => (
                    <div key={s._id} onClick={() => setSelSubject(s._id)} style={{
                      padding:'6px 14px', borderRadius:20, cursor:'pointer', fontSize:12, fontWeight:500,
                      background: selSubject===s._id ? '#2b6cb0' : '#f7fafc',
                      color: selSubject===s._id ? '#fff' : '#4a5568',
                      border:`1px solid ${selSubject===s._id ? '#2b6cb0' : '#e2e8f0'}`,
                    }}>{s.name} — {s.average}%</div>
                  ))}
                </div>
              )}
            </div>

            {/* Enter Marks */}
            <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:18 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#2d3748', marginBottom:14 }}>Enter Marks</div>
              {subjects.length === 0 ? (
                <div style={{ fontSize:13, color:'#a0aec0' }}>Add a subject first.</div>
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
                      <select value={markForm.testType} onChange={e => setMarkForm({...markForm,testType:e.target.value})} style={inp}>
                        {TEST_TYPES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#4a5568', marginBottom:5 }}>Test Name *</label>
                      <input required value={markForm.testName} placeholder="Unit Test 1" onChange={e => setMarkForm({...markForm,testName:e.target.value})} style={inp} onFocus={focus} onBlur={blur} />
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                      <div>
                        <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#4a5568', marginBottom:5 }}>Marks *</label>
                        <input required type="number" min={0} value={markForm.marks} placeholder="75" onChange={e => setMarkForm({...markForm,marks:e.target.value})} style={inp} onFocus={focus} onBlur={blur} />
                      </div>
                      <div>
                        <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#4a5568', marginBottom:5 }}>Out of</label>
                        <input type="number" min={1} value={markForm.maxMarks} onChange={e => setMarkForm({...markForm,maxMarks:e.target.value})} style={inp} onFocus={focus} onBlur={blur} />
                      </div>
                    </div>
                  </div>
                  {msg && <div style={{ padding:'8px 12px', borderRadius:6, fontSize:13, marginBottom:10, background: msg.startsWith('✅')?'#f0fff4':'#fff5f5', border:`1px solid ${msg.startsWith('✅')?'#9ae6b4':'#feb2b2'}`, color: msg.startsWith('✅')?'#276749':'#c53030' }}>{msg}</div>}
                  <button type="submit" disabled={saving} style={{ padding:'9px 22px', background: saving?'#a0aec0':'#2b6cb0', color:'#fff', border:'none', borderRadius:6, fontSize:13, fontWeight:600, cursor:'pointer' }}>{saving?'Saving...':'Save Marks'}</button>
                </form>
              )}
            </div>

            {/* History */}
            {selSubject && subjects.find(s => s._id===selSubject)?.marks?.length > 0 && (
              <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:18 }}>
                <div style={{ fontSize:13, fontWeight:600, color:'#2d3748', marginBottom:12 }}>Marks History — {subjects.find(s=>s._id===selSubject)?.name}</div>
                {subjects.find(s=>s._id===selSubject).marks.map((m,i) => {
                  const pct = Math.round(m.marks/m.maxMarks*100);
                  return (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid #f7fafc' }}>
                      <div style={{ flex:1, fontSize:13, color:'#1a202c' }}>{m.testName}</div>
                      <div style={{ fontSize:11, color:'#a0aec0' }}>{m.testType}</div>
                      <div style={{ fontSize:14, fontWeight:700, color: pct>=75?'#276749':pct>=50?'#975a16':'#c53030' }}>{pct}%</div>
                      <div style={{ fontSize:11, color:'#a0aec0' }}>{m.marks}/{m.maxMarks}</div>
                      <button onClick={() => handleDeleteMark(selSubject,m._id)} style={{ background:'none', border:'none', color:'#c53030', cursor:'pointer', fontSize:12 }}>✕</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
