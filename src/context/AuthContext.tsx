import React, { createContext, useContext, useState, ReactNode } from 'react';
import { apiService } from '../services/apiService';

interface User {
  id: string;
  name: string;
  email?: string;
  docID?: string;
  role: 'patient' | 'doctor';
  token: string;
  phone?: string;
  birthday?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email?: string; docID?: string; password: string }) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  forgotPassword: (email: string) => Promise<void>;
  verifyOtpLogin: (email: string, otp: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (credentials: { email?: string; docID?: string; password: string }) => {
    setIsLoading(true);
    try {
      // Mock Doctor Login if docID is provided
      if (credentials.docID) {
        if (credentials.password === 'doctor123') {
           setUser({
            id: 'doc_mock_1',
            name: 'Dr. Sanctuary',
            docID: credentials.docID,
            role: 'doctor',
            token: 'mock_doc_token',
          });
          return;
        } else {
          throw new Error('Access Denied: Invalid Doctor Security Key');
        }
      }

      const response = await apiService.login({ 
        email: credentials.email!, 
        password: credentials.password 
      });
      setUser({
        id: response.data._id,
        name: response.data.name,
        email: response.data.email,
        role: 'patient',
        token: response.data.token,
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiService.register({ name, email, password });
      setUser({
        id: response.data._id,
        name: response.data.name,
        email: response.data.email,
        role: 'patient',
        token: response.data.token,
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : null);
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    try {
      await apiService.forgotPassword(email);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtpLogin = async (email: string, otp: string) => {
    setIsLoading(true);
    try {
      const response = await apiService.verifyOtpLogin(email, otp);
      setUser({
        id: response.data._id,
        name: response.data.name,
        email: response.data.email,
        role: 'patient',
        token: response.data.token,
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading, 
      login, 
      signup, 
      logout,
      updateProfile,
      forgotPassword,
      verifyOtpLogin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
