'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Editor } from '@/components/Editor';
import { AiSidebar } from '@/components/AiSidebar';
import { projectsAPI, aiAPI } from '@/lib/api';
import { Project, AiInteraction } from '@/types';
import { Save, Menu, X, FileText, BarChart2, BookOpen, Maximize2, Minimize2 } from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

export default function ProjectPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [chatHistory, setChatHistory] = useState<AiInteraction[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [wasAiLocked, setWasAiLocked] = useState(true);
  const [isZenMode, setIsZenMode] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadProject();
  }, [id, isAuthenticated, router]);

  const loadProject = async () => {
    try {
      const { data } = await projectsAPI.getOne(id as string);
      setProject(data);
      setContent(data.content || '');
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load project:', error);
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!project) return;

    setIsSaving(true);
    try {
      const { data } = await projectsAPI.save(id as string, content);
      setProject(data);
      setLastSaved(new Date());
      toast.success('Project saved successfully!', {
        icon: '💾',
      });
    } catch (error) {
      console.error('Failed to save project:', error);
      toast.error('Failed to save project. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNewChat = (interaction: AiInteraction) => {
    setChatHistory([...chatHistory, interaction]);
  };

  // Confetti effect when AI unlocks
  useEffect(() => {
    const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
    const isAiUnlocked = wordCount >= 50;

    if (wasAiLocked && isAiUnlocked) {
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#8b5cf6', '#14b8a6'],
      });

      toast.success('🎉 AI Assistant Unlocked!', {
        duration: 4000,
      });

      setWasAiLocked(false);
    } else if (!isAiUnlocked && !wasAiLocked) {
      setWasAiLocked(true);
    }
  }, [content, wasAiLocked]);

  // Keyboard shortcut: Esc to exit Zen Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isZenMode) {
        setIsZenMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZenMode]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <h2 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">Project not found</h2>
          <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
  const isAiUnlocked = wordCount >= 50;
  const wordsToUnlock = Math.max(0, 50 - wordCount);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* LEFT: Navigation Sidebar (Collapsible) - Hidden on mobile and in Zen Mode */}
      {!isZenMode && (
        <aside className="hidden md:flex w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h1 className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                MITRA AI
              </h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              ← Back to Dashboard
            </Button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-2">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 rounded-lg">
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-2 truncate">
                  {project.title}
                </h3>
                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Words:</span>
                    <span className="font-medium text-indigo-600 dark:text-indigo-400">{wordCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-medium">{project.status}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {lastSaved ? (
                <p>Saved {lastSaved.toLocaleTimeString()}</p>
              ) : (
                <p>Not saved yet</p>
              )}
            </div>
          </div>
        </aside>
      )}

      {/* CENTER: Editor Canvas */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Toolbar - Hidden in Zen Mode */}
        {!isZenMode && (
          <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden"
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>

              <div>
                <h2 className="font-semibold text-slate-900 dark:text-slate-100 text-sm sm:text-base truncate max-w-[200px] sm:max-w-none">
                  {project.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {wordCount} words {isAiUnlocked && '• AI Unlocked'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsZenMode(!isZenMode)}
                className="border-2 border-bauhaus rounded-none hover:bg-bauhaus-blue hover:text-white transition-colors btn-press"
                size="sm"
                title={isZenMode ? "Exit Focus Mode" : "Enter Focus Mode"}
              >
                {isZenMode ? <Minimize2 className="w-4 h-4 mr-2" /> : <Maximize2 className="w-4 h-4 mr-2" />}
                <span className="hidden sm:inline font-bold uppercase tracking-wide text-xs">
                  {isZenMode ? 'EXIT FOCUS' : 'FOCUS'}
                </span>
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-bauhaus-red text-white border-4 border-bauhaus shadow-bauhaus btn-press font-bold uppercase tracking-wide rounded-none hover:bg-bauhaus-red/90"
                size="sm"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'SAVING...' : 'SAVE'}
              </Button>
            </div>
          </div>
        )}

        {/* Editor Area */}
        <Editor
          content={content}
          onUpdate={setContent}
          isLocked={!isAiUnlocked}
        />
      </main>

      {/* RIGHT: AI Sidebar (Collapsible) - Hidden in Zen Mode */}
      {!isZenMode && (
        <aside className={`
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
          fixed md:relative right-0 top-0 h-full w-80 md:w-96 z-50
          transition-transform duration-300 ease-in-out
          md:translate-x-0
        `}>
          <AiSidebar
            projectId={id as string}
            isLocked={!isAiUnlocked}
            wordCount={wordCount}
            wordsToUnlock={wordsToUnlock}
            chatHistory={chatHistory}
            onNewChat={handleNewChat}
          />
        </aside>
      )}

      {/* Floating Zen Mode Exit Button - Bauhaus Style */}
      {isZenMode && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white border-4 border-bauhaus shadow-bauhaus-lg p-2">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-bauhaus-red text-white border-2 border-bauhaus shadow-bauhaus-sm btn-press font-bold uppercase tracking-wide rounded-none hover:bg-bauhaus-red/90"
            size="sm"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'SAVING...' : 'SAVE'}
          </Button>
          <Button
            onClick={() => setIsZenMode(false)}
            className="bg-white border-2 border-bauhaus rounded-none hover:bg-gray-100 btn-press font-bold uppercase tracking-wide"
            size="sm"
            title="Exit Focus Mode (Esc)"
          >
            <Minimize2 className="w-4 h-4 mr-2" />
            EXIT
          </Button>
        </div>
      )}

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}