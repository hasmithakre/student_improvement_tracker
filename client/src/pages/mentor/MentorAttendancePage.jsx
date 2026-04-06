import React, { useState, useEffect } from 'react';
import { mentorAttendanceAPI } from '../../services/api';

const PERIODS = [1,2,3,4,5,6,7,8];
const inp = { width:'100%', padding:'9px 12px', fontSize:13, border:'1.5px solid #e2e8f0', borderRadius:6, outline:'none', color:'#1a202c', background:'#fff', boxSizing:'border-box' };

export default function MentorAttendancePage() {
  const [students, setStudents]         = useState([]);
  const [selected, setSelected]         = useState(null);
  const [subjList, setSubjList]         = useState([]);
  const [selSubject, setSelSubject]     = useState('');
  const [record, setRecord]             = useState(null);
  const [date, setDate]                 = useState(new Date().toISOString().split('T')[0]);
  const [periodStatuses, setPeriodStatuses] = useState({});
  const [msg, setMsg]                   = useState('');
  const [saving, setSaving]             = useState(false);

  useEffect(() => { mentorAttendanceAPI.getStudents().then(r => setStudents(r.data)).catch(() => {}); }, []);

  const pickStudent = async (s) => {
    setSelected(s); setSelSubject(''); setRecord(null); setMsg('');
    const r = await mentorAttendanceAPI.getSubjects(s._id);
    setSubjList(r.data);
  };

  const pickSubject = async (subjectId) => {
    setSelSubject(subjectId); setMsg(''); setPeriodStatuses({});
    const r = await mentorAttendanceAPI.getRecord(selected._id, subjectId);
    setRecord(r.data);
  };

  const togglePeriod = (p) => {
    setPeriodStatuses(prev => ({
      ...prev,
      [p]: prev[p] === 'present' ? 'absent' : prev[p] === 'absent' ? undefined : 'present'
    }));
  };

  const handleSave = async () => {
    const entries = Object.entries(periodStatuses).filter(([,v]) => v);
    if (!entries.length) return setMsg('Mark at least one period.');
    setSaving(true); setMsg('');
    try {
      for (const [period, status] of entries) {
        await mentorAttendanceAPI.markPeriod(selected._id, selSubject, { date, period:Number(period), status });
      }
      setMsg(`✅ Attendance saved!`);
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

  const groupByDate = (periods=[]) => {
    const map = {};
    periods.forEach(p => { const d = new Date(p.date).toDateString(); if(!map[d]) map[d]=[]; map[d].push(p); });
    return Object.entries(map).sort((a,b) => new Date(b[0])-new Date(a[0]));
  };

  return (
    <div style={{ padding:'28px 32px' }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:20, fontWeight:700, color:'#1a202c', marginBottom:4 }}>Attendance</h1>
        <p style={{ fontSize:13, color:'#718096' }}>Mark period-wise attendance for each student.</p>
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
            {/* Subject selector */}
            <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:18 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#2d3748', marginBottom:12 }}>Select Subject — {selected.name}</div>
              {subjList.length === 0 ? (
                <div style={{ fontSize:13, color:'#a0aec0' }}>No subjects found. Add subjects in the Marks section first.</div>
              ) : (
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {subjList.map(s => (
                    <div key={s._id} onClick={() => pickSubject(s._id)} style={{
                      padding:'7px 16px', borderRadius:20, cursor:'pointer', fontSize:12, fontWeight:500,
                      background: selSubject===s._id ? '#2b6cb0' : '#f7fafc',
                      color: selSubject===s._id ? '#fff' : '#4a5568',
                      border:`1px solid ${selSubject===s._id ? '#2b6cb0' : '#e2e8f0'}`,
                    }}>{s.name}</div>
                  ))}
                </div>
              )}
            </div>

            {/* Mark attendance */}
            {selSubject && (
              <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:18 }}>
                <div style={{ fontSize:13, fontWeight:600, color:'#2d3748', marginBottom:14 }}>Mark Attendance</div>
                <div style={{ marginBottom:16 }}>
                  <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#4a5568', marginBottom:6 }}>Date</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...inp, width:180 }} />
                </div>
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:12, fontWeight:500, color:'#4a5568', marginBottom:10 }}>Click period to mark — green = present, red = absent</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
                    {PERIODS.map(p => {
                      const status = periodStatuses[p];
                      return (
                        <div key={p} onClick={() => togglePeriod(p)} style={{
                          width:56, height:56, borderRadius:8, cursor:'pointer',
                          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                          border:`2px solid ${status==='present'?'#48bb78':status==='absent'?'#fc8181':'#e2e8f0'}`,
                          background: status==='present'?'#f0fff4':status==='absent'?'#fff5f5':'#f7fafc',
                          userSelect:'none', transition:'all 0.15s',
                        }}>
                          <div style={{ fontSize:13, fontWeight:700, color: status==='present'?'#276749':status==='absent'?'#c53030':'#a0aec0' }}>P{p}</div>
                          <div style={{ fontSize:10, color: status==='present'?'#276749':status==='absent'?'#c53030':'#cbd5e0' }}>
                            {status==='present'?'✓':status==='absent'?'✕':'—'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {msg && <div style={{ padding:'8px 12px', borderRadius:6, fontSize:13, marginBottom:12, background: msg.startsWith('✅')?'#f0fff4':'#fff5f5', border:`1px solid ${msg.startsWith('✅')?'#9ae6b4':'#feb2b2'}`, color: msg.startsWith('✅')?'#276749':'#c53030' }}>{msg}</div>}
                <button onClick={handleSave} disabled={saving} style={{ padding:'9px 22px', background: saving?'#a0aec0':'#276749', color:'#fff', border:'none', borderRadius:6, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                  {saving?'Saving...':'Save Attendance'}
                </button>
              </div>
            )}

            {/* History */}
            {record && record.periods?.length > 0 && (
              <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:18 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'#2d3748' }}>
                    History — {record.attendedClasses}/{record.totalClasses} periods ({record.percentage}%)
                  </div>
                  <span style={{ fontSize:12, fontWeight:600, padding:'3px 10px', borderRadius:20, background: record.isLow?'#fff5f5':'#f0fff4', color: record.isLow?'#c53030':'#276749', border:`1px solid ${record.isLow?'#fed7d7':'#9ae6b4'}` }}>
                    {record.isLow ? 'Below threshold' : 'On track'}
                  </span>
                </div>
                <div style={{ height:6, background:'#e2e8f0', borderRadius:3, marginBottom:14 }}>
                  <div style={{ height:'100%', width:`${record.percentage}%`, background: record.isLow?'#fc8181':'#48bb78', borderRadius:3 }} />
                </div>
                <div style={{ maxHeight:220, overflowY:'auto' }}>
                  {groupByDate(record.periods).map(([dateStr, periods]) => (
                    <div key={dateStr} style={{ marginBottom:10 }}>
                      <div style={{ fontSize:11, fontWeight:600, color:'#718096', marginBottom:6 }}>{dateStr}</div>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                        {periods.sort((a,b)=>a.period-b.period).map(p => (
                          <div key={p._id} style={{ display:'flex', alignItems:'center', gap:4, padding:'3px 10px', borderRadius:20, background: p.status==='present'?'#f0fff4':'#fff5f5', border:`1px solid ${p.status==='present'?'#9ae6b4':'#fed7d7'}`, fontSize:11, fontWeight:600, color: p.status==='present'?'#276749':'#c53030' }}>
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
    </div>
  );
}
