import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { api } from '../lib/api';
import type { ApiResponse } from '../types';

interface Admin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'super_admin';
  createdAt: string;
}

interface AuthContextType {
  admin: Admin | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!admin;

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      // Verify token with backend
      verifyToken();
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const response: ApiResponse<Admin> = await api.get('/auth/admin/me');
      if (response.success && response.data) {
        setAdmin(response.data);
      } else {
        localStorage.removeItem('adminToken');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('adminToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response: ApiResponse<{ admin: Admin; token: string }> = await api.post('/auth/admin/login', {
        email,
        password,
      });

      if (response.success && response.data) {
        const { admin: adminData, token } = response.data;
        localStorage.setItem('adminToken', token);
        setAdmin(adminData);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setAdmin(null);
  };

  const value: AuthContextType = {
    admin,
    isLoading,
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}