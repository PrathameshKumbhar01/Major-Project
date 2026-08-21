import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import api from '../lib/api';

const StudyDataContext = createContext(null);

const defaultStreakData = {
  currentStreak: 0,
  longestStreak: 0,
  totalDays: 0,
  weeklyGoal: 10,
  weeklyProgress: 0,
  lastStudyDate: null,
  heatmapData: Array.from({ length: 365 }, (_, i) => ({
    date: new Date(Date.now() - (364 - i) * 86400000).toISOString().split('T')[0],
    value: 0,
  })),
};

const defaultSubjects = [
  { id: '1', name: 'Data Structures', code: 'DS201', color: '#3B82F6', icon: 'Database', progress: 0, totalTopics: 12, completedTopics: 0, semester: 3 },
  { id: '2', name: 'Operating Systems', code: 'OS301', color: '#8B5CF6', icon: 'Cpu', progress: 0, totalTopics: 10, completedTopics: 0, semester: 3 },
  { id: '3', name: 'Computer Networks', code: 'CN302', color: '#10B981', icon: 'Globe', progress: 0, totalTopics: 14, completedTopics: 0, semester: 4 },
  { id: '4', name: 'Database Systems', code: 'DB303', color: '#F59E0B', icon: 'Server', progress: 0, totalTopics: 11, completedTopics: 0, semester: 4 },
  { id: '5', name: 'Software Engineering', code: 'SE401', color: '#EF4444', icon: 'GitBranch', progress: 0, totalTopics: 15, completedTopics: 0, semester: 5 },
  { id: '6', name: 'Web Development', code: 'WD402', color: '#EC4899', icon: 'Code', progress: 0, totalTopics: 13, completedTopics: 0, semester: 5 },
];

export function StudyDataProvider({ children }) {
  const [subjects, setSubjects] = useState(defaultSubjects);
  const [studySessions, setStudySessions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [streakData, setStreakData] = useState(defaultStreakData);
  const [libraryMaterials, setLibraryMaterials] = useState([]);
  const [quizScores, setQuizScores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAll = useCallback(async () => {
    try {
      const [sessions, tasksData, streak, subjectsData, library, quizzes] = await Promise.all([
        api.getSessions(),
        api.getTasks(),
        api.getStreak(),
        api.getSubjects(),
        api.getLibrary(),
        api.getQuizScores(),
      ]);
      setStudySessions(sessions || []);
      setTasks(tasksData || []);
      setStreakData(streak || defaultStreakData);
      setSubjects(subjectsData?.length ? subjectsData : defaultSubjects);
      setLibraryMaterials(library || []);
      setQuizScores(quizzes || []);
    } catch (error) {
      console.error('Failed to load study data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const addSession = useCallback(async (sessionData) => {
    const newSession = await api.addSession(sessionData);
    setStudySessions(prev => [newSession, ...prev]);
    await refreshAll();
    return newSession;
  }, [refreshAll]);

  const deleteSession = useCallback(async (id) => {
    await api.deleteSession(id);
    setStudySessions(prev => prev.filter(s => s.id !== id));
    await refreshAll();
  }, [refreshAll]);

  const addTask = useCallback(async (taskData) => {
    const newTask = await api.addTask(taskData);
    setTasks(prev => [...prev, newTask]);
    return newTask;
  }, []);

  const updateTask = useCallback(async (id, updates) => {
    const updated = await api.updateTask(id, updates);
    setTasks(prev => prev.map(t => t.id === id ? updated : t));
    return updated;
  }, []);

  const deleteTask = useCallback(async (id) => {
    await api.deleteTask(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const toggleTaskComplete = useCallback(async (id) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      await updateTask(id, { completed: !task.completed });
    }
  }, [tasks, updateTask]);

  const addSubject = useCallback(async (subjectData) => {
    const newSubject = await api.addSubject(subjectData);
    setSubjects(prev => [...prev, newSubject]);
    return newSubject;
  }, []);

  const updateSubject = useCallback(async (id, updates) => {
    const updated = await api.updateSubject(id, updates);
    setSubjects(prev => prev.map(s => s.id === id ? updated : s));
    return updated;
  }, []);

  const updateStreak = useCallback(async (updates) => {
    const updated = await api.updateStreak(updates);
    setStreakData(prev => ({ ...prev, ...updated }));
    return updated;
  }, []);

  const addQuizScore = useCallback(async (scoreData) => {
    const newScore = await api.addQuizScore(scoreData);
    setQuizScores(prev => [newScore, ...prev]);
    return newScore;
  }, []);

  const getSubjectById = useCallback((id) => subjects.find(s => s.id === id), [subjects]);

  const getSessionsBySubject = useCallback((subjectId) =>
    studySessions.filter(s => s.subjectId === subjectId), [studySessions]);

  const getTasksBySubject = useCallback((subject) =>
    tasks.filter(t => t.subject === subject), [tasks]);

  const getWeeklyStudyHours = useCallback(async () => {
    const data = await api.getWeeklyHours();
    return data;
  }, []);

  const getSubjectProgress = useCallback(() => {
    return subjects.map(s => ({
      name: s.name,
      progress: s.progress,
      color: s.color,
    }));
  }, [subjects]);

  const value = useMemo(() => ({
    subjects,
    studySessions,
    tasks,
    streakData,
    libraryMaterials,
    quizScores,
    isLoading,
    getSubjectById,
    getSessionsBySubject,
    getTasksBySubject,
    getWeeklyStudyHours,
    getSubjectProgress,
    addSession,
    deleteSession,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    addSubject,
    updateSubject,
    updateStreak,
    addQuizScore,
    refreshAll,
  }), [
    subjects, studySessions, tasks, streakData, libraryMaterials, quizScores, isLoading,
    getSubjectById, getSessionsBySubject, getTasksBySubject, getWeeklyStudyHours, getSubjectProgress,
    addSession, deleteSession, addTask, updateTask, deleteTask, toggleTaskComplete,
    addSubject, updateSubject, updateStreak, addQuizScore, refreshAll
  ]);

  return <StudyDataContext.Provider value={value}>{children}</StudyDataContext.Provider>;
}

export function useStudyData() {
  const context = useContext(StudyDataContext);
  if (!context) {
    throw new Error('useStudyData must be used within a StudyDataProvider');
  }
  return context;
}