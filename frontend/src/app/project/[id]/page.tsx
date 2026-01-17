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
    <div className="flex h-screen bg-white overflow-hidden">
      {/* LEFT: Navigation Sidebar (Collapsible) - Hidden on mobile and in Zen Mode */}
      {!isZenMode && (
        <aside className="hidden md:flex w-64 border-r-4 border-bauhaus bg-white flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b-4 border-bauhaus bg-bauhaus-yellow">
            {/* Logo - Matching Homepage */}
            <div className="flex items-center gap-2 mb-4">
              <div className="relative h-8 w-20 flex items-center">
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-bauhaus-blue border-2 border-bauhaus flex items-center justify-center">
                  <span className="text-white font-black text-base">M</span>
                </div>
                <svg className="absolute left-6 top-0 w-10 h-8" viewBox="0 0 40 32">
                  <polygon points="20,0 0,32 40,32" fill="#D02020" stroke="#121212" strokeWidth="2" />
                  <text x="20" y="24" textAnchor="middle" fill="white" fontSize="16" fontWeight="900">A</text>
                </svg>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-bauhaus-yellow border-2 border-bauhaus"></div>
              </div>
              <span className="font-black uppercase tracking-tighter">MITRA AI</span>
            </div>

            <Button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-white border-2 border-bauhaus shadow-bauhaus-sm btn-press font-bold uppercase tracking-wide text-xs rounded-none hover:bg-gray-100"
              size="sm"
            >
              ← DASHBOARD
            </Button>
          </div>

          {/* Project Info */}
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {/* Title Card */}
              <div className="p-4 bg-white border-4 border-bauhaus shadow-bauhaus">
                <h3 className="font-black uppercase tracking-tight text-sm mb-3 truncate">
                  {project.title}
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold uppercase">Words:</span>
                    <span className="font-black text-bauhaus-blue text-base">{wordCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold uppercase">Status:</span>
                    <div className={`px-2 py-1 border-2 border-bauhaus ${project.status === 'FINAL' ? 'bg-green-500 text-white' : 'bg-bauhaus-yellow'
                      }`}>
                      <span className="font-bold text-xs">{project.status}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold uppercase">AI:</span>
                    <div className={`px-2 py-1 border-2 border-bauhaus ${isAiUnlocked ? 'bg-green-500 text-white' : 'bg-gray-300'
                      }`}>
                      <span className="font-bold text-xs">{isAiUnlocked ? 'UNLOCKED' : 'LOCKED'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-bauhaus-blue border-2 border-bauhaus text-center">
                  <div className="text-2xl font-black text-white">{wordCount}</div>
                  <div className="text-xs font-bold text-white uppercase">Words</div>
                </div>
                <div className="p-3 bg-bauhaus-red border-2 border-bauhaus text-center">
                  <div className="text-2xl font-black text-white">{wordsToUnlock}</div>
                  <div className="text-xs font-bold text-white uppercase">To Go</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t-4 border-bauhaus bg-gray-100">
            <div className="text-xs font-bold uppercase tracking-wide text-center">
              {lastSaved ? (
                <p>✓ Saved {lastSaved.toLocaleTimeString()}</p>
              ) : (
                <p>⚠️ Not saved yet</p>
              )}
            </div>
          </div>
        </aside>
      )}

      {/* CENTER: Editor Canvas */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Toolbar - Hidden in Zen Mode */}
        {!isZenMode && (
          <div className="bg-white border-b-4 border-bauhaus px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden border-2 border-bauhaus rounded-none"
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>

              <div>
                <h2 className="font-black uppercase tracking-tight text-sm sm:text-base truncate max-w-[200px] sm:max-w-none">
                  {project.title}
                </h2>
                <p className="text-xs font-bold">
                  {wordCount} words {isAiUnlocked && '• ✓ AI UNLOCKED'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsZenMode(!isZenMode)}
                className="border-2 border-bauhaus rounded-none hover:bg-bauhaus-blue hover:text-white transition-colors btn-press bg-white"
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