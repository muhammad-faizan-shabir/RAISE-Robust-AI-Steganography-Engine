'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';
import { ROUTES, VALIDATION } from '@/lib/constants';
import toast from 'react-hot-toast';

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(VALIDATION.PASSWORD_MIN_LENGTH, `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [hasValidSession, setHasValidSession] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('=== Password Reset Debug Info ===');
        console.log('Current URL:', window.location.href);
        console.log('URL Hash:', window.location.hash);
        console.log('URL Search:', window.location.search);
        
        // Supabase's detectSessionInUrl should automatically handle the token exchange
        // when the page loads. We just need to check if we have a valid session.
        
        // Wait a bit for Supabase to process the URL
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('Session check:', { 
          hasSession: !!session, 
          userId: session?.user?.id,
          email: session?.user?.email,
          error: sessionError 
        });
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setErrorMessage('Failed to verify reset link. Please try again.');
          setHasValidSession(false);
        } else if (session && session.user) {
          console.log('✅ Valid session found for user:', session.user.email);
          setHasValidSession(true);
          setErrorMessage(null);
        } else {
          // Check if there's an error in the URL
          const urlParams = new URLSearchParams(window.location.search);
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          
          const error = urlParams.get('error') || hashParams.get('error');
          const errorDescription = urlParams.get('error_description') || hashParams.get('error_description');
          const errorCode = urlParams.get('error_code') || hashParams.get('error_code');
          
          console.log('URL Error Details:', { error, errorCode, errorDescription });
          
          if (error) {
            console.error('❌ URL error:', error, errorDescription);
            let friendlyMessage = errorDescription?.replace(/\+/g, ' ') || 
              'The password reset link is invalid or has expired.';
            
            // Add specific help for common errors
            if (errorCode === 'otp_expired') {
              friendlyMessage = 'The password reset link has expired. Password reset links are only valid for a short time. Please request a new one.';
            }
            
            setErrorMessage(friendlyMessage);
          } else {
            console.warn('⚠️ No session and no error in URL');
            setErrorMessage('No valid reset session found. Please request a new password reset link.');
          }
          setHasValidSession(false);
        }
        
        console.log('=== End Debug Info ===');
      } catch (error) {
        console.error('Error checking session:', error);
        setErrorMessage('An error occurred. Please try again.');
        setHasValidSession(false);
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();
    
    // Also listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 Auth state changed:', event, 'Has session:', !!session);
      
      if (event === 'PASSWORD_RECOVERY') {
        console.log('✅ Password recovery event detected');
        setHasValidSession(true);
        setErrorMessage(null);
        setIsCheckingSession(false);
      } else if (event === 'SIGNED_IN' && session) {
        console.log('✅ User signed in via recovery link');
        setHasValidSession(true);
        setErrorMessage(null);
        setIsCheckingSession(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!hasValidSession) {
      toast.error('Invalid or missing reset token');
      return;
    }

    setIsLoading(true);
    try {
      // Update password using Supabase (user must be authenticated via the reset link)
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      setResetSuccess(true);
      toast.success('Password reset successful!');
      
      // Sign out after successful password reset
      setTimeout(async () => {
        await supabase.auth.signOut();
      }, 2000);
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (resetSuccess) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-[#bfb48f]">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-[#252627]">
              Password Reset Successful!
            </h3>
            
            <p className="text-[#564e58]">
              Your password has been successfully reset. You can now login with your new password.
            </p>
            
            <div className="pt-4">
              <Link href={ROUTES.AUTH.LOGIN}>
                <Button
                  variant="gradient"
                  className="w-full h-12"
                >
                  Go to Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isCheckingSession) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-[#bfb48f]">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#904e55]"></div>
            </div>
            <p className="text-[#564e58]">
              Verifying reset link...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!hasValidSession || errorMessage) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-[#bfb48f]">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-[#252627]">
              Invalid Reset Link
            </h3>
            
            <p className="text-[#564e58]">
              {errorMessage || 'This password reset link is invalid or has expired. Please request a new one.'}
            </p>
            
            {errorMessage?.includes('expired') && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
                <p className="text-sm text-yellow-800 font-medium mb-2">
                  💡 Quick Fix:
                </p>
                <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
                  <li>Make sure to click the reset link immediately after receiving the email</li>
                  <li>Check that <code className="bg-yellow-100 px-1 rounded">http://localhost:3000/auth/reset-password</code> is added to Supabase Redirect URLs</li>
                  <li>Request a fresh reset link if this one has expired</li>
                </ul>
              </div>
            )}
            
            <div className="pt-4 space-y-3">
              <Link href={ROUTES.AUTH.FORGOT_PASSWORD}>
                <Button
                  variant="gradient"
                  className="w-full h-12"
                >
                  Request New Reset Link
                </Button>
              </Link>
              <Link href={ROUTES.AUTH.LOGIN}>
                <Button
                  variant="outline"
                  className="w-full h-12"
                >
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Input
            type="password"
            placeholder="Enter new password"
            leftIcon={<Lock className="w-5 h-5" />}
            className="h-12 bg-white border-2 border-[#bfb48f] focus:border-[#bfb48f]"
            {...register('password')}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
          <p className="mt-1 text-xs text-[#564e58]">
            At least {VALIDATION.PASSWORD_MIN_LENGTH} characters
          </p>
        </div>

        <div>
          <Input
            type="password"
            placeholder="Confirm new password"
            leftIcon={<Lock className="w-5 h-5" />}
            className="h-12 bg-white border-2 border-[#bfb48f] focus:border-[#bfb48f]"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button
          type="submit"
          variant="gradient"
          className="w-full h-12"
          disabled={isLoading}
        >
          {isLoading ? 'Resetting Password...' : 'Reset Password'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link 
          href={ROUTES.AUTH.LOGIN}
          className="text-[#904e55] hover:underline text-sm font-medium"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}

