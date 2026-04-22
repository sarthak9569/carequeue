import axios from 'axios';
import { getApiBaseUrl } from '../config/backendHost';

const BASE_URL = getApiBaseUrl();

export interface Prescription {
  _id: string;
  title: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
}

export const prescriptionService = {
  getPrescriptions: (userId: string) => 
    axios.get(`${BASE_URL}/prescriptions`, { params: { userId } }),
  
  uploadPrescription: (data: { userId: string, title: string, fileName?: string, fileUrl?: string }) => 
    axios.post(`${BASE_URL}/prescriptions/upload`, data),
  
  deletePrescription: (id: string) => 
    axios.delete(`${BASE_URL}/prescriptions/${id}`),
};
