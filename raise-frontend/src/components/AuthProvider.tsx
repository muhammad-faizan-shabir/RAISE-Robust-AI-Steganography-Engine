'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { authApi } from '@/lib/api';
import { STORAGE_KEYS } from '@/lib/constants';

/**
 * Auth Provider Component
 * Listens to Supabase auth state changes and syncs with backend
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Check initial session and sync with backend
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token && session?.user) {
        // Update token in storage if session exists
        localStorage.setItem(STORAGE_KEYS.SUPABASE_TOKEN, session.access_token);
        
        // Check if user is already synced
        const existingUser = localStorage.getItem(STORAGE_KEYS.USER);
        if (!existingUser) {
          // Sync with backend if not already synced
          try {
            await authApi.syncSessionWithBackend();
            console.log('Initial session synced with backend');
          } catch (error) {
            console.error('Failed to sync initial session with backend:', error);
          }
        }
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Supabase auth event:', event);

        if (event === 'SIGNED_IN' && session) {
          // User signed in, store token
          // Note: Backend sync is handled by login/register functions, not here
          // This prevents duplicate sync calls
          localStorage.setItem(STORAGE_KEYS.SUPABASE_TOKEN, session.access_token);
          console.log('Token stored, sync will be handled by auth function');
        } else if (event === 'SIGNED_OUT') {
          // User signed out, clear storage
          localStorage.removeItem(STORAGE_KEYS.SUPABASE_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          // Token refreshed, update stored token
          localStorage.setItem(STORAGE_KEYS.SUPABASE_TOKEN, session.access_token);
          console.log('Token refreshed successfully');
        } else if (event === 'USER_UPDATED' && session) {
          // User data updated
          localStorage.setItem(STORAGE_KEYS.SUPABASE_TOKEN, session.access_token);
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return <>{children}</>;
}

