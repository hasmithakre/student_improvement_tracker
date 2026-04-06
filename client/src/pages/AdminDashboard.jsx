import React, { useState, useEffect } from 'react';
import { adminAPI, adminDashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ROLES      = ['student', 'mentor', 'admin'];
const ROLE_COLOR = { student:'#2b6cb0', mentor:'#276749', admin:'#744210' };
const ROLE_BG    = { student:'#ebf4ff', mentor:'#f0fff4', admin:'#fffff0' };

const StatCard = ({ label, value, sub, color='#1a202c' }) => (
  <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:'18px 20px' }}>
    <div style={{ fontSize:11, color:'#718096', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6 }}>{label}</div>
    <div style={{ fontSize:26, fontWeight:700, color, lineHeight:1 }}>{value}</div>
    {sub && <div style={{ fontSize:12, color:'#a0aec0', marginTop:6 }}>{sub}</div>}
  </div>
);

// ── OVERVIEW TAB ───────────────────────────────────────────────────────
function OverviewTab({ stats, loading }) {
  if (loading) return <div style={{ padding:40, textAlign:'center', color:'#a0aec0', fontSize:13 }}>Loading...</div>;
  if (!stats)  return <div style={{ padding:40, textAlign:'center', color:'#a0aec0', fontSize:13 }}>No data yet.</div>;

  return (
    <div>
      {/* Top stat cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
        <StatCard label="Total Users"       value={stats.userCounts.total}          sub="All roles" />
        <StatCard label="Students"          value={stats.userCounts.student}        color="#2b6cb0" sub="Registered" />
        <StatCard label="Mentors"           value={stats.userCounts.mentor}         color="#276749" sub="Active" />
        <StatCard label="Platform Attendance" value={`${stats.platformAttendance}%`} color={stats.platformAttendance < 75 ? '#c53030' : '#276749'} sub="Overall" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
        <StatCard label="Total Subjects"    value={stats.totalSubjects}     sub="Across all students" />
        <StatCard label="Marks Entered"     value={stats.totalMarksEntered} color="#2b6cb0" sub="By mentors" />
        <StatCard label="Pending Assignments" value={stats.pendingAssignments} color={stats.pendingAssignments > 0 ? '#975a16' : '#276749'} sub="Student tasks" />
      </div>

      {/* Recent users */}
      <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, overflow:'hidden' }}>
        <div style={{ padding:'14px 20px', borderBottom:'1px solid #e2e8f0', fontSize:13, fontWeight:600, color:'#2d3748' }}>
          Recently Joined Users
        </div>
        {stats.recentUsers.length === 0 && (
          <div style={{ padding:40, textAlign:'center', color:'#a0aec0', fontSize:13 }}>No users yet.</div>
        )}
        {stats.recentUsers.map((u, i) => (
          <div key={u._id} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 20px', borderBottom: i < stats.recentUsers.length-1 ? '1px solid #f7fafc' : 'none' }}>
            <div style={{ width:34, height:34, borderRadius:'50%', background: ROLE_BG[u.role], display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color: ROLE_COLOR[u.role], flexShrink:0 }}>
              {u.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:600, color:'#1a202c' }}>{u.name}</div>
              <div style={{ fontSize:11, color:'#a0aec0' }}>{u.email}</div>
            </div>
            <span style={{ fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:20, background: ROLE_BG[u.role], color: ROLE_COLOR[u.role], textTransform:'capitalize' }}>{u.role}</span>
            <span style={{ fontSize:11, color:'#a0aec0' }}>{new Date(u.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── USER MANAGEMENT TAB ────────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers]   = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [msg, setMsg]       = useState('');

  useEffect(() => { adminAPI.getAllUsers().then(r => setUsers(r.data)).catch(() => {}); }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const r = await adminAPI.updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: r.data.role } : u));
      setMsg('✅ Role updated.');
      setTimeout(() => setMsg(''), 3000);
    } catch(err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Failed'));
    }
  };

  const filtered = users.filter(u => {
    const matchRole   = filter === 'all' || u.role === filter;
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <div>
      {/* Role counts */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        {['all', ...ROLES].map(r => (
          <div key={r} onClick={() => setFilter(r)} style={{
            padding:'12px 16px', borderRadius:8, cursor:'pointer',
            background: filter === r ? (r === 'all' ? '#1a202c' : ROLE_BG[r] || '#1a202c') : '#fff',
            border:`1px solid ${filter === r ? (ROLE_COLOR[r] || '#1a202c') : '#e2e8f0'}`,
            transition:'all 0.15s',
          }}>
            <div style={{ fontSize:11, color: filter === r ? (ROLE_COLOR[r] || '#fff') : '#718096', textTransform:'capitalize', fontWeight:600 }}>
              {r === 'all' ? 'All Users' : `${r}s`}
            </div>
            <div style={{ fontSize:22, fontWeight:700, color: filter === r ? (ROLE_COLOR[r] || '#fff') : '#1a202c', lineHeight:1.2, marginTop:3 }}>
              {r === 'all' ? users.length : users.filter(u => u.role === r).length}
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom:16 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
          style={{ width:'100%', maxWidth:320, padding:'9px 12px', fontSize:13, border:'1.5px solid #e2e8f0', borderRadius:6, outline:'none', boxSizing:'border-box' }}
          onFocus={e => e.target.style.borderColor = '#2b6cb0'}
          onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
      </div>

      {msg && (
        <div style={{ padding:'8px 14px', borderRadius:6, fontSize:13, marginBottom:14,
          background: msg.startsWith('✅') ? '#f0fff4' : '#fff5f5',
          border:`1px solid ${msg.startsWith('✅') ? '#9ae6b4' : '#feb2b2'}`,
          color: msg.startsWith('✅') ? '#276749' : '#c53030' }}>{msg}
        </div>
      )}

      {/* Users table */}
      <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, overflow:'hidden' }}>
        <div style={{ padding:'13px 20px', borderBottom:'1px solid #e2e8f0', display:'grid', gridTemplateColumns:'1fr 200px 160px', gap:12 }}>
          <div style={{ fontSize:11, fontWeight:600, color:'#718096', textTransform:'uppercase', letterSpacing:'0.04em' }}>User</div>
          <div style={{ fontSize:11, fontWeight:600, color:'#718096', textTransform:'uppercase', letterSpacing:'0.04em' }}>Joined</div>
          <div style={{ fontSize:11, fontWeight:600, color:'#718096', textTransform:'uppercase', letterSpacing:'0.04em' }}>Role</div>
        </div>
        {filtered.length === 0 && (
          <div style={{ padding:40, textAlign:'center', color:'#a0aec0', fontSize:13 }}>No users found.</div>
        )}
        {filtered.map((u, i) => (
          <div key={u._id} style={{ display:'grid', gridTemplateColumns:'1fr 200px 160px', gap:12, alignItems:'center', padding:'12px 20px', borderBottom: i < filtered.length-1 ? '1px solid #f7fafc' : 'none' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background: ROLE_BG[u.role], display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color: ROLE_COLOR[u.role], flexShrink:0 }}>
                {u.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:500, color:'#1a202c' }}>{u.name}</div>
                <div style={{ fontSize:11, color:'#a0aec0' }}>{u.email}</div>
              </div>
            </div>
            <div style={{ fontSize:12, color:'#718096' }}>
              {new Date(u.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:11, fontWeight:600, padding:'3px 9px', borderRadius:20, background: ROLE_BG[u.role], color: ROLE_COLOR[u.role], textTransform:'capitalize', whiteSpace:'nowrap' }}>
                {u.role}
              </span>
              <select value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)}
                style={{ fontSize:12, padding:'5px 8px', border:'1px solid #e2e8f0', borderRadius:5, outline:'none', cursor:'pointer', background:'#fff' }}>
                {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user } = useAuth();
  const [tab, setTab]         = useState('Overview');
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminDashboardAPI.get()
      .then(r => { setStats(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const TABS = ['Overview', 'User Management'];

  return (
    <div style={{ padding:'28px 32px' }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:20, fontWeight:700, color:'#1a202c', marginBottom:4 }}>
          {greeting}, {user?.name?.split(' ')[0]}.
        </h1>
        <p style={{ fontSize:13, color:'#718096' }}>Admin Dashboard — full platform control.</p>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:24, background:'#f7fafc', padding:4, borderRadius:8, width:'fit-content' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding:'8px 20px', borderRadius:6, border:'none', fontSize:13, fontWeight:600,
            background: tab === t ? '#fff' : 'transparent',
            color: tab === t ? '#1a202c' : '#718096',
            cursor:'pointer', boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            transition:'all 0.15s',
          }}>{t}</button>
        ))}
      </div>

      {tab === 'Overview'         && <OverviewTab stats={stats} loading={loading} />}
      {tab === 'User Management'  && <UsersTab />}
    </div>
  );
}
