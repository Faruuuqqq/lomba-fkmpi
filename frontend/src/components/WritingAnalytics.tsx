'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, Clock, FileText, TrendingUp, Award, Zap } from 'lucide-react';

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
  totalWritingTime: number; // in minutes
  averageWordsPerSession: number;
  mostProductiveDay: string;
  longestSession: number; // in minutes
}

export default function WritingAnalytics() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<WritingStats | null>(null);
  const [sessions, setSessions] = useState<WritingSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      loadAnalytics();
    }
  }, [isAuthenticated, authLoading, router]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      // In production, this would fetch from the API
      // For now, using mock data
      setTimeout(() => {
        const mockStats: WritingStats = {
          totalWordsWritten: 12450,
          totalTokensEarned: 1250,
          totalWritingTime: 345, // ~5.75 hours
          averageWordsPerSession: 187,
          mostProductiveDay: 'Tuesday',
          longestSession: 65, // 1 hour 5 minutes
        };

        const mockSessions: WritingSession[] = [
          {
            id: '1',
            projectId: 'proj-1',
            startTime: new Date(Date.now() - 3600000), // 1 hour ago
            endTime: new Date(Date.now() - 1800000), // 30 min ago
            wordCount: 320,
            tokensEarned: 6,
          },
          {
            id: '2',
            projectId: 'proj-1',
            startTime: new Date(Date.now() - 7200000), // 2 hours ago
            endTime: new Date(Date.now() - 5400000), // 1.5 hours ago
            wordCount: 540,
            tokensEarned: 10,
          },
          {
            id: '3',
            projectId: 'proj-2',
            startTime: new Date(Date.now() - 10800000), // 3 hours ago
            endTime: new Date(Date.now() - 9000000), // 2.5 hours ago
            wordCount: 425,
            tokensEarned: 8,
          },
          {
            id: '4',
            projectId: 'proj-1',
            startTime: new Date(Date.now() - 18000000), // 5 hours ago
            endTime: undefined,
            wordCount: 687,
            tokensEarned: 13,
          },
        ];

        setStats(mockStats);
        setSessions(mockSessions);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      setIsLoading(false);
    }
  };

  const getDuration = (startTime: Date, endTime?: Date) => {
    const end = endTime || new Date();
    const diff = end.getTime() - startTime.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Writing Analytics
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Track your writing progress and productivity
            </p>
          </div>
          <button
            onClick={() => router.push('/projects')}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            Back to Projects
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <FileText className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold uppercase text-zinc-500">Total Words</span>
              </div>
              <p className="text-3xl font-black text-zinc-900 dark:text-zinc-100">
                {stats?.totalWordsWritten.toLocaleString()}
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Across all sessions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Zap className="w-8 h-8 text-amber-500" />
                <span className="text-xs font-bold uppercase text-zinc-500">Total Tokens</span>
              </div>
              <p className="text-3xl font-black text-amber-600 dark:text-amber-400">
                {stats?.totalTokensEarned.toLocaleString()}
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Earned from writing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-bold uppercase text-zinc-500">Writing Time</span>
              </div>
              <p className="text-3xl font-black text-zinc-900 dark:text-zinc-100">
                {Math.floor(stats?.totalWritingTime || 0)}m
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                ~{Math.floor((stats?.totalWritingTime || 0) / 60)} hours total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
                <span className="text-xs font-bold uppercase text-zinc-500">Avg/Session</span>
              </div>
              <p className="text-3xl font-black text-zinc-900 dark:text-zinc-100">
                {stats?.averageWordsPerSession}
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Words per session
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <div>
                  <p className="text-xs font-bold uppercase text-zinc-500">Most Productive Day</p>
                  <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {stats?.mostProductiveDay}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <div>
                  <p className="text-xs font-bold uppercase text-zinc-500">Longest Session</p>
                  <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {stats?.longestSession}m
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Sessions */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Recent Writing Sessions
            </h3>

            {sessions.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                No writing sessions yet. Start writing to track your progress!
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-zinc-500" />
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          Project ID: {session.projectId}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-500">
                        <span>{getDuration(session.startTime, session.endTime)}</span>
                        <span>{session.wordCount} words</span>
                        <span className="text-amber-600 dark:text-amber-400 font-semibold">
                          +{session.tokensEarned} tokens
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Progress Chart */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
              Weekly Word Count
            </h3>

            <div className="space-y-3">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                const words = idx === 1 ? 3200 : idx === 2 ? 2800 : idx === 4 ? 3500 : 1500 + Math.floor(Math.random() * 1000);
                const maxWords = 3500;
                const percentage = (words / maxWords) * 100;

                return (
                  <div key={day} className="flex items-center gap-3">
                    <div className="w-12 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      {day}
                    </div>
                    <div className="flex-1 h-6 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          percentage >= 80
                            ? 'bg-green-500'
                            : percentage >= 60
                            ? 'bg-blue-500'
                            : percentage >= 40
                            ? 'bg-yellow-500'
                            : 'bg-zinc-300'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="w-12 text-right text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {words}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Pro Tips
          </h3>
          <ul className="space-y-3 text-sm text-indigo-800 dark:text-indigo-200">
            <li className="flex items-start gap-2">
              <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Aim for consistency:</strong> Write a little every day to build a steady streak.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Time your sessions:</strong> Take breaks every 25-30 minutes to maintain focus.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Set word goals:</strong> Daily targets help you stay motivated and track progress.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}