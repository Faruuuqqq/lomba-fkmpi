'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Editor } from '@/components/Editor';
import { AiSidebar } from '@/components/AiSidebar';
import DevilsAdvocate from '@/components/DevilsAdvocate';
import GrammarChecker from '@/components/GrammarChecker';
import PlagiarismChecker from '@/components/PlagiarismChecker';
import CitationSuggestions from '@/components/CitationSuggestions';
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
  ShieldAlert 
} from 'lucide-react';

export default function ProjectPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  
  const [project, setProject] = useState<Project | null>(null);
  const [content, setContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Chat history for AI features
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  
  // Advanced AI feature states
  const [showDevilsAdvocate, setShowDevilsAdvocate] = useState(false);
  const [showGrammarChecker, setShowGrammarChecker] = useState(false);
  const [showPlagiarismChecker, setShowPlagiarismChecker] = useState(false);
  const [showCitationSuggestions, setShowCitationSuggestions] = useState(false);
  
  // Mobile states
  const [activeTab, setActiveTab] = useState<'editor' | 'advanced' | 'analytics'>('editor');
  
  const debouncedContent = useDebounce(content, 1000);

  // Fetch project data
  useEffect(() => {
    if (!id || !isAuthenticated) return;
    
    const fetchProject = async () => {
      try {
        const projectData = await projectsAPI.getById(id as string);
        setProject(projectData);
        setContent(projectData.content || '');
        setWordCount(projectData.wordCount || 0);
        
        // Fetch chat history
        const history = await aiAPI.getChatHistory(id as string);
        setChatHistory(history);
      } catch (error) {
        console.error('Failed to fetch project:', error);
        router.push('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [id, isAuthenticated]);

  // Auto-save functionality
  useEffect(() => {
    if (!project || debouncedContent === content) return;

    const autoSave = setTimeout(() => {
      handleSave(debouncedContent);
    }, 1000);

    return () => clearTimeout(autoSave);
  }, [debouncedContent, project]);

  // Word count tracking
  useEffect(() => {
    const words = content.split(/\s+/).filter(word => word.length > 0).length;
    setWordCount(words);
  }, [content]);

  const handleSave = async (contentToSave?: string) => {
    if (!project) return;

    setIsSaving(true);
    try {
      await projectsAPI.save(id as string, contentToSave || content);
      setLastSaved(new Date());
      
      // Update project state
      setProject(prev => prev ? {
        ...prev,
        content: contentToSave || content,
        wordCount: words,
        updatedAt: new Date()
      } : null);
    } catch (error) {
      console.error('Failed to save project:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDevilsAdvocateResponse = (response: any) => {
    // Add to chat history
    setChatHistory(prev => [...prev, {
      userPrompt: content,
      aiResponse: response.text,
      timestamp: new Date(),
      persona: 'devils_advocate'
    }]);
  };

  const handleGrammarCorrection = (correctedText: string) => {
    setContent(correctedText);
  };

  const handleCitationSelect = (citation: any) => {
    // Add citation to content at cursor position or end
    const citationText = `\n\n[${citation.type}] ${citation.authors.join(', ')} (${citation.year}). ${citation.title}.`;
    setContent(prev => prev + citationText);
  };

  const exportProject = async () => {
    if (!project) return;

    try {
      const blob = await projectsAPI.exportPDF(id as string);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.title}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export project:', error);
    }
  };

  const isAiUnlocked = wordCount >= 150;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-xl font-semibold text-gray-900 truncate">
                {project.title}
              </h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-600 mr-4">
                {wordCount} words • {isAiUnlocked ? 'AI Unlocked' : `Locked (${150 - wordCount} words to unlock)`}
              </div>
              
              <Button
                onClick={() => handleSave()}
                disabled={isSaving}
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
              
              <Button
                onClick={exportProject}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Tabs */}
      <div className="md:hidden bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('editor')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'editor'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setActiveTab('advanced')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'advanced'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Advanced AI
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Editor Section */}
          <div className="lg:col-span-2">
            {(activeTab === 'editor' || !isAiUnlocked) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Network className="h-5 w-5 mr-2" />
                    Editor
                    {isAiUnlocked && (
                      <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        AI Unlocked
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Editor
                    content={content}
                    onChange={setContent}
                    placeholder="Start writing your academic paper here..."
                    disabled={false}
                  />
                  {lastSaved && (
                    <div className="mt-4 text-sm text-gray-600">
                      Last saved: {lastSaved.toLocaleTimeString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Advanced AI Features (Mobile) */}
            {(activeTab === 'advanced' && isAiUnlocked) && (
              <div className="space-y-6">
                <DevilsAdvocate
                  projectId={id as string}
                  content={content}
                  chatHistory={chatHistory}
                  onResponse={handleDevilsAdvocateResponse}
                />
                
                <GrammarChecker
                  content={content}
                  onCorrection={handleGrammarCorrection}
                />
                
                <PlagiarismChecker
                  content={content}
                  projectId={id as string}
                />
                
                <CitationSuggestions
                  topic={project.title}
                  content={content}
                  onCitationSelect={handleCitationSelect}
                />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Sidebar - Desktop */}
            {isAiUnlocked && (
              <div className="hidden md:block">
                <AiSidebar projectId={id as string} />
              </div>
            )}

            {/* Advanced AI Features - Desktop */}
            {isAiUnlocked && (
              <div className="hidden md:block space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Advanced AI Tools</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant={showDevilsAdvocate ? 'default' : 'outline'}
                      onClick={() => setShowDevilsAdvocate(!showDevilsAdvocate)}
                      className="w-full justify-start"
                    >
                      😈 Devil's Advocate
                    </Button>
                    
                    <Button
                      variant={showGrammarChecker ? 'default' : 'outline'}
                      onClick={() => setShowGrammarChecker(!showGrammarChecker)}
                      className="w-full justify-start"
                    >
                      ✅ Grammar Check
                    </Button>
                    
                    <Button
                      variant={showPlagiarismChecker ? 'default' : 'outline'}
                      onClick={() => setShowPlagiarismChecker(!showPlagiarismChecker)}
                      className="w-full justify-start"
                    >
                      🛡️ Plagiarism Check
                    </Button>
                    
                    <Button
                      variant={showCitationSuggestions ? 'default' : 'outline'}
                      onClick={() => setShowCitationSuggestions(!showCitationSuggestions)}
                      className="w-full justify-start"
                    >
                      📚 Citations
                    </Button>
                  </CardContent>
                </Card>

                {/* Show active features */}
                {showDevilsAdvocate && (
                  <DevilsAdvocate
                    projectId={id as string}
                    content={content}
                    chatHistory={chatHistory}
                    onResponse={handleDevilsAdvocateResponse}
                  />
                )}
                
                {showGrammarChecker && (
                  <GrammarChecker
                    content={content}
                    onCorrection={handleGrammarCorrection}
                  />
                )}
                
                {showPlagiarismChecker && (
                  <PlagiarismChecker
                    content={content}
                    projectId={id as string}
                  />
                )}
                
                {showCitationSuggestions && (
                  <CitationSuggestions
                    topic={project.title}
                    content={content}
                    onCitationSelect={handleCitationSelect}
                  />
                )}
              </div>
            )}

            {/* Project Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Project Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Word Count</span>
                  <span className="font-medium">{wordCount}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">AI Status</span>
                  <span className={`font-medium ${isAiUnlocked ? 'text-green-600' : 'text-gray-400'}`}>
                    {isAiUnlocked ? 'Unlocked' : 'Locked'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Chat History</span>
                  <span className="font-medium">{chatHistory.length}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="font-medium">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}