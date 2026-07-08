'use client';

import TechEarth from '@/components/TechEarth';
import Image from 'next/image';
import ForgotPasswordForm from '@/features/auth/components/ForgotPasswordForm';
import { useMobile } from '@/hooks/useMobile';

export default function ForgotPasswordPage() {
  const isMobile = useMobile(1024);

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Left Side (Mobile Top) - Content */}
      <div className="w-full lg:w-1/2 bg-[#f2efe9] flex flex-col items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-xl space-y-12">
          <div className="space-y-6 text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-[#252627] leading-tight">
              Reset Your<br />Password
            </h2>
            <p className="text-[#564e58] text-lg">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>
          </div>
          
          {/* Forgot Password Form */}
          <ForgotPasswordForm />
        </div>
      </div>

      {/* Right Side (Mobile Bottom) - Visuals - Hidden on Mobile */}
      {!isMobile && (
        <div className="w-full lg:w-1/2 bg-[#252627] flex flex-col p-0 relative overflow-hidden">
          <div className="flex-1 flex flex-col justify-between">
            <div className="w-full flex flex-col items-center pt-24">
              <div className="flex items-center gap-4">
                <Image 
                  src="/assets/Logo.png" 
                  alt="RAISE Logo" 
                  width={80} 
                  height={80}
                  className="object-contain"
                />
                <div>
                  <h1 className="text-5xl font-bold text-[#f2efe9] tracking-[0.2em]">RAISE</h1>
                  <p className="text-xs text-[#f2efe9]/80 mt-1">Robust AI Steganography Engine</p>
                </div>
              </div>
            </div>
            <div className="w-full flex items-end justify-center" style={{ marginBottom: '-50%' }}>
              <TechEarth />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

