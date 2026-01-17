'use client';

import { useState } from 'react';
import { Send, Lock, Unlock, Bot, User, Sparkles } from 'lucide-react';
import { AiInteraction } from '@/types';
import { aiAPI } from '@/lib/api';

interface AiSidebarProps {
  projectId: string;
  isLocked: boolean;
  wordCount: number;
  wordsToUnlock: number;
  chatHistory: AiInteraction[];
  onNewChat: (interaction: AiInteraction) => void;
}

export function AiSidebar({
  projectId,
  isLocked,
  wordCount,
  wordsToUnlock,
  chatHistory,
  onNewChat,
}: AiSidebarProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const { data } = await aiAPI.analyze(projectId, '', query);
      const newInteraction: AiInteraction = {
        id: Date.now().toString(),
        userPrompt: query,
        aiResponse: data.response,
        timestamp: new Date().toISOString(),
        projectId,
      };
      onNewChat(newInteraction);
      setQuery('');
    } catch (error) {
      console.error('Error analyzing:', error);
      alert('Failed to get AI response. Make sure you have written at least 50 words.');
    } finally {
      setIsLoading(false);
    }
  };

  const progress = Math.min((wordCount / 50) * 100, 100);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-xl">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <div className="p-1.5 bg-indigo-600 rounded-lg">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm">AI Assistant</span>
          </h2>
          {!isLocked && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-teal-100 dark:bg-teal-900/30 rounded-full">
              <Unlock className="w-3 h-3 text-teal-600 dark:text-teal-400" />
              <span className="text-xs font-medium text-teal-700 dark:text-teal-300">Active</span>
            </div>
          )}
        </div>

        {/* Tab-like Navigation */}
        <div className="flex gap-2 text-xs mt-3">
          <button className="px-3 py-1.5 bg-white dark:bg-slate-900 rounded-md shadow-sm font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            Chat
          </button>
          <button className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 rounded-md transition-colors">
            Logic Map
          </button>
          <button className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 rounded-md transition-colors">
            Ethics
          </button>
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLocked ? (
          <div className="text-center py-8 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl mb-4">
              <Lock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="font-semibold mb-2 text-slate-900 dark:text-slate-100">AI Locked</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Write at least <span className="font-semibold text-indigo-600 dark:text-indigo-400">50 words</span> to unlock AI assistance
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 mb-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {wordCount}/50 words ({wordsToUnlock} more to unlock)
            </p>
          </div>
        ) : (
          <>
            {chatHistory.length === 0 && (
              <div className="text-center py-8 px-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl mb-4">
                  <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Start a conversation with MITRA AI</p>
                <p className="text-xs text-slate-500 dark:text-slate-500">Ask for feedback on your essay</p>
              </div>
            )}

            {chatHistory.map((chat) => (
              <div key={chat.id} className="space-y-3 fade-in">
                {/* User Message */}
                <div className="flex gap-3 justify-end">
                  <div className="flex-1 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl rounded-tr-sm p-3 max-w-[85%]">
                    <p className="text-sm text-slate-800 dark:text-slate-200">{chat.userPrompt}</p>
                  </div>
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
                    <User className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-md">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-sm p-3 max-w-[85%]">
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{chat.aiResponse}</p>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        {isLocked ? (
          <div className="text-center text-sm text-slate-500 dark:text-slate-400 py-2">
            Complete <span className="font-semibold text-indigo-600 dark:text-indigo-400">{wordsToUnlock}</span> more words to unlock AI
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask MITRA AI for feedback..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 text-sm border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !query.trim()}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg disabled:shadow-none"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
