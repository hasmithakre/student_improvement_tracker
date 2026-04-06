import React, { useState, useEffect } from 'react';
import { goalsAPI } from '../services/api';

const input = { width:'100%', padding:'9px 12px', fontSize:13, border:'1px solid #e2e8f0', borderRadius:6, outline:'none', boxSizing:'border-box', background:'#fff', color:'#1a202c' };
const lbl = { display:'block', fontSize:12, fontWeight:500, color:'#4a5568', marginBottom:6 };
const btn = (primary) => ({ padding:'9px 18px', border: primary ? 'none' : '1px solid #e2e8f0', borderRadius:6, background: primary ? '#2b6cb0' : '#fff', color: primary ? '#fff' : '#4a5568', fontSize:13, fontWeight:500, cursor:'pointer' });

function Modal({ onClose, onSave }) {
  const [form, setForm] = useState({ title:'', description:'', type:'short-term', targetDate:'', progress:0 });
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200 }}>
      <div style={{ background:'#fff', borderRadius:10, padding:28, width:420, boxShadow:'0 8px 32px rgba(0,0,0,0.12)' }}>
        <h3 style={{ fontSize:15, fontWeight:700, color:'#1a202c', marginBottom:20 }}>New Goal</h3>
        {[['Goal Title','title','text','e.g. Score 90% in Math'],['Description','description','text','Optional'],['Target Date','targetDate','date','']].map(([l,k,t,p]) => (
          <div key={k} style={{ marginBottom:14 }}>
            <label style={lbl}>{l}</label>
            <input type={t} placeholder={p} value={form[k]} style={input}
              onChange={e => setForm({...form,[k]:e.target.value})}
              onFocus={e => e.target.style.borderColor='#4299e1'} onBlur={e => e.target.style.borderColor='#e2e8f0'} />
          </div>
        ))}
        <div style={{ marginBottom:20 }}>
          <label style={lbl}>Type</label>
          <div style={{ display:'flex', gap:8 }}>
            {[['short-term','Short-term'],['long-term','Long-term']].map(([v,l]) => (
              <button key={v} onClick={() => setForm({...form,type:v})} style={{
                flex:1, padding:'9px', border:`1px solid ${form.type===v ? '#4299e1' : '#e2e8f0'}`,
                borderRadius:6, background: form.type===v ? '#ebf4ff' : '#fff',
                color: form.type===v ? '#2b6cb0' : '#718096', fontSize:13, fontWeight:500, cursor:'pointer',
              }}>{l}</button>
            ))}
          </div>
        </div>
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button style={btn(false)} onClick={onClose}>Cancel</button>
          <button style={btn(true)} onClick={() => form.title && onSave(form)}>Create Goal</button>
        </div>
      </div>
    </div>
  );
}

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');

  const load = () => goalsAPI.getAll().then(r => setGoals(r.data));
  useEffect(() => { load(); }, []);

  const handleSave = async (form) => { await goalsAPI.create(form); setShowModal(false); load(); };
  const handleDelete = async (id) => { if (window.confirm('Delete?')) { await goalsAPI.delete(id); load(); } };
  const updateProgress = async (id, progress) => { await goalsAPI.update(id, { progress }); load(); };

  const filtered = filter === 'all' ? goals : goals.filter(g => filter === 'completed' ? g.status === 'completed' : g.status === 'active');

  return (
    <div className="fade-in" style={{ padding:'28px 32px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:18, fontWeight:700, color:'#1a202c' }}>Goals</h1>
          <p style={{ fontSize:13, color:'#718096', marginTop:2 }}>{goals.filter(g=>g.status==='active').length} active · {goals.filter(g=>g.status==='completed').length} completed</p>
        </div>
        <button style={btn(true)} onClick={() => setShowModal(true)}>New Goal</button>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        {['all','active','completed'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding:'7px 16px', borderRadius:6, fontSize:12, fontWeight:500, cursor:'pointer',
            border: filter===f ? 'none' : '1px solid #e2e8f0',
            background: filter===f ? '#2b6cb0' : '#fff',
            color: filter===f ? '#fff' : '#4a5568', textTransform:'capitalize',
          }}>{f}</button>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px,1fr))', gap:16 }}>
        {filtered.map(g => {
          const daysLeft = g.targetDate ? Math.ceil((new Date(g.targetDate) - new Date()) / 86400000) : null;
          const isCompleted = g.status === 'completed';
          return (
            <div key={g._id} style={{ background:'#fff', border:`1px solid ${isCompleted ? '#c6f6d5' : '#e2e8f0'}`, borderRadius:8, padding:'18px 20px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)', opacity: isCompleted ? 0.85 : 1 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', gap:6, marginBottom:6 }}>
                    <span style={{ fontSize:11, fontWeight:500, padding:'2px 8px', borderRadius:4, background: g.type==='short-term' ? '#fffff0' : '#ebf4ff', color: g.type==='short-term' ? '#975a16' : '#2b6cb0', border:`1px solid ${g.type==='short-term' ? '#faf089' : '#bee3f8'}` }}>
                      {g.type === 'short-term' ? 'Short-term' : 'Long-term'}
                    </span>
                    {isCompleted && <span style={{ fontSize:11, fontWeight:500, padding:'2px 8px', borderRadius:4, background:'#f0fff4', color:'#276749', border:'1px solid #9ae6b4' }}>Completed</span>}
                  </div>
                  <div style={{ fontSize:14, fontWeight:600, color:'#1a202c', textDecoration: isCompleted ? 'line-through' : 'none' }}>{g.title}</div>
                  {g.description && <div style={{ fontSize:12, color:'#718096', marginTop:3 }}>{g.description}</div>}
                </div>
                <button onClick={() => handleDelete(g._id)} style={{ background:'none', border:'1px solid #e2e8f0', borderRadius:6, padding:'4px 9px', color:'#c53030', fontSize:12, cursor:'pointer', flexShrink:0, marginLeft:10 }}>Delete</button>
              </div>

              {daysLeft !== null && (
                <div style={{ fontSize:12, color: daysLeft < 0 ? '#c53030' : daysLeft <= 7 ? '#975a16' : '#718096', marginBottom:10, fontWeight:500 }}>
                  {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : daysLeft === 0 ? 'Due today' : `${daysLeft} days remaining`}
                </div>
              )}

              {/* Progress */}
              <div style={{ marginBottom:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                  <span style={{ fontSize:12, color:'#718096' }}>Progress</span>
                  <span style={{ fontSize:12, fontWeight:700, color:'#2b6cb0' }}>{g.progress}%</span>
                </div>
                <div style={{ height:6, background:'#e2e8f0', borderRadius:3 }}>
                  <div style={{ height:'100%', width:`${g.progress}%`, background: isCompleted ? '#48bb78' : '#2b6cb0', borderRadius:3, transition:'width 0.3s' }} />
                </div>
              </div>

              {!isCompleted && (
                <input type="range" min="0" max="100" value={g.progress}
                  onChange={e => updateProgress(g._id, Number(e.target.value))}
                  style={{ width:'100%', accentColor:'#2b6cb0', cursor:'pointer', marginTop:4 }} />
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'60px 0', color:'#a0aec0' }}>
            <div style={{ fontSize:14, fontWeight:500 }}>No goals found.</div>
          </div>
        )}
      </div>
      {showModal && <Modal onClose={() => setShowModal(false)} onSave={handleSave} />}
    </div>
  );
}
