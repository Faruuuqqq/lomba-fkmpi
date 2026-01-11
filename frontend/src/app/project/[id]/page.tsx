'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Editor } from '@/components/Editor';
import { AiSidebar } from '@/components/AiSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useDebounce } from '@/hooks/useDebounce';
import { projectsAPI } from '@/lib/api';
import { exportToPDF } from '@/lib/pdf-export';
import { Project, AiInteraction, SaveResponse } from '@/types';
import { ArrowLeft, Save, Download, Check, X, FileText } from 'lucide-react';

export default function ProjectPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [content, setContent] = useState('');
  const [displayContent, setDisplayContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [isAiUnlocked, setIsAiUnlocked] = useState(false);
  const [chatHistory, setChatHistory] = useState<AiInteraction[]>([]);
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [reflection, setReflection] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  const debouncedContent = useDebounce(content, 2000);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (id) {
      fetchProject(id as string);
    }

    return () => {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }
    };
  }, [id, isAuthenticated, router]);

  useEffect(() => {
    const countWords = (text: string) => {
      const trimmedText = text.trim();
      if (trimmedText === '') return 0;
      return trimmedText.split(/\s+/).length;
    };

    const currentCount = countWords(debouncedContent);
    setWordCount(currentCount);
    setDisplayContent(debouncedContent);
    
    const shouldAutoSave = project && debouncedContent && !isSaving && debouncedContent !== project.content;
    
    if (shouldAutoSave) {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }
      
      autoSaveRef.current = setTimeout(() => {
        handleAutoSave();
      }, 30000);
    }
  }, [debouncedContent, project]);

  const fetchProject = async (projectId: string) => {
    try {
      setIsLoading(true);
      const { data } = await projectsAPI.getOne(projectId);
      setProject(data);
      setContent(data.content);
      setWordCount(data.wordCount);
      setIsAiUnlocked(data.isAiUnlocked);
      setChatHistory(data.aiChats || []);
    } catch (error) {
      console.error('Error fetching project:', error);
      alert('Failed to load project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!project) return;

    try {
      setIsSaving(true);
      const { data }: { data: SaveResponse } = await projectsAPI.save(
        project.id,
        content
      );
      setWordCount(data.wordCount);
      setIsAiUnlocked(data.isAiUnlocked);
      setProject(data.project);
      alert('Project saved successfully!');
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAutoSave = async () => {
    if (!project) return;

    try {
      setIsAutoSaving(true);
      const { data }: { data: SaveResponse } = await projectsAPI.save(
        project.id,
        content
      );
      setWordCount(data.wordCount);
      setIsAiUnlocked(data.isAiUnlocked);
      setProject(data.project);
    } catch (error) {
      console.error('Error auto-saving project:', error);
    } finally {
      setIsAutoSaving(false);
    }
  };

  const handleFinish = () => {
    setShowReflectionModal(true);
  };

  const handleFinishWithReflection = async () => {
    if (!project) return;

    try {
      await projectsAPI.finish(project.id, reflection);
      alert('Project finished successfully!');
      setShowReflectionModal(false);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error finishing project:', error);
      alert('Failed to finish project');
    }
  };

  const handleNewChat = (interaction: AiInteraction) => {
    setChatHistory([...chatHistory, interaction]);
  };

  const handleExportPDF = () => {
    if (!project) return;

    exportToPDF(
      project.title,
      content,
      wordCount,
      project.status,
      chatHistory,
      reflection
    );
  };

  const handleExportHTML = () => {
    if (!project) return;

    const printContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${project.title} - MITRA AI</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #fff; }
    h1 { color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
    h2 { color: #1f2937; border-top: 2px solid #e5e7eb; padding-top: 20px; margin-top: 30px; }
    .essay { margin: 20px 0; line-height: 1.8; white-space: pre-wrap; color: #374151; }
    .chat-history { margin-top: 40px; }
    .chat-item { margin: 15px 0; padding: 15px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #2563eb; }
    .chat-user { color: #1f2937; font-weight: bold; margin-bottom: 5px; }
    .chat-ai { color: #2563eb; font-style: italic; }
    .stats { background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #bfdbfe; }
    .stats-item { display: inline-block; margin-right: 30px; }
    .stats-label { color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    .stats-value { color: #1f2937; font-size: 24px; font-weight: bold; }
    .reflection { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
    .reflection-title { font-weight: bold; color: #92400e; margin-bottom: 5px; }
  </style>
</head>
<body>
  <h1>${project.title}</h1>
  <div class="stats">
    <div class="stats-item">
      <div class="stats-label">Word Count</div>
      <div class="stats-value">${wordCount}</div>
    </div>
    <div class="stats-item">
      <div class="stats-label">Status</div>
      <div class="stats-value">${project.status}</div>
    </div>
    <div class="stats-item">
      <div class="stats-label">AI Interactions</div>
      <div class="stats-value">${chatHistory.length}</div>
    </div>
  </div>
  <h2>Essay</h2>
  <div class="essay">${content}</div>
  ${reflection ? `
  <div class="reflection">
    <div class="reflection-title">Student Reflection:</div>
    ${reflection}
  </div>
  ` : ''}
  ${chatHistory.length > 0 ? `
  <div class="chat-history">
    <h2>AI Discussion Log</h2>
    ${chatHistory.map(chat => `
      <div class="chat-item">
        <div class="chat-user">Student: ${chat.userPrompt}</div>
        <div class="chat-ai">MITRA AI: ${chat.aiResponse}</div>
      </div>
    `).join('')}
  </div>
  ` : ''}
  <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px;">
    Generated by MITRA AI - Academic Writing Assistant<br>
    ${new Date().toLocaleDateString()}
  </div>
</body>
</html>`;

    const blob = new Blob([printContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.title.replace(/\s+/g, '-')}-mitra-ai-report.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const wordsToUnlock = Math.max(0, 150 - wordCount);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Project not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold">{project.title}</h1>
                {isAutoSaving && (
                  <p className="text-xs text-muted-foreground">Auto-saving...</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="mr-4 text-right">
                <div className="text-sm font-medium">
                  {wordCount} / 150 words
                </div>
                <div className={`text-xs ${isAiUnlocked ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {isAiUnlocked ? 'AI Unlocked' : `${wordsToUnlock} words to unlock`}
                </div>
              </div>
              <Button onClick={handleSave} disabled={isSaving || isAutoSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
              <div className="relative">
                <Button variant="outline" onClick={() => setShowExportMenu(!showExportMenu)}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                  <FileText className="w-3 h-3 ml-2" />
                </Button>
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-10">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          handleExportPDF();
                          setShowExportMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Export as PDF
                      </button>
                      <button
                        onClick={() => {
                          handleExportHTML();
                          setShowExportMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Export as HTML
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <Button variant="default" onClick={handleFinish}>
                <Check className="w-4 h-4 mr-2" />
                Finish
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        <div className="flex-1 container mx-auto px-4 py-6">
          <Card>
            <CardHeader>
              <CardTitle>Write Your Essay</CardTitle>
            </CardHeader>
            <CardContent>
              <Editor
                content={content}
                onUpdate={setContent}
                isLocked={!isAiUnlocked}
              />
            </CardContent>
          </Card>
        </div>

        <div className="w-96 border-l">
          <AiSidebar
            projectId={project.id}
            isLocked={!isAiUnlocked}
            wordCount={wordCount}
            wordsToUnlock={wordsToUnlock}
            chatHistory={chatHistory}
            onNewChat={handleNewChat}
          />
        </div>
      </div>

      {showReflectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Finish Project</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Reflection (Required)
                  </label>
                  <p className="text-sm text-muted-foreground mb-2">
                    What did you learn from the AI feedback? What changes did you make to your essay?
                  </p>
                  <textarea
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="Write your reflection here..."
                    className="w-full min-h-[150px] px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowReflectionModal(false)}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleFinishWithReflection} disabled={!reflection.trim()}>
                    <Check className="w-4 h-4 mr-2" />
                    Finish & Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
