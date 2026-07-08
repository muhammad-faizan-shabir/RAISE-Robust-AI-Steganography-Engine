'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import Loading from '@/components/ui/Loading';

/**
 * OAuth Callback Page
 * Handles OAuth redirects from Supabase (Google, GitHub)
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      try {
        // Sync session with backend
        const user = await authApi.syncSessionWithBackend();
        
        if (user) {
          // Successfully authenticated, redirect to dashboard
          router.push(ROUTES.DASHBOARD);
        } else {
          // No session found, redirect to login
          setError('Authentication failed. Please try again.');
          setTimeout(() => {
            router.push(ROUTES.AUTH.LOGIN);
          }, 2000);
        }
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err.message || 'Authentication failed. Please try again.');
        setTimeout(() => {
          router.push(ROUTES.AUTH.LOGIN);
        }, 2000);
      }
    }

    handleCallback();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f2efe9]">
        <div className="text-center space-y-4">
          <div className="text-red-600 text-lg font-medium">{error}</div>
          <p className="text-[#564e58] text-sm">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f2efe9]">
      <div className="text-center space-y-4">
        <Loading />
        <p className="text-[#564e58] text-lg">Completing authentication...</p>
      </div>
    </div>
  );
}

