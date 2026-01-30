'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';

interface AnalyticsData {
  dailyStats: Array<{
    date: string;
    words: number;
    minutes: number;
    tokens: number;
  }>;
  featureUsage: Array<{
    feature: string;
    count: number;
    color: string;
  }>;
  performanceData: Array<{
    date: string;
    score: number;
  }>;
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AnalyticsCharts() {
  const { user, isAuthenticated } = useAuth();
  const [data, setData] = useState<AnalyticsData>({
    dailyStats: [],
    featureUsage: [],
    performanceData: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchAnalyticsData();
    }
  }, [isAuthenticated, user, timeRange]);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Fetch daily stats
      const dailyResponse = await fetch(`/api/analytics/daily-stats?days=${timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const performanceResponse = await fetch('/api/analytics/performance', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (dailyResponse.ok && performanceResponse.ok) {
        const dailyData = await dailyResponse.json();
        const performanceData = await performanceResponse.json();
        
        setData({
          dailyStats: dailyData || [],
          featureUsage: [
            { feature: 'AI Chat', count: Math.floor(Math.random() * 100) + 50, color: COLORS[0] },
            { feature: 'Grammar Check', count: Math.floor(Math.random() * 50) + 20, color: COLORS[1] },
            { feature: 'Logic Mapping', count: Math.floor(Math.random() * 30) + 10, color: COLORS[2] },
            { feature: 'Citations', count: Math.floor(Math.random() * 80) + 30, color: COLORS[3] },
            { feature: 'Library', count: Math.floor(Math.random() * 60) + 25, color: COLORS[4] },
          ],
          performanceData: performanceData?.dailyStats || [],
        });
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Please log in to view analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Analytics Dashboard</h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Track your writing progress and performance</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Daily Writing Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Daily Writing Progress</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  style={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937',
                    border: '1px solid #4f46e5',
                    borderRadius: '8px',
                    color: '#f9fafb'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="words" 
                  stroke="#4f46e5" 
                  strokeWidth={2}
                  name="Words Written"
                />
                <Line 
                  type="monotone" 
                  dataKey="tokens" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Tokens Earned"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Feature Usage Pie Chart */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Feature Usage Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.featureUsage}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.feature}: ${entry.count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.featureUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937',
                    border: '1px solid #4f46e5',
                    borderRadius: '8px',
                    color: '#f9fafb'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Score */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Performance Score Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                style={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: 12 }}
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937',
                  border: '1px solid #4f46e5',
                  borderRadius: '8px',
                  color: '#f9fafb'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#f59e0b" 
                strokeWidth={3}
                name="Performance Score"
                dot={{ fill: '#f59e0b', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Feature Usage Bar Chart */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Feature Usage Count</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.featureUsage}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="feature" 
                stroke="#6b7280"
                style={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937',
                  border: '1px solid #4f46e5',
                  borderRadius: '8px',
                  color: '#f9fafb'
                }}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}