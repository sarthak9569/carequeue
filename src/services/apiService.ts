import axios from 'axios';

const BASE_URL = 'http://192.168.1.6:5000/api';

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

  // Queue (Future: Implement these routes in backend as needed)
  joinQueue: (data: any) => axios.post(`${BASE_URL}/queue/join`, data),
  getQueue: () => axios.get(`${BASE_URL}/queue`),
  getStats: () => axios.get(`${BASE_URL}/queue/stats`),
  getDepartments: () => axios.get(`${BASE_URL}/queue/departments`),
};
