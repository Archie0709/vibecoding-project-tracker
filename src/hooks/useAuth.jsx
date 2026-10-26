import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as api from '../api';

/**
 * 12c: who is logged in, shared across the app.
 * status: 'loading' | 'anonymous' | 'authenticated' | 'error' (server unreachable)
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', user: null, error: null });

  const refresh = useCallback(async () => {
    setState((s) => ({ ...s, status: 'loading', error: null }));
    try {
      const user = await api.getCurrentUser();
      setState({ status: user ? 'authenticated' : 'anonymous', user, error: null });
    } catch (error) {
      setState({ status: 'error', user: null, error });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (credentials) => {
    const user = await api.login(credentials);
    setState({ status: 'authenticated', user, error: null });
    return user;
  }, []);

  const register = useCallback(async (details) => {
    const user = await api.register(details);
    setState({ status: 'authenticated', user, error: null });
    return user;
  }, []);

  const loginAsDemo = useCallback(async () => {
    const user = await api.demoLogin();
    setState({ status: 'authenticated', user, error: null });
    return user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setState({ status: 'anonymous', user: null, error: null });
    }
  }, []);

  const value = useMemo(
    () => ({ ...state, refresh, login, register, loginAsDemo, logout }),
    [state, refresh, login, register, loginAsDemo, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
