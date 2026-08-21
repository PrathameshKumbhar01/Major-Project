import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Supabase credentials not fully configured. Some features may not work.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const app = express();
app.use(express.json());

const allowOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
});

const maskValue = (value) => {
  if (!value) return null;
  if (value.length <= 8) return '***';
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
};

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

app.get('/api/env-status', (_req, res) => {
  const keys = {
    VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    VITE_GROQ_API_KEY: process.env.VITE_GROQ_API_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    VITE_SUPABASE_PUBLISHABLE_KEY: process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    VITE_ARCJET_KEY: process.env.VITE_ARCJET_KEY,
  };

  const configured = Object.fromEntries(
    Object.entries(keys).map(([name, value]) => [name, Boolean(value)])
  );

  res.json({ configured, masked: Object.fromEntries(Object.entries(keys).map(([name, value]) => [name, maskValue(value)])) });
});

app.post('/api/study-chat', async (req, res) => {
  const groqApiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
  const { messages = [], mode = 'chat' } = req.body || {};

  if (!groqApiKey) {
    res.status(500).json({ error: 'Missing GROQ_API_KEY in .env.' });
    return;
  }

  const safeMessages = messages
    .filter((message) => ['user', 'assistant'].includes(message?.role) && typeof message.content === 'string')
    .slice(-12)
    .map((message) => ({
      role: message.role,
      content: message.content.slice(0, 12000),
    }));

  if (!safeMessages.length) {
    res.status(400).json({ error: 'Message content is required.' });
    return;
  }

  const systemPrompt =
    mode === 'summary'
      ? 'You are StudyCat AI. Summarize study material clearly with exam-focused key points, definitions, formulas, and revision suggestions.'
      : 'You are StudyCat AI, a helpful study assistant for engineering diploma students. Explain concepts clearly, use examples, and keep answers structured for learning.';

  try {
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        max_tokens: mode === 'summary' ? 900 : 700,
        messages: [
          { role: 'system', content: systemPrompt },
          ...safeMessages,
        ],
      }),
    });

    const data = await groqResponse.json();

    if (!groqResponse.ok) {
      res.status(groqResponse.status).json({
        error: data?.error?.message || 'Groq request failed.',
      });
      return;
    }

    res.json({
      message: data.choices?.[0]?.message?.content || 'I could not generate a response.',
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Study AI request failed.' });
  }
});

// Auth middleware
const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }
  
  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  
  req.user = user;
  next();
};

// STUDY SESSIONS
app.get('/api/study-sessions', authenticateUser, async (req, res) => {
  const { data, error } = await supabase
    .from('study_sessions')
    .select('*')
    .eq('user_id', req.user.id)
    .order('date', { ascending: false });
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/study-sessions', authenticateUser, async (req, res) => {
  const { subjectId, topic, duration, date, type } = req.body;
  const { data, error } = await supabase
    .from('study_sessions')
    .insert({ user_id: req.user.id, subject_id: subjectId, topic, duration, date, type })
    .select()
    .single();
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.delete('/api/study-sessions/:id', authenticateUser, async (req, res) => {
  const { error } = await supabase
    .from('study_sessions')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user.id);
  
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// TASKS
app.get('/api/tasks', authenticateUser, async (req, res) => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', req.user.id)
    .order('due_date', { ascending: true });
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/tasks', authenticateUser, async (req, res) => {
  const { title, subject, dueDate, priority, type, completed = false } = req.body;
  const { data, error } = await supabase
    .from('tasks')
    .insert({ user_id: req.user.id, title, subject, due_date: dueDate, priority, type, completed })
    .select()
    .single();
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.patch('/api/tasks/:id', authenticateUser, async (req, res) => {
  const { data, error } = await supabase
    .from('tasks')
    .update(req.body)
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select()
    .single();
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.delete('/api/tasks/:id', authenticateUser, async (req, res) => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', req.params.id)
    .eq('user_id', req.user.id);
  
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// SUBJECTS
app.get('/api/subjects', authenticateUser, async (req, res) => {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: true });
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/subjects', authenticateUser, async (req, res) => {
  const { data, error } = await supabase
    .from('subjects')
    .insert({ user_id: req.user.id, ...req.body })
    .select()
    .single();
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.patch('/api/subjects/:id', authenticateUser, async (req, res) => {
  const { data, error } = await supabase
    .from('subjects')
    .update(req.body)
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select()
    .single();
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// STREAK DATA
app.get('/api/streak', authenticateUser, async (req, res) => {
  const { data, error } = await supabase
    .from('streak_data')
    .select('*')
    .eq('user_id', req.user.id)
    .single();
  
  if (error && error.code !== 'PGRST116') return res.status(500).json({ error: error.message });
  
  if (!data) {
    // Create default streak data
    const { data: newData, error: createError } = await supabase
      .from('streak_data')
      .insert({ user_id: req.user.id })
      .select()
      .single();
    if (createError) return res.status(500).json({ error: createError.message });
    return res.json(newData);
  }
  
  res.json(data);
});

app.patch('/api/streak', authenticateUser, async (req, res) => {
  const { data, error } = await supabase
    .from('streak_data')
    .upsert({ user_id: req.user.id, ...req.body })
    .select()
    .single();
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// QUIZ SCORES
app.get('/api/quiz-scores', authenticateUser, async (req, res) => {
  const { data, error } = await supabase
    .from('quiz_scores')
    .select('*')
    .eq('user_id', req.user.id)
    .order('date', { ascending: false });
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/quiz-scores', authenticateUser, async (req, res) => {
  const { data, error } = await supabase
    .from('quiz_scores')
    .insert({ user_id: req.user.id, ...req.body })
    .select()
    .single();
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// LIBRARY MATERIALS (public read)
app.get('/api/library', async (req, res) => {
  const { data, error } = await supabase
    .from('library_materials')
    .select('*')
    .order('downloads', { ascending: false });
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// WEEKLY STUDY HOURS (computed)
app.get('/api/weekly-study-hours', authenticateUser, async (req, res) => {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });
  
  const { data, error } = await supabase
    .from('study_sessions')
    .select('date, duration')
    .eq('user_id', req.user.id)
    .in('date', last7Days);
  
  if (error) return res.status(500).json({ error: error.message });
  
  const hoursByDate = {};
  data?.forEach(s => {
    hoursByDate[s.date] = (hoursByDate[s.date] || 0) + s.duration;
  });
  
  const result = last7Days.map(date => ({
    date,
    hours: Math.round((hoursByDate[date] || 0) / 60 * 10) / 10,
  }));
  
  res.json(result);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
