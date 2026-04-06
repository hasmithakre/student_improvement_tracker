import React, { useState } from 'react';

/**
 * SubjectCard — Reusable card for displaying a subject with marks history,
 * average, progress bar, and action buttons.
 *
 * Props:
 *   subject     — { _id, name, code, teacher, color, marks[], average }
 *   onEdit      — fn(subject)
 *   onDelete    — fn(id)
 *   onAddMark   — fn(subject)
 *   onDeleteMark— fn(subjectId, markId)
 */
export default function SubjectCard({ subject, onEdit, onDelete, onAddMark, onDeleteMark }) {
  const [expanded, setExpanded] = useState(false);

  const avg = subject.average || 0;
  const getGradeInfo = (score) => {
    if (score >= 90) return { grade: 'A+', color: '#10b981', bg: '#d1fae5' };
    if (score >= 80) return { grade: 'A', color: '#6366f1', bg: '#ede9fe' };
    if (score >= 70) return { grade: 'B', color: '#3b82f6', bg: '#dbeafe' };
    if (score >= 60) return { grade: 'C', color: '#f59e0b', bg: '#fef3c7' };
    if (score >= 50) return { grade: 'D', color: '#f97316', bg: '#ffedd5' };
    return { grade: 'F', color: '#ef4444', bg: '#fee2e2' };
  };
  const { grade, color: gradeColor, bg: gradeBg } = getGradeInfo(avg);

  const recentTrend = subject.marks?.length >= 2
    ? subject.marks[subject.marks.length - 1].marks / subject.marks[subject.marks.length - 1].maxMarks * 100
      - subject.marks[subject.marks.length - 2].marks / subject.marks[subject.marks.length - 2].maxMarks * 100
    : null;

  return (
    <div style={{
      background: 'white',
      borderRadius: 20,
      overflow: 'hidden',
      boxShadow: '0 4px 15px rgba(99,102,241,0.08)',
      border: '1px solid #f1f5f9',
      transition: 'all 0.25s ease',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(99,102,241,0.15)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(99,102,241,0.08)'; }}
    >
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${subject.color || '#6366f1'}, ${subject.color || '#6366f1'}99)`,
        padding: '20px 22px', color: 'white'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 3px' }}>{subject.name}</h3>
            <p style={{ fontSize: 12, opacity: 0.8, margin: 0 }}>
              {[subject.code, subject.teacher].filter(Boolean).join(' • ')}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 30, fontWeight: 900, lineHeight: 1 }}>{avg}%</div>
            <div style={{
              display: 'inline-block', marginTop: 4, background: gradeBg,
              color: gradeColor, borderRadius: 8, padding: '2px 10px', fontSize: 12, fontWeight: 800
            }}>Grade {grade}</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginTop: 14 }}>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.25)', borderRadius: 3 }}>
            <div style={{
              height: '100%', width: `${avg}%`, background: 'white',
              borderRadius: 3, transition: 'width 0.6s ease'
            }} />
          </div>
        </div>

        {/* Trend indicator */}
        {recentTrend !== null && (
          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.9 }}>
            {recentTrend > 0
              ? `📈 +${recentTrend.toFixed(1)}% from last test`
              : recentTrend < 0
                ? `📉 ${recentTrend.toFixed(1)}% from last test`
                : '➡️ Same as last test'}
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, borderBottom: '1px solid #f1f5f9' }}>
        {[
          { label: 'Tests', value: subject.marks?.length || 0, icon: '📋' },
          { label: 'Highest', value: subject.marks?.length ? `${Math.max(...subject.marks.map(m => Math.round(m.marks / m.maxMarks * 100)))}%` : '-', icon: '⬆️' },
          { label: 'Lowest', value: subject.marks?.length ? `${Math.min(...subject.marks.map(m => Math.round(m.marks / m.maxMarks * 100)))}%` : '-', icon: '⬇️' },
        ].map(({ label, value, icon }, i) => (
          <div key={label} style={{
            padding: '12px 14px', textAlign: 'center',
            borderRight: i < 2 ? '1px solid #f1f5f9' : 'none'
          }}>
            <div style={{ fontSize: 16, marginBottom: 2 }}>{icon}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#1e1b4b' }}>{value}</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: expanded ? 14 : 0 }}>
          <button onClick={() => onAddMark?.(subject)}
            style={{ flex: 1, padding: '9px 8px', background: 'linear-gradient(135deg, #ede9fe, #e0e7ff)', color: '#6366f1', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'linear-gradient(135deg, #6366f1, #8b5cf6)' || (e.currentTarget.style.color = 'white')}
            onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #ede9fe, #e0e7ff)'; e.currentTarget.style.color = '#6366f1'; }}>
            + Add Mark
          </button>
          <button onClick={() => setExpanded(!expanded)}
            style={{ flex: 1, padding: '9px 8px', background: '#f8f7ff', color: '#8b5cf6', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
            {expanded ? '▲ Hide' : '▼ Marks'}
          </button>
          <button onClick={() => onEdit?.(subject)}
            style={{ padding: '9px 11px', background: '#f0fdf4', color: '#10b981', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: 'pointer' }} title="Edit">✏️</button>
          <button onClick={() => onDelete?.(subject._id)}
            style={{ padding: '9px 11px', background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: 'pointer' }} title="Delete">🗑️</button>
        </div>

        {/* Expanded Marks List */}
        {expanded && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            {!subject.marks?.length ? (
              <div style={{ textAlign: 'center', padding: '16px 0', color: '#94a3b8', fontSize: 13 }}>
                No marks recorded yet
              </div>
            ) : (
              <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                {subject.marks.map((m, i) => {
                  const pct = Math.round((m.marks / m.maxMarks) * 100);
                  const { color: mc } = getGradeInfo(pct);
                  return (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '9px 12px', background: '#f8f7ff', borderRadius: 10, marginBottom: 6
                    }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1e1b4b' }}>{m.testName}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{new Date(m.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 800, color: mc, fontSize: 15 }}>{pct}%</span>
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>{m.marks}/{m.maxMarks}</span>
                        {onDeleteMark && (
                          <button onClick={() => onDeleteMark(subject._id, m._id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fca5a5', fontSize: 14, padding: 2 }}>×</button>
                        )}
                      </div>
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
