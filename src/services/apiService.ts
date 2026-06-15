import axios from 'axios';

import { getApiBaseUrl } from '../config/backendHost';

const BASE_URL = getApiBaseUrl();

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
});

import { storage } from './storageService';

// In-memory cache for synchronous access
let _token: string | null = null;

// Helper to set auth token
export const setAuthToken = async (token: string | null) => {
  _token = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    await storage.setItem('carequeue_token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    await storage.removeItem('carequeue_token');
    await storage.removeItem('carequeue_user');
  }
};

// Add interceptor for tokens
api.interceptors.request.use(async (config) => {
  // Try cache first, then storage
  const token = _token || await storage.getItem('carequeue_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    _token = token; // Update cache
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Types
export interface QueueEntry {
  id: string;
  queue_number: string;
  patient_name: string;
  phone?: string;
  department: { id: string, name: string };
  status: 'waiting' | 'current' | 'completed';
  source: 'web' | 'ivr' | 'mobile' | 'qr';
  createdAt: Date;
}

// Real API Integration
export const apiService = {
  // Auth
  login: (data: any) => api.post(`/auth/login`, data),
  register: (data: any) => api.post(`/auth/register`, data),
  doctorLogin: (data: { hospitalCode: string, docId: string }) => api.post(`/auth/doctor-login`, data),
  forgotPassword: (email: string) => api.post(`/auth/forgot-password`, { email }),
  verifyOtpLogin: (email: string, otp: string) => api.post(`/auth/verify-otp-login`, { email, otp }),

  // Queue
  joinQueue: (data: any) => api.post(`/queue/join`, data),
  getQueue: () => api.get(`/queue`),
  getStats: () => api.get(`/queue/stats`),
  getDepartments: (hospitalId?: string) => api.get(`/admin/departments`, { params: { hospitalId } }),
  addDepartment: (data: any) => api.post(`/admin/departments`, { ...data, action: 'create' }),
  updateDepartment: (id: string, data: any) => api.put(`/admin/departments/${id}`, { ...data, action: 'update' }),
  deleteDepartment: (id: string) => api.put(`/admin/departments/${id}`, { action: 'disable' }),
  getHospitals: (params?: { city?: string, pincode?: string, department?: string, search?: string }) => 
    api.get(`/admin/hospitals`, { params }),
  getMyHospital: () => api.get(`/admin/hospitals/me`),
  getDiscoveryData: () => api.get(`/admin/hospitals/discovery`),
  skipPatient: (id: string) => api.post(`/queue/skip/${id}`),
  pauseDepartment: (id: string) => api.post(`/queue/pause/${id}`),
  transferPatient: (id: string, newDeptId: string) => api.post(`/queue/transfer/${id}`, { new_department_id: newDeptId }),
  completePatient: (id: string) => api.put(`/queue/complete/${id}`),
  callNext: (departmentId: string) => api.post(`/queue/next`, { department_id: departmentId }),

  // Shared instance for other services
  instance: api,
};
