import React, { useState, useEffect } from 'react';
import { assignmentsAPI } from '../services/api';

const input = { width:'100%', padding:'9px 12px', fontSize:13, border:'1px solid #e2e8f0', borderRadius:6, outline:'none', boxSizing:'border-box', background:'#fff', color:'#1a202c' };
const lbl = { display:'block', fontSize:12, fontWeight:500, color:'#4a5568', marginBottom:6 };
const btn = (primary) => ({ padding:'9px 18px', border: primary ? 'none' : '1px solid #e2e8f0', borderRadius:6, background: primary ? '#2b6cb0' : '#fff', color: primary ? '#fff' : '#4a5568', fontSize:13, fontWeight:500, cursor:'pointer' });

const priorityColors = { high:{ text:'#c53030', bg:'#fff5f5', border:'#fed7d7' }, medium:{ text:'#975a16', bg:'#fffff0', border:'#faf089' }, low:{ text:'#276749', bg:'#f0fff4', border:'#9ae6b4' } };

function Modal({ onClose, onSave }) {
  const [form, setForm] = useState({ title:'', subject:'', description:'', dueDate:'', priority:'medium' });
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200 }}>
      <div style={{ background:'#fff', borderRadius:10, padding:28, width:420, boxShadow:'0 8px 32px rgba(0,0,0,0.12)' }}>
        <h3 style={{ fontSize:15, fontWeight:700, color:'#1a202c', marginBottom:20 }}>New Assignment</h3>
        {[['Title','title','text','Assignment title'],['Subject','subject','text','Subject name'],['Due Date','dueDate','date',''],['Description','description','text','Optional details']].map(([l,k,t,p]) => (
          <div key={k} style={{ marginBottom:14 }}>
            <label style={lbl}>{l}</label>
            <input type={t} placeholder={p} value={form[k]} style={input}
              onChange={e => setForm({...form,[k]:e.target.value})}
              onFocus={e => e.target.style.borderColor='#4299e1'} onBlur={e => e.target.style.borderColor='#e2e8f0'} />
          </div>
        ))}
        <div style={{ marginBottom:20 }}>
          <label style={lbl}>Priority</label>
          <div style={{ display:'flex', gap:8 }}>
            {['low','medium','high'].map(p => (
              <button key={p} onClick={() => setForm({...form,priority:p})} style={{
                flex:1, padding:'8px', border:`1px solid ${form.priority===p ? priorityColors[p].border : '#e2e8f0'}`,
                borderRadius:6, background: form.priority===p ? priorityColors[p].bg : '#fff',
                color: form.priority===p ? priorityColors[p].text : '#718096', fontSize:12, fontWeight:500, cursor:'pointer',
                textTransform:'capitalize',
              }}>{p}</button>
            ))}
          </div>
        </div>
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button style={btn(false)} onClick={onClose}>Cancel</button>
          <button style={btn(true)} onClick={() => form.title && form.subject && form.dueDate && onSave(form)}>Add Assignment</button>
        </div>
      </div>
    </div>
  );
}

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);

  const load = () => assignmentsAPI.getAll().then(r => setAssignments(r.data));
  useEffect(() => { load(); }, []);

  const handleSave = async (form) => { await assignmentsAPI.create(form); setShowModal(false); load(); };
  const toggleStatus = async (a) => { await assignmentsAPI.update(a._id, { status: a.status === 'pending' ? 'completed' : 'pending' }); load(); };
  const handleDelete = async (id) => { if (window.confirm('Delete?')) { await assignmentsAPI.delete(id); load(); } };

  const filtered = filter === 'all' ? assignments : assignments.filter(a => a.status === filter);
  const pending = assignments.filter(a => a.status === 'pending').length;

  return (
    <div className="fade-in" style={{ padding:'28px 32px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:18, fontWeight:700, color:'#1a202c' }}>Assignments</h1>
          <p style={{ fontSize:13, color:'#718096', marginTop:2 }}>{pending} pending · {assignments.length - pending} completed</p>
        </div>
        <button style={btn(true)} onClick={() => setShowModal(true)}>New Assignment</button>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        {['all','pending','completed'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding:'7px 16px', borderRadius:6, fontSize:12, fontWeight:500, cursor:'pointer',
            border: filter===f ? 'none' : '1px solid #e2e8f0',
            background: filter===f ? '#2b6cb0' : '#fff',
            color: filter===f ? '#fff' : '#4a5568', textTransform:'capitalize',
          }}>{f}</button>
        ))}
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {filtered.map(a => {
          const daysLeft = Math.ceil((new Date(a.dueDate) - new Date()) / 86400000);
          const isOverdue = daysLeft < 0 && a.status === 'pending';
          const p = priorityColors[a.priority];
          return (
            <div key={a._id} style={{
              background:'#fff', border:`1px solid ${isOverdue ? '#fed7d7' : '#e2e8f0'}`,
              borderRadius:8, padding:'14px 18px', display:'flex', alignItems:'center', gap:14,
              opacity: a.status === 'completed' ? 0.7 : 1, boxShadow:'0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <input type="checkbox" checked={a.status === 'completed'} onChange={() => toggleStatus(a)}
                style={{ width:16, height:16, cursor:'pointer', accentColor:'#2b6cb0', flexShrink:0 }} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                  <span style={{ fontSize:14, fontWeight:500, color:'#1a202c', textDecoration: a.status==='completed' ? 'line-through' : 'none' }}>{a.title}</span>
                  <span style={{ fontSize:11, fontWeight:500, padding:'2px 8px', borderRadius:4, background:p.bg, color:p.text, border:`1px solid ${p.border}`, textTransform:'capitalize' }}>{a.priority}</span>
                  {isOverdue && <span style={{ fontSize:11, fontWeight:500, padding:'2px 8px', borderRadius:4, background:'#fff5f5', color:'#c53030', border:'1px solid #fed7d7' }}>Overdue</span>}
                </div>
                <div style={{ fontSize:12, color:'#718096', marginTop:3 }}>{a.subject}{a.description ? ` · ${a.description}` : ''}</div>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <div style={{ fontSize:12, fontWeight:600, color: isOverdue ? '#c53030' : daysLeft <= 2 ? '#975a16' : '#718096' }}>
                  {a.status === 'completed' ? 'Done' : daysLeft === 0 ? 'Due today' : daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                </div>
                <div style={{ fontSize:11, color:'#a0aec0', marginTop:2 }}>{new Date(a.dueDate).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</div>
              </div>
              <button onClick={() => handleDelete(a._id)} style={{ background:'none', border:'1px solid #e2e8f0', borderRadius:6, padding:'5px 9px', color:'#c53030', fontSize:12, cursor:'pointer', flexShrink:0 }}>Delete</button>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'60px 0', color:'#a0aec0' }}>
            <div style={{ fontSize:14, fontWeight:500 }}>No assignments found.</div>
          </div>
        )}
      </div>
      {showModal && <Modal onClose={() => setShowModal(false)} onSave={handleSave} />}
    </div>
  );
}
