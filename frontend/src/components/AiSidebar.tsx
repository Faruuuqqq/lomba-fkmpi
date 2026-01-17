'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, BookOpen, Wrench, Copy, ArrowDownToLine, Coins, Brain, AlertCircle, CheckCircle2, RefreshCw, Trash2, Quote } from 'lucide-react';
import { AiInteraction } from '@/types';
import { aiAPI, libraryAPI } from '@/lib/api';
import { Modal } from './Modal';
import toast from 'react-hot-toast';
import { useGamification } from '@/contexts/GamificationContext';

interface AiSidebarProps {
  projectId: string;
  isLocked: boolean;
  wordCount: number;
  wordsToUnlock: number;
  chatHistory: AiInteraction[];
  onNewChat: (interaction: AiInteraction) => void;
  currentContent: string;
  editorInstance?: any;
}

type TabType = 'chat' | 'citations' | 'tools';

export function AiSidebar({
  projectId,
  isLocked,
  wordCount,
  wordsToUnlock,
  chatHistory,
  onNewChat,
  currentContent,
  editorInstance,
}: AiSidebarProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Library State
  const [savedPapers, setSavedPapers] = useState<any[]>([]);
  const [isLoadingPapers, setIsLoadingPapers] = useState(false);

  // Tools modals
  const [showGrammarModal, setShowGrammarModal] = useState(false);
  const [showPlagiarismModal, setShowPlagiarismModal] = useState(false);
  const [showLogicMapModal, setShowLogicMapModal] = useState(false);
  const [grammarResult, setGrammarResult] = useState<any>(null);
  const [plagiarismResult, setPlagiarismResult] = useState<any>(null);
  const [logicMapResult, setLogicMapResult] = useState<any>(null);
  const [isCheckingGrammar, setIsCheckingGrammar] = useState(false);
  const [isCheckingPlagiarism, setIsCheckingPlagiarism] = useState(false);
  const [isGeneratingMap, setIsGeneratingMap] = useState(false);

  const { stats, setShowDailyChallenge, addTokens } = useGamification();
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  useEffect(() => {
    if (activeTab === 'citations') {
      fetchSavedPapers();
    }
  }, [activeTab]);

  const fetchSavedPapers = async () => {
    setIsLoadingPapers(true);
    try {
      const { data } = await libraryAPI.getAll(projectId);
      setSavedPapers(data || []);
    } catch (error) {
      console.error('Failed to fetch papers:', error);
    } finally {
      setIsLoadingPapers(false);
    }
  };

  const handleSend = async (retryCount = 0) => {
    if (!query.trim() || isLocked) return;

    // Check tokens (Cost: 5)
    if (stats.tokens < 5) {
      toast.error('Not enough tokens! Complete Daily Challenge to earn more.');
      setShowDailyChallenge(true);
      return;
    }

    const userQuery = query.trim();
    setQuery('');
    setIsLoading(true);
    setError(null);

    try {
      addTokens(-5);
      const { data } = await aiAPI.analyze(projectId, '', userQuery);
      const newInteraction: AiInteraction = {
        id: Date.now().toString(),
        userPrompt: userQuery,
        aiResponse: data.analysis || data.response,
        timestamp: new Date().toISOString(),
        projectId: projectId,
      };
      onNewChat(newInteraction);
      toast.success('✓ Analysis complete');
    } catch (error: any) {
      console.error('Chat error:', error);
      addTokens(5); // Refund on error

      const errorMessage = error.response?.data?.message || error.message || 'Failed to analyze';
      setError(errorMessage);

      // Retry mechanism
      if (retryCount < 2) {
        toast.error(`${errorMessage}. Retrying... (${retryCount + 1}/2)`);
        setTimeout(() => {
          setQuery(userQuery);
          handleSend(retryCount + 1);
        }, 2000);
      } else {
        toast.error(`${errorMessage}. Please try again later.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCite = (paper: any) => {
    if (!editorInstance) {
      navigator.clipboard.writeText(`(${paper.authors[0]} et al., ${paper.year})`);
      toast.success('Citation copied');
      return;
    }

    // Insert simple citation
    editorInstance.chain().focus().insertContent(` (${paper.authors[0]} et al., ${paper.year}) `).run();
    toast.success('Citation added');
  };

  const handleGrammarCheck = async () => {
    if (!currentContent || currentContent.length < 10) {
      toast.error('Write at least 10 characters to check grammar');
      return;
    }

    if (stats.tokens < 10) {
      toast.error('Not enough tokens! Need 10 tokens.');
      setShowDailyChallenge(true);
      return;
    }

    setIsCheckingGrammar(true);
    setShowGrammarModal(true);

    try {
      addTokens(-10);
      const { data } = await aiAPI.checkGrammar(projectId, currentContent);
      setGrammarResult(data);
      toast.success('✓ Grammar check complete');
    } catch (error: any) {
      console.error('Grammar check error:', error);
      addTokens(10); // Refund
      toast.error(error.response?.data?.message || 'Grammar check failed. Try again.');
      setShowGrammarModal(false);
    } finally {
      setIsCheckingGrammar(false);
    }
  };

  const handlePlagiarismCheck = async () => {
    if (!currentContent || currentContent.length < 50) {
      toast.error('Write at least 50 characters to check plagiarism');
      return;
    }

    if (stats.tokens < 10) {
      toast.error('Not enough tokens! Need 10 tokens.');
      setShowDailyChallenge(true);
      return;
    }

    setIsCheckingPlagiarism(true);
    setShowPlagiarismModal(true);

    try {
      addTokens(-10);
      const { data } = await aiAPI.checkPlagiarism(projectId, currentContent);
      setPlagiarismResult(data);
      toast.success('✓ Plagiarism check complete');
    } catch (error: any) {
      console.error('Plagiarism check error:', error);
      addTokens(10); // Refund
      toast.error(error.response?.data?.message || 'Plagiarism check failed. Try again.');
      setShowPlagiarismModal(false);
    } finally {
      setIsCheckingPlagiarism(false);
    }
  };

  const handleLogicMap = async () => {
    if (!currentContent || currentContent.length < 100) {
      toast.error('Write at least 100 characters to generate logic map');
      return;
    }

    if (stats.tokens < 15) {
      toast.error('Not enough tokens! Need 15 tokens.');
      setShowDailyChallenge(true);
      return;
    }

    setIsGeneratingMap(true);
    setShowLogicMapModal(true);

    try {
      addTokens(-15);
      const { data } = await aiAPI.generateMap(projectId, currentContent);
      setLogicMapResult(data);
      toast.success('✓ Logic map generated');
    } catch (error: any) {
      console.error('Logic map error:', error);
      addTokens(15); // Refund
      toast.error(error.response?.data?.message || 'Logic map generation failed. Try again.');
      setShowLogicMapModal(false);
    } finally {
      setIsGeneratingMap(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const insertToEditor = (text: string) => {
    if (!editorInstance) {
      navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
      return;
    }

    editorInstance.chain().focus().insertContent(`\n\n${text}\n\n`).run();
    toast.success('✓ Inserted to editor');
  };

  return (
    <>
      <aside className="w-80 h-screen bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 flex flex-col">
        {/* Header with Token Balance */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-sm uppercase tracking-tight">AI Assistant</h2>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-none">
              <Coins className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="font-bold text-sm text-amber-700 dark:text-amber-300">{stats.tokens}</span>
            </div>
          </div>

          {/* Segmented Control Tabs */}
          <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-none">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-semibold transition-all ${activeTab === 'chat'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-bauhaus-lg-bauhaus'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
            >
              <Brain className="w-3.5 h-3.5" />
              Chat
            </button>
            <button
              onClick={() => setActiveTab('citations')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-semibold transition-all ${activeTab === 'citations'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-bauhaus-lg-bauhaus'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Library
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-semibold transition-all ${activeTab === 'tools'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-bauhaus-lg-bauhaus'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              Tools
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border-4 border-bauhaus-red dark:border-red-800 rounded-none flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-red-800 dark:text-red-200">Error</p>
                      <p className="text-xs text-red-700 dark:text-red-300 mt-1">{error}</p>
                    </div>
                  </div>
                )}

                {chatHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <Sparkles className="w-12 h-12 mx-auto mb-3 text-zinc-300 dark:text-zinc-700" />
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                      Start a conversation
                    </p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-600">
                      Ask me to challenge your arguments
                    </p>
                  </div>
                ) : (
                  chatHistory.map((chat) => (
                    <div key={chat.id} className="space-y-3">
                      {/* User Message */}
                      <div className="flex gap-2 justify-end">
                        <div className="max-w-[85%] p-3 bg-indigo-600 text-white rounded-none rounded-none">
                          <p className="text-sm leading-relaxed">{chat.userPrompt}</p>
                        </div>
                        <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-none flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                      </div>

                      {/* AI Message */}
                      <div
                        className="flex gap-2"
                        onMouseEnter={() => setHoveredMessageId(chat.id)}
                        onMouseLeave={() => setHoveredMessageId(null)}
                      >
                        <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-none flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                        </div>
                        <div className="max-w-[85%] relative group">
                          <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-none rounded-none border-4 border-bauhaus dark:border-zinc-700">
                            <p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
                              {chat.aiResponse}
                            </p>
                          </div>

                          {/* Hover Actions */}
                          {hoveredMessageId === chat.id && (
                            <div className="absolute -bottom-2 right-2 flex gap-1">
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(chat.aiResponse);
                                  toast.success('Copied!');
                                }}
                                className="p-1.5 bg-white dark:bg-zinc-700 border-4 border-bauhaus dark:border-zinc-600 rounded shadow-bauhaus-lg-bauhaus hover:bg-zinc-50 dark:hover:bg-zinc-600 transition-colors"
                                title="Copy"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                              {editorInstance && (
                                <button
                                  onClick={() => insertToEditor(chat.aiResponse)}
                                  className="p-1.5 bg-indigo-600 text-white border border-indigo-700 rounded shadow-bauhaus-lg-bauhaus hover:bg-indigo-700 transition-colors"
                                  title="Insert to Editor"
                                >
                                  <ArrowDownToLine className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-none flex items-center justify-center">
                      <Bot className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-none">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-zinc-400 rounded-none animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-zinc-400 rounded-none animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-zinc-400 rounded-none animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                {isLocked ? (
                  <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-none text-center">
                    <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                      🔒 Write {wordsToUnlock} more words to unlock AI
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Challenge my argument..."
                      disabled={isLoading}
                      className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border-4 border-bauhaus dark:border-zinc-700 rounded-none focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
                      rows={3}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500">5 tokens per message</span>
                      <button
                        onClick={() => handleSend()}
                        disabled={!query.trim() || isLoading}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-none font-semibold text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-none animate-spin"></div>
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Send
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Library Tab */}
          {activeTab === 'citations' && (
            <div className="flex-1 overflow-y-auto p-4 bg-zinc-50/50 dark:bg-zinc-900/50">
              {isLoadingPapers ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <RefreshCw className="w-6 h-6 text-zinc-400 animate-spin" />
                  <p className="text-xs text-zinc-500">Loading library...</p>
                </div>
              ) : savedPapers.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 text-zinc-300 dark:text-zinc-700" />
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                    No saved references
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-600 mb-4">
                    Visit the Research Library to save papers
                  </p>
                  <button
                    onClick={() => window.location.href = '/library'}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-none font-semibold text-xs transition-colors shadow-bauhaus-lg-bauhaus"
                  >
                    Go to Library
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <h3 className="text-xs font-bold uppercase text-zinc-500">Saved Papers ({savedPapers.length})</h3>
                    <button
                      onClick={() => window.location.href = '/library'}
                      className="text-xs text-indigo-600 font-semibold hover:underline"
                    >
                      + Add More
                    </button>
                  </div>
                  {savedPapers.map((paper) => (
                    <div key={paper.id} className="bg-white dark:bg-zinc-800 border-4 border-bauhaus dark:border-zinc-700 rounded-none p-3 shadow-bauhaus-lg-bauhaus hover:shadow-bauhaus-lg transition-shadow-bauhaus-lg group">
                      <div className="flex items-start gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 leading-tight mb-1 truncate">
                            {paper.title}
                          </h4>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                            {paper.authors.join(', ')} • {paper.year}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleCite(paper)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                        >
                          <Quote className="w-3 h-3" />
                          Cite
                        </button>
                        <a
                          href={paper.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center px-2 py-1.5 bg-zinc-50 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 rounded hover:bg-zinc-100 dark:hover:bg-zinc-600 transition-colors"
                          title="View Source"
                        >
                          <ArrowDownToLine className="w-3 h-3 rotate-180" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tools Tab */}
          {activeTab === 'tools' && (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                <button
                  onClick={handleGrammarCheck}
                  disabled={isCheckingGrammar || !currentContent}
                  className="w-full p-4 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border-4 border-bauhaus dark:border-zinc-700 rounded-none text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm">Grammar Check</span>
                    <span className="text-xs text-zinc-500">10 tokens</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Analyze grammar, spelling, and style
                  </p>
                </button>

                <button
                  onClick={handlePlagiarismCheck}
                  disabled={isCheckingPlagiarism || !currentContent}
                  className="w-full p-4 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border-4 border-bauhaus dark:border-zinc-700 rounded-none text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm">Plagiarism Check</span>
                    <span className="text-xs text-zinc-500">10 tokens</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Verify the originality of your work
                  </p>
                </button>

                <button
                  onClick={handleLogicMap}
                  disabled={isGeneratingMap || !currentContent}
                  className="w-full p-4 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border-4 border-bauhaus dark:border-zinc-700 rounded-none text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm">Logic Map</span>
                    <span className="text-xs text-zinc-500">15 tokens</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Visualize argument structure
                  </p>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Grammar Check Modal */}
      <Modal
        isOpen={showGrammarModal}
        onClose={() => setShowGrammarModal(false)}
        title="Grammar Check Results"
      >
        {isCheckingGrammar ? (
          <div className="text-center py-12">
            <RefreshCw className="w-12 h-12 mx-auto mb-4 text-indigo-600 animate-spin" />
            <p className="text-sm font-semibold">Analyzing your text...</p>
          </div>
        ) : grammarResult ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-none">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h3 className="font-bold text-green-900 dark:text-green-100">Analysis Complete</h3>
              </div>
              <p className="text-sm text-green-800 dark:text-green-200">
                {grammarResult.summary || 'Your text has been analyzed for grammar, spelling, and style.'}
              </p>
            </div>
            {grammarResult.issues && grammarResult.issues.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-sm">Issues Found:</h4>
                {grammarResult.issues.map((issue: any, idx: number) => (
                  <div key={idx} className="p-3 bg-zinc-50 dark:bg-zinc-800 border-4 border-bauhaus dark:border-zinc-700 rounded-none">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-1">{issue.type}</p>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300">{issue.message}</p>
                    {issue.suggestion && (
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                        Suggestion: {issue.suggestion}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </Modal>

      {/* Plagiarism Check Modal */}
      <Modal
        isOpen={showPlagiarismModal}
        onClose={() => setShowPlagiarismModal(false)}
        title="Plagiarism Check Results"
      >
        {isCheckingPlagiarism ? (
          <div className="text-center py-12">
            <RefreshCw className="w-12 h-12 mx-auto mb-4 text-indigo-600 animate-spin" />
            <p className="text-sm font-semibold">Checking originality...</p>
          </div>
        ) : plagiarismResult ? (
          <div className="space-y-4">
            <div className={`p-4 border rounded-none ${plagiarismResult.isOriginal
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
              }`}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className={`w-5 h-5 ${plagiarismResult.isOriginal
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-yellow-600 dark:text-yellow-400'
                  }`} />
                <h3 className={`font-bold ${plagiarismResult.isOriginal
                    ? 'text-green-900 dark:text-green-100'
                    : 'text-yellow-900 dark:text-yellow-100'
                  }`}>
                  {plagiarismResult.isOriginal ? 'Original Content' : 'Similarity Detected'}
                </h3>
              </div>
              <p className="text-sm">
                Similarity Score: <strong>{plagiarismResult.similarityScore}%</strong>
              </p>
            </div>
            {plagiarismResult.sources && plagiarismResult.sources.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-sm">Similar Sources:</h4>
                {plagiarismResult.sources.map((source: any, idx: number) => (
                  <div key={idx} className="p-3 bg-zinc-50 dark:bg-zinc-800 border-4 border-bauhaus dark:border-zinc-700 rounded-none">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{source.title}</p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                      Similarity: {source.similarity}%
                    </p>
                    {source.url && (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-1 inline-block"
                      >
                        View Source →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </Modal>

      {/* Logic Map Modal */}
      <Modal
        isOpen={showLogicMapModal}
        onClose={() => setShowLogicMapModal(false)}
        title="Logic Map"
      >
        {isGeneratingMap ? (
          <div className="text-center py-12">
            <RefreshCw className="w-12 h-12 mx-auto mb-4 text-indigo-600 animate-spin" />
            <p className="text-sm font-semibold">Generating logic map...</p>
          </div>
        ) : logicMapResult ? (
          <div className="space-y-4">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border-4 border-bauhaus-blue dark:border-indigo-800 rounded-none">
              <h3 className="font-bold text-indigo-900 dark:text-indigo-100 mb-2">Analysis</h3>
              <p className="text-sm text-indigo-800 dark:text-indigo-200">
                {logicMapResult.analysis || 'Your argument structure has been analyzed.'}
              </p>
            </div>
            {logicMapResult.graphData && (
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800 border-4 border-bauhaus dark:border-zinc-700 rounded-none">
                <h4 className="font-bold text-sm mb-3">Argument Structure:</h4>
                <div className="space-y-2">
                  {logicMapResult.graphData.nodes?.map((node: any, idx: number) => (
                    <div key={idx} className="p-2 bg-white dark:bg-zinc-900 border-4 border-bauhaus dark:border-zinc-700 rounded">
                      <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${node.type === 'premise' ? 'bg-blue-100 text-blue-800' :
                          node.type === 'evidence' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                        }`}>
                        {node.type}
                      </span>
                      <p className="text-xs mt-2">{node.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </>
  );
}
