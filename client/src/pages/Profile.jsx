import React from 'react';
import { useAuth } from '../context/AuthContext';

const ROLE_COLOR = { student:'#2b6cb0', mentor:'#276749', admin:'#744210' };
const ROLE_BG    = { student:'#ebf4ff', mentor:'#f0fff4', admin:'#fffff0' };

export default function Profile() {
  const { user } = useAuth();

  return (
    <div style={{ padding:'28px 32px', maxWidth:520 }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:20, fontWeight:700, color:'#1a202c', marginBottom:4 }}>Profile</h1>
        <p style={{ fontSize:13, color:'#718096' }}>Your account information.</p>
      </div>

      <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:'28px 28px' }}>
        {/* Avatar */}
        <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:28, paddingBottom:24, borderBottom:'1px solid #f0f4f8' }}>
          <div style={{ width:64, height:64, borderRadius:'50%', background: ROLE_BG[user?.role] || '#ebf4ff', border:`2px solid ${ROLE_COLOR[user?.role] || '#bee3f8'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, fontWeight:700, color: ROLE_COLOR[user?.role] || '#2b6cb0', flexShrink:0 }}>
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <div style={{ fontSize:18, fontWeight:700, color:'#1a202c' }}>{user?.name}</div>
            <div style={{ fontSize:13, color:'#718096', marginTop:2 }}>{user?.email}</div>
            <span style={{ display:'inline-block', marginTop:8, fontSize:12, fontWeight:600, padding:'3px 12px', borderRadius:20, background: ROLE_BG[user?.role], color: ROLE_COLOR[user?.role], textTransform:'capitalize' }}>
              {user?.role}
            </span>
          </div>
        </div>

        {/* Info rows */}
        {[
          ['Full Name',   user?.name],
          ['Email',       user?.email],
          ['Role',        user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)],
          ['Study Streak', `${user?.studyStreak || 0} day${user?.studyStreak !== 1 ? 's' : ''}`],
        ].map(([label, value]) => (
          <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid #f7fafc' }}>
            <span style={{ fontSize:13, color:'#718096', fontWeight:500 }}>{label}</span>
            <span style={{ fontSize:13, fontWeight:600, color:'#1a202c', textTransform: label==='Role'?'capitalize':'none' }}>{value}</span>
          </div>
        ))}

        <div style={{ marginTop:20, padding:'12px 16px', background:'#f7fafc', borderRadius:8, fontSize:12, color:'#718096' }}>
          To update your name, email or password, contact your administrator.
        </div>
      </div>
    </div>
  );
}
