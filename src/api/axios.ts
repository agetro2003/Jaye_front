// src/api/axios.ts
import axios from 'axios';




const api = axios.create({
  baseURL: import.meta.env.API_URL || 'http://localhost:8000', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Si hay un token guardado, se lo pegamos a TODAS las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;