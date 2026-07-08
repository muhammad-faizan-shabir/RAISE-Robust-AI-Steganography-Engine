'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Lock } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES, VALIDATION } from '@/lib/constants';

const registerDetailsSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must be at most 255 characters'),
  password: z
    .string()
    .min(VALIDATION.PASSWORD_MIN_LENGTH, `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterDetailsFormData = z.infer<typeof registerDetailsSchema>;

interface RegisterDetailsFormProps {
  email: string;
  onBack: () => void;
}

export default function RegisterDetailsForm({ email, onBack }: RegisterDetailsFormProps) {
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterDetailsFormData>({
    resolver: zodResolver(registerDetailsSchema),
  });

  const onSubmit = async (data: RegisterDetailsFormData) => {
    try {
      const { confirmPassword, ...registerData } = data;
      await registerUser({
        email,
        ...registerData,
      });
      // Use window.location for a full page navigation to ensure clean state
      window.location.href = ROUTES.DASHBOARD;
    } catch (error) {
      // Error handled in useAuth hook
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold text-[#252627] mb-2">Complete Sign Up</h3>
        <p className="text-[#564e58] text-sm">
          Creating account for <span className="font-medium">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            type="text"
            placeholder="Enter your full name"
            leftIcon={<User className="w-5 h-5" />}
            className="h-12 bg-white border-2 border-[#bfb48f] focus:border-[#bfb48f]"
            {...register('name')}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Input
            type="password"
            placeholder="Create a password"
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
            placeholder="Confirm your password"
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
          className="w-full h-12 mt-6"
          disabled={isLoading}
        >
          {isLoading ? 'Creating account...' : 'Create Account'}
        </Button>

        <div className="mt-4 text-center">
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
      </form>
    </div>
  );
}

