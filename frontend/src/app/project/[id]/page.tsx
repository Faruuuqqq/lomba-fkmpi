'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Editor } from '@/components/Editor';
import AiSidebar from '@/components/AiSidebar';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { KeyboardShortcutsModal } from '@/components/KeyboardShortcutsModal';
import { CompetitionSubmissionModal } from '@/components/CompetitionSubmissionModal';
import { projectsAPI, aiAPI } from '@/lib/api';
import { Project, AiInteraction } from '@/types';
import { ChevronLeft, ChevronRight, HelpCircle, FileText, Target, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { useHotkeys } from '@/hooks/useHotkeys';

export default function ProjectPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [chatHistory, setChatHistory] = useState<AiInteraction[]>([]);
  const [showProjectSidebar, setShowProjectSidebar] = useState(true);
  const [showAiSidebar, setShowAiSidebar] = useState(true);
  const [wasAiLocked, setWasAiLocked] = useState(true);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showSubmissionChecklist, setShowSubmissionChecklist] = useState(false);
  const [plagiarismChecked, setPlagiarismChecked] = useState(false);
  const [plagiarismScore, setPlagiarismScore] = useState<number | undefined>();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated) {
      loadProject();
    }
  }, [id, isAuthenticated, isLoading, router]);

  const loadProject = async () => {
    try {
      const { data } = await projectsAPI.getOne(id as string);
      setProject(data);
      setContent(data.content || '');
      setWasAiLocked(!data.isAiUnlocked);
      setIsLoading(false);

      // Load chat history
      const chatResponse = await aiAPI.getChatHistory(id as string);
      setChatHistory(chatResponse.data || []);
    } catch (error) {
      console.error('Failed to load project:', error);
      toast.error('Failed to load project');
      router.push('/projects');
    }
  };

  const handleSave = async () => {
    if (!project) return;

    setIsSaving(true);
    try {
      const { data } = await projectsAPI.save(id as string, content);

      setProject(data.project);

      // Check if AI just unlocked
      if (wasAiLocked && data.project.isAiUnlocked) {
        setWasAiLocked(false);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        toast.success('🎉 AI Assistant Unlocked!');
      } else {
        toast.success('Saved');
      }
    } catch (error) {
      toast.error('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save
  useEffect(() => {
    if (!project || content === project.content) return;

    const timer = setTimeout(() => {
      handleSave();
    }, 2000);

    return () => clearTimeout(timer);
  }, [content]);

  // Keyboard Shortcuts
  useHotkeys('ctrl+s', () => {
    handleSave();
  });

  useHotkeys('ctrl+/', () => {
    setShowShortcuts(true);
  });

  useHotkeys('ctrl+shift+s', () => {
    setShowSubmissionChecklist(true);
  });

  const handleNewChat = (interaction: AiInteraction) => {
    setChatHistory([...chatHistory, interaction]);
  };

  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
  const isAiUnlocked = project?.isAiUnlocked || false;
  const wordsToUnlock = Math.max(0, 50 - wordCount);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-100 dark:bg-zinc-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="flex h-screen bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
      {/* LEFT SIDEBAR: Projects Navigation */}
      {showProjectSidebar && <ProjectSidebar />}

      {/* CENTER: Editor */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Toggle Sidebar Buttons & Actions */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          {!showProjectSidebar && (
            <button
              onClick={() => setShowProjectSidebar(true)}
              className="p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
              title="Show Projects"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Editor Actions */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button
            onClick={() => setShowShortcuts(true)}
            className="p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
            title="Keyboard Shortcuts (Ctrl + /)"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowSubmissionChecklist(true)}
            className="p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg shadow-sm hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
            title="Submission Checklist"
          >
            <Target className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </button>
        </div>

        {/* Editor */}
        <Editor
          content={content}
          onUpdate={setContent}
          isLocked={!isAiUnlocked}
          isSaving={isSaving}
          lastSaved={project?.updatedAt ? new Date(project.updatedAt) : undefined}
          minWords={1000}
          maxWords={5000}
        />
      </main>

      {/* RIGHT SIDEBAR: AI Assistant */}
      {showAiSidebar && (
        <AiSidebar
          projectId={id as string}
          isLocked={!isAiUnlocked}
          wordCount={wordCount}
          wordsToUnlock={wordsToUnlock}
          chatHistory={chatHistory}
          onNewChat={handleNewChat}
          currentContent={content}
        />
      )}

      {/* Toggle AI Sidebar Button (when hidden) */}
      {!showAiSidebar && (
        <button
          onClick={() => setShowAiSidebar(true)}
          className="fixed right-4 top-1/2 -translate-y-1/2 p-3 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition-colors"
          title="Show AI Assistant"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />

      {/* Competition Submission Modal */}
      <CompetitionSubmissionModal
        isOpen={showSubmissionChecklist}
        onClose={() => setShowSubmissionChecklist(false)}
        content={content}
        wordCount={wordCount}
        isPlagiarismChecked={plagiarismChecked}
        plagiarismScore={plagiarismScore}
      />
    </div>
  );
}