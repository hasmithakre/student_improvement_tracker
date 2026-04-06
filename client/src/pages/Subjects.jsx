import React, { useState, useEffect } from 'react';
import { subjectsAPI } from '../services/api';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const TEST_TYPE_STYLE = {
  'Semester Exam':       { bg:'#ebf4ff', color:'#2b6cb0', border:'#bee3f8' },
  'Internal Assessment': { bg:'#f0fff4', color:'#276749', border:'#9ae6b4' },
  'Periodical Test':     { bg:'#fffff0', color:'#975a16', border:'#faf089' },
  'Lab Practical':       { bg:'#faf5ff', color:'#553c9a', border:'#d6bcfa' },
};

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    subjectsAPI.getAll()
      .then(r => { setSubjects(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const chartData = {
    labels: subjects.map(s => s.name),
    datasets: [{ label: 'Average %', data: subjects.map(s => s.average), backgroundColor: '#2b6cb0', borderRadius: 4 }],
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <span style={{ fontSize: 13, color: '#a0aec0' }}>Loading...</span>
    </div>
  );

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1a202c' }}>My Subjects</h1>
        <p style={{ fontSize: 13, color: '#718096', marginTop: 2 }}>
          {subjects.length} subject{subjects.length !== 1 ? 's' : ''} — subjects and marks are managed by your teacher.
        </p>
      </div>

      {/* Info banner */}
      <div style={{ background: '#ebf4ff', border: '1px solid #bee3f8', borderRadius: 8, padding: '11px 16px', marginBottom: 20, fontSize: 13, color: '#2b6cb0' }}>
        📘 Your teacher adds subjects and enters marks. You can view your performance here.
      </div>

      {/* Chart */}
      {subjects.length > 1 && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '20px 22px', marginBottom: 22 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1a202c', marginBottom: 14 }}>Performance Comparison</div>
          <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 100, grid: { color: '#f7fafc' } }, x: { grid: { display: false } } } }} height={70} />
        </div>
      )}

      {subjects.length === 0 && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '60px 0', textAlign: 'center', color: '#a0aec0' }}>
          <div style={{ fontSize: 14, fontWeight: 500 }}>No subjects yet.</div>
          <div style={{ fontSize: 12, marginTop: 6 }}>Your teacher will add subjects and marks for you.</div>
        </div>
      )}

      {/* Subject cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px,1fr))', gap: 16 }}>
        {subjects.map(s => (
          <div key={s._id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '18px 20px', borderBottom: '1px solid #f0f4f8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1a202c' }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: '#a0aec0', marginTop: 3 }}>
                    {[s.code, s.teacher].filter(Boolean).join(' · ')}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 26, fontWeight: 700, color: '#2b6cb0', lineHeight: 1 }}>{s.average}%</div>
                  <div style={{ fontSize: 11, color: '#a0aec0', marginTop: 3 }}>{s.marks?.length || 0} tests</div>
                </div>
              </div>
              <div style={{ height: 5, background: '#edf2f7', borderRadius: 3 }}>
                <div style={{ height: '100%', width: `${s.average}%`, background: s.average >= 75 ? '#2b6cb0' : s.average >= 50 ? '#d97706' : '#c53030', borderRadius: 3, transition: 'width 0.4s' }} />
              </div>
            </div>

            {/* View marks toggle */}
            <div style={{ padding: '10px 16px' }}>
              <button onClick={() => setExpanded(expanded === s._id ? null : s._id)}
                style={{ background: 'none', border: 'none', fontSize: 12, color: '#2b6cb0', cursor: 'pointer', fontWeight: 500, padding: 0 }}>
                {expanded === s._id ? '▲ Hide marks' : '▼ View marks'}
              </button>
            </div>

            {expanded === s._id && (
              <div style={{ padding: '0 16px 16px' }}>
                <div style={{ borderTop: '1px solid #f0f4f8', paddingTop: 12 }}>
                  {!s.marks?.length ? (
                    <p style={{ fontSize: 12, color: '#a0aec0', textAlign: 'center', padding: '12px 0' }}>No marks recorded yet.</p>
                  ) : s.marks.map((m, i) => {
                    const pct = Math.round(m.marks / m.maxMarks * 100);
                    const style = TEST_TYPE_STYLE[m.testName] || { bg: '#f7fafc', color: '#4a5568', border: '#e2e8f0' };
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid #f7fafc' }}>
                        <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 4, background: style.bg, color: style.color, border: `1px solid ${style.border}`, whiteSpace: 'nowrap', flexShrink: 0 }}>
                          {m.testName}
                        </span>
                        <div style={{ flex: 1, fontSize: 11, color: '#a0aec0' }}>
                          {new Date(m.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: pct >= 75 ? '#276749' : pct >= 50 ? '#975a16' : '#c53030' }}>{pct}%</span>
                        <span style={{ fontSize: 11, color: '#a0aec0' }}>{m.marks}/{m.maxMarks}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
