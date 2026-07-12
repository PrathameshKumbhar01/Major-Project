import { createContext, useContext, useState, useCallback } from 'react';
import {
  getSupabaseConfigStatus,
  signInWithPassword,
  signOutSupabase,
  signUpWithPassword,
} from '../lib/supabaseAuth';

const AuthContext = createContext(null);
const STORAGE_KEY = 'studycat_auth';

const readStoredAuth = () => {
  if (typeof window === 'undefined') return { user: null, session: null };

  try {
    const savedAuth = localStorage.getItem(STORAGE_KEY);
    return savedAuth ? JSON.parse(savedAuth) : { user: null, session: null };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return { user: null, session: null };
  }
};

const persistAuth = (nextAuth) => {
  if (typeof window === 'undefined') return;

  if (nextAuth.user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAuth));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
};

export function AuthProvider({ children }) {
  const [{ user, session }, setAuth] = useState(readStoredAuth);
  const [isLoading, setIsLoading] = useState(false);
  const configStatus = getSupabaseConfigStatus();

  const saveAuth = useCallback((nextAuth) => {
    persistAuth(nextAuth);
    setAuth(nextAuth);
  }, []);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const nextAuth = await signInWithPassword(email, password);
      saveAuth(nextAuth);
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  }, [saveAuth]);

  const register = useCallback(async (data) => {
    setIsLoading(true);
    try {
      const nextAuth = await signUpWithPassword(data);
      saveAuth(nextAuth);
      return {
        success: true,
        needsEmailConfirmation: !nextAuth.session,
      };
    } finally {
      setIsLoading(false);
    }
  }, [saveAuth]);

  const logout = useCallback(async () => {
    const accessToken = session?.access_token;
    saveAuth({ user: null, session: null });

    try {
      await signOutSupabase(accessToken);
    } catch {
      // Local logout should still complete if the remote token is already invalid.
    }
  }, [saveAuth, session?.access_token]);

  const updateProfile = useCallback((updates) => {
    setAuth((current) => {
      const updatedAuth = {
        ...current,
        user: current.user ? { ...current.user, ...updates } : current.user,
      };
      persistAuth(updatedAuth);
      return updatedAuth;
    });
  }, []);

  const value = {
    user,
    session,
    isLoading,
    isAuthenticated: Boolean(user),
    authConfigReady: configStatus.hasUrl && configStatus.hasKey,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
