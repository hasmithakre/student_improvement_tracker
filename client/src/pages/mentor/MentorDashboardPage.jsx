import React, { useState, useEffect } from 'react';
import { mentorDashboardAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function MentorDashboardPage() {
  const { user }              = useAuth();
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  useEffect(() => {
    mentorDashboardAPI.get()
      .then(r => { setStats(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const filtered = stats?.studentStats?.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  ) || [];

  if (loading) return <div style={{ padding:40, textAlign:'center', color:'#a0aec0' }}>Loading...</div>;

  return (
    <div style={{ padding:'28px 32px' }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:20, fontWeight:700, color:'#1a202c', marginBottom:4 }}>{greeting}, {user?.name?.split(' ')[0]}.</h1>
        <p style={{ fontSize:13, color:'#718096' }}>Improvement overview of all your students.</p>
      </div>

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:14, marginBottom:26 }}>
        {[
          { label:'Total Students',   value: stats?.totalStudents || 0,             color:'#1a202c' },
          { label:'Avg Performance',  value: `${stats?.avgClassPerformance || 0}%`, color:'#2b6cb0' },
          { label:'Improving',        value: stats?.improvingCount || 0,            color:'#276749' },
          { label:'Needs Attention',  value: stats?.needsAttention || 0,            color: stats?.needsAttention > 0 ? '#c53030' : '#276749' },
          { label:'Low Attendance',   value: stats?.lowAttendanceCount || 0,        color: stats?.lowAttendanceCount > 0 ? '#c53030' : '#276749' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:'16px 18px' }}>
            <div style={{ fontSize:11, color:'#718096', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6 }}>{label}</div>
            <div style={{ fontSize:24, fontWeight:700, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Student table */}
      <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, overflow:'hidden' }}>
        <div style={{ padding:'14px 20px', borderBottom:'1px solid #e2e8f0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ fontSize:13, fontWeight:600, color:'#2d3748' }}>All Students ({stats?.totalStudents || 0})</div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..."
            style={{ padding:'7px 12px', fontSize:12, border:'1px solid #e2e8f0', borderRadius:6, outline:'none', width:200 }}
            onFocus={e => e.target.style.borderColor='#2b6cb0'} onBlur={e => e.target.style.borderColor='#e2e8f0'} />
        </div>

        {/* Table header */}
        <div style={{ display:'grid', gridTemplateColumns:'1.4fr 80px 90px 100px 110px 160px', padding:'9px 20px', background:'#f7fafc', borderBottom:'1px solid #e2e8f0' }}>
          {['Student','Subjects','Avg Marks','Attendance','Improvement','Status'].map(h => (
            <div key={h} style={{ fontSize:11, fontWeight:600, color:'#718096', textTransform:'uppercase', letterSpacing:'0.04em' }}>{h}</div>
          ))}
        </div>

        {filtered.length === 0 && <div style={{ padding:40, textAlign:'center', color:'#a0aec0', fontSize:13 }}>No students found.</div>}

        {filtered.map((s, i) => (
          <div key={s._id} style={{ display:'grid', gridTemplateColumns:'1.4fr 80px 90px 100px 110px 160px', padding:'12px 20px', alignItems:'center', borderBottom: i < filtered.length-1 ? '1px solid #f7fafc' : 'none' }}>
            {/* Name */}
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background:'#ebf4ff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#2b6cb0', flexShrink:0 }}>
                {s.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:500, color:'#1a202c' }}>{s.name}</div>
                <div style={{ fontSize:11, color:'#a0aec0' }}>{s.email}</div>
                {s.decliningSubjects?.length > 0 && (
                  <div style={{ fontSize:10, color:'#c53030', marginTop:1 }}>↓ {s.decliningSubjects.join(', ')}</div>
                )}
                {s.improvingSubjects?.length > 0 && (
                  <div style={{ fontSize:10, color:'#276749', marginTop:1 }}>↑ {s.improvingSubjects.join(', ')}</div>
                )}
              </div>
            </div>

            <div style={{ fontSize:13, color:'#4a5568' }}>{s.subjectCount}</div>

            <div style={{ fontSize:14, fontWeight:700, color: s.overallAverage < 60 ? '#c53030' : s.overallAverage < 75 ? '#975a16' : '#276749' }}>
              {s.overallAverage}%
            </div>

            <div style={{ fontSize:14, fontWeight:700, color: s.attendancePercentage < 75 ? '#c53030' : '#276749' }}>
              {s.attendancePercentage}%
            </div>

            {/* Improvement score */}
            <div>
              {s.improvementScore === null ? (
                <span style={{ fontSize:11, color:'#a0aec0' }}>No data</span>
              ) : (
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color: s.improvementScore > 50 ? '#276749' : s.improvementScore > 0 ? '#975a16' : '#c53030' }}>
                    {s.improvementScore > 50 ? '↑' : s.improvementScore > 0 ? '→' : '↓'} {s.improvementScore}%
                  </div>
                  <div style={{ fontSize:10, color:'#a0aec0' }}>subjects improving</div>
                </div>
              )}
            </div>

            {/* Status */}
            <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
              {s.needsAttention
                ? <span style={{ fontSize:11, fontWeight:600, padding:'3px 9px', borderRadius:20, background:'#fff5f5', color:'#c53030', border:'1px solid #fed7d7', display:'inline-block' }}>Needs Attention</span>
                : <span style={{ fontSize:11, fontWeight:600, padding:'3px 9px', borderRadius:20, background:'#f0fff4', color:'#276749', border:'1px solid #9ae6b4', display:'inline-block' }}>On Track</span>
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
