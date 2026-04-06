import React, { useState, useEffect } from 'react';
import { attendanceAPI } from '../services/api';

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    attendanceAPI.getMy()
      .then(r => { setRecords(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const totalClasses  = records.reduce((s, r) => s + r.totalClasses, 0);
  const totalAttended = records.reduce((s, r) => s + r.attendedClasses, 0);
  const overall = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;

  // Group periods by date for a subject
  const groupByDate = (periods) => {
    const map = {};
    periods.forEach(p => {
      const d = new Date(p.date).toDateString();
      if (!map[d]) map[d] = [];
      map[d].push(p);
    });
    return Object.entries(map).sort((a, b) => new Date(b[0]) - new Date(a[0]));
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <span style={{ fontSize: 13, color: '#a0aec0' }}>Loading...</span>
    </div>
  );

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1a202c' }}>Attendance</h1>
        <p style={{ fontSize: 13, color: '#718096', marginTop: 2 }}>
          Period-wise attendance marked by your teachers. Read-only.
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Overall Attendance', value: `${overall}%`, color: overall >= 75 ? '#276749' : '#c53030' },
          { label: 'Total Periods',      value: totalClasses,   color: '#1a202c' },
          { label: 'Below Threshold',    value: `${records.filter(r => r.isLow).length} subjects`,
            color: records.some(r => r.isLow) ? '#c53030' : '#276749' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '18px 22px' }}>
            <div style={{ fontSize: 11, color: '#718096', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
          </div>
        ))}
      </div>

      {records.some(r => r.isLow) && (
        <div style={{ background: '#fff5f5', border: '1px solid #fed7d7', borderRadius: 8, padding: '12px 18px', marginBottom: 20, fontSize: 13, color: '#c53030' }}>
          ⚠ One or more subjects have attendance below the required threshold. Contact your teacher.
        </div>
      )}

      {records.length === 0 && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '60px 0', textAlign: 'center', color: '#a0aec0' }}>
          <div style={{ fontSize: 14, fontWeight: 500 }}>No attendance records yet.</div>
          <div style={{ fontSize: 12, marginTop: 6 }}>Your teacher will mark attendance period-wise.</div>
        </div>
      )}

      {/* Subject cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px,1fr))', gap: 16 }}>
        {records.map(r => {
          const isLow = r.isLow;
          const byDate = groupByDate(r.periods);
          return (
            <div key={r._id} style={{ background: '#fff', border: `1px solid ${isLow ? '#fed7d7' : '#e2e8f0'}`, borderRadius: 8, overflow: 'hidden' }}>
              {/* Card header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f4f8' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1a202c' }}>{r.subjectName}</div>
                    {isLow && <div style={{ fontSize: 11, color: '#c53030', marginTop: 2, fontWeight: 500 }}>Below {r.threshold}% threshold</div>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 26, fontWeight: 700, color: isLow ? '#c53030' : '#276749', lineHeight: 1 }}>{r.percentage}%</div>
                    <div style={{ fontSize: 11, color: '#a0aec0', marginTop: 2 }}>{r.attendedClasses}/{r.totalClasses} periods</div>
                  </div>
                </div>
                {/* Progress bar */}
                <div style={{ height: 5, background: '#e2e8f0', borderRadius: 3 }}>
                  <div style={{ height: '100%', width: `${r.percentage}%`, background: isLow ? '#fc8181' : '#48bb78', borderRadius: 3, transition: 'width 0.4s' }} />
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', padding: '12px 20px', gap: 8, borderBottom: '1px solid #f0f4f8' }}>
                {[['Present', r.attendedClasses, '#276749'], ['Absent', r.totalClasses - r.attendedClasses, '#c53030'], ['Total', r.totalClasses, '#2b6cb0']].map(([l, v, c]) => (
                  <div key={l} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: c }}>{v}</div>
                    <div style={{ fontSize: 11, color: '#a0aec0' }}>{l}</div>
                  </div>
                ))}
              </div>

              {/* Toggle period history */}
              <div style={{ padding: '10px 20px' }}>
                <button onClick={() => setExpanded(expanded === r._id ? null : r._id)}
                  style={{ background: 'none', border: 'none', fontSize: 12, color: '#2b6cb0', cursor: 'pointer', fontWeight: 500, padding: 0 }}>
                  {expanded === r._id ? '▲ Hide period history' : '▼ View period history'}
                </button>
              </div>

              {/* Period history */}
              {expanded === r._id && (
                <div style={{ padding: '0 20px 16px', maxHeight: 240, overflowY: 'auto' }}>
                  {byDate.length === 0 && <div style={{ fontSize: 12, color: '#a0aec0' }}>No periods recorded.</div>}
                  {byDate.map(([dateStr, periods]) => (
                    <div key={dateStr} style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#718096', marginBottom: 4 }}>{dateStr}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {periods.sort((a, b) => a.period - b.period).map(p => (
                          <span key={p._id} style={{
                            fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                            background: p.status === 'present' ? '#f0fff4' : '#fff5f5',
                            color: p.status === 'present' ? '#276749' : '#c53030',
                            border: `1px solid ${p.status === 'present' ? '#9ae6b4' : '#fed7d7'}`,
                          }}>
                            P{p.period} — {p.status}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
