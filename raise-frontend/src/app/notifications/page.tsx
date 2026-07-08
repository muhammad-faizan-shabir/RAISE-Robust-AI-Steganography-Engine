'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, Trash2, CheckCheck, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { Loading } from '@/components/ui';
import { notificationsApi } from '@/lib/api';
import { ROUTES } from '@/lib/constants';
import { SidebarLayout } from '@/components/layout';
import { formatRelativeTime } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import type { Notification } from '@/types';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
      setIsAuthLoading(false);
    };
    initAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push(ROUTES.AUTH.LOGIN);
    } else if (!isAuthLoading && isAuthenticated) {
      loadNotifications();
    }
  }, [isAuthenticated, isAuthLoading, router]);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await notificationsApi.getNotifications({ page_size: 50 });
      setNotifications(response.items);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      // Don't show error toast for now - just show empty state
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationsApi.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-red-400" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      default: return <Info className="h-5 w-5 text-[#7a9eb1]" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'warning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-[#7a9eb1]/20 text-[#7a9eb1] border-[#7a9eb1]/30';
    }
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#252627] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#904e55] border-t-transparent mx-auto mb-4"></div>
          <p className="text-[#f2efe9]/80 text-lg">Loading notifications...</p>
        </div>
      </div>
    );
    }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <SidebarLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-gradient-to-br from-[#904e55] to-[#564e58] rounded-xl flex items-center justify-center">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Notifications</h1>
                <p className="text-[#f2efe9]/70">
                  {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#904e55]/20 border border-[#904e55]/30 text-[#f6d6cf] hover:bg-[#904e55]/30 transition-colors"
              >
                <CheckCheck className="h-4 w-4" />
                <span className="text-sm font-medium">Mark All Read</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="rounded-2xl bg-gradient-to-b from-[#131417] to-[#0a0b0d] p-12 shadow-xl shadow-black/40 ring-1 ring-white/5 text-center">
            <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="h-10 w-10 text-[#f2efe9]/40" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No notifications yet</h3>
            <p className="text-[#f2efe9]/60 mb-6">
              We'll notify you when something important happens
            </p>
            <Link href={ROUTES.DASHBOARD}>
              <button className="px-6 py-3 bg-gradient-to-r from-[#904e55] to-[#564e58] rounded-xl text-white font-medium hover:brightness-110 transition-all">
                Back to Dashboard
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-xl bg-gradient-to-b from-[#131417] to-[#0a0b0d] p-6 shadow-lg shadow-black/20 ring-1 transition-all hover:ring-white/10 ${
                  !notification.is_read ? 'ring-[#904e55]/50' : 'ring-white/5'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="h-10 w-10 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getNotificationColor(notification.type)}`}>
                        {notification.type}
                      </span>
                      {!notification.is_read && (
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 bg-[#904e55] rounded-full animate-pulse"></div>
                          <span className="text-xs text-[#904e55] font-medium">New</span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-white mb-1">
                      {notification.title}
                    </h3>
                    <p className="text-[#f2efe9]/70 text-sm mb-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-[#f2efe9]/50">
                      {formatRelativeTime(notification.created_at)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!notification.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#f2efe9]/80 text-sm font-medium transition-colors"
                      >
                        Mark Read
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-[#f2efe9]/60 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
