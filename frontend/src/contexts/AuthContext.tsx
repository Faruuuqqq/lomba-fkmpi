'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '@/types';
import { authAPI } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  verifyResetToken: (token: string) => Promise<{ isValid: boolean; message: string }>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchProfile(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchProfile = async (authToken: string) => {
    try {
      const { data } = await authAPI.getProfile();
      setUser(data);
    } catch (error) {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      // Handle different response structures
      const authData = response.data || response;
      const token = authData.access_token || authData.token;
      const userData = authData.user || authData.user;
      
      if (!token) {
        throw new Error('No token received from server');
      }
      
      setToken(token);
      setUser(userData);
      localStorage.setItem('token', token);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    try {
      const response = await authAPI.register({
        email,
        password,
        name,
      });
      // Handle different response structures
      const authData = response.data || response;
      const token = authData.access_token || authData.token;
      const userData = authData.user || authData.user;
      
      if (!token) {
        throw new Error('No token received from server');
      }
      
      setToken(token);
      setUser(userData);
      localStorage.setItem('token', token);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call backend to blacklist token
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage regardless of API call result
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      await authAPI.requestPasswordReset({ email });
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      await authAPI.resetPassword({ token, newPassword });
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const verifyResetToken = async (token: string) => {
    try {
      const response = await authAPI.verifyResetToken(token);
      return response.data || response;
    } catch (error) {
      console.error('Token verification error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        requestPasswordReset,
        resetPassword,
        verifyResetToken,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
