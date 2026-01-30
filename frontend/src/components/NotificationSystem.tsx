'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { X, Check, Info, AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationSystemProps {
  notifications?: Notification[];
  onNotificationClick?: (notification: Notification) => void;
  onMarkAsRead?: (notificationId: string) => void;
  onClearAll?: () => void;
}

export function NotificationSystem({
  notifications = [],
  onNotificationClick,
  onMarkAsRead,
  onClearAll
}: NotificationSystemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const { user } = useAuth();

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const handleNotificationClick = (notification: Notification) => {
    onNotificationClick?.(notification);
    if (!notification.read) {
      onMarkAsRead?.(notification.id);
    }
    setIsOpen(false);
  };

  const getNotificationIcon = (notification: Notification) => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationColor = (notification: Notification) => {
    switch (notification.type) {
      case 'success':
        return 'border-green-500 bg-green-50 dark:bg-green-900/10';
      case 'error':
        return 'border-red-500 bg-red-50 dark:bg-red-900/10';
      case 'warning':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10';
      default:
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900/10';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Notification Bell */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2"
        >
          <div className="w-5 h-5 relative">
            <svg className="w-5 h-5 text-zinc-600 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
        </Button>
      </div>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end pt-16 pr-4">
          <div className="fixed inset-0 bg-black/20" onClick={() => setIsOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Notifications</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Filter Tabs */}
            <div className="flex border-b border-zinc-200 dark:border-zinc-700">
              {(['all', 'unread', 'read'] as const).map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`flex-1 px-4 py-2 text-sm font-medium capitalize ${
                    filter === filterType
                      ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  {filterType}
                  {filterType === 'unread' && unreadCount > 0 && (
                    <span className="ml-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full px-2 py-0.5 text-xs">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <Info className="w-8 h-8 mx-auto text-zinc-400" />
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    No notifications
                  </p>
                </div>
              ) : (
                <div className="space-y-2 p-2">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 rounded-lg border-l-4 transition-all cursor-pointer hover:shadow-md ${getNotificationColor(notification)}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {getNotificationIcon(notification)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div>
                            <p className="text-sm font-semibold mb-1">{notification.title}</p>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400">
                              {notification.message}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                              {new Date(notification.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {notification.action && (
                          <button
                            onClick={notification.action.onClick}
                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium ml-auto"
                          >
                            {notification.action.label}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Close Button */}
            <div className="flex justify-end p-4 border-t border-zinc-200 dark:border-zinc-700">
              <button
                onClick={() => setIsOpen(false)}
                className="text-sm text-zinc-600 dark:text-zinc-400 hover:underline font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}