'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, Clock, TrendingUp, Activity, Smartphone, X } from 'lucide-react';

interface AnalyticsData {
  feature: string;
  usageCount: number;
  avgDuration: number;
}

interface PerformanceData {
  feature: string;
  minDuration: number;
  maxDuration: number;
  avgDuration: number;
  requestCount: number;
}

interface DailyStats {
  [date: string]: {
    [feature: string]: number;
  };
}

export default function AnalyticsDashboard() {
  const [overview, setOverview] = useState<AnalyticsData[]>([]);
  const [performance, setPerformance] = useState<PerformanceData[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'usage'>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const [overviewRes, performanceRes, dailyRes] = await Promise.all([
        fetch('/api/analytics/overview'),
        fetch('/api/analytics/performance'),
        fetch('/api/analytics/daily-stats')
      ]);

      const [overviewData, performanceData, dailyData] = await Promise.all([
        overviewRes.json(),
        performanceRes.json(),
        dailyRes.json()
      ]);

      setOverview(overviewData);
      setPerformance(performanceData);
      setDailyStats(dailyData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (ms: number) => {
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const totalUsage = overview.reduce((sum, item) => sum + item.usageCount, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">
          <BarChart3 className="w-8 h-8 text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">Analytics</h1>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50">
          <div className="bg-background w-64 h-full shadow-xl p-4">
            <div className="space-y-2">
              <Button
                variant={activeTab === 'overview' ? 'default' : 'outline'}
                onClick={() => {
                  setActiveTab('overview');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full justify-start"
              >
                Overview
              </Button>
              <Button
                variant={activeTab === 'performance' ? 'default' : 'outline'}
                onClick={() => {
                  setActiveTab('performance');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full justify-start"
              >
                Performance
              </Button>
              <Button
                variant={activeTab === 'usage' ? 'default' : 'outline'}
                onClick={() => {
                  setActiveTab('usage');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full justify-start"
              >
                Usage Trends
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Header */}
      <div className="hidden md:block border-b bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">AI Feature Analytics</h1>
            <div className="flex items-center space-x-2">
              <Button
                variant={activeTab === 'overview' ? 'default' : 'outline'}
                onClick={() => setActiveTab('overview')}
                className="text-sm"
              >
                Overview
              </Button>
              <Button
                variant={activeTab === 'performance' ? 'default' : 'outline'}
                onClick={() => setActiveTab('performance')}
                className="text-sm"
              >
                Performance
              </Button>
              <Button
                variant={activeTab === 'usage' ? 'default' : 'outline'}
                onClick={() => setActiveTab('usage')}
                className="text-sm"
              >
                Usage
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Mobile Tab Indicators */}
        <div className="md:hidden flex justify-center space-x-2 mb-6">
          <div className={`w-2 h-2 rounded-full ${activeTab === 'overview' ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`w-2 h-2 rounded-full ${activeTab === 'performance' ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`w-2 h-2 rounded-full ${activeTab === 'usage' ? 'bg-primary' : 'bg-muted'}`} />
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="col-span-2 sm:col-span-1">
                <CardContent className="pt-4 p-3 sm:p-6">
                  <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                    <p className="text-xs sm:text-sm font-medium">Total Usage</p>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold">{totalUsage}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">All AI features</p>
                </CardContent>
              </Card>

              <Card className="col-span-2 sm:col-span-1">
                <CardContent className="pt-4 p-3 sm:p-6">
                  <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                    <p className="text-xs sm:text-sm font-medium">Reasoning Maps</p>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold">
                    {overview.find(item => item.feature === 'reasoning_map')?.usageCount || 0}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Maps generated</p>
                </CardContent>
              </Card>

              <Card className="col-span-2 sm:col-span-1">
                <CardContent className="pt-4 p-3 sm:p-6">
                  <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                    <p className="text-xs sm:text-sm font-medium">Ethics Checks</p>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold">
                    {overview.find(item => item.feature === 'ethics_check')?.usageCount || 0}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Analysis performed</p>
                </CardContent>
              </Card>

              <Card className="col-span-2 sm:col-span-1">
                <CardContent className="pt-4 p-3 sm:p-6">
                  <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                    <p className="text-xs sm:text-sm font-medium">Avg Response Time</p>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold">
                    {totalUsage > 0 
                      ? formatDuration(overview.reduce((sum, item) => sum + item.avgDuration * item.usageCount, 0) / totalUsage)
                      : '0.00s'
                    }
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Across all features</p>
                </CardContent>
              </Card>
            </div>

            {/* Feature Usage Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Feature Usage Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {overview.length === 0 ? (
                  <div className="py-8 sm:py-12 text-center">
                    <p className="text-muted-foreground">No usage data available yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {overview.map((item) => (
                      <div key={item.feature} className="p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium capitalize text-sm sm:text-base">{item.feature.replace('_', ' ')}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {item.usageCount} uses
                            </Badge>
                            <Badge variant="outline">
                              {((item.usageCount / totalUsage) * 100).toFixed(1)}%
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {item.usageCount} uses • Avg time: {formatDuration(item.avgDuration)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                {performance.length === 0 ? (
                  <div className="py-8 sm:py-12 text-center">
                    <p className="text-muted-foreground">No performance data available yet</p>
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-6">
                    {performance.map((metric) => (
                      <div key={metric.feature} className="p-3 sm:p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium capitalize text-sm sm:text-base">{metric.feature.replace('_', ' ')}</p>
                          <Badge variant="outline">{metric.requestCount} requests</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-xs sm:text-sm">
                          <div>
                            <p className="text-muted-foreground">Min Time</p>
                            <p className="font-medium">{formatDuration(metric.minDuration)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Avg Time</p>
                            <p className="font-medium">{formatDuration(metric.avgDuration)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Max Time</p>
                            <p className="font-medium">{formatDuration(metric.maxDuration)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Usage Tab */}
        {activeTab === 'usage' && (
          <div className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Usage Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h3 className="text-sm sm:text-base font-medium mb-3">Daily Usage Overview</h3>
                    <div className="space-y-2">
                      {Object.entries(dailyStats).slice(-7).reverse().map(([date, stats]) => (
                        <div key={date} className="p-2 sm:p-3 border rounded">
                          <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                            {new Date(date).toLocaleDateString()}
                          </p>
                          <div className="space-x-2 sm:space-x-4">
                            {stats['reasoning_map'] && (
                              <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 bg-blue-100 rounded-full flex-shrink-0"></div>
                                <span className="text-xs">
                                  Maps: {stats['reasoning_map']}
                                </span>
                              </div>
                            )}
                            {stats['ethics_check'] && (
                              <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 bg-green-100 rounded-full flex-shrink-0"></div>
                                <span className="text-xs">
                                  Ethics: {stats['ethics_check']}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}