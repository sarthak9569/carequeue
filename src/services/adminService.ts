import { apiService } from './apiService';

const api = apiService.instance;

export const adminService = {
  // Hospital
  createHospital: (data: any) => api.post('/admin/hospitals', data),
  updateHospital: (id: string, data: any) => api.put(`/admin/hospitals/${id}`, data),
  getHospital: (id: string) => api.get(`/admin/hospitals/${id}`),
  getMyHospital: () => api.get('/admin/hospitals/me'),

  // Departments
  createDepartment: (data: any) => api.post('/admin/departments', data),
  updateDepartment: (id: string, data: any) => api.put(`/admin/departments/${id}`, data),
  getDepartments: () => api.get('/admin/departments'), // This might need a separate route in backend or use queue/departments if they are the same

  // Doctors
  onboardDoctor: (data: any) => api.post('/admin/doctors/onboard', data),
  getDoctors: () => api.get('/admin/doctors'), 
  removeDoctor: (id: string) => api.delete(`/admin/doctors/${id}`),
  getSchedules: () => api.get('/admin/schedules'),
  manageSchedule: (data: any) => api.post('/admin/schedules', data),

  // Staff
  addStaff: (data: any) => api.post('/admin/staff', data),
  getStaff: (hospitalId?: string) => api.get('/admin/staff', { params: { hospitalId } }),

  // Leaves
  applyLeave: (data: any) => api.post('/admin/leaves/apply', data),
  getLeaves: (hospitalId?: string) => api.get('/admin/leaves', { params: { hospitalId } }),
  updateLeaveStatus: (id: string, status: 'Approved' | 'Rejected') => api.put(`/admin/leaves/${id}/status`, { status }),

  // Analytics
  getAnalytics: (hospitalId?: string) => api.get('/admin/analytics', { params: { hospitalId } }),
};
