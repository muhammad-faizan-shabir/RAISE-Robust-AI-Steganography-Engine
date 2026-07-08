/**
 * Authentication Hook
 */

import { create } from 'zustand';
import { authApi } from '@/lib/api';
import type { User, LoginCredentials, RegisterData } from '@/types';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: typeof window !== 'undefined' ? authApi.getStoredUser() : null,
  isAuthenticated: typeof window !== 'undefined' ? authApi.isAuthenticated() : false,
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await authApi.login(credentials);
      set({ user, isAuthenticated: true, isLoading: false });
      toast.success('Login successful!');
      // Don't throw error on success - let the component handle redirect
    } catch (error: any) {
      const message = error.message || 'Login failed';
      set({ error: message, isLoading: false });
      toast.error(message);
      throw error; // Only throw on actual error
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await authApi.register(data);
      set({ user, isAuthenticated: true, isLoading: false });
      toast.success('Registration successful!');
      // Don't throw error on success - let the component handle redirect
    } catch (error: any) {
      const message = error.message || 'Registration failed';
      set({ error: message, isLoading: false });
      toast.error(message);
      throw error; // Only throw on actual error
    }
  },

  signInWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      await authApi.signInWithGoogle();
      // User will be redirected to Google OAuth, then back to callback page
      // Don't update state here, it will be handled by the callback
    } catch (error: any) {
      const message = error.message || 'Google sign-in failed';
      set({ error: message, isLoading: false });
      toast.error(message);
      throw error;
    }
  },

  signInWithGitHub: async () => {
    set({ isLoading: true, error: null });
    try {
      await authApi.signInWithGitHub();
      // User will be redirected to GitHub OAuth, then back to callback page
      // Don't update state here, it will be handled by the callback
    } catch (error: any) {
      const message = error.message || 'GitHub sign-in failed';
      set({ error: message, isLoading: false });
      toast.error(message);
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authApi.logout();
      set({ user: null, isAuthenticated: false, isLoading: false });
      toast.success('Logged out successfully');
    } catch (error: any) {
      set({ isLoading: false });
      toast.error('Logout failed');
    }
  },

  checkAuth: async () => {
    // First check if we have a token
    if (!authApi.isAuthenticated()) {
      set({ isAuthenticated: false, user: null });
      return;
    }

    // Check if we already have user data in localStorage
    const storedUser = authApi.getStoredUser();
    if (storedUser) {
      // Use stored user data immediately
      set({ user: storedUser, isAuthenticated: true, isLoading: false });
      
      // Optionally refresh user data in background
      try {
        const freshUser = await authApi.getCurrentUser();
        set({ user: freshUser, isAuthenticated: true, isLoading: false });
      } catch (error) {
        // Keep using stored user data if refresh fails
        console.warn('Failed to refresh user data, using cached data');
      }
      return;
    }

    // No stored user, fetch from API
    set({ isLoading: true });
    try {
      const user = await authApi.getCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
