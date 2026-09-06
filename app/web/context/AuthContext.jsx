import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('aps_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const savedToken = localStorage.getItem('aps_token');
      if (savedToken) {
        try {
          const res = await api.getMe();
          setUser(res.user);
        } catch (err) {
          console.warn('Session expired or invalid:', err.message);
          localStorage.removeItem('aps_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    localStorage.setItem('aps_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = async () => {
    try {
      if (token) await api.logout();
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('aps_token');
      setToken(null);
      setUser(null);
    }
  };

  const quickSwitch = async (role) => {
    if (role === 'admin') {
      return await login('admin@aps.com', 'admin123');
    } else {
      return await login('gestionnaire@aps.com', 'gestionnaire123');
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    quickSwitch,
    isAdmin: user?.role === 'admin',
    isManager: user?.role === 'gestionnaire' || user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
