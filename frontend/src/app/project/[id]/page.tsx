'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Editor } from '@/components/Editor';
import { AiSidebar } from '@/components/AiSidebar';
import { ReasoningGraph } from '@/components/ReasoningGraph';
import { EthicsCheck } from '@/components/EthicsCheck';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useDebounce } from '@/hooks/useDebounce';
import { projectsAPI, aiAPI } from '@/lib/api';
import { Project } from '@/types';
import { 
  ArrowLeft, 
  Save, 
  Download, 
  Check, 
  Network, 
  ShieldAlert, 
  ManagerService
} from 'lucide-react';
import { 
  ChartIcon, 
  Activity, 
  TrendingUp, 
  Smartphone
} from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { useFocusManagement } from '@/hooks/useFocusManagement';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ScreenReaderOnly } from '@/components/ui/accessibility';

const DEBOUNCE_DELAY = 100;

export default function ProjectPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  const [project, setProject] = useState<Project | null>(null);
  const [content, setContent] = useState('');
  const [displayContent, setDisplayContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Mobile states
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'analytics'>('editor');
  const [showProjectInfo, setShowProjectInfo] = useState(false);
  
  // Modal states
  const [showReasoningMap, setShowReasoningMap] = useState(false);
  const [showEthicsCheck, setShowEthicsCheck] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  // PWA hooks
  const { isOnline, addToOfflineQueue } = usePWA();
  
  // Auto-save debouncing
  const debouncedContent = useDebounce(content, 1000);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  // Timer for inactivity
  const inactivityTimeoutRef = useRef<NodeJS.Timeout>();
  const exitTimeoutRef = useRef<NodeJS.Timeout>();

  const startInactivityTimer = () => {
    clearTimeout(inactivityTimeoutRef.current);
    inactivityTimeoutRef.current = setTimeout(() => {
      handleAutoSave();
    }, 60000);
  };

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimeoutRef.current);
    };

  // Progress states
  const [saveProgress, setSaveProgress] = useState(0);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  // Analytics hooks
  const [isAnalytics, setIsAnalytics] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  
  // Analytics hooks
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

      setAnalyticsData([...overviewData, ...performanceData, ...dailyData]);
      setAnalyticsLoading(false);
      
      setAnalytics(true);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setAnalyticsLoading(false);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Show exit confirmation for unsaved changes
  const showExitConfirmation = () => {
    return window.confirm('You have unsaved changes. All unsaved changes will be lost. Continue?');
  };

  // Exit cleanup
  const cleanup = () => {
    resetInactivityTimer();
    clearTimeout(exitTimeoutRef.current);
  };

  // Auto-save functionality
  useEffect(() => {
    const shouldAutoSave = debouncedContent !== displayContent;
    
    if (shouldAutoSave && !isSaving && project) {
      clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleAutoSave();
      }, DEBOUNCE_DELAY);
    }
  }, [debouncedContent, project, debouncedContent, autoSaveTimeoutRef]);

  // WebSocket connection monitoring
  const [isConnected, setIsConnected] = useState(false);
  const [lastPingTime, setLastPingTime] = useState(Date.now());

  useEffect(() => {
    const checkConnection = () => {
      fetch('/api/ping')
        .then(() => {
          setIsConnected(true);
          setLastPingTime(Date.now());
        })
        .catch(() => {
          setIsConnected(false);
        });
    };

    const intervalId = setInterval(checkConnection, 30000);
    return () => {
      clearInterval(intervalId);
    };
  }, [lastPingTime]);

  // Enhanced save with progress
  const enhancedSave = async () => {
    if (!project) return;

    try {
      setIsSaving(true);
      setSaveProgress(50);
      
      const response = await projectsAPI.save(id!, content);
      
      if (response) {
        setSaveProgress(100);
        setDisplayContent(content);
        setLastSaved(new Date());
        setSaveStatus('saved');
        
        // Update project data
        setProject(prev => ({
          ...prev!,
          content,
          wordCount: content.split(/\s+/).filter(word => word.length > 0).length,
          updatedAt: new Date()
        }));
        
        setSaveProgress(100);
        return true;
      }
    } catch (error) {
      setSaveStatus('error');
      setSaveProgress(0);
      
      // Restore previous content on error
      if (displayContent !== displayContent) {
        setDisplayContent(displayContent);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Add comprehensive hotkey support for power users
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const key = event.key;

    // Ctrl+S for save
    if (key === 's' && (event.ctrlKey || event.metaKey || event.metaKey)) {
      event.preventDefault();
      if (content && content !== displayContent && project) {
        enhancedSave();
      }
    }

    // Ctrl+Shift+R for "Restart"
    if (key === 'R' && (event.ctrlKey || event.metaKey) && event.shiftKey) {
      event.preventDefault();
      if (content && content !== displayContent && project) {
        // Clear content
        setContent('');
        setDisplayContent('');
      }
    }

    // Escape to dismiss modals
    if (key === 'Escape') {
      setShowReasoningMap(false);
      setShowEthicsCheck(false);
      setShowProjectInfo(false);
    }

    // Ctrl+N for new project
    if (key === 'n' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      if (!newProjectTitle.trim()) return;
      
      handleCreateProject();
    }

    // Cmd+K for analytics
    if (key === 'k' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      router.push('/dashboard');
    }
  }, [content, displayContent, project]);

  // Show success confirmation
  const showSuccessNotification = (message: string) => {
    // Create notification if not shown
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 z-50 max-w-sm bg-green-600 text-white px-4 py-3 rounded-lg shadow-xl';
    notification.style.zIndex = '9999';
    notification.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="w-4 h-4 bg-white rounded-full"></div>
        <div class="text-sm font-medium">${message}</div>
      </div>
    `;
    document.body.appendChild(notification);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.opacity = '0';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
    }, 3000);

    return () => {
      notification.remove();
    };
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold truncate">{project?.title || 'Untitled'}</h1>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/dashboard')}
                  className="flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
                
                <ThemeToggle />
                
                <Button variant="outline" onClick={logout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
                
                {/* Mobile Menu Toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  className="sm:hidden"
                  onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                  className="w-4 h-4 sm:mr-2"
                >
                  {isMobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </Button>
              </div>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-full overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-80 border-r bg-muted/30 h-full overflow-y-auto sticky top-16">
          <div className="h-full overflow-y-auto p-6">
            {/* AI Tools Navigation */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">AI Writing Assistant</h3>
              
              <div className="space-y-2">
                <Button
                  variant={aiFeatureStates.reasoningMap ? 'default' : 'outline'}
                  onClick={generateReasoningMap}
                  disabled={!isAiUnlocked}
                  className="w-full justify-start"
                >
                  {aiFeatureStates.reasoningMap ? (
                    <LoadingSpinner size="sm" text="" />
                  ) : (
                    <>
                      <Network className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Map</span>
                    </>
                  )}
                </Button>
                
                <Button
                  variant={aiFeatureStates.ethicsCheck ? 'default' : 'outline'}
                  onClick={performEthicsCheck}
                  disabled={!isAiUnlocked}
                  className="w-full justify-start"
                >
                  {aiFeatureStates.ethicsCheck ? (
                    <LoadingSpinner size="sm" text="" />
                  ) : (
                    <>
                      <ShieldAlert className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Check</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Stats Section */}
            <div className="mb-6 border-b">
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">Writing Statistics</h3>
                
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{wordCount}</div>
                    <p className="text-xs text-muted-foreground">Total Words</p>
                  </div>
                  <div className="text-center text-xs text-muted-foreground">Characters</div>
                  <div className="text-xs text-muted-foreground">AI Unlocked</div>
                  <div className="text-xs text-muted-foreground">
                    {isAiUnlocked ? 'Yes' : 'No'}
                  </div>
                </div>
              </div>
                
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{wordCount}</div>
                    <p className="text-xs text-muted-foreground">Reading Time</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {totalUsage > 0 
                      ? formatDuration(overview.reduce((sum, item) => sum + item.avgDuration * item.usageCount, 0) / totalUsage)
                      : '0.00s'
                    }
                  </div>
                  <div className="text-xs text-muted-foreground">Editor Focus Time</div>
                  <div className="text-xs text-muted-foreground">
                    {totalWritingTime > 0 
                      ? formatDuration(totalWritingTime) 
                      : '0.00s'
                    }
                  </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Navigation Tabs */}
            <div className="md:hidden border-b bg-background p-4 sticky top-16 z-50">
              <div className="flex items-center gap-2">
                <Button
                  variant={activeTab === 'editor' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('editor')}
                  className="flex items-center"
                >
                  <span className="text-xs">Editor</span>
                </Button>
                
                <Button
                  variant={activeTab === 'analytics' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('analytics')}
                  className="flex items-center"
                >
                  <span className="text-xs">Analytics</span>
                </Button>
                
                <Button
                  variant={activeTab === 'history' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('history')}
                  className="flex items-center"
                >
                  <span className="text-xs">History</span>
                </Button>
              </div>
              </div>

              {/* PWA Install Status */}
              {!isInstalled && isInstallable && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>📲 Install MITRA AI</strong>
                  </p>
                  <p className="text-xs text-blue-600">
                    Get the mobile app for the best experience!
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      size="sm"
                      onClick={installPrompt}
                      className="w-full"
                      disabled={isInstalled}
                      className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded"
                    >
                      Get App
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
              <div className="fixed inset-0 z-40 bg-black/50">
                <div className="bg-background w-64 h-full shadow-xl">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Mobile Menu</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsMobileSidebarOpen(false)}
                        className="text-white"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Button
                      variant={showReasoningMap ? 'default' : 'outline'}
                      onClick={generateReasoningMap}
                      disabled={!isAiUnlocked}
                      className="w-full justify-start"
                    >
                      {showReasoningMap ? (
                        <LoadingSpinner size="sm" text="" />
                      ) : (
                        <>
                          <Network className="w-4 h-4 mr-2" />
                          <span className="text-xs">Generating...</span>
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant={showEthicsCheck ? 'default' : 'outline'}
                      onClick={performEthicsCheck}
                      disabled={!isAiUnlocked}
                      className="w-full justify-start"
                    >
                      {showEthicsCheck ? (
                        <LoadingSpinner size="sm" text="" />
                      ) : (
                        <>
                          <ShieldAlert className="w-4 h-4 mr-2" />
                          <span className="text-xs">Analyzing...</span>
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab('analytics')}
                      className="w-full justify-start"
                    >
                      <span className="text-xs">Analytics</span>
                    </Button>
                  </div>
                  
                  {/* Activity History */}
                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold">Recent Activity</h4>
                    {aiHistory.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <div className="flex flex-col items-center">
                          <FileText className="w-12 h-12 mx-auto text-muted-foreground" />
                          <p className="mt-2">No activity yet</p>
                          </div>
                    ) : (
                      <div className="space-y-4">
                        {aiHistory.map((interaction, index) => (
                          <div key={interaction.id} className="p-3 border-b border rounded-lg">
                            <div className="flex justify-between items-start">
                              <div className="flex-shrink-0 min-w-0">
                                <div className="text-xs text-gray-500">User:</div>
                              <div className="font-medium">{interaction.user?.name}</div>
                              </div>
                              <div className="flex-1">
                                <div className="flex-1 overflow-hidden">
                                  <p className="text-sm text-foreground">
                                    "{interaction.userQuery}"
                                  </p>
                                </div>
                              </div>
                            </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Desktop Header */}
          <div className="hidden md:block sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold">MITRA AI</h1>
                  <div className="flex items-center gap-2">
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Welcome, {user?.name || user?.email}
                    </p>
                  </div>
                
                  <div className="flex items-center gap-2">
                    <ThemeToggle />
                    
                    <Button
                      variant="outline" onClick={logout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Logout</span>
                    </Button>
                  </div>
                </div>
            </div>
          </div>

          {/* Analytics Toggle Button */}
          <div className="hidden md:flex">
            <Button
              variant={isAnalytics ? "default" : "outline"}
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Analytics</span>
            </Button>
          </div>

          {/* Exit Confirmation Dialog */}
          {showExitConfirmation && (
            <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
              <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-auto">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-4">Leaving Project?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    You have unsaved changes. All unsaved changes will be lost. Continue?
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline" onClick={showExitConfirmation ? () => setShowExitConfirmation(false)}>
                    Cancel
                  </Button>
                  
                  <Button
                    variant="default"
                    onClick={async () => {
                      const confirmed = await showExitConfirmation();
                      if (confirmed) {
                        cleanup();
                        await projectsAPI.delete(id!);
                        router.push('/dashboard');
                      }
                    }}
                    className="bg-red-600 text-white hover:bg-red-700 px-4 py-2"
                  >
                    Leave Anyway
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}