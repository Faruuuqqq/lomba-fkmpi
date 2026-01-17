'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Editor } from '@/components/Editor';
import { AiSidebar } from '@/components/AiSidebar';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { projectsAPI, aiAPI } from '@/lib/api';
import { Project, AiInteraction } from '@/types';
import { Save, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
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
  const [showProjectSidebar, setShowProjectSidebar] = useState(true);
  const [showAiSidebar, setShowAiSidebar] = useState(true);
  const [isZenMode, setIsZenMode] = useState(false);
  const [wasAiLocked, setWasAiLocked] = useState(true);

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
      setWasAiLocked(!data.isAiUnlocked);
      setIsLoading(false);

      // Load chat history
      const chatResponse = await aiAPI.getChatHistory(id as string);
      setChatHistory(chatResponse.data || []);
    } catch (error) {
      console.error('Failed to load project:', error);
      toast.error('Failed to load project');
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!project) return;

    setIsSaving(true);
    try {
      await projectsAPI.save(project.id, content);
      toast.success('Saved!', { duration: 2000 });
      await loadProject(); // Reload to get updated AI unlock status
    } catch (error) {
      toast.error('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNewChat = (interaction: AiInteraction) => {
    setChatHistory([...chatHistory, interaction]);
  };

  const handleTitleChange = (newTitle: string) => {
    if (project) {
      setProject({ ...project, title: newTitle });
    }
  };

  // Check if AI just unlocked
  useEffect(() => {
    if (project && wasAiLocked && project.isAiUnlocked) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      toast.success('🎉 AI Assistant Unlocked!', { duration: 4000 });
      setWasAiLocked(false);
    }
  }, [project?.isAiUnlocked, wasAiLocked]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-bauhaus-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-black uppercase tracking-wide">Loading Project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center p-8 border-4 border-bauhaus shadow-bauhaus">
          <h2 className="font-black text-xl uppercase mb-2">Project Not Found</h2>
          <Button
            onClick={() => router.push('/dashboard')}
            className="mt-4 bg-bauhaus-blue text-white border-4 border-bauhaus shadow-bauhaus btn-press font-bold uppercase"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
  const isAiUnlocked = wordCount >= 50;
  const wordsToUnlock = Math.max(0, 50 - wordCount);

  // Zen Mode: Hide both sidebars
  if (isZenMode) {
    return (
      <div className="flex h-screen bg-gray-100 overflow-hidden">
        {/* Zen Mode: Only Editor */}
        <main className="flex-1 flex flex-col">
          {/* Minimal Floating Toolbar */}
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <Button
              onClick={() => setIsZenMode(false)}
              className="bg-white border-2 border-bauhaus shadow-bauhaus btn-press font-bold uppercase text-xs"
              size="sm"
            >
              <Minimize2 className="w-4 h-4 mr-1" />
              Exit Zen
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-bauhaus-red text-white border-4 border-bauhaus shadow-bauhaus btn-press font-bold uppercase text-xs"
              size="sm"
            >
              <Save className="w-4 h-4 mr-1" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>

          <div className="flex-1 overflow-auto p-8">
            <div className="max-w-4xl mx-auto bg-white border-4 border-bauhaus shadow-bauhaus p-12">
              <Editor
                content={content}
                onUpdate={setContent}
                isLocked={!isAiUnlocked}
              />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* LEFT SIDEBAR: Projects Navigation */}
      {showProjectSidebar && <ProjectSidebar />}

      {/* CENTER: Editor */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Bar */}
        <div className="bg-white border-b-4 border-bauhaus px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!showProjectSidebar && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProjectSidebar(true)}
                className="border-2 border-bauhaus rounded-none"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            )}
            {showProjectSidebar && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProjectSidebar(false)}
                className="border-2 border-bauhaus rounded-none"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            )}

            <input
              type="text"
              value={project.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              onBlur={handleSave}
              className="font-black uppercase tracking-tight text-lg border-2 border-transparent hover:border-bauhaus focus:border-bauhaus-blue focus:outline-none px-2 py-1 bg-transparent"
            />

            {isAiUnlocked && (
              <span className="px-2 py-1 bg-green-500 border-2 border-bauhaus text-white text-xs font-black uppercase">
                AI ✓
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase text-gray-600">
              {wordCount} words
            </span>
            <Button
              onClick={() => setIsZenMode(true)}
              className="border-2 border-bauhaus rounded-none hover:bg-bauhaus-blue hover:text-white transition-colors btn-press bg-white"
              size="sm"
            >
              <Maximize2 className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline font-bold uppercase text-xs">Zen</span>
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-bauhaus-red text-white border-4 border-bauhaus shadow-bauhaus btn-press font-bold uppercase text-xs"
              size="sm"
            >
              <Save className="w-4 h-4 mr-1" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        {/* Editor Area - Paper-like with Serif Font */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-3xl mx-auto bg-white border-4 border-bauhaus shadow-bauhaus p-8 md:p-12">
            <style jsx global>{`
              .ProseMirror {
                font-family: 'Merriweather', 'Georgia', serif;
                font-size: 16px;
                line-height: 1.8;
                color: #1a1a1a;
              }
              .ProseMirror h1 {
                font-family: 'Inter', sans-serif;
                font-weight: 900;
                font-size: 2em;
                margin-bottom: 0.5em;
              }
              .ProseMirror h2 {
                font-family: 'Inter', sans-serif;
                font-weight: 800;
                font-size: 1.5em;
                margin-top: 1em;
                margin-bottom: 0.5em;
              }
              .ProseMirror p {
                margin-bottom: 1em;
              }
              .ProseMirror ul, .ProseMirror ol {
                padding-left: 1.5em;
                margin-bottom: 1em;
              }
            `}</style>
            <Editor
              content={content}
              onUpdate={setContent}
              isLocked={!isAiUnlocked}
            />
          </div>
        </div>
      </main>

      {/* RIGHT SIDEBAR: AI Assistant */}
      {showAiSidebar && (
        <div className="w-80 relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAiSidebar(false)}
            className="absolute top-2 left-2 z-10 border-2 border-bauhaus rounded-none bg-white"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
          <AiSidebar
            projectId={id as string}
            isLocked={!isAiUnlocked}
            wordCount={wordCount}
            wordsToUnlock={wordsToUnlock}
            chatHistory={chatHistory}
            onNewChat={handleNewChat}
          />
        </div>
      )}

      {/* Toggle AI Sidebar Button (when hidden) */}
      {!showAiSidebar && (
        <Button
          onClick={() => setShowAiSidebar(true)}
          className="fixed right-4 top-1/2 -translate-y-1/2 bg-bauhaus-blue text-white border-4 border-bauhaus shadow-bauhaus btn-press font-black uppercase text-xs py-6"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}