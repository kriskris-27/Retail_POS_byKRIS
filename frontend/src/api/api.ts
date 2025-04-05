import axios from 'axios';
import { User, Product, Sale, InventoryItem, Report } from '../types';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    api.post<{ token: string; user: User }>('/users/login', credentials),
  register: (userData: Omit<User, 'id'>) =>
    api.post('/users/register', userData),
};

// Product API
export const productApi = {
  getAll: () => api.get<Product[]>('/products'),
  getById: (id: string) => api.get<Product>(`/products/${id}`),
  create: (data: Omit<Product, 'id'>) => api.post<Product>('/products', data),
  update: (id: string, data: Partial<Product>) => api.put<Product>(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
};

// Sales API
export const salesApi = {
  create: (data: Omit<Sale, 'id' | 'date' | 'cashierId'>) => api.post<Sale>('/sales', data),
  getAll: () => api.get<Sale[]>('/sales'),
  getById: (id: string) => api.get<Sale>(`/sales/${id}`),
  getReports: (period: 'daily' | 'weekly' | 'monthly') => 
    api.get<Report[]>(`/reports/${period}`),
};

// Inventory API
export const inventoryApi = {
  getAll: () => api.get<InventoryItem[]>('/inventory'),
  update: (id: string, data: Partial<InventoryItem>) => 
    api.put<InventoryItem>(`/inventory/${id}`, data),
  getLowStock: () => api.get<InventoryItem[]>('/inventory/low-stock'),
};

// Admin API
export const adminApi = {
  getUsers: () => api.get<User[]>('/admin'),
  createUser: (data: Omit<User, 'id'>) => api.post<User>('/admin/create', data),
  updateUser: (id: string, data: Partial<User>) => api.put<User>(`/admin/update/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/delete/${id}`),
};

export default api; 