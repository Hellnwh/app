import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Create axios instance
const api = axios.create({
  baseURL: API,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);

// Documents
export const uploadDocument = (formData) => api.post('/documents/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const analyzeDocument = (data) => api.post('/documents/analyze', data);
export const chatWithDocument = (data) => api.post('/documents/chat', data);
export const downloadReport = (documentId) => api.get(`/documents/download-report/${documentId}`, {
  responseType: 'blob'
});
export const getSavedDocuments = () => api.get('/documents/saved');

// Payment
export const createPaymentOrder = (data) => api.post('/payment/create-order', data);
export const verifyPayment = (data) => api.post('/payment/verify', data);
export const getSubscription = () => api.get('/user/subscription');

export default api;