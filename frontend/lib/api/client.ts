import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

console.log('🔧 API Client initialized with baseURL:', `${API_URL}/api`);

export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Check backend connection
export const checkBackendConnection = async () => {
  try {
    const response = await axios.get(`${API_URL}/health`, { timeout: 3000 });
    console.log('✅ Backend is connected:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Backend is NOT connected:', error);
    console.error('💡 Please start backend: cd backend && uvicorn app.main:main --reload');
    return false;
  }
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth and redirect to login
      Cookies.remove('access_token');
      Cookies.remove('refresh_token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;


