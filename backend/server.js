import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
