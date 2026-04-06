import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const inp = { width:'100%', padding:'10px 12px', fontSize:13, border:'1px solid #e2e8f0', borderRadius:6, outline:'none', color:'#1a202c', background:'#fff', transition:'border-color 0.15s', boxSizing:'border-box' };

const ROLE_OPTIONS = [
  { value:'student', label:'Student', desc:'View marks, attendance & goals' },
  { value:'mentor',  label:'Mentor',  desc:'Enter marks & mark attendance'  },
  { value:'admin',   label:'Admin',   desc:'Manage all users & roles'        },
];

export default function Register() {
  const [form, setForm]       = useState({ name:'', email:'', password:'', confirm:'', role:'student' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f5f6fa', padding:20 }}>
      <div style={{ width:'100%', maxWidth:440, background:'#fff', borderRadius:10, border:'1px solid #e2e8f0', padding:40, boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
        <div style={{ marginBottom:28 }}>
          <h2 style={{ fontSize:20, fontWeight:700, color:'#1a202c', marginBottom:4 }}>Create account</h2>
          <p style={{ fontSize:13, color:'#718096' }}>Student Improvement Tracker</p>
        </div>

        {error && (
          <div style={{ background:'#fff5f5', border:'1px solid #fed7d7', borderRadius:6, padding:'10px 14px', fontSize:13, color:'#c53030', marginBottom:20 }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:16 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#4a5568', marginBottom:6 }}>Full Name</label>
            <input type="text" value={form.name} placeholder="John Smith" required onChange={e => setForm({...form,name:e.target.value})} style={inp}
              onFocus={e=>e.target.style.borderColor='#4299e1'} onBlur={e=>e.target.style.borderColor='#e2e8f0'} />
          </div>

          <div style={{ marginBottom:16 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#4a5568', marginBottom:6 }}>Email Address</label>
            <input type="email" value={form.email} placeholder="john@example.com" required onChange={e => setForm({...form,email:e.target.value})} style={inp}
              onFocus={e=>e.target.style.borderColor='#4299e1'} onBlur={e=>e.target.style.borderColor='#e2e8f0'} />
          </div>

          <div style={{ marginBottom:18 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#4a5568', marginBottom:8 }}>I am a...</label>
            <div style={{ display:'flex', gap:8 }}>
              {ROLE_OPTIONS.map(r => (
                <div key={r.value} onClick={() => setForm({...form,role:r.value})} style={{
                  flex:1, padding:'10px 8px', borderRadius:7, cursor:'pointer', textAlign:'center',
                  border:`2px solid ${form.role===r.value ? '#2b6cb0' : '#e2e8f0'}`,
                  background: form.role===r.value ? '#ebf4ff' : '#fff', transition:'all 0.15s',
                }}>
                  <div style={{ fontSize:12, fontWeight:600, color: form.role===r.value ? '#2b6cb0' : '#4a5568' }}>{r.label}</div>
                  <div style={{ fontSize:10, color:'#a0aec0', marginTop:3, lineHeight:1.4 }}>{r.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom:16 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#4a5568', marginBottom:6 }}>Password</label>
            <input type="password" value={form.password} placeholder="Min 6 characters" required onChange={e => setForm({...form,password:e.target.value})} style={inp}
              onFocus={e=>e.target.style.borderColor='#4299e1'} onBlur={e=>e.target.style.borderColor='#e2e8f0'} />
          </div>

          <div style={{ marginBottom:20 }}>
            <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#4a5568', marginBottom:6 }}>Confirm Password</label>
            <input type="password" value={form.confirm} placeholder="Repeat password" required onChange={e => setForm({...form,confirm:e.target.value})} style={inp}
              onFocus={e=>e.target.style.borderColor='#4299e1'} onBlur={e=>e.target.style.borderColor='#e2e8f0'} />
          </div>

          <button type="submit" disabled={loading} style={{ width:'100%', padding:'10px', background: loading ? '#a0aec0' : '#2b6cb0', color:'#fff', border:'none', borderRadius:6, fontSize:13, fontWeight:600, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:24, fontSize:13, color:'#718096' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color:'#2b6cb0', fontWeight:500, textDecoration:'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
