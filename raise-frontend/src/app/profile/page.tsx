'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Calendar, Shield, Edit, Key, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/lib/constants';
import { SidebarLayout } from '@/components/layout';
import { formatDate } from '@/lib/utils';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
      setIsLoading(false);
    };
    initAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(ROUTES.AUTH.LOGIN);
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push(ROUTES.HOME);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#252627] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#904e55] border-t-transparent mx-auto mb-4"></div>
          <p className="text-[#f2efe9]/80 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarLayout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Profile Header */}
        <div className="rounded-2xl bg-gradient-to-b from-[#131417] to-[#0a0b0d] p-8 shadow-xl shadow-black/40 ring-1 ring-white/5 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="h-24 w-24 bg-gradient-to-br from-[#904e55] to-[#564e58] rounded-2xl flex items-center justify-center shadow-lg">
              <User className="h-12 w-12 text-white" />
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-white mb-2">@{user.username || 'user'}</h1>
              <p className="text-[#f2efe9]/60 mb-4">{user.email}</p>
              
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs font-medium border border-green-500/30 flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 bg-green-400 rounded-full"></div>
                  Active
                </span>
                <span className="px-3 py-1 bg-[#7a9eb1]/20 text-[#7a9eb1] rounded-lg text-xs font-medium border border-[#7a9eb1]/30">
                  Verified
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="rounded-2xl bg-gradient-to-b from-[#131417] to-[#0a0b0d] p-8 shadow-xl shadow-black/40 ring-1 ring-white/5 mb-8">
          <h2 className="text-xl font-bold text-white mb-6">Account Information</h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
              <div className="h-10 w-10 bg-[#7a9eb1]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="h-5 w-5 text-[#7a9eb1]" />
              </div>
              <div className="flex-1">
                <p className="text-[#f2efe9]/50 text-xs mb-1">Email Address</p>
                <p className="text-[#f2efe9] font-medium">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
              <div className="h-10 w-10 bg-[#904e55]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-[#904e55]" />
              </div>
              <div className="flex-1">
                <p className="text-[#f2efe9]/50 text-xs mb-1">Username</p>
                <p className="text-[#f2efe9] font-medium">@{user.username || 'Not set'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
              <div className="h-10 w-10 bg-[#f6d6cf]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="h-5 w-5 text-[#f6d6cf]" />
              </div>
              <div className="flex-1">
                <p className="text-[#f2efe9]/50 text-xs mb-1">Member Since</p>
                <p className="text-[#f2efe9] font-medium">{formatDate(user.created_at)}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
              <div className="h-10 w-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-[#f2efe9]/50 text-xs mb-1">Account Status</p>
                <p className="text-green-400 font-medium">Active & Verified</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl bg-gradient-to-b from-[#131417] to-[#0a0b0d] p-8 shadow-xl shadow-black/40 ring-1 ring-white/5">
          <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Link href={ROUTES.SETTINGS} className="group">
              <div className="p-5 bg-white/5 rounded-xl border border-white/5 hover:border-[#7a9eb1]/50 hover:bg-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-[#7a9eb1]/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Edit className="h-6 w-6 text-[#7a9eb1]" />
                </div>
                <div>
                    <h3 className="text-white font-semibold mb-1">Edit Profile</h3>
                    <p className="text-[#f2efe9]/60 text-sm">Update your information</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href={`${ROUTES.SETTINGS}?tab=password`} className="group">
              <div className="p-5 bg-white/5 rounded-xl border border-white/5 hover:border-[#bfb48f]/50 hover:bg-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-[#bfb48f]/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Key className="h-6 w-6 text-[#bfb48f]" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Change Password</h3>
                    <p className="text-[#f2efe9]/60 text-sm">Update your password</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href={ROUTES.STEGO.HISTORY} className="group">
              <div className="p-5 bg-white/5 rounded-xl border border-white/5 hover:border-[#904e55]/50 hover:bg-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-[#904e55]/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Shield className="h-6 w-6 text-[#904e55]" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">View History</h3>
                    <p className="text-[#f2efe9]/60 text-sm">See your operations</p>
                  </div>
                </div>
              </div>
            </Link>

            <button onClick={handleLogout} className="group text-left">
              <div className="p-5 bg-white/5 rounded-xl border border-white/5 hover:border-red-500/50 hover:bg-red-500/5 transition-all">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-red-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <LogOut className="h-6 w-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Sign Out</h3>
                    <p className="text-[#f2efe9]/60 text-sm">Logout from your account</p>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
