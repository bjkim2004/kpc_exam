import { create } from 'zustand';
import Cookies from 'js-cookie';
import apiClient from '../api/client';

interface User {
  id: number;
  email: string;
  name?: string;
  exam_number: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, exam_number: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { access_token, refresh_token } = response.data;
      
      Cookies.set('access_token', access_token, { expires: 1/96 }); // 15 minutes
      Cookies.set('refresh_token', refresh_token, { expires: 7 }); // 7 days
      
      // Get user info
      const userResponse = await apiClient.get('/auth/me');
      set({ user: userResponse.data, isAuthenticated: true });
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  },

  register: async (email: string, password: string, exam_number: string) => {
    try {
      await apiClient.post('/auth/register', { email, password, exam_number });
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Registration failed');
    }
  },

  logout: () => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = Cookies.get('access_token');
    if (!token) {
      // 개발 환경: 로컬에서 Mock 사용자로 자동 로그인
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: '홍길동',
        exam_number: 'E2024001',
        role: 'student'
      };
      set({ user: mockUser, isAuthenticated: true, isLoading: false });
      return;
    }

    try {
      const response = await apiClient.get('/auth/me');
      set({ user: response.data, isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.error('Failed to check auth:', error);
      // 개발 환경: Mock 사용자로 대체
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: '홍길동',
        exam_number: 'E2024001',
        role: 'student'
      };
      set({ user: mockUser, isAuthenticated: true, isLoading: false });
    }
  },
}));


