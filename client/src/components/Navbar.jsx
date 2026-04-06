import React from 'react';
import { useLocation } from 'react-router-dom';

const titles = {
  '/dashboard':   'Dashboard',
  '/subjects':    'Subjects',
  '/assignments': 'Assignments',
  '/attendance':  'Attendance',
  '/analytics':   'Analytics',
  '/goals':       'Goals',
  '/profile':     'Profile',
};

export default function Navbar() {
  const location = useLocation();
  const title = titles[location.pathname] || 'Dashboard';
  const today = new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });

  return (
    <header style={{
      height: 60, background: '#fff', borderBottom: '1px solid #e2e8f0',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px', position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div>
        <span style={{ fontSize: 16, fontWeight: 600, color: '#1a202c' }}>{title}</span>
      </div>
      <div style={{ fontSize: 12, color: '#a0aec0' }}>{today}</div>
    </header>
  );
}
