import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

// Optionally, you can add interceptors here to append auth tokens or handle global errors.

export default api;
