import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Auth pages
import Login    from './pages/Login';
import Register from './pages/Register';

// Student pages
import Dashboard        from './pages/Dashboard';
import Subjects         from './pages/Subjects';
import Assignments      from './pages/Assignments';
import Attendance       from './pages/Attendance';
import Analytics        from './pages/Analytics';
import Goals            from './pages/Goals';
import Profile          from './pages/Profile';
import StudentResources from './pages/StudentResources';
import StudentFeedback  from './pages/StudentFeedback';

// Mentor pages
import MentorDashboardPage  from './pages/mentor/MentorDashboardPage';
import MentorMarksPage      from './pages/mentor/MentorMarksPage';
import MentorAttendancePage from './pages/mentor/MentorAttendancePage';
import MentorResourcesPage  from './pages/mentor/MentorResourcesPage';
import MentorFeedbackPage   from './pages/mentor/MentorFeedbackPage';

// Admin page
import AdminDashboard from './pages/AdminDashboard';

// ── Guards ─────────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:48, marginBottom:12 }}>🎓</div>
        <div style={{ color:'#2b6cb0', fontWeight:700 }}>Loading...</div>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" />;
};

const RoleRoute = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (!roles.includes(user.role)) {
    if (user.role === 'admin')  return <Navigate to="/admin" />;
    if (user.role === 'mentor') return <Navigate to="/mentor/dashboard" />;
    return <Navigate to="/dashboard" />;
  }
  return children;
};

const HomeRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'admin')  return <Navigate to="/admin" />;
  if (user.role === 'mentor') return <Navigate to="/mentor/dashboard" />;
  return <Navigate to="/dashboard" />;
};

// ── Layout ─────────────────────────────────────────────────────────────────
const Layout = ({ children }) => (
  <div style={{ display:'flex', minHeight:'100vh', background:'#f8f7ff' }}>
    <Sidebar />
    <div style={{ marginLeft:220, flex:1, display:'flex', flexDirection:'column', minHeight:'100vh' }}>
      <Navbar />
      <main style={{ flex:1, overflowY:'auto' }}>{children}</main>
    </div>
  </div>
);

// ── Routes ─────────────────────────────────────────────────────────────────
function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login"    element={user ? <HomeRedirect /> : <Login />} />
      <Route path="/register" element={user ? <HomeRedirect /> : <Register />} />

      {/* ── Student routes ── */}
      <Route path="/dashboard"   element={<ProtectedRoute><RoleRoute roles={['student']}><Layout><Dashboard /></Layout></RoleRoute></ProtectedRoute>} />
      <Route path="/subjects"    element={<ProtectedRoute><RoleRoute roles={['student']}><Layout><Subjects /></Layout></RoleRoute></ProtectedRoute>} />
      <Route path="/assignments" element={<ProtectedRoute><RoleRoute roles={['student']}><Layout><Assignments /></Layout></RoleRoute></ProtectedRoute>} />
      <Route path="/attendance"  element={<ProtectedRoute><RoleRoute roles={['student']}><Layout><Attendance /></Layout></RoleRoute></ProtectedRoute>} />
      <Route path="/analytics"   element={<ProtectedRoute><RoleRoute roles={['student']}><Layout><Analytics /></Layout></RoleRoute></ProtectedRoute>} />
      <Route path="/goals"       element={<ProtectedRoute><RoleRoute roles={['student']}><Layout><Goals /></Layout></RoleRoute></ProtectedRoute>} />
      <Route path="/resources"   element={<ProtectedRoute><RoleRoute roles={['student']}><Layout><StudentResources /></Layout></RoleRoute></ProtectedRoute>} />
      <Route path="/myfeedback"  element={<ProtectedRoute><RoleRoute roles={['student']}><Layout><StudentFeedback /></Layout></RoleRoute></ProtectedRoute>} />
      <Route path="/profile"     element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />

      {/* ── Mentor routes (mentor + admin) ── */}
      <Route path="/mentor/dashboard"  element={<ProtectedRoute><RoleRoute roles={['mentor','admin']}><Layout><MentorDashboardPage /></Layout></RoleRoute></ProtectedRoute>} />
      <Route path="/mentor/marks"      element={<ProtectedRoute><RoleRoute roles={['mentor','admin']}><Layout><MentorMarksPage /></Layout></RoleRoute></ProtectedRoute>} />
      <Route path="/mentor/attendance" element={<ProtectedRoute><RoleRoute roles={['mentor','admin']}><Layout><MentorAttendancePage /></Layout></RoleRoute></ProtectedRoute>} />
      <Route path="/mentor/resources"  element={<ProtectedRoute><RoleRoute roles={['mentor','admin']}><Layout><MentorResourcesPage /></Layout></RoleRoute></ProtectedRoute>} />
      <Route path="/mentor/feedback"   element={<ProtectedRoute><RoleRoute roles={['mentor','admin']}><Layout><MentorFeedbackPage /></Layout></RoleRoute></ProtectedRoute>} />

      {/* ── Admin route ── */}
      <Route path="/admin" element={<ProtectedRoute><RoleRoute roles={['admin']}><Layout><AdminDashboard /></Layout></RoleRoute></ProtectedRoute>} />

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}
