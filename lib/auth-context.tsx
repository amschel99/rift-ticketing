'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  externalId: string;
  name?: string | null;
  email?: string | null;
  role: string;
}

interface AuthContextType {
  user: User | null;
  bearerToken: string | null;
  isLoading: boolean;
  login: (externalId: string, password: string) => Promise<boolean>;
  signup: (externalId: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [bearerToken, setBearerToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage
    const token = localStorage.getItem('bearerToken');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setBearerToken(token);
      setUser(JSON.parse(userData));
    }
    setIsLoading(false);
  }, []);

  const login = async (externalId: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ externalId, password }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      
      localStorage.setItem('bearerToken', data.bearerToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setBearerToken(data.bearerToken);
      setUser(data.user);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (externalId: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ externalId, password }),
      });

      if (!response.ok) {
        return false;
      }

      // After signup, auto-login
      return await login(externalId, password);
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('bearerToken');
    localStorage.removeItem('user');
    setBearerToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, bearerToken, isLoading, login, signup, logout }}>
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
