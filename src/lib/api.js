const API_BASE = '/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('studycat_auth');
  let authToken = null;
  
  if (token) {
    try {
      const parsed = JSON.parse(token);
      authToken = parsed.session?.access_token;
    } catch {}
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data;
}

export const api = {
  // Study Sessions
  getSessions: () => request('/study-sessions'),
  addSession: (session) => request('/study-sessions', { method: 'POST', body: JSON.stringify(session) }),
  deleteSession: (id) => request(`/study-sessions/${id}`, { method: 'DELETE' }),

  // Tasks
  getTasks: () => request('/tasks'),
  addTask: (task) => request('/tasks', { method: 'POST', body: JSON.stringify(task) }),
  updateTask: (id, updates) => request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
  toggleTask: (id, completed) => request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ completed }) }),

  // Subjects
  getSubjects: () => request('/subjects'),
  addSubject: (subject) => request('/subjects', { method: 'POST', body: JSON.stringify(subject) }),
  updateSubject: (id, updates) => request(`/subjects/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),

  // Streak
  getStreak: () => request('/streak'),
  updateStreak: (updates) => request('/streak', { method: 'PATCH', body: JSON.stringify(updates) }),

  // Quiz Scores
  getQuizScores: () => request('/quiz-scores'),
  addQuizScore: (score) => request('/quiz-scores', { method: 'POST', body: JSON.stringify(score) }),

  // Library
  getLibrary: () => request('/library'),

  // Weekly Study Hours
  getWeeklyHours: () => request('/weekly-study-hours'),
};

export default api;