import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'#f0f4f8' }}>

      {/* Left panel */}
      <div style={{ width:340, flexShrink:0, background:'linear-gradient(160deg,#1a365d 0%,#2a4a7f 55%,#2b6cb0 100%)', display:'flex', flexDirection:'column', justifyContent:'center', padding:'48px 40px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-80, right:-80, width:220, height:220, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.06)' }} />
        <div style={{ position:'absolute', bottom:-40, left:-40, width:180, height:180, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.05)' }} />
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:44, height:44, background:'rgba(255,255,255,0.12)', borderRadius:10, border:'1px solid rgba(255,255,255,0.18)', marginBottom:24 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          </div>
          <h1 style={{ fontSize:24, fontWeight:700, color:'#fff', lineHeight:1.3, margin:'0 0 12px' }}>Student Improvement Tracker</h1>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.55)', lineHeight:1.6, maxWidth:240, margin:'0 0 28px' }}>Monitor performance, attendance, and goals — all in one place.</p>
          {['Track marks & performance','Manage assignments','Attendance monitoring','Goal tracking'].map(item => (
            <div key={item} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
              <div style={{ width:5, height:5, borderRadius:'50%', background:'#63b3ed', flexShrink:0 }} />
              <span style={{ fontSize:12, color:'rgba(255,255,255,0.75)' }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:40 }}>
        <div style={{ width:'100%', maxWidth:400 }}>
          <div style={{ marginBottom:32 }}>
            <h2 style={{ fontSize:22, fontWeight:700, color:'#1a202c', marginBottom:6 }}>Sign in to your account</h2>
            <p style={{ fontSize:13, color:'#718096' }}>Enter your credentials to continue.</p>
          </div>

          {error && (
            <div style={{ background:'#fff5f5', border:'1px solid #feb2b2', borderRadius:7, padding:'11px 14px', fontSize:13, color:'#c53030', marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c53030" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#4a5568', marginBottom:7 }}>Email Address</label>
              <div style={{ position:'relative' }}>
                <svg style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a0aec0" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input type="email" value={form.email} placeholder="you@example.com" required
                  onChange={e => setForm({...form, email:e.target.value})}
                  style={{ width:'100%', padding:'11px 12px 11px 40px', fontSize:13, border:'1.5px solid #e2e8f0', borderRadius:7, outline:'none', boxSizing:'border-box', color:'#1a202c', background:'#fff' }}
                  onFocus={e => e.target.style.borderColor='#2b6cb0'}
                  onBlur={e => e.target.style.borderColor='#e2e8f0'} />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom:24 }}>
              <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#4a5568', marginBottom:7 }}>Password</label>
              <div style={{ position:'relative' }}>
                <svg style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a0aec0" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input type={showPass ? 'text' : 'password'} value={form.password} placeholder="Enter your password" required
                  onChange={e => setForm({...form, password:e.target.value})}
                  style={{ width:'100%', padding:'11px 40px 11px 40px', fontSize:13, border:'1.5px solid #e2e8f0', borderRadius:7, outline:'none', boxSizing:'border-box', color:'#1a202c', background:'#fff' }}
                  onFocus={e => e.target.style.borderColor='#2b6cb0'}
                  onBlur={e => e.target.style.borderColor='#e2e8f0'} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#a0aec0' }}>
                  {showPass
                    ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ width:'100%', padding:'12px', background: loading ? '#a0aec0' : '#2b6cb0', color:'#fff', border:'none', borderRadius:7, fontSize:14, fontWeight:600, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 2px 8px rgba(43,108,176,0.35)' }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background='#2c5282'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background='#2b6cb0'; }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ display:'flex', alignItems:'center', gap:14, margin:'24px 0' }}>
            <div style={{ flex:1, height:1, background:'#e2e8f0' }} />
            <span style={{ fontSize:12, color:'#a0aec0' }}>New to the platform?</span>
            <div style={{ flex:1, height:1, background:'#e2e8f0' }} />
          </div>
          <Link to="/register" style={{ textDecoration:'none' }}>
            <div style={{ width:'100%', padding:'11px', border:'1.5px solid #e2e8f0', borderRadius:7, fontSize:13, fontWeight:600, color:'#4a5568', textAlign:'center', background:'#fff', cursor:'pointer', boxSizing:'border-box', display:'block' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='#2b6cb0'; e.currentTarget.style.color='#2b6cb0'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='#e2e8f0'; e.currentTarget.style.color='#4a5568'; }}>
              Create a new account
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
