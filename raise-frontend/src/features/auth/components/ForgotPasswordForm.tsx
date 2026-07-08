'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { authApi } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import toast from 'react-hot-toast';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      await authApi.forgotPassword(data.email);
      setEmailSent(true);
      toast.success('Password reset email sent!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
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
              Check Your Email
            </h3>
            
            <p className="text-[#564e58]">
              We&apos;ve sent a password reset link to:
            </p>
            
            <p className="text-[#904e55] font-medium">
              {getValues('email')}
            </p>
            
            <p className="text-[#564e58] text-sm">
              Click the link in the email to reset your password. 
              If you don&apos;t see it, check your spam folder.
            </p>
            
            <div className="pt-4 space-y-3">
              <Link href={ROUTES.AUTH.LOGIN} className="block">
                <Button
                  variant="gradient"
                  className="w-full h-12"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Login
                </Button>
              </Link>
              
              <button
                onClick={() => setEmailSent(false)}
                className="text-[#904e55] hover:underline text-sm"
              >
                Try a different email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

        <Button
          type="submit"
          variant="gradient"
          className="w-full h-12"
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </form>

      <div className="text-center space-y-3">
        <Link 
          href={ROUTES.AUTH.LOGIN}
          className="inline-flex items-center text-[#904e55] hover:underline text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Login
        </Link>
        
        <p className="text-[#564e58] text-sm">
          Don&apos;t have an account?{' '}
          <Link href={ROUTES.AUTH.REGISTER} className="text-[#904e55] hover:underline font-medium">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

