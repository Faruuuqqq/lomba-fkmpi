'use client';

import { useState } from 'react';
import { Send, Lock, Unlock, Bot, User } from 'lucide-react';
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
      alert('Failed to get AI response. Make sure you have written at least 150 words.');
    } finally {
      setIsLoading(false);
    }
  };

  const progress = (wordCount / 150) * 100;

  return (
    <div className="flex flex-col h-full bg-card border-l">
      <div className="p-4 border-b">
        <h2 className="font-semibold flex items-center gap-2">
          <Bot className="w-5 h-5" />
          MITRA AI Assistant
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {isLocked ? 'AI Locked' : 'AI Unlocked'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLocked ? (
          <div className="text-center py-8">
            <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">AI is Locked</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Write at least 150 words to unlock AI assistance
            </p>
            <div className="w-full bg-muted rounded-full h-2 mb-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {wordCount}/150 words ({wordsToUnlock} more to unlock)
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 text-green-600">
              <Unlock className="w-4 h-4" />
              <span className="text-sm font-medium">AI Unlocked</span>
            </div>
            {chatHistory.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Start a conversation with MITRA AI</p>
                <p className="text-xs mt-2">Ask for feedback on your essay</p>
              </div>
            )}
            {chatHistory.map((chat) => (
              <div key={chat.id} className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="flex-1 bg-muted rounded-lg p-3">
                    <p className="text-sm">{chat.userPrompt}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <Bot className="w-4 h-4 text-secondary-foreground" />
                  </div>
                  <div className="flex-1 bg-secondary rounded-lg p-3">
                    <p className="text-sm">{chat.aiResponse}</p>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <div className="p-4 border-t">
        {isLocked ? (
          <div className="text-center text-sm text-muted-foreground">
            Complete {wordsToUnlock} more words to unlock AI
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
              className="flex-1 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !query.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
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
