import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Card = ({ label, value, sub, color }) => (
  <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:'18px 20px' }}>
    <div style={{ fontSize:11, color:'#718096', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:7 }}>{label}</div>
    <div style={{ fontSize:26, fontWeight:700, color: color||'#1a202c', lineHeight:1 }}>{value}</div>
    {sub && <div style={{ fontSize:11, color:'#a0aec0', marginTop:5 }}>{sub}</div>}
  </div>
);

const TrendIcon = ({ trend }) => {
  if (trend === 'up')   return <span style={{ color:'#276749', fontWeight:700, fontSize:13 }}>↑ Improving</span>;
  if (trend === 'down') return <span style={{ color:'#c53030', fontWeight:700, fontSize:13 }}>↓ Declining</span>;
  return <span style={{ color:'#a0aec0', fontWeight:600, fontSize:13 }}>→ Stable</span>;
};

const Sparkline = ({ data, color = '#2b6cb0' }) => {
  if (!data || data.length < 2) return <span style={{ fontSize:11, color:'#a0aec0' }}>Not enough data</span>;
  const w = 80, h = 28, pad = 3;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((v, i) => {
        const x = pad + (i / (data.length - 1)) * (w - pad * 2);
        const y = h - pad - ((v - min) / range) * (h - pad * 2);
        return <circle key={i} cx={x} cy={y} r="2.5" fill={color} />;
      })}
    </svg>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.get()
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh' }}>
      <span style={{ fontSize:13, color:'#a0aec0' }}>Loading your dashboard...</span>
    </div>
  );

  const imp = data?.improvementSummary;

  return (
    <div style={{ padding:'28px 32px' }}>

      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:20, fontWeight:700, color:'#1a202c', marginBottom:4 }}>
          {greeting}, {user?.name?.split(' ')[0]}.
        </h1>
        <p style={{ fontSize:13, color:'#718096' }}>Here is your improvement overview.</p>
      </div>

      {/* Quote */}
      {data?.motivationalQuote && (
        <div style={{ background:'#ebf4ff', border:'1px solid #bee3f8', borderRadius:8, padding:'11px 18px', marginBottom:22, fontSize:13, color:'#2b6cb0', fontStyle:'italic' }}>
          "{data.motivationalQuote}"
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:22 }}>
        <Card label="Performance Score" value={`${data?.performanceScore||0}%`} color="#2b6cb0" sub="Overall rating" />
        <Card label="Average Marks"     value={`${data?.overallAverage||0}%`}   color="#1a202c" sub="Across all subjects" />
        <Card label="Attendance"        value={`${data?.attendancePercentage||0}%`}
          color={data?.attendancePercentage < 75 ? '#c53030' : '#276749'}
          sub={data?.attendancePercentage < 75 ? 'Below threshold' : 'On track'} />
        <Card label="Active Goals" value={data?.goals?.active||0} color="#1a202c" sub={`${data?.goals?.completed||0} completed`} />
      </div>

      {/* Improvement Summary */}
      {imp && (
        <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:'16px 22px', marginBottom:22, display:'flex', gap:32, alignItems:'center', flexWrap:'wrap' }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#1a202c' }}>Improvement Overview</div>
          <div style={{ display:'flex', gap:24, flexWrap:'wrap' }}>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:22, fontWeight:700, color:'#276749' }}>{imp.improving}</div>
              <div style={{ fontSize:11, color:'#718096' }}>Improving ↑</div>
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:22, fontWeight:700, color:'#c53030' }}>{imp.declining}</div>
              <div style={{ fontSize:11, color:'#718096' }}>Declining ↓</div>
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:22, fontWeight:700, color:'#a0aec0' }}>{imp.stable}</div>
              <div style={{ fontSize:11, color:'#718096' }}>Stable →</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:22 }}>

        {/* Focus Areas */}
        <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:'18px 20px' }}>
          <div style={{ fontSize:13, fontWeight:600, color:'#1a202c', marginBottom:14 }}>Focus Areas</div>
          {data?.focusAreas?.length > 0 ? data.focusAreas.map((s, i) => (
            <div key={i} style={{ padding:'10px 12px', background:'#fff5f5', border:'1px solid #fed7d7', borderRadius:6, marginBottom:8 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:13, fontWeight:500, color:'#1a202c' }}>{s.name}</span>
                <span style={{ fontSize:13, fontWeight:700, color:'#c53030' }}>{s.average}%</span>
              </div>
              <div style={{ marginTop:5 }}><TrendIcon trend={s.trend} /></div>
              {s.average < 60 && (
                <div style={{ fontSize:11, color:'#c53030', marginTop:4 }}>
                  Need {60 - s.average}% more to reach safe zone
                </div>
              )}
            </div>
          )) : (
            <div style={{ fontSize:13, color:'#276749', textAlign:'center', padding:'24px 0' }}>
              ✅ No subjects need immediate attention!
            </div>
          )}
        </div>

        {/* Trending Up */}
        <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:'18px 20px' }}>
          <div style={{ fontSize:13, fontWeight:600, color:'#1a202c', marginBottom:14 }}>Trending Up</div>
          {data?.improvingSubjects?.length > 0 ? data.improvingSubjects.map((s, i) => (
            <div key={i} style={{ padding:'10px 12px', background:'#f0fff4', border:'1px solid #9ae6b4', borderRadius:6, marginBottom:8 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:13, fontWeight:500, color:'#1a202c' }}>{s.name}</span>
                <span style={{ fontSize:13, fontWeight:700, color:'#276749' }}>{s.average}%</span>
              </div>
              <div style={{ marginTop:4 }}><Sparkline data={s.sparkline} color="#276749" /></div>
            </div>
          )) : (
            <div style={{ fontSize:13, color:'#a0aec0', textAlign:'center', padding:'24px 0' }}>
              Enter marks in multiple tests to see trends.
            </div>
          )}
        </div>
      </div>

      {/* Subject Progress */}
      <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:'18px 20px', marginBottom:22 }}>
        <div style={{ fontSize:13, fontWeight:600, color:'#1a202c', marginBottom:14 }}>Subject Progress</div>
        {!data?.subjectPerformance?.length && (
          <div style={{ fontSize:13, color:'#a0aec0', textAlign:'center', padding:'24px 0' }}>No subjects yet.</div>
        )}
        {data?.subjectPerformance?.map((s, i) => (
          <div key={i} style={{ padding:'12px 0', borderBottom: i < data.subjectPerformance.length-1 ? '1px solid #f7fafc' : 'none' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:7 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:10, height:10, borderRadius:'50%', background: s.color||'#2b6cb0', flexShrink:0 }} />
                <span style={{ fontSize:13, fontWeight:500, color:'#1a202c' }}>{s.name}</span>
                <TrendIcon trend={s.trend} />
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                <Sparkline data={s.sparkline} color={s.color||'#2b6cb0'} />
                <span style={{ fontSize:15, fontWeight:700, color:'#1a202c', minWidth:36 }}>{s.average}%</span>
              </div>
            </div>
            <div style={{ height:6, background:'#e2e8f0', borderRadius:3 }}>
              <div style={{ height:'100%', width:`${Math.min(s.average,100)}%`, borderRadius:3, transition:'width 0.4s',
                background: s.average < 60 ? '#fc8181' : s.average < 75 ? '#f6ad55' : '#48bb78' }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:20 }}>
        {/* Upcoming assignments */}
        <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:'18px 20px' }}>
          <div style={{ fontSize:13, fontWeight:600, color:'#1a202c', marginBottom:14 }}>Due Soon</div>
          {data?.upcomingAssignments?.length > 0 ? data.upcomingAssignments.map((a, i) => {
            const daysLeft = Math.ceil((new Date(a.dueDate) - new Date()) / 86400000);
            return (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 12px', border:'1px solid #e2e8f0', borderRadius:6, marginBottom:7 }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:500, color:'#1a202c' }}>{a.title}</div>
                  <div style={{ fontSize:11, color:'#a0aec0', marginTop:2 }}>{a.subject}</div>
                </div>
                <span style={{ fontSize:12, fontWeight:600, color: daysLeft <= 1 ? '#c53030' : '#2b6cb0', marginLeft:10, whiteSpace:'nowrap' }}>
                  {daysLeft <= 0 ? 'Today!' : `${daysLeft}d left`}
                </span>
              </div>
            );
          }) : <div style={{ fontSize:13, color:'#718096' }}>No upcoming assignments.</div>}
        </div>

        {/* Attendance Warnings */}
        <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:'18px 20px' }}>
          <div style={{ fontSize:13, fontWeight:600, color:'#1a202c', marginBottom:14 }}>Attendance Warnings</div>
          {data?.lowAttendance?.length > 0 ? data.lowAttendance.map((a, i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 12px', background:'#fff5f5', border:'1px solid #fed7d7', borderRadius:6, marginBottom:7 }}>
              <span style={{ fontSize:13, color:'#1a202c', fontWeight:500 }}>{a.subject}</span>
              <span style={{ fontSize:13, fontWeight:700, color:'#c53030' }}>{a.percentage}%</span>
            </div>
          )) : (
            <div style={{ fontSize:13, color:'#276749', paddingTop:8 }}>✅ All attendance on track.</div>
          )}
        </div>
      </div>
    </div>
  );
}