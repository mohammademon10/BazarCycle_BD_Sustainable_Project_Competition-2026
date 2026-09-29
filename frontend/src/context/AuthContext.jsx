import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const DEMO_CREDENTIALS = {
  ADMIN: { email: 'admin@bazarcycle.bd', password: 'BazarCycle2026!', label: 'Platform Admin' },
  MARKET_MANAGER: { email: 'manager@bazarcycle.bd', password: 'BazarCycle2026!', label: 'Market Manager (Karwan Bazar)' },
  COLLECTOR: { email: 'collector@bazarcycle.bd', password: 'BazarCycle2026!', label: 'Waste Collector (Salam Miah)' }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('bazarcycle_token');
    const savedUser = localStorage.getItem('bazarcycle_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('bazarcycle_token');
        localStorage.removeItem('bazarcycle_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { access_token, user: userData } = response.data;

    localStorage.setItem('bazarcycle_token', access_token);
    localStorage.setItem('bazarcycle_user', JSON.stringify(userData));

    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    const { access_token, user: newUser } = response.data;

    localStorage.setItem('bazarcycle_token', access_token);
    localStorage.setItem('bazarcycle_user', JSON.stringify(newUser));

    setToken(access_token);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('bazarcycle_token');
    localStorage.removeItem('bazarcycle_user');
    setToken(null);
    setUser(null);
  };

  const quickDemoLogin = async (roleKey) => {
    const creds = DEMO_CREDENTIALS[roleKey];
    if (!creds) throw new Error(`Invalid demo role: ${roleKey}`);
    return await login(creds.email, creds.password);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    role: user?.role,
    login,
    register,
    logout,
    quickDemoLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
