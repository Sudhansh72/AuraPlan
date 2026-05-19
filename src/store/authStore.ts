import { create } from 'zustand';
import type { User } from '../types/plan';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

const getInitialToken = () => {
  try {
    return localStorage.getItem('auraplan_token');
  } catch {
    return null;
  }
};

const getInitialUser = () => {
  try {
    const userJson = localStorage.getItem('auraplan_user');
    return userJson ? JSON.parse(userJson) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getInitialUser(),
  token: getInitialToken(),
  isAuthenticated: !!getInitialToken(),
  setAuth: (user, token) => {
    localStorage.setItem('auraplan_token', token);
    localStorage.setItem('auraplan_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('auraplan_token');
    localStorage.removeItem('auraplan_user');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
