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
      console.log("OAuth Code received:", code);
      
      const googleUser = await auth.handleGoogleCallback(code);
      console.log("Google User Response:", googleUser);
  
      if (!googleUser || !googleUser.access_token) {
        throw new Error("Invalid Google user response");
      }
  
      const user = await auth.findOrCreateUser(googleUser);
      console.log("User from Database:", user);
  
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isLoading: false });
    } catch (error) {
      console.error("Error handling callback:", error);
      set({ user: null, isLoading: false });
    }
  };
  
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
      console.log("Running checkUser...");
      const savedUser = localStorage.getItem("user");
  
      if (!savedUser) {
        console.log("No user in localStorage. Redirecting to login.");
        set({ user: null, isLoading: false });
        return;
      }
  
      const user = JSON.parse(savedUser);
      console.log("User found in localStorage:", user);
  
      const freshUser = await auth.getUser(user.id);
      console.log("Fetched fresh user data:", freshUser);
  
      set({ user: freshUser, isLoading: false });
    } catch (error) {
      console.error("Error checking user:", error);
      set({ user: null, isLoading: false });
    }
  };
  
}));

export async function handleGoogleCallback(code: string) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: REDIRECT_URI,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to exchange code for token");
  }

  return response.json(); // Should return access_token
}
