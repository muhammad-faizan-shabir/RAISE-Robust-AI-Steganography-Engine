'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Mail } from 'lucide-react';
import { SiGoogle, SiGithub } from 'react-icons/si';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

interface RegisterEmailStepProps {
  onContinue: (email: string) => void;
}

export default function RegisterEmailStep({ onContinue }: RegisterEmailStepProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const { signInWithGoogle, isLoading } = useAuth();

  const handleContinue = () => {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    onContinue(email);
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

      <div className="space-y-3">
        <Input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError('');
          }}
          className="h-12 bg-white border-2 border-[#bfb48f] focus:border-[#bfb48f]"
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        <Button 
          variant="gradient" 
          className="w-full h-12"
          onClick={handleContinue}
        >
          <Mail className="w-5 h-5 mr-2" />
          Continue with Email
        </Button>
      </div>

      <div className="space-y-3 text-center">
        <p className="text-[#564e58] text-sm">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-[#904e55] hover:underline font-medium">
            Login here
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

