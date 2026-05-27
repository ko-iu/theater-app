import { create } from 'zustand';
import { api } from '../services/api';

interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  name?: string;
  avatar_url?: string;
  role: string;
  created_at?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (firstName: string, lastName: string, phone?: string, email?: string) => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,

  login: async (email: string, password: string) => {
    const user = await api.login(email, password);
    console.log('Login successful, user:', user);
    set({ user });
  },

  register: async (email: string, password: string, firstName: string, lastName: string, phone?: string) => {
    const user = await api.register(email, password, firstName, lastName, phone);
    set({ user });
  },

  logout: async () => {
    await api.logout();
    set({ user: null });
  },

  updateProfile: async (firstName: string, lastName: string, phone?: string, email?: string) => {
    const updated = await api.updateProfile(firstName, lastName, phone, email);
    set({ user: updated });
  },

  loadUser: async () => {
    const { user } = get();
    if (user) {
      set({ isLoading: false });
      return;
    }
    
    try {
      if (api.getToken()) {
        const user = await api.getProfile();
        set({ user, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      api.clearToken();
      set({ user: null, isLoading: false });
    }
  },
}));