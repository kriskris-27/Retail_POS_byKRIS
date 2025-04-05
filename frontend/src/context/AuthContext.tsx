import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/api';
import { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Here you would typically verify the token with the backend
      // For now, we'll just set the token
      setState(prev => ({
        ...prev,
        token,
        isAuthenticated: true,
        loading: false,
      }));
    } else {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await authApi.login({ email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setState({
        user,
        token,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.response?.data?.message || 'Login failed',
      }));
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    });
  };

  const hasRole = (role: string) => {
    return state.user?.role === role;
  };

  const value = {
    ...state,
    login,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 