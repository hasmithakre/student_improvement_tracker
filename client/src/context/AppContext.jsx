import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { subjectsAPI, assignmentsAPI, attendanceAPI, goalsAPI, dashboardAPI } from '../services/api';

const initialState = {
  subjects:    [],
  assignments: [],
  attendance:  [],
  goals:       [],
  dashboard:   null,
  loading: {
    subjects: false, assignments: false, attendance: false, goals: false, dashboard: false,
  },
  errors: {
    subjects: null, assignments: null, attendance: null, goals: null, dashboard: null,
  },
};

const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR:   'SET_ERROR',
  SET_SUBJECTS:    'SET_SUBJECTS',
  SET_ASSIGNMENTS: 'SET_ASSIGNMENTS',
  SET_ATTENDANCE:  'SET_ATTENDANCE',
  SET_GOALS:       'SET_GOALS',
  ADD_GOAL:        'ADD_GOAL',
  UPDATE_GOAL:     'UPDATE_GOAL',
  DELETE_GOAL:     'DELETE_GOAL',
  SET_DASHBOARD:   'SET_DASHBOARD',
};

const appReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: { ...state.loading, [action.resource]: action.value } };
    case ACTIONS.SET_ERROR:
      return { ...state, errors: { ...state.errors, [action.resource]: action.error } };
    case ACTIONS.SET_SUBJECTS:
      return { ...state, subjects: action.payload };
    case ACTIONS.SET_ASSIGNMENTS:
      return { ...state, assignments: action.payload };
    case ACTIONS.SET_ATTENDANCE:
      return { ...state, attendance: action.payload };
    case ACTIONS.SET_GOALS:
      return { ...state, goals: action.payload };
    case ACTIONS.ADD_GOAL:
      return { ...state, goals: [action.payload, ...state.goals] };
    case ACTIONS.UPDATE_GOAL:
      return { ...state, goals: state.goals.map(g => g._id === action.payload._id ? action.payload : g) };
    case ACTIONS.DELETE_GOAL:
      return { ...state, goals: state.goals.filter(g => g._id !== action.payload) };
    case ACTIONS.SET_DASHBOARD:
      return { ...state, dashboard: action.payload };
    default:
      return state;
  }
};

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const withLoading = useCallback(async (resource, asyncFn) => {
    dispatch({ type: ACTIONS.SET_LOADING, resource, value: true });
    dispatch({ type: ACTIONS.SET_ERROR,   resource, error: null });
    try {
      return await asyncFn();
    } catch (err) {
      const message = err.response?.data?.errors
        ? err.response.data.errors.map(e => e.message).join(', ')
        : err.response?.data?.message || err.message || 'Something went wrong';
      dispatch({ type: ACTIONS.SET_ERROR, resource, error: message });
      throw err;
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, resource, value: false });
    }
  }, []);

  // Dashboard
  const fetchDashboard = useCallback(() =>
    withLoading('dashboard', async () => {
      const { data } = await dashboardAPI.get();
      dispatch({ type: ACTIONS.SET_DASHBOARD, payload: data });
      return data;
    }), [withLoading]);

  // Subjects — student view only
  const fetchSubjects = useCallback(() =>
    withLoading('subjects', async () => {
      const { data } = await subjectsAPI.getAll();
      dispatch({ type: ACTIONS.SET_SUBJECTS, payload: data });
      return data;
    }), [withLoading]);

  // Assignments — student view only
  const fetchAssignments = useCallback((status) =>
    withLoading('assignments', async () => {
      const { data } = await assignmentsAPI.getAll(status);
      dispatch({ type: ACTIONS.SET_ASSIGNMENTS, payload: data });
      return data;
    }), [withLoading]);

  // Attendance — student view only
  const fetchAttendance = useCallback(() =>
    withLoading('attendance', async () => {
      const { data } = await attendanceAPI.getMy();
      dispatch({ type: ACTIONS.SET_ATTENDANCE, payload: data });
      return data;
    }), [withLoading]);

  // Goals — student full CRUD
  const fetchGoals = useCallback(() =>
    withLoading('goals', async () => {
      const { data } = await goalsAPI.getAll();
      dispatch({ type: ACTIONS.SET_GOALS, payload: data });
      return data;
    }), [withLoading]);

  const createGoal = useCallback((form) =>
    withLoading('goals', async () => {
      const { data } = await goalsAPI.create(form);
      dispatch({ type: ACTIONS.ADD_GOAL, payload: data });
      return data;
    }), [withLoading]);

  const updateGoal = useCallback((id, form) =>
    withLoading('goals', async () => {
      const { data } = await goalsAPI.update(id, form);
      dispatch({ type: ACTIONS.UPDATE_GOAL, payload: data });
      return data;
    }), [withLoading]);

  const deleteGoal = useCallback((id) =>
    withLoading('goals', async () => {
      await goalsAPI.delete(id);
      dispatch({ type: ACTIONS.DELETE_GOAL, payload: id });
    }), [withLoading]);

  const value = {
    ...state,
    fetchDashboard,
    fetchSubjects,
    fetchAssignments,
    fetchAttendance,
    fetchGoals, createGoal, updateGoal, deleteGoal,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

export default AppContext;
