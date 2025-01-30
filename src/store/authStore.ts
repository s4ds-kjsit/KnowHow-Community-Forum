import { create } from 'zustand';
import { User } from '../types';
import * as auth from '../lib/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  checkUser: () => Promise<void>;
  handleCallback: (code: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  signInWithGoogle: async () => {
    try {
      await auth.signInWithGoogle();
    } catch (error) {
      console.error('Error signing in:', error);
    }
  },
  handleCallback: async (code: string) => {
    try {
      const googleUser = await auth.handleGoogleCallback(code);
      const user = await auth.findOrCreateUser(googleUser);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isLoading: false });
    } catch (error) {
      console.error('Error handling callback:', error);
      set({ user: null, isLoading: false });
    }
  },
  signOut: async () => {
    try {
      await auth.signOut();
      set({ user: null });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  },
  checkUser: async () => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        const freshUser = await auth.getUser(user.id);
        set({ user: freshUser, isLoading: false });
      } else {
        set({ user: null, isLoading: false });
      }
    } catch (error) {
      console.error('Error checking user:', error);
      set({ user: null, isLoading: false });
    }
  },
}));