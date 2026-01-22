'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useGamification } from '@/contexts/GamificationContext';
import { AiInteraction } from '@/types';
import { aiAPI } from '@/lib/api';
import { Send, Bot, User, Sparkles, ArrowLeft, Copy, Trash2, RefreshCw, Coins, MessageSquare, Brain, Lightbulb, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

type ChatMode = 'socratic' | 'research' | 'critical';

export default function AiChatPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { stats, addTokens, setShowDailyChallenge } = useGamification();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<AiInteraction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<ChatMode>('socratic');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSend = async (retryCount = 0) => {
    if (!query.trim()) return;

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

      // Add user message immediately
      const userMessage: AiInteraction = {
        id: Date.now().toString() + '_user',
        userPrompt: userQuery,
        aiResponse: '',
        timestamp: new Date().toISOString(),
        projectId: 'ai-chat',
      };

      setChatHistory(prev => [...prev, userMessage]);

      // Add prompt based on mode
      let prompt = userQuery;
      if (activeMode === 'socratic') {
        prompt = `[SOCRATIC MODE - Ask questions back, don't give direct answers] ${userQuery}`;
      } else if (activeMode === 'research') {
        prompt = `[RESEARCH MODE - Help with literature review and citations] ${userQuery}`;
      } else if (activeMode === 'critical') {
        prompt = `[CRITICAL MODE - Challenge arguments and identify fallacies] ${userQuery}`;
      }

      const { data } = await aiAPI.analyze('ai-chat', '', prompt);

      // Replace the temporary message with the actual response
      const aiResponse: AiInteraction = {
        id: Date.now().toString(),
        userPrompt: userQuery,
        aiResponse: data.analysis || data.response,
        timestamp: new Date().toISOString(),
        projectId: 'ai-chat',
      };

      setChatHistory(prev => [...prev.slice(0, -1), aiResponse]);
      toast.success('✓ Response complete');
    } catch (error: any) {
      console.error('Chat error:', error);
      addTokens(5); // Refund on error

      const errorMessage = error.response?.data?.message || error.message || 'Failed to analyze';
      setError(errorMessage);

      // Remove the temporary user message
      setChatHistory(prev => prev.filter(msg => !msg.id.includes('_user')));

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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setChatHistory([]);
    toast.success('Chat cleared');
  };

  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  const getModeIcon = (mode: ChatMode) => {
    switch (mode) {
      case 'socratic':
        return <Brain className="w-4 h-4" />;
      case 'research':
        return <MessageSquare className="w-4 h-4" />;
      case 'critical':
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getModeDescription = (mode: ChatMode) => {
    switch (mode) {
      case 'socratic':
        return 'AI will ask questions to guide your thinking';
      case 'research':
        return 'Help with literature review and citations';
      case 'critical':
        return 'Challenge your arguments and identify fallacies';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push('/projects')}
              className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Projects
            </button>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="font-bold text-sm text-amber-700 dark:text-amber-300">{stats.tokens}</span>
              </div>
              <button
                onClick={clearChat}
                className="flex items-center gap-2 px-3 py-1.5 text-zinc-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Clear Chat
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">AI Assistant</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Your academic writing companion</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-700 px-6 py-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveMode('socratic')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeMode === 'socratic'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'
              }`}
            >
              <Brain className="w-4 h-4" />
              Socratic
            </button>
            <button
              onClick={() => setActiveMode('research')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeMode === 'research'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Research
            </button>
            <button
              onClick={() => setActiveMode('critical')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeMode === 'critical'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              Critical
            </button>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
            {getModeDescription(activeMode)}
          </p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800 dark:text-red-200">Error</p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
              </div>
            </div>
          )}

          {chatHistory.length === 0 ? (
            <div className="text-center py-16">
              <Sparkles className="w-20 h-20 mx-auto mb-6 text-zinc-300 dark:text-zinc-700" />
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Start a conversation
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                Ask me anything about your writing, research, or arguments
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <button
                  onClick={() => setQuery('What are the weaknesses in my argument?')}
                  className="p-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-left hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors"
                >
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                    Challenge my argument
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Find logical fallacies
                  </p>
                </button>
                <button
                  onClick={() => setQuery('Help me find relevant sources for my topic')}
                  className="p-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-left hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors"
                >
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                    Find sources
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Get research help
                  </p>
                </button>
                <button
                  onClick={() => setQuery('Ask me questions to help develop my thinking')}
                  className="p-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-left hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors"
                >
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                    Guide my thinking
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Socratic dialogue
                  </p>
                </button>
              </div>
            </div>
          ) : (
            chatHistory.map((chat) => (
              <div key={chat.id} className="space-y-4">
                {/* User Message */}
                <div className="flex gap-3 justify-end">
                  <div className="max-w-2xl p-4 bg-indigo-600 text-white rounded-2xl rounded-br-md">
                    <p className="text-sm leading-relaxed">{chat.userPrompt}</p>
                  </div>
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>

                {/* AI Message */}
                <div
                  className="flex gap-3"
                  onMouseEnter={() => setHoveredMessageId(chat.id)}
                  onMouseLeave={() => setHoveredMessageId(null)}
                >
                  <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                  </div>
                  <div className="flex-1 max-w-2xl relative group">
                    <div className="p-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl rounded-bl-md shadow-sm">
                      <p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
                        {chat.aiResponse}
                      </p>
                    </div>

                    {/* Hover Actions */}
                    {hoveredMessageId === chat.id && (
                      <div className="absolute -bottom-2 right-2 flex gap-1">
                        <button
                          onClick={() => copyMessage(chat.aiResponse)}
                          className="p-2 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-lg shadow-lg hover:bg-zinc-50 dark:hover:bg-zinc-600 transition-colors"
                          title="Copy"
                        >
                          <Copy className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
              </div>
              <div className="p-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl rounded-bl-md">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question or paste your text..."
                disabled={isLoading}
                className="w-full p-4 pr-16 bg-zinc-50 dark:bg-zinc-900 border-4 border-bauhaus dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm min-h-[60px] max-h-[200px]"
                rows={1}
              />
              <div className="absolute bottom-3 right-3 text-xs text-zinc-500">
                {query.length > 0 && `${query.length} chars`}
              </div>
            </div>
            <button
              onClick={() => handleSend()}
              disabled={!query.trim() || isLoading}
              className="px-6 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-semibold text-sm flex items-center gap-2 transition-colors"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
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
          <p className="text-xs text-zinc-500 mt-2 text-center">
            5 tokens per message • {stats.tokens} tokens available
          </p>
        </div>
      </div>
    </div>
  );
}
