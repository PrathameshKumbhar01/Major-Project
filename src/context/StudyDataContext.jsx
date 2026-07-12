import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { generateId } from '../utils/cn';

const StudyDataContext = createContext(null);

const TASKS_STORAGE_KEY = 'studycat_tasks';

const MOCK_SUBJECTS = [
  { id: '1', name: 'Data Structures', code: 'DS201', color: '#3B82F6', icon: 'Database', progress: 75, totalTopics: 12, completedTopics: 9, semester: 3 },
  { id: '2', name: 'Operating Systems', code: 'OS301', color: '#8B5CF6', icon: 'Cpu', progress: 60, totalTopics: 10, completedTopics: 6, semester: 3 },
  { id: '3', name: 'Computer Networks', code: 'CN302', color: '#10B981', icon: 'Globe', progress: 45, totalTopics: 14, completedTopics: 6, semester: 4 },
  { id: '4', name: 'Database Systems', code: 'DB303', color: '#F59E0B', icon: 'Server', progress: 80, totalTopics: 11, completedTopics: 9, semester: 4 },
  { id: '5', name: 'Software Engineering', code: 'SE401', color: '#EF4444', icon: 'GitBranch', progress: 30, totalTopics: 15, completedTopics: 4, semester: 5 },
  { id: '6', name: 'Web Development', code: 'WD402', color: '#EC4899', icon: 'Code', progress: 55, totalTopics: 13, completedTopics: 7, semester: 5 },
];

const MOCK_STUDY_SESSIONS = [
  { id: '1', subjectId: '1', topic: 'Binary Trees', duration: 45, date: '2024-01-15', type: 'study' },
  { id: '2', subjectId: '3', topic: 'TCP/IP Model', duration: 60, date: '2024-01-15', type: 'study' },
  { id: '3', subjectId: '4', topic: 'Normalization', duration: 30, date: '2024-01-14', type: 'review' },
  { id: '4', subjectId: '2', topic: 'Process Scheduling', duration: 50, date: '2024-01-14', type: 'study' },
  { id: '5', subjectId: '1', topic: 'Graph Algorithms', duration: 90, date: '2024-01-13', type: 'practice' },
  { id: '6', subjectId: '5', topic: 'Design Patterns', duration: 40, date: '2024-01-13', type: 'study' },
  { id: '7', subjectId: '6', topic: 'React Hooks', duration: 75, date: '2024-01-12', type: 'project' },
  { id: '8', subjectId: '3', topic: 'Routing Protocols', duration: 55, date: '2024-01-12', type: 'study' },
  { id: '9', subjectId: '4', topic: 'SQL Joins', duration: 45, date: '2024-01-11', type: 'review' },
  { id: '10', subjectId: '2', topic: 'Memory Management', duration: 65, date: '2024-01-11', type: 'study' },
];

const MOCK_TASKS = [
  { id: '1', title: 'Complete DS Assignment 3', subject: 'Data Structures', dueDate: '2024-01-18', priority: 'high', completed: false, type: 'assignment' },
  { id: '2', title: 'Study for OS Midterm', subject: 'Operating Systems', dueDate: '2024-01-20', priority: 'high', completed: false, type: 'exam' },
  { id: '3', title: 'CN Lab Report', subject: 'Computer Networks', dueDate: '2024-01-17', priority: 'medium', completed: false, type: 'lab' },
  { id: '4', title: 'DB Project Phase 1', subject: 'Database Systems', dueDate: '2024-01-25', priority: 'medium', completed: false, type: 'project' },
  { id: '5', title: 'Read SE Chapter 4-5', subject: 'Software Engineering', dueDate: '2024-01-19', priority: 'low', completed: true, type: 'reading' },
  { id: '6', title: 'Build Portfolio Site', subject: 'Web Development', dueDate: '2024-02-01', priority: 'high', completed: false, type: 'project' },
];

const MOCK_STREAK_DATA = {
  currentStreak: 12,
  longestStreak: 28,
  totalDays: 156,
  weeklyGoal: 10,
  weeklyProgress: 7,
  lastStudyDate: '2024-01-15',
  heatmapData: Array.from({ length: 365 }, (_, i) => ({
    date: new Date(Date.now() - (364 - i) * 86400000).toISOString().split('T')[0],
    value: Math.random() > 0.7 ? Math.floor(Math.random() * 4) + 1 : 0,
  })),
};

const MOCK_LIBRARY_MATERIALS = [
  { id: '1', title: 'Data Structures & Algorithms - Complete Notes', subject: 'Data Structures', type: 'notes', semester: 3, pages: 45, downloads: 234, rating: 4.8, tags: ['trees', 'graphs', 'sorting'] },
  { id: '2', title: 'Operating Systems - Previous Year Papers', subject: 'Operating Systems', type: 'papers', semester: 3, pages: 28, downloads: 567, rating: 4.9, tags: ['processes', 'scheduling', 'memory'] },
  { id: '3', title: 'Computer Networks - Tanenbaum Summary', subject: 'Computer Networks', type: 'summary', semester: 4, pages: 32, downloads: 345, rating: 4.7, tags: ['osi', 'tcp', 'routing'] },
  { id: '4', title: 'Database Design - ER Diagrams Guide', subject: 'Database Systems', type: 'notes', semester: 4, pages: 22, downloads: 189, rating: 4.6, tags: ['er', 'normalization', 'sql'] },
  { id: '5', title: 'Software Engineering - Case Studies', subject: 'Software Engineering', type: 'notes', semester: 5, pages: 38, downloads: 156, rating: 4.5, tags: ['agile', 'testing', 'patterns'] },
  { id: '6', title: 'Web Dev - React Best Practices', subject: 'Web Development', type: 'guide', semester: 5, pages: 30, downloads: 423, rating: 4.8, tags: ['react', 'hooks', 'performance'] },
  { id: '7', title: 'DS - Dynamic Programming Patterns', subject: 'Data Structures', type: 'summary', semester: 3, pages: 18, downloads: 289, rating: 4.9, tags: ['dp', 'memoization', 'tabulation'] },
  { id: '8', title: 'OS - Concurrency Problems & Solutions', subject: 'Operating Systems', type: 'notes', semester: 3, pages: 25, downloads: 201, rating: 4.7, tags: ['deadlock', 'mutex', 'semaphore'] },
];

const MOCK_QUIZ_SCORES = [
  { subject: 'Data Structures', score: 85, date: '2024-01-10', total: 100 },
  { subject: 'Operating Systems', score: 72, date: '2024-01-12', total: 100 },
  { subject: 'Computer Networks', score: 90, date: '2024-01-14', total: 100 },
  { subject: 'Database Systems', score: 78, date: '2024-01-11', total: 100 },
  { subject: 'Software Engineering', score: 65, date: '2024-01-13', total: 100 },
  { subject: 'Web Development', score: 88, date: '2024-01-15', total: 100 },
];

export function StudyDataProvider({ children }) {
  const [subjects] = useState(MOCK_SUBJECTS);
  const [studySessions] = useState(MOCK_STUDY_SESSIONS);
  const [tasks, setTasks] = useState(() => {
    try {
      const stored = localStorage.getItem(TASKS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fall through to defaults
    }
    return MOCK_TASKS;
  });
  const [streakData] = useState(MOCK_STREAK_DATA);
  const [libraryMaterials] = useState(MOCK_LIBRARY_MATERIALS);
  const [quizScores] = useState(MOCK_QUIZ_SCORES);

  useEffect(() => {
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // ignore storage errors (e.g. private browsing quota)
    }
  }, [tasks]);

 const addTask = useCallback((taskData) => {
  console.log("ADD TASK CALLED", taskData);

  const newTask = {
    id: generateId(),
    completed: false,
    ...taskData,
  };

  setTasks((prev) => [...prev, newTask]);
}, []);

  const updateTask = useCallback((id, updates) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  const deleteTask = useCallback((id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleTaskComplete = useCallback((id) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }, []);

  const getSubjectById = useCallback((id) => subjects.find(s => s.id === id), [subjects]);
  
  const getSessionsBySubject = useCallback((subjectId) => 
    studySessions.filter(s => s.subjectId === subjectId), [studySessions]);

  const getTasksBySubject = useCallback((subject) => 
    tasks.filter(t => t.subject === subject), [tasks]);

  const getWeeklyStudyHours = useCallback(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });
    
    return last7Days.map(date => {
      const daySessions = studySessions.filter(s => s.date === date);
      const hours = daySessions.reduce((sum, s) => sum + s.duration, 0) / 60;
      return { date, hours: Math.round(hours * 10) / 10 };
    });
  }, [studySessions]);

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
    getSubjectById,
    getSessionsBySubject,
    getTasksBySubject,
    getWeeklyStudyHours,
    getSubjectProgress,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
  }), [subjects, studySessions, tasks, streakData, libraryMaterials, quizScores, getSubjectById, getSessionsBySubject, getTasksBySubject, getWeeklyStudyHours, getSubjectProgress, addTask, updateTask, deleteTask, toggleTaskComplete]);

  return <StudyDataContext.Provider value={value}>{children}</StudyDataContext.Provider>;
}

export function useStudyData() {
  const context = useContext(StudyDataContext);
  if (!context) {
    throw new Error('useStudyData must be used within a StudyDataProvider');
  }
  return context;
}