import axios from 'axios';

import { getApiBaseUrl } from '../config/backendHost';

const BASE_URL = getApiBaseUrl();

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
  login: (data: any) => axios.post(`${BASE_URL}/auth/login`, data),
  register: (data: any) => axios.post(`${BASE_URL}/auth/register`, data),
  forgotPassword: (email: string) => axios.post(`${BASE_URL}/auth/forgot-password`, { email }),
  verifyOtpLogin: (email: string, otp: string) => axios.post(`${BASE_URL}/auth/verify-otp-login`, { email, otp }),

  // Queue (Future: Implement these routes in backend as needed)
  joinQueue: (data: any) => axios.post(`${BASE_URL}/queue/join`, data),
  getQueue: () => axios.get(`${BASE_URL}/queue`),
  getStats: () => axios.get(`${BASE_URL}/queue/stats`),
  getDepartments: () => axios.get(`${BASE_URL}/queue/departments`),
  skipPatient: (id: string) => axios.post(`${BASE_URL}/queue/skip/${id}`),
  pauseDepartment: (id: string) => axios.post(`${BASE_URL}/queue/pause/${id}`),
  transferPatient: (id: string, newDeptId: string) => axios.post(`${BASE_URL}/queue/transfer/${id}`, { new_department_id: newDeptId }),
  completePatient: (id: string) => axios.put(`${BASE_URL}/queue/complete/${id}`),
  callNext: (departmentId: string) => axios.post(`${BASE_URL}/queue/next`, { department_id: departmentId }),
};
