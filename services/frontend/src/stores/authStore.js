import { create } from 'zustand';
import axios from 'axios';

// BASE URL WITHOUT /api/v1
const API_URL = 'http://localhost:5000';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,

  login: async (credentialResponse) => {
    set({ isLoading: true, error: null });
    try {
      const { credential } = credentialResponse;
      const url = `${API_URL}/api/v1/auth/google`;
      console.log('🔐 Sending to:', url);

      const response = await axios.post(url, { credential });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({ user, token, isLoading: false });
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      console.error('❌ Login error:', msg);
      set({ isLoading: false, error: msg });
      return { success: false };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },

  fetchUser: async () => {
    try {
      const token = get().token;
      if (!token) return;
      const url = `${API_URL}/api/v1/auth/me`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ user: response.data.user });
    } catch (error) {
      localStorage.removeItem('token');
      set({ token: null, user: null });
    }
  },

  getToken: () => get().token,
  setUser: (user) => set({ user }),
}));
