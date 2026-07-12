const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '');
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const isSupabaseConfigured = Boolean(supabaseUrl) && Boolean(supabaseAnonKey);

const defaultPreferences = {
  theme: 'system',
  notifications: true,
  studyGoal: 120,
};

// ---------------------------------------------------------------------------
// Local (demo) auth – used when Supabase credentials are NOT configured.
// Stores users in localStorage so registration / login works offline.
// ---------------------------------------------------------------------------

const LOCAL_USERS_KEY = 'studycat_local_users';

const getLocalUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '{}');
  } catch {
    return {};
  }
};

const saveLocalUsers = (users) => {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
};

const createLocalSession = () => ({
  access_token: `local_${Date.now()}_${Math.random().toString(36).slice(2)}`,
  refresh_token: `local_refresh_${Date.now()}`,
  expires_at: Math.floor(Date.now() / 1000) + 3600 * 24,
  expires_in: 3600 * 24,
  token_type: 'bearer',
});

const localSignIn = (email, password) => {
  const users = getLocalUsers();
  const stored = users[email.toLowerCase()];

  if (!stored || stored.password !== password) {
    throw new Error('Invalid email or password.');
  }

  return {
    user: { ...stored.profile },
    session: createLocalSession(),
  };
};

const localSignUp = ({ email, password, name, branch, semester, subjects }) => {
  const users = getLocalUsers();
  const key = email.toLowerCase();

  if (users[key]) {
    throw new Error('An account with this email already exists.');
  }

  const profile = {
    id: `local_${Date.now()}`,
    name: name || email.split('@')[0] || 'Student',
    email,
    avatar: null,
    branch: branch || 'Computer Engineering',
    semester: Number(semester || 4),
    subjects: subjects || [],
    preferences: defaultPreferences,
  };

  users[key] = { password, profile };
  saveLocalUsers(users);

  return {
    user: profile,
    session: createLocalSession(),
  };
};

// ---------------------------------------------------------------------------
// Supabase helpers (used when credentials ARE configured)
// ---------------------------------------------------------------------------

const getSessionFromResponse = (data) => {
  if (!data) return null;
  if (data.session) return data.session;
  if (data.access_token) {
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
      expires_in: data.expires_in,
      token_type: data.token_type,
    };
  }
  return null;
};

const assertSupabaseConfig = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables.');
  }
};

const requestSupabaseAuth = async (path, { accessToken, ...options } = {}) => {
  assertSupabaseConfig();

  const response = await fetch(`${supabaseUrl}/auth/v1${path}`, {
    ...options,
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${accessToken || supabaseAnonKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.error_description || data?.msg || data?.message || 'Supabase request failed.');
  }

  return data;
};

// ---------------------------------------------------------------------------
// Public API – automatically picks local or Supabase mode
// ---------------------------------------------------------------------------

export const getSupabaseConfigStatus = () => ({
  hasUrl: Boolean(supabaseUrl),
  hasKey: Boolean(supabaseAnonKey),
  isLocalMode: !isSupabaseConfigured,
});

export const normalizeSupabaseUser = (supabaseUser, fallback = {}) => {
  const metadata = supabaseUser?.user_metadata || {};
  const email = supabaseUser?.email || fallback.email || '';

  return {
    id: supabaseUser?.id || fallback.id || email,
    name: metadata.name || fallback.name || email.split('@')[0] || 'Student',
    email,
    avatar: metadata.avatar_url || fallback.avatar || null,
    branch: metadata.branch || fallback.branch || 'Computer Engineering',
    semester: Number(metadata.semester || fallback.semester || 4),
    subjects: metadata.subjects || fallback.subjects || [],
    preferences: metadata.preferences || fallback.preferences || defaultPreferences,
  };
};

export const signInWithPassword = async (email, password) => {
  // Local demo mode
  if (!isSupabaseConfigured) {
    return localSignIn(email, password);
  }

  // Supabase mode
  const data = await requestSupabaseAuth('/token?grant_type=password', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  return {
    user: normalizeSupabaseUser(data.user),
    session: getSessionFromResponse(data),
  };
};

export const signUpWithPassword = async ({ email, password, name, branch, semester, subjects }) => {
  // Local demo mode
  if (!isSupabaseConfigured) {
    return localSignUp({ email, password, name, branch, semester, subjects });
  }

  // Supabase mode
  const data = await requestSupabaseAuth('/signup', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      data: {
        name,
        branch,
        semester,
        subjects,
        preferences: defaultPreferences,
      },
    }),
  });

  return {
    user: normalizeSupabaseUser(data.user, { email, name, branch, semester, subjects }),
    session: getSessionFromResponse(data),
  };
};

export const getCurrentSupabaseUser = async (accessToken, fallbackUser) => {
  if (!isSupabaseConfigured) {
    return fallbackUser || null;
  }

  const data = await requestSupabaseAuth('/user', {
    method: 'GET',
    accessToken,
  });

  return normalizeSupabaseUser(data, fallbackUser);
};

export const signOutSupabase = async (accessToken) => {
  // In local mode, nothing to do server-side
  if (!isSupabaseConfigured || !accessToken) return;

  await requestSupabaseAuth('/logout', {
    method: 'POST',
    accessToken,
  });
};
