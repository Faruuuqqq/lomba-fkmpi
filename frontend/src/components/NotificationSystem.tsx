'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle, Bell, Check, Trash2, XCircle } from 'lucide-react';
import { useGamification } from '@/contexts/GamificationContext';
import { Modal } from './Modal';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';
export type NotificationPriority = 'low' | 'medium' | 'high';

interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: Date;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  isRead: boolean;
}

interface NotificationSystemProps {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export function NotificationSystem({ markAsRead, markAllAsRead, clearAll }: NotificationSystemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    loadNotifications();

    const channel = new BroadcastChannel('mitra-notifications');
    channel.onmessage = (event) => {
      if (event.data?.type === 'notification') {
        const newNotification: Notification = {
          id: event.data.id,
          type: event.data.priority === 'high' ? 'error' : event.data.priority === 'medium' ? 'warning' : 'info',
          priority: event.data.priority,
          title: event.data.title,
          message: event.data.message,
          timestamp: new Date(event.data.timestamp),
          isRead: false,
          action: {
            label: 'View Details',
            onClick: () => {
              channel.postMessage({ type: 'read', id: event.data.id });
            },
          },
        };
        setNotifications(prev => [newNotification, ...prev]);
      }
    };

    return () => channel.close();
  }, []);

  const loadNotifications = async () => {
    setNotifications([
      {
        id: '1',
        type: 'success',
        priority: 'low',
        title: 'Welcome to MITRA AI',
        message: 'You have successfully created your account. Start by writing 150 words to unlock AI assistance.',
        timestamp: new Date(Date.now() - 300000),
        isRead: true,
      },
      {
        id: '2',
        type: 'info',
        priority: 'low',
        title: 'Writing Goal Progress',
        message: 'You have written 0 words so far. Keep going!',
        timestamp: new Date(Date.now() - 180000),
        isRead: false,
      },
      {
        id: '3',
        type: 'warning',
        priority: 'medium',
        title: 'AI Usage Update',
        message: 'You have 100 tokens available for AI features.',
        timestamp: new Date(Date.now() - 60000),
        isRead: false,
        action: {
          label: 'View Token Balance',
          onClick: () => {
            window.open('/gamification', '_blank');
          },
        },
      },
    ]);
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    );
    markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true })),
    );
    markAllAsRead();
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      setNotifications([]);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.action?.onClick) {
      notification.action.onClick();
    }
    handleMarkAsRead(notification.id);
  };

  const getNotificationIcon = (notification: Notification) => {
    if (notification.type === 'success') {
      return <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />;
    } else if (notification.type === 'error') {
      return <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />;
    } else if (notification.type === 'warning') {
      return <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    } else {
      return <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getNotificationColor = (notification: Notification) => {
    if (!notification.isRead) {
      if (notification.priority === 'high') {
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      } else if (notification.priority === 'medium') {
        return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
      } else {
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      }
    }
    return 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700';
  };

  const getNotificationTitleColor = (notification: Notification) => {
    if (notification.type === 'error') {
      return 'text-red-600 dark:text-red-400';
    } else if (notification.type === 'warning') {
      return 'text-amber-600 dark:text-amber-400';
    } else if (notification.type === 'success') {
      return 'text-green-600 dark:text-green-400';
    }
    return 'text-zinc-700 dark:text-zinc-300';
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') {
      return !n.isRead;
    }
    if (filter === 'all') {
      return true;
    }
    return false;
  });

  return (
    <>
      {/* Notification Bell Button */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="relative p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full hover:shadow-lg hover:shadow-xl transition-all"
        >
          <Bell className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 bg-red-600 text-white rounded-full text-xs font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notifications Panel */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-end z-50 p-4">
          <div className="w-full max-w-md bg-white dark:bg-zinc-800 rounded-lg shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-700">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Notifications</h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  Mark All Read
                </button>
                <button
                  onClick={handleClearAll}
                  className="text-sm text-red-600 dark:text-red-400 hover:underline font-medium"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 p-4 pt-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                filter === 'unread'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-[60vh] overflow-y-auto">
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
                          <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                            {notification.timestamp
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
                </div>
              ))}
            </div>
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
