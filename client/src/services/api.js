import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login:    (data) => API.post('/auth/login', data),
  getMe:    ()     => API.get('/auth/me'),
};

// Student: view-only
export const subjectsAPI = {
  getAll:      ()              => API.get('/subjects'),
  setTarget:   (id, target)   => API.put(`/subjects/${id}/target`, { targetScore: target }),
};

// Student: goals full CRUD
export const goalsAPI = {
  getAll:  ()           => API.get('/goals'),
  create:  (data)       => API.post('/goals', data),
  update:  (id, data)   => API.put(`/goals/${id}`, data),
  delete:  (id)         => API.delete(`/goals/${id}`),
};

// Student: view-only attendance
export const attendanceAPI = {
  getMy: () => API.get('/attendance/my'),
};

// Student: view-only assignments
export const assignmentsAPI = {
  getAll: (status) => API.get('/assignments', { params: status ? { status } : {} }),
};

// Mentor APIs — subjects + marks
export const mentorAPI = {
  getStudents:          ()                              => API.get('/subjects/mentor/students'),
  getStudentSubjects:   (studentId)                    => API.get(`/subjects/mentor/students/${studentId}/subjects`),
  addSubjectForStudent: (studentId, data)              => API.post(`/subjects/mentor/students/${studentId}/subjects`, data),
  addMarkForStudent:    (studentId, subjectId, data)   => API.post(`/subjects/mentor/students/${studentId}/subjects/${subjectId}/marks`, data),
  deleteMarkForStudent: (studentId, subjectId, markId) => API.delete(`/subjects/mentor/students/${studentId}/subjects/${subjectId}/marks/${markId}`),
};

// Mentor APIs — attendance
export const mentorAttendanceAPI = {
  getStudents:      ()                          => API.get('/attendance/students'),
  getSubjects:      (studentId)                 => API.get(`/attendance/students/${studentId}/subjects`),
  getRecord:        (studentId, subjectId)      => API.get(`/attendance/students/${studentId}/subjects/${subjectId}`),
  markPeriod:       (studentId, subjectId, data) => API.post(`/attendance/students/${studentId}/subjects/${subjectId}/period`, data),
  deletePeriod:     (studentId, subjectId, periodId) => API.delete(`/attendance/students/${studentId}/subjects/${subjectId}/periods/${periodId}`),
};

// Admin APIs
export const adminAPI = {
  getAllUsers:     ()               => API.get('/subjects/admin/users'),
  updateUserRole: (userId, role)   => API.put(`/subjects/admin/users/${userId}/role`, { role }),
};

// Dashboard APIs
export const dashboardAPI        = { get: () => API.get('/dashboard') };
export const mentorDashboardAPI  = { get: () => API.get('/dashboard/mentor') };
export const adminDashboardAPI   = { get: () => API.get('/dashboard/admin') };

export default API;

export const resourcesAPI = {
  getForStudent: ()     => API.get('/resources/student'),
  getForMentor:  ()     => API.get('/resources/mentor'),
  create:        (data) => API.post('/resources', data),
  delete:        (id)   => API.delete(`/resources/${id}`),
};

export const feedbackAPI = {
  getForStudent:  ()     => API.get('/feedback/student'),
  getUnreadCount: ()     => API.get('/feedback/student/unread'),
  getForMentor:   ()     => API.get('/feedback/mentor'),
  create:         (data) => API.post('/feedback', data),
  delete:         (id)   => API.delete(`/feedback/${id}`),
};
