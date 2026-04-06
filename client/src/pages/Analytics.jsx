import React, { useState, useEffect } from 'react';
import { subjectsAPI, attendanceAPI } from '../services/api';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js';
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend, Filler);

const CHART_COLORS = ['#2b6cb0','#2c7a7b','#276749','#744210','#553c9a','#97266d'];

export default function Analytics() {
  const [subjects, setSubjects] = useState([]);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    subjectsAPI.getAll().then(r => setSubjects(r.data));
    attendanceAPI.getMy().then(r => setAttendance(r.data));
  }, []);

  const overallAvg = subjects.length > 0 ? Math.round(subjects.reduce((s, sub) => s + sub.average, 0) / subjects.length) : 0;
  const best = subjects.reduce((b, s) => (!b || s.average > b.average) ? s : b, null);
  const worst = subjects.reduce((w, s) => (!w || (s.average < w.average && s.average > 0)) ? s : w, null);
  const totalClasses = attendance.reduce((s, a) => s + a.totalClasses, 0);
  const attended = attendance.reduce((s, a) => s + a.attendedClasses, 0);
  const overallAtt = totalClasses > 0 ? Math.round((attended / totalClasses) * 100) : 0;

  const barData = {
    labels: subjects.map(s => s.name),
    datasets: [{ label: 'Average %', data: subjects.map(s => s.average), backgroundColor: subjects.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]), borderRadius: 4 }],
  };

  const pieData = {
    labels: ['Attended', 'Absent'],
    datasets: [{ data: [attended, totalClasses - attended], backgroundColor: ['#2b6cb0', '#e2e8f0'], borderWidth: 0 }],
  };

  const allMarks = subjects
    .flatMap(s => s.marks?.map(m => ({ date: new Date(m.date), pct: Math.round(m.marks / m.maxMarks * 100) })) || [])
    .sort((a, b) => a.date - b.date).slice(-10);

  const lineData = {
    labels: allMarks.map(m => m.date.toLocaleDateString('en-US', { month:'short', day:'numeric' })),
    datasets: [{
      label: 'Score %', data: allMarks.map(m => m.pct),
      borderColor: '#2b6cb0', backgroundColor: 'rgba(43,108,176,0.07)',
      fill: true, tension: 0.4, pointRadius: 4, borderWidth: 2,
    }],
  };

  const chartOpts = { responsive:true, plugins:{legend:{display:false}}, scales:{ y:{min:0,max:100,grid:{color:'#f7fafc'},ticks:{color:'#a0aec0',fontSize:11}}, x:{grid:{display:false},ticks:{color:'#a0aec0',fontSize:11}} }};

  const suggestions = [];
  if (worst && worst.average < 60) suggestions.push(`Focus more on ${worst.name} — currently at ${worst.average}%.`);
  if (overallAtt < 75) suggestions.push(`Overall attendance is ${overallAtt}%. Aim for at least 75%.`);
  if (overallAvg < 60) suggestions.push('Consider forming study groups or seeking additional help.');
  if (overallAvg >= 85) suggestions.push('Great performance. Keep your current study routine.');

  return (
    <div className="fade-in" style={{ padding:'28px 32px' }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:18, fontWeight:700, color:'#1a202c' }}>Analytics</h1>
        <p style={{ fontSize:13, color:'#718096', marginTop:2 }}>Performance insights and trends</p>
      </div>

      {/* Key metrics */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        {[
          { label:'Overall Average', value:`${overallAvg}%`, color:'#2b6cb0' },
          { label:'Best Subject', value: best?.name || '-', sub: best ? `${best.average}%` : '', color:'#1a202c' },
          { label:'Weakest Subject', value: worst?.name || '-', sub: worst ? `${worst.average}%` : '', color: worst && worst.average < 60 ? '#c53030' : '#1a202c' },
          { label:'Overall Attendance', value:`${overallAtt}%`, color: overallAtt >= 75 ? '#276749' : '#c53030' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:'18px 22px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize:12, color:'#718096', fontWeight:500, marginBottom:6, textTransform:'uppercase', letterSpacing:'0.04em' }}>{label}</div>
            <div style={{ fontSize:20, fontWeight:700, color, lineHeight:1.2 }}>{value}</div>
            {sub && <div style={{ fontSize:12, color:'#718096', marginTop:4 }}>{sub}</div>}
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:'20px 22px' }}>
          <div style={{ fontSize:13, fontWeight:600, color:'#1a202c', marginBottom:16 }}>Subject Comparison</div>
          {subjects.length > 0 ? <Bar data={barData} options={chartOpts} /> : <div style={{ color:'#a0aec0', fontSize:13, textAlign:'center', padding:40 }}>No subjects yet.</div>}
        </div>
        <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:'20px 22px' }}>
          <div style={{ fontSize:13, fontWeight:600, color:'#1a202c', marginBottom:16 }}>Attendance Breakdown</div>
          {totalClasses > 0 ? (
            <div style={{ maxWidth:240, margin:'0 auto' }}>
              <Pie data={pieData} options={{ responsive:true, plugins:{ legend:{ position:'bottom', labels:{ font:{size:12}, padding:16 }}}}} />
            </div>
          ) : <div style={{ color:'#a0aec0', fontSize:13, textAlign:'center', padding:40 }}>No attendance records yet.</div>}
        </div>
      </div>


      {suggestions.length > 0 && (
        <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:'20px 22px' }}>
          <div style={{ fontSize:13, fontWeight:600, color:'#1a202c', marginBottom:14 }}>Recommendations</div>
          {suggestions.map((s, i) => (
            <div key={i} style={{ display:'flex', gap:12, alignItems:'flex-start', padding:'10px 14px', background:'#f7fafc', borderRadius:6, marginBottom:8, border:'1px solid #e2e8f0' }}>
              <div style={{ width:5, height:5, borderRadius:'50%', background:'#2b6cb0', marginTop:5, flexShrink:0 }} />
              <span style={{ fontSize:13, color:'#4a5568' }}>{s}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
