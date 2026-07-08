'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, Key, Save, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usersApi } from '@/lib/api';
import { ROUTES, VALIDATION } from '@/lib/constants';
import { SidebarLayout } from '@/components/layout';
import toast from 'react-hot-toast';

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, checkAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: '',
    username: '',
    email: '',
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
      setIsLoading(false);
    };
    initAuth();
  }, [checkAuth]);

  useEffect(() => {
    // Check URL parameter for tab
    const tab = searchParams.get('tab');
    if (tab === 'password') {
      setActiveTab('password');
    } else {
      setActiveTab('profile');
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(ROUTES.AUTH.LOGIN);
    } else if (user) {
      setProfileData({
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
      });
    }
  }, [isAuthenticated, isLoading, user, router]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileData.username || !profileData.username.trim()) {
      toast.error('Username is required');
      return;
    }

    if (profileData.username.length < VALIDATION.USERNAME_MIN_LENGTH) {
      toast.error(`Username must be at least ${VALIDATION.USERNAME_MIN_LENGTH} characters`);
      return;
    }

    setIsUpdatingProfile(true);
    try {
      await usersApi.updateProfile({
        username: profileData.username,
      });
      
      toast.success('Profile updated successfully');
      await checkAuth(); // Refresh user data
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('All password fields are required');
      return;
    }

    if (passwordData.newPassword.length < VALIDATION.PASSWORD_MIN_LENGTH) {
      toast.error(`Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    setIsChangingPassword(true);
    try {
      await usersApi.changePassword({
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
      });
      
      toast.success('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Account Settings</h1>
          <p className="text-[#f2efe9]/60 text-lg">Manage your profile and security settings</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-[#904e55] to-[#564e58] text-white shadow-lg'
                : 'bg-white/5 text-[#f2efe9]/60 hover:bg-white/10'
            }`}
          >
            <User className="h-5 w-5" />
            Edit Profile
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'password'
                ? 'bg-gradient-to-r from-[#904e55] to-[#564e58] text-white shadow-lg'
                : 'bg-white/5 text-[#f2efe9]/60 hover:bg-white/10'
            }`}
          >
            <Key className="h-5 w-5" />
            Change Password
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="rounded-2xl bg-gradient-to-b from-[#131417] to-[#0a0b0d] p-8 shadow-xl shadow-black/40 ring-1 ring-white/5">
            <h2 className="text-2xl font-bold text-white mb-6">Profile Information</h2>
            
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div>
                <label className="block text-[#f2efe9]/80 text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[#f2efe9]/50 cursor-not-allowed"
                />
                <p className="text-[#f2efe9]/40 text-xs mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-[#f2efe9]/80 text-sm font-medium mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  value={profileData.username}
                  onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                  placeholder="Choose a unique username"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[#f2efe9] placeholder-[#f2efe9]/30 focus:outline-none focus:ring-2 focus:ring-[#904e55]/50 focus:border-[#904e55]/50 transition-all"
                  minLength={VALIDATION.USERNAME_MIN_LENGTH}
                  maxLength={VALIDATION.USERNAME_MAX_LENGTH}
                  required
                />
                <p className="text-[#f2efe9]/40 text-xs mt-1">
                  {VALIDATION.USERNAME_MIN_LENGTH}-{VALIDATION.USERNAME_MAX_LENGTH} characters
                </p>
              </div>

              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#904e55] to-[#564e58] rounded-xl text-white font-medium hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdatingProfile ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Save Changes
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="rounded-2xl bg-gradient-to-b from-[#131417] to-[#0a0b0d] p-8 shadow-xl shadow-black/40 ring-1 ring-white/5">
            <h2 className="text-2xl font-bold text-white mb-6">Change Password</h2>
            
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div>
                <label className="block text-[#f2efe9]/80 text-sm font-medium mb-2">
                  Current Password *
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Enter your current password"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[#f2efe9] placeholder-[#f2efe9]/30 focus:outline-none focus:ring-2 focus:ring-[#bfb48f]/50 focus:border-[#bfb48f]/50 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-[#f2efe9]/80 text-sm font-medium mb-2">
                  New Password *
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Enter your new password"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[#f2efe9] placeholder-[#f2efe9]/30 focus:outline-none focus:ring-2 focus:ring-[#bfb48f]/50 focus:border-[#bfb48f]/50 transition-all"
                  minLength={VALIDATION.PASSWORD_MIN_LENGTH}
                  required
                />
                <p className="text-[#f2efe9]/40 text-xs mt-1">
                  Minimum {VALIDATION.PASSWORD_MIN_LENGTH} characters
                </p>
              </div>

              <div>
                <label className="block text-[#f2efe9]/80 text-sm font-medium mb-2">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Confirm your new password"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-[#f2efe9] placeholder-[#f2efe9]/30 focus:outline-none focus:ring-2 focus:ring-[#bfb48f]/50 focus:border-[#bfb48f]/50 transition-all"
                  required
                />
              </div>

              <div className="bg-[#7a9eb1]/10 border border-[#7a9eb1]/30 rounded-xl p-4">
                <p className="text-[#7a9eb1] text-sm">
                  <strong>Security Tips:</strong> Use a strong password with a mix of letters, numbers, and symbols. 
                  Avoid using personal information or common words.
            </p>
              </div>

              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#bfb48f] to-[#9f9470] rounded-xl text-white font-medium hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Changing Password...
                  </>
                ) : (
                  <>
                    <Key className="h-5 w-5" />
                    Change Password
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsContent />
    </Suspense>
  );
}
