'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, Clock, FileText, TrendingUp, Award, Zap, CheckCircle2, AlertCircle, BookOpen, Flame } from 'lucide-react';

interface WritingSession {
  id: string;
  projectId: string;
  startTime: Date;
  endTime?: Date;
  wordCount: number;
  tokensEarned: number;
}

interface WritingStats {
  totalWordsWritten: number;
  totalTokensEarned: number;
  totalWritingTime: number;
  averageWordsPerSession: number;
  mostProductiveDay: string;
  longestSession: number;
}

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  priority: 'low' | 'medium' | 'high';
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

export default function WritingAnalyticsAndNotifications() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const storedNotifs = localStorage.getItem('notifications');
    if (storedNotifs) {
      try {
        const parsed = JSON.parse(storedNotifs);
        setNotifications(Array.isArray(parsed) ? parsed : []);
      } catch {
        console.error('Failed to load notifications:', error);
        setNotifications([]);
      }
  }, [isAuthenticated, user]);

  const loadSampleData = () => {
    const notifications = [
      {
        id: '1',
        type: 'success',
        priority: 'low',
        title: 'Welcome to MITRA AI',
        message: 'You have successfully created your account.',
        timestamp: new Date(Date.now() - 300000),
        isRead: true,
      },
      {
        id: '2',
        type: 'info',
        priority: 'low',
        title: 'Writing Goal',
        message: 'You have written 0 words so far.',
        timestamp: new Date(Date.now() - 180000),
        isRead: true,
        action: {
          label: 'View Dashboard',
          onClick: () => {
            window.open('/analytics', '_blank');
          },
        },
      },
    ];

    if (notifications.length === 0) {
      setNotifications(loadSampleData());
    }
  }, []);

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-bold uppercase text-zinc-500">Writing Analytics</span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Your writing statistics and progress
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              Today's Focus
            </h3>
            </CardContent>
          </Card>

        <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">
                Words today
              </span>
              <span className="text-zinc-400">
                • Session 1
              </span>
              </div>
            </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">
              This Week
            </h3>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">
                Total
              </span>
              <span className="text-zinc-400">
                42 words written
              </span>
              </div>
            </CardContent>
        </Card>
      </div>

        <div className="grid grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
                <span className="text-xs font-bold uppercase text-zinc-500">Growth</span>
              </div>
              <p className="text-xs text-zinc-500">
                +12% vs last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Flame className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                <span className="text-xs font-bold uppercase text-zinc-500">Streak</span>
              </div>
              <p className="text-xs text-zinc-500">
                3 days in a row
              </p>
              </CardContent>
          </Card>
        </div>
      </div>

        {/* Recent Writing Sessions */}
        <div className="max-w-4xl">
          <Card className="p-6">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Recent Activity
              </h3>

              <div className="space-y-3">
                <div className="text-center py-12">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Your most recent writing sessions
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg">
                    <div className="flex items-center justify-between p-4">
                      <div>
                        <span className="text-xs text-zinc-600 dark:text-zinc-400">
                          Today
                        </span>
                      </div>
                      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        15 min ago
                      </div>
                    </div>
                    <div className="text-xs text-zinc-500">
                      Project: sample-proj
                      </div>
                  </div>
                  </div>
                </div>

                  {notifications.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          No recent activity yet. Start writing to build your streak!
                        </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg">
                        <div className="flex items-center justify-between p-4">
                          <div className="text-xs text-zinc-600 dark:text-zinc-400">
                            Project: sample-proj
                          </div>
                          <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            Started 15 min ago
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-500">
                              {15 min ago
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

        {/* Quick Actions */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => window.open('/gamification', '_blank')}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm"
          >
            View Full Gamification
          </button>
          <button
            onClick={() => {
              localStorage.setItem('notifications', '[]');
            }}
            className="px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg font-semibold text-sm"
          >
            Clear Notifications
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
