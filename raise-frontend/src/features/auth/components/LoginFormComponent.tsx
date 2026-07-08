'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock } from 'lucide-react';
import { SiGoogle, SiGithub } from 'react-icons/si';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/lib/constants';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginFormComponent() {
  const router = useRouter();
  const { login, signInWithGoogle, isLoading } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      // Use window.location for a full page navigation to ensure clean state
      window.location.href = ROUTES.DASHBOARD;
    } catch (error) {
      // Error handled in useAuth hook
      console.error('Login error:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // User will be redirected to Google OAuth
    } catch (error) {
      // Error handled in useAuth hook
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="space-y-3">
        <Button 
          variant="outline" 
          className="w-full justify-center gap-3 h-12 bg-white"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          type="button"
        >
          <SiGoogle className="w-5 h-5" />
          <span>Continue with Google</span>
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#bfb48f]" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-[#f2efe9] text-[#564e58]">OR</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            type="email"
            placeholder="Enter your email address"
            leftIcon={<Mail className="w-5 h-5" />}
            className="h-12 bg-white border-2 border-[#bfb48f] focus:border-[#bfb48f]"
            {...register('email')}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Input
            type="password"
            placeholder="Enter your password"
            leftIcon={<Lock className="w-5 h-5" />}
            className="h-12 bg-white border-2 border-[#bfb48f] focus:border-[#bfb48f]"
            {...register('password')}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-end">
          <Link
            href={ROUTES.AUTH.FORGOT_PASSWORD}
            className="text-sm text-[#904e55] hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="gradient"
          className="w-full h-12"
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <div className="space-y-3 text-center">
        <p className="text-[#564e58] text-sm">
          Don&apos;t have an account?{' '}
          <Link href={ROUTES.AUTH.REGISTER} className="text-[#904e55] hover:underline font-medium">
            Register here
          </Link>
        </p>
        <p className="text-[#564e58] text-xs">
          By continuing, you agree to RAISE&apos;s{' '}
          <Link href="/terms" className="text-[#904e55] hover:underline">
            Terms of Service
          </Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-[#904e55] hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}

