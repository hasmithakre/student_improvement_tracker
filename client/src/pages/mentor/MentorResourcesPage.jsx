import React, { useState, useEffect } from 'react';
import { resourcesAPI, mentorAPI } from '../../services/api';

const inp = { width:'100%', padding:'9px 12px', fontSize:13, border:'1.5px solid #e2e8f0', borderRadius:6, outline:'none', color:'#1a202c', background:'#fff', boxSizing:'border-box', transition:'border-color 0.15s' };
const focus = e => e.target.style.borderColor = '#2b6cb0';
const blur  = e => e.target.style.borderColor = '#e2e8f0';

const FILE_TYPES = ['pdf','doc','docx','ppt','pptx','xls','xlsx','txt','zip','other'];
const TYPE_COLOR = { pdf:'#c53030', doc:'#2b6cb0', docx:'#2b6cb0', ppt:'#c05621', pptx:'#c05621', xls:'#276749', xlsx:'#276749', link:'#553c9a' };

export default function MentorResourcesPage() {
  const [resources, setResources] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState({ title:'', description:'', type:'link', url:'', fileName:'', fileType:'pdf', subject:'' });
  const [msg, setMsg]             = useState('');
  const [saving, setSaving]       = useState(false);

  const load = () => resourcesAPI.getForMentor().then(r => setResources(r.data)).catch(() => {});

  useEffect(() => {
    load();
    mentorAPI.getStudents()
      .then(async (r) => {
        const students = r.data;
        const subjectSets = await Promise.all(
          students.map(s => mentorAPI.getStudentSubjects(s._id).then(r => r.data).catch(() => []))
        );
        const names = [...new Set(subjectSets.flat().map(s => s.name))].sort();
        setAllSubjects(names);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setMsg('');
    try {
      await resourcesAPI.create(form);
      setMsg('✅ Resource uploaded successfully!');
      setForm({ title:'', description:'', type:'link', url:'', fileName:'', fileType:'pdf', subject:'' });
      setShowForm(false);
      load();
    } catch(err) { setMsg('❌ ' + (err.response?.data?.message || 'Failed')); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resource?')) return;
    await resourcesAPI.delete(id);
    load();
  };

  return (
    <div style={{ padding:'28px 32px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:700, color:'#1a202c', marginBottom:4 }}>Resources</h1>
          <p style={{ fontSize:13, color:'#718096' }}>Upload study materials and links for your students.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ padding:'9px 20px', background:'#2b6cb0', color:'#fff', border:'none', borderRadius:7, fontSize:13, fontWeight:600, cursor:'pointer' }}>
          {showForm ? 'Cancel' : '+ Upload Resource'}
        </button>
      </div>

      {/* Upload form */}
      {showForm && (
        <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:24, marginBottom:24 }}>
          <div style={{ fontSize:14, fontWeight:600, color:'#2d3748', marginBottom:16 }}>New Resource</div>
          <form onSubmit={handleSubmit}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#4a5568', marginBottom:5 }}>Title *</label>
                <input required value={form.title} placeholder="e.g. Chapter 3 Notes" onChange={e => setForm({...form,title:e.target.value})} style={inp} onFocus={focus} onBlur={blur} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#4a5568', marginBottom:5 }}>Subject</label>
                <select
                  value={form.subject}
                  onChange={e => setForm({...form, subject: e.target.value})}
                  style={{ ...inp, color: form.subject ? '#1a202c' : '#a0aec0', cursor:'pointer' }}
                >
                  <option value="">— General / All subjects —</option>
                  {allSubjects.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {allSubjects.length === 0 && (
                  <div style={{ fontSize:11, color:'#a0aec0', marginTop:4 }}>No subjects yet — add them via the Marks tab first.</div>
                )}
              </div>
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#4a5568', marginBottom:5 }}>Description</label>
              <input value={form.description} placeholder="Optional description" onChange={e => setForm({...form,description:e.target.value})} style={inp} onFocus={focus} onBlur={blur} />
            </div>

            {/* Type selector */}
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#4a5568', marginBottom:8 }}>Type</label>
              <div style={{ display:'flex', gap:8 }}>
                {['link','file'].map(t => (
                  <div key={t} onClick={() => setForm({...form,type:t})} style={{
                    padding:'8px 20px', borderRadius:6, cursor:'pointer', fontSize:13, fontWeight:500,
                    border:`2px solid ${form.type===t ? '#2b6cb0' : '#e2e8f0'}`,
                    background: form.type===t ? '#ebf4ff' : '#fff',
                    color: form.type===t ? '#2b6cb0' : '#4a5568',
                  }}>{t === 'link' ? '🔗 Link' : '📄 File'}</div>
                ))}
              </div>
            </div>

            {form.type === 'link' && (
              <div style={{ marginBottom:14 }}>
                <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#4a5568', marginBottom:5 }}>URL *</label>
                <input required value={form.url} placeholder="https://..." onChange={e => setForm({...form,url:e.target.value})} style={inp} onFocus={focus} onBlur={blur} />
              </div>
            )}

{form.type === 'file' && (
  <div style={{ marginBottom: 16 }}>
    <label
      style={{
        display: "block",
        fontSize: 12,
        fontWeight: 500,
        color: "#4a5568",
        marginBottom: 6
      }}
    >
      Upload File *
    </label>

    <div
      style={{
        border: "2px dashed #cbd5e0",
        padding: "20px",
        borderRadius: "8px",
        textAlign: "center",
        background: "#f9fafb",
        cursor: "pointer"
      }}
      onClick={() => document.getElementById("fileUpload").click()}
    >
      <p style={{ margin: 0, fontSize: 14 }}>
        Click to choose file or drag here
      </p>

      {form.file && (
        <p style={{ marginTop: 8, fontSize: 12, color: "#2d3748" }}>
          Selected: {form.file.name}
        </p>
      )}
    </div>

    <input
      id="fileUpload"
      type="file"
      style={{ display: "none" }}
      onChange={(e) =>
        setForm({
          ...form,
          file: e.target.files[0]
        })
      }
    />
  </div>
)}
            {msg && (
              <div style={{ padding:'8px 12px', borderRadius:6, fontSize:13, marginBottom:12,
                background: msg.startsWith('✅') ? '#f0fff4' : '#fff5f5',
                border:`1px solid ${msg.startsWith('✅') ? '#9ae6b4' : '#feb2b2'}`,
                color: msg.startsWith('✅') ? '#276749' : '#c53030' }}>{msg}</div>
            )}

            <button type="submit" disabled={saving} style={{ padding:'9px 24px', background: saving ? '#a0aec0' : '#2b6cb0', color:'#fff', border:'none', borderRadius:6, fontSize:13, fontWeight:600, cursor:'pointer' }}>
              {saving ? 'Uploading...' : 'Upload Resource'}
            </button>
          </form>
        </div>
      )}

      {/* Resources list */}
      {resources.length === 0 && (
        <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:'60px 0', textAlign:'center', color:'#a0aec0' }}>
          <div style={{ fontSize:14, fontWeight:500 }}>No resources uploaded yet.</div>
          <div style={{ fontSize:12, marginTop:6 }}>Click "Upload Resource" to share materials with students.</div>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px,1fr))', gap:16 }}>
        {resources.map(r => (
          <div key={r._id} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:'16px 18px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:18 }}>{r.type === 'link' ? '🔗' : '📄'}</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:'#1a202c' }}>{r.title}</div>
                  {r.subject && <div style={{ fontSize:11, color:'#718096' }}>{r.subject}</div>}
                </div>
              </div>
              <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:4, background:'#f7fafc', color: TYPE_COLOR[r.fileType || r.type] || '#4a5568', border:'1px solid #e2e8f0', textTransform:'uppercase', flexShrink:0 }}>
                {r.fileType || r.type}
              </span>
            </div>
            {r.description && <div style={{ fontSize:12, color:'#718096', marginBottom:10 }}>{r.description}</div>}
            <div style={{ display:'flex', gap:8, alignItems:'center', marginTop:10 }}>
              <a href={r.url} target="_blank" rel="noreferrer" style={{ flex:1, padding:'7px 0', background:'#ebf4ff', color:'#2b6cb0', border:'none', borderRadius:6, fontSize:12, fontWeight:600, cursor:'pointer', textAlign:'center', textDecoration:'none' }}>
                Open
              </a>
              <button onClick={() => handleDelete(r._id)} style={{ padding:'7px 14px', background:'#fff5f5', color:'#c53030', border:'1px solid #fed7d7', borderRadius:6, fontSize:12, fontWeight:500, cursor:'pointer' }}>
                Delete
              </button>
            </div>
            <div style={{ fontSize:10, color:'#a0aec0', marginTop:8 }}>{new Date(r.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
