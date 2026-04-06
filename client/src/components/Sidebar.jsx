import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const STUDENT_NAV = [
  { to:'/dashboard',   label:'Dashboard' },
  { to:'/subjects',    label:'Subjects'},
  { to:'/attendance',  label:'Attendance' },
  { to:'/goals',       label:'Goals'},
  { to:'/analytics',   label:'Analytics'},
  { to:'/resources',   label:'Resources' },
  { to:'/myfeedback',  label:'Feedback' },
];

const MENTOR_NAV = [
  { to:'/mentor/dashboard',   label:'Dashboard' },
  { to:'/mentor/marks',       label:'Marks' },
  { to:'/mentor/attendance',  label:'Attendance' },
  { to:'/mentor/resources',   label:'Resources' },
  { to:'/mentor/feedback',    label:'Feedback' },
];

const ADMIN_NAV = [
  { to:'/admin',              label:'Dashboard'},
  { to:'/mentor/dashboard',   label:'Mentor View' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems =
    user?.role === 'admin'  ? ADMIN_NAV  :
    user?.role === 'mentor' ? MENTOR_NAV : STUDENT_NAV;

  const roleColor = { student:'#2b6cb0', mentor:'#276749', admin:'#744210' };
  const roleBg    = { student:'#2c5282', mentor:'#1c4532', admin:'#5f370e' };

  return (
    <aside style={{ width:220, minHeight:'100vh', background:'#1a202c', display:'flex', flexDirection:'column', position:'fixed', left:0, top:0, zIndex:100 }}>
      <div style={{ padding:'24px 20px 20px', borderBottom:'1px solid #2d3748' }}>
        <div style={{ fontSize:14, fontWeight:700, color:'#fff', lineHeight:1.3 }}>Student Improvement<br/>Tracker</div>
        <div style={{ fontSize:10, color:'#718096', marginTop:3, textTransform:'uppercase', letterSpacing:'0.05em' }}>Academic Portal</div>
      </div>

      <nav style={{ flex:1, padding:'12px 10px' }}>
        {navItems.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:6, marginBottom:2,
            textDecoration:'none', fontSize:13, fontWeight: isActive ? 600 : 400,
            color: isActive ? '#fff' : '#a0aec0',
            background: isActive ? '#2d3748' : 'transparent',
            transition:'all 0.15s',
          })}
            onMouseEnter={e => { if (e.currentTarget.getAttribute('data-active') !== 'true') e.currentTarget.style.color='#e2e8f0'; }}
            onMouseLeave={e => { if (e.currentTarget.getAttribute('data-active') !== 'true') e.currentTarget.style.color='#a0aec0'; }}
          >
            <span style={{ fontSize:14 }}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding:'14px 10px 18px', borderTop:'1px solid #2d3748' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'0 4px 12px' }}>
          <div style={{ width:30, height:30, borderRadius:'50%', background: roleBg[user?.role] || '#2d3748', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff', flexShrink:0 }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth:0 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'#e2e8f0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</div>
            <div style={{ fontSize:10, color:'#4a5568', textTransform:'capitalize' }}>{user?.role}</div>
          </div>
        </div>
        <button onClick={() => { logout(); navigate('/login'); }} style={{ width:'100%', padding:'7px 12px', background:'transparent', border:'1px solid #2d3748', borderRadius:6, color:'#718096', fontSize:12, cursor:'pointer', textAlign:'left', transition:'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor='#fc8181'; e.currentTarget.style.color='#fc8181'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor='#2d3748'; e.currentTarget.style.color='#718096'; }}>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
