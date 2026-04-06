import React, { useState, useEffect } from 'react';
import { resourcesAPI } from '../services/api';

const TYPE_COLOR = { pdf:'#c53030', doc:'#2b6cb0', docx:'#2b6cb0', ppt:'#c05621', pptx:'#c05621', xls:'#276749', xlsx:'#276749', link:'#553c9a', other:'#4a5568' };

export default function StudentResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState('all');

  useEffect(() => {
    resourcesAPI.getForStudent()
      .then(r => { setResources(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const subjects = [...new Set(resources.map(r => r.subject).filter(Boolean))];
  const filtered = resources.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
                        r.subject?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || r.subject === filter || (filter==='links' && r.type==='link') || (filter==='files' && r.type==='file');
    return matchSearch && matchFilter;
  });

  if (loading) return <div style={{ padding:40, textAlign:'center', color:'#a0aec0' }}>Loading...</div>;

  return (
    <div style={{ padding:'28px 32px' }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:20, fontWeight:700, color:'#1a202c', marginBottom:4 }}>Resources</h1>
        <p style={{ fontSize:13, color:'#718096' }}>Study materials and links shared by your mentor.</p>
      </div>

      {/* Search + filter */}
      <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search resources..."
          style={{ padding:'8px 14px', fontSize:13, border:'1px solid #e2e8f0', borderRadius:6, outline:'none', width:220 }}
          onFocus={e => e.target.style.borderColor='#2b6cb0'} onBlur={e => e.target.style.borderColor='#e2e8f0'} />
        {['all','links','files',...subjects].map(f => (
          <div key={f} onClick={() => setFilter(f)} style={{
            padding:'6px 14px', borderRadius:20, cursor:'pointer', fontSize:12, fontWeight:500,
            background: filter===f ? '#2b6cb0' : '#fff', color: filter===f ? '#fff' : '#4a5568',
            border:'1px solid #e2e8f0', textTransform:'capitalize',
          }}>{f}</div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:'60px 0', textAlign:'center', color:'#a0aec0' }}>
          <div style={{ fontSize:14, fontWeight:500 }}>No resources available yet.</div>
          <div style={{ fontSize:12, marginTop:6 }}>Your mentor will share study materials here.</div>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))', gap:16 }}>
        {filtered.map(r => (
          <div key={r._id} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:'16px 18px', transition:'box-shadow 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow='none'}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:20 }}>{r.type==='link' ? '🔗' : '📄'}</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:'#1a202c' }}>{r.title}</div>
                  {r.subject && <div style={{ fontSize:11, color:'#718096' }}>{r.subject}</div>}
                </div>
              </div>
              <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:4, background:'#f7fafc', color: TYPE_COLOR[r.fileType || r.type] || '#4a5568', border:'1px solid #e2e8f0', textTransform:'uppercase', flexShrink:0 }}>
                {r.fileType || r.type}
              </span>
            </div>
            {r.description && <div style={{ fontSize:12, color:'#718096', marginBottom:10, lineHeight:1.5 }}>{r.description}</div>}
            <div style={{ fontSize:11, color:'#a0aec0', marginBottom:10 }}>
              By {r.uploadedBy?.name || 'Mentor'} · {new Date(r.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
            </div>
            <a href={r.url} target="_blank" rel="noreferrer" style={{ display:'block', padding:'8px', background:'#ebf4ff', color:'#2b6cb0', borderRadius:6, fontSize:12, fontWeight:600, textAlign:'center', textDecoration:'none' }}>
              Open Resource →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
