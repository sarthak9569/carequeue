import React, { createContext, useContext, useState, ReactNode } from 'react';
import { apiService, setAuthToken } from '../services/apiService';

interface User {
  id: string;
  name: string;
  email?: string;
  docID?: string;
  role: 'patient' | 'doctor' | 'hospital_admin' | 'department_admin' | 'staff';
  token: string;
  phone?: string;
  birthday?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email?: string; docID?: string; password: string }) => Promise<void>;
  signup: (name: string, email: string, password: string, extraData?: any) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  forgotPassword: (email: string) => Promise<void>;
  verifyOtpLogin: (email: string, otp: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('carequeue_token');
        const storedUser = localStorage.getItem('carequeue_user');
        if (token && storedUser) {
          setAuthToken(token);
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        setAuthToken(null);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

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
      const userData = {
        id: response.data._id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role || 'patient',
        token: response.data.token,
      };
      setUser(userData);
      localStorage.setItem('carequeue_user', JSON.stringify(userData));
      setAuthToken(response.data.token);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, extraData?: any) => {
    setIsLoading(true);
    try {
      const response = await apiService.register({ name, email, password, ...extraData });
      const userData = {
        id: response.data._id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role || 'patient',
        token: response.data.token,
      };
      setUser(userData);
      localStorage.setItem('carequeue_user', JSON.stringify(userData));
      setAuthToken(response.data.token);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('carequeue_user');
    setAuthToken(null);
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
      const userData: User = {
        id: response.data._id,
        name: response.data.name,
        email: response.data.email,
        role: 'patient',
        token: response.data.token,
      };
      setUser(userData);
      localStorage.setItem('carequeue_user', JSON.stringify(userData));
      setAuthToken(response.data.token);
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
