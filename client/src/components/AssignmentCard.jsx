import React from 'react';

const PRIORITY = {
  high:   { color: '#ef4444', bg: '#fef2f2', border: '#fecaca', label: '🔴 High',   dot: '#ef4444' },
  medium: { color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', label: '🟡 Medium', dot: '#f59e0b' },
  low:    { color: '#10b981', bg: '#f0fdf4', border: '#a7f3d0', label: '🟢 Low',    dot: '#10b981' },
};

export default function AssignmentCard({ assignment, onToggle, onDelete }) {
  const a = assignment;
  const p = PRIORITY[a.priority] || PRIORITY.medium;
  const now = new Date();
  const due = new Date(a.dueDate);
  const daysLeft = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  const isOverdue = daysLeft < 0 && a.status === 'pending';
  const isDueToday = daysLeft === 0 && a.status === 'pending';
  const isCompleted = a.status === 'completed';

  const getDueLabel = () => {
    if (isCompleted) return { text: 'Completed', color: '#10b981' };
    if (isOverdue) return { text: `${Math.abs(daysLeft)}d overdue`, color: '#ef4444' };
    if (isDueToday) return { text: 'Due today!', color: '#ef4444' };
    if (daysLeft === 1) return { text: 'Due tomorrow', color: '#f59e0b' };
    if (daysLeft <= 3) return { text: `${daysLeft}d left`, color: '#f59e0b' };
    return { text: `${daysLeft}d left`, color: '#6366f1' };
  };

  const { text: dueText, color: dueColor } = getDueLabel();

  return (
    <div style={{
      background: 'white',
      borderRadius: 18,
      padding: '18px 22px',
      boxShadow: '0 4px 15px rgba(99,102,241,0.06)',
      border: `1px solid ${isOverdue ? '#fecaca' : isCompleted ? '#d1fae5' : '#f1f5f9'}`,
      display: 'flex',
      alignItems: 'flex-start',
      gap: 16,
      opacity: isCompleted ? 0.78 : 1,
      transition: 'all 0.25s ease',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(99,102,241,0.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(99,102,241,0.06)'; }}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle?.(a)}
        style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0, marginTop: 2,
          border: `2px solid ${isCompleted ? '#10b981' : '#c7d2fe'}`,
          background: isCompleted ? '#10b981' : 'white',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, color: 'white', transition: 'all 0.2s'
        }}>
        {isCompleted && '✓'}
      </button>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Title row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 5 }}>
          <span style={{
            fontSize: 15, fontWeight: 700, color: '#1e1b4b',
            textDecoration: isCompleted ? 'line-through' : 'none',
            textDecorationColor: '#94a3b8'
          }}>{a.title}</span>

          {/* Priority badge */}
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20,
            background: p.bg, color: p.color, border: `1px solid ${p.border}`
          }}>{p.label}</span>

          {isOverdue && <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20, background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' }}>OVERDUE</span>}
        </div>

        {/* Subject & description */}
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>
          📚 <strong style={{ color: '#6366f1' }}>{a.subject}</strong>
          {a.description && <span> · {a.description}</span>}
        </div>

        {/* Due date row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: dueColor }}>{dueText}</span>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>
            {due.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Delete button */}
      <button
        onClick={() => onDelete?.(a._id)}
        style={{
          width: 34, height: 34, borderRadius: 10, border: 'none',
          background: '#fef2f2', color: '#fca5a5', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, flexShrink: 0, transition: 'all 0.2s'
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white'; }}
        onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#fca5a5'; }}
        title="Delete"
      >🗑️</button>
    </div>
  );
}
