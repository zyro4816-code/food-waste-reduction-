// client/src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isDonor: boolean;
  isNgo: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  quickLoginAs: (role: 'admin' | 'donor' | 'ngo' | 'recipient') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('saveplate_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const res = await api.getMe();
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        logout();
      }
    } catch (err) {
      console.warn('[AuthContext] Session expired or invalid:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [token]);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await api.login(credentials);
    if (res.success && res.token) {
      localStorage.setItem('saveplate_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } else {
      throw new Error(res.message || 'Login failed.');
    }
  };

  const register = async (userData: any) => {
    const res = await api.register(userData);
    if (res.success && res.token) {
      localStorage.setItem('saveplate_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } else {
      throw new Error(res.message || 'Registration failed.');
    }
  };

  const logout = () => {
    localStorage.removeItem('saveplate_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const quickLoginAs = async (role: 'admin' | 'donor' | 'ngo' | 'recipient') => {
    const accounts = {
      admin: { email: 'admin@saveplate.org', password: 'Admin@SavePlate2026!' },
      donor: { email: 'contact@greenbistro.com', password: 'Password@123' },
      ngo: { email: 'sarah.miller@communitytable.org', password: 'Password@123' },
      recipient: { email: 'elena.rodriguez@familycare.org', password: 'Password@123' }
    };

    const target = accounts[role];
    if (target) {
      await login(target);
    }
  };

  const isAdmin = user?.role === 'admin';
  const isDonor = user?.role === 'donor';
  const isNgo = user?.role === 'ngo';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        isDonor,
        isNgo,
        login,
        register,
        logout,
        refreshUser,
        quickLoginAs
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

