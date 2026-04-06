import React from 'react';

/**
 * GoalTracker — Reusable goal card with progress bar and controls.
 *
 * Props:
 *   goal         — { _id, title, description, type, targetDate, progress, status }
 *   onProgress   — fn(id, newProgress)
 *   onDelete     — fn(id)
 *   onEdit       — fn(goal) [optional]
 *   compact      — boolean — minimal view for dashboard widget
 */
export default function GoalTracker({ goal, onProgress, onDelete, onEdit, compact = false }) {
  const g = goal;
  const isCompleted = g.status === 'completed';
  const isShortTerm = g.type === 'short-term';

  const daysLeft = g.targetDate
    ? Math.ceil((new Date(g.targetDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  const progressColor =
    g.progress === 100 ? '#10b981' :
    g.progress >= 60 ? '#6366f1' :
    g.progress >= 30 ? '#f59e0b' : '#ef4444';

  if (compact) {
    return (
      <div style={{
        background: 'white', borderRadius: 14, padding: '14px 16px',
        border: `1px solid ${isCompleted ? '#d1fae5' : '#f1f5f9'}`,
        opacity: isCompleted ? 0.8 : 1,
        transition: 'all 0.2s'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14 }}>{isShortTerm ? '⚡' : '🌟'}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1e1b4b', textDecoration: isCompleted ? 'line-through' : 'none' }}>{g.title}</span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 800, color: progressColor }}>{g.progress}%</span>
        </div>
        <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3 }}>
          <div style={{ height: '100%', width: `${g.progress}%`, background: isCompleted ? '#10b981' : `linear-gradient(90deg, ${progressColor}, ${progressColor}99)`, borderRadius: 3, transition: 'width 0.5s ease' }} />
        </div>
        {daysLeft !== null && (
          <div style={{ fontSize: 11, color: daysLeft < 0 ? '#ef4444' : '#94a3b8', marginTop: 5, fontWeight: 500 }}>
            {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Due today' : `${daysLeft}d left`}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      background: 'white', borderRadius: 20, padding: '22px 24px',
      boxShadow: '0 4px 15px rgba(99,102,241,0.08)',
      border: `1px solid ${isCompleted ? '#d1fae5' : '#f1f5f9'}`,
      opacity: isCompleted ? 0.85 : 1,
      transition: 'all 0.25s ease'
    }}
      onMouseEnter={e => { if (!isCompleted) { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(99,102,241,0.14)'; } }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(99,102,241,0.08)'; }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
              background: isShortTerm ? '#fffbeb' : '#ede9fe',
              color: isShortTerm ? '#d97706' : '#7c3aed'
            }}>
              {isShortTerm ? '⚡ Short-term' : '🌟 Long-term'}
            </span>
            {isCompleted && (
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#d1fae5', color: '#059669' }}>
                ✅ Completed!
              </span>
            )}
          </div>

          <h3 style={{
            fontSize: 16, fontWeight: 800, color: '#1e1b4b', margin: '0 0 4px',
            textDecoration: isCompleted ? 'line-through' : 'none',
            textDecorationColor: '#94a3b8'
          }}>{g.title}</h3>

          {g.description && (
            <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.5 }}>{g.description}</p>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 6, marginLeft: 12, flexShrink: 0 }}>
          {onEdit && (
            <button onClick={() => onEdit(g)}
              style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#f0fdf4', color: '#10b981', cursor: 'pointer', fontSize: 14 }}>✏️</button>
          )}
          <button onClick={() => onDelete?.(g._id)}
            style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#fef2f2', color: '#fca5a5', cursor: 'pointer', fontSize: 14, transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#fca5a5'; }}>🗑️</button>
        </div>
      </div>

      {/* Due date */}
      {daysLeft !== null && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 14,
          fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20,
          background: daysLeft < 0 ? '#fef2f2' : daysLeft <= 7 ? '#fffbeb' : '#f0f9ff',
          color: daysLeft < 0 ? '#ef4444' : daysLeft <= 7 ? '#d97706' : '#0284c7'
        }}>
          📅 {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : daysLeft === 0 ? 'Due today!' : `${daysLeft} days left`}
          {g.targetDate && <span style={{ fontWeight: 400, opacity: 0.8 }}>· {new Date(g.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
        </div>
      )}

      {/* Progress */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Progress</span>
          <span style={{ fontSize: 14, fontWeight: 900, color: progressColor }}>{g.progress}%</span>
        </div>
        <div style={{ height: 12, background: '#f1f5f9', borderRadius: 6, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${g.progress}%`,
            background: isCompleted ? '#10b981' : `linear-gradient(90deg, #6366f1, #8b5cf6)`,
            borderRadius: 6, transition: 'width 0.5s ease',
            boxShadow: g.progress > 0 ? `0 2px 8px ${progressColor}55` : 'none'
          }} />
        </div>
      </div>

      {/* Slider — only for active goals */}
      {!isCompleted && onProgress && (
        <input
          type="range" min="0" max="100" value={g.progress}
          onChange={e => onProgress(g._id, Number(e.target.value))}
          style={{ width: '100%', accentColor: '#6366f1', cursor: 'pointer', marginTop: 4 }}
        />
      )}

      {/* Milestone markers */}
      {!isCompleted && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, paddingTop: 6, borderTop: '1px solid #f1f5f9' }}>
          {[0, 25, 50, 75, 100].map(m => (
            <button key={m} onClick={() => onProgress?.(g._id, m)}
              style={{
                fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 8,
                border: `1px solid ${g.progress >= m ? '#c7d2fe' : '#f1f5f9'}`,
                background: g.progress >= m ? '#ede9fe' : 'white',
                color: g.progress >= m ? '#6366f1' : '#94a3b8',
                cursor: 'pointer', transition: 'all 0.2s'
              }}>{m}%</button>
          ))}
        </div>
      )}
    </div>
  );
}
