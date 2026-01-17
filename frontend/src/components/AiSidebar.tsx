'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Lock, Brain, User, Sparkles } from 'lucide-react';
import { AiInteraction } from '@/types';
import { aiAPI } from '@/lib/api';
import toast from 'react-hot-toast';

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
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSend = async () => {
    if (!query.trim() || isLocked) return;

    const userQuery = query.trim();
    setQuery(''); // Clear immediately for better UX
    setIsLoading(true);

    try {
      const { data } = await aiAPI.analyze(projectId, '', userQuery);
      const newInteraction: AiInteraction = {
        id: Date.now().toString(),
        userPrompt: userQuery,
        aiResponse: data.response,
        timestamp: new Date().toISOString(),
        projectId,
      };
      onNewChat(newInteraction);
      toast.success('AI responded!', { duration: 2000 });
    } catch (error) {
      console.error('Error analyzing:', error);
      toast.error('Failed to get AI response. Make sure you have written at least 50 words.');
      setQuery(userQuery); // Restore query on error
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

  const progress = Math.min((wordCount / 50) * 100, 100);

  return (
    <div className="flex flex-col h-full bg-white border-l-4 border-bauhaus">
      {/* Header - Bauhaus Style */}
      <div className="p-4 border-b-4 border-bauhaus bg-bauhaus-blue">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white border-2 border-bauhaus flex items-center justify-center">
              <Brain className="w-5 h-5 text-bauhaus-blue" strokeWidth={3} />
            </div>
            <h2 className="font-black uppercase tracking-tight text-white">MITRA AI</h2>
          </div>
          {!isLocked && (
            <div className="px-2 py-1 bg-green-500 border-2 border-bauhaus">
              <span className="text-xs font-black text-white uppercase">ACTIVE</span>
            </div>
          )}
        </div>
        <p className="text-xs font-bold text-white uppercase tracking-wide">
          Socratic Method Assistant
        </p>
      </div>

      {/* Chat Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {isLocked ? (
          /* Locked State - Bauhaus */
          <div className="text-center py-8 px-4">
            <div className="w-20 h-20 bg-bauhaus-yellow border-4 border-bauhaus shadow-bauhaus mx-auto mb-4 flex items-center justify-center">
              <Lock className="w-10 h-10 text-black" strokeWidth={3} />
            </div>
            <h3 className="font-black uppercase tracking-tight mb-3 text-lg">AI LOCKED</h3>
            <p className="text-sm font-bold mb-6">
              Write <span className="text-bauhaus-red text-xl font-black">{wordsToUnlock}</span> more words to unlock
            </p>

            {/* Progress Bar - Bauhaus */}
            <div className="w-full bg-gray-200 border-2 border-bauhaus h-6 mb-2 overflow-hidden">
              <div
                className="h-full bg-bauhaus-blue border-r-2 border-bauhaus transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs font-black uppercase tracking-wide">
              {wordCount}/50 words ({Math.round(progress)}%)
            </p>

            {/* Instruction */}
            <div className="mt-6 p-4 bg-white border-2 border-bauhaus text-left">
              <p className="text-xs font-bold uppercase mb-2">💡 How to unlock:</p>
              <ol className="text-xs space-y-1 font-medium">
                <li>1. Type your original ideas in the editor</li>
                <li>2. Reach 50 words minimum</li>
                <li>3. AI will unlock automatically</li>
              </ol>
            </div>
          </div>
        ) : (
          /* Chat Messages */
          <>
            {chatHistory.length === 0 ? (
              <div className="text-center py-8 px-4">
                <div className="w-16 h-16 bg-bauhaus-blue border-4 border-bauhaus shadow-bauhaus mx-auto mb-4 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" strokeWidth={3} />
                </div>
                <h3 className="font-black uppercase tracking-tight mb-2">AI READY</h3>
                <p className="text-sm font-bold mb-4">Ask me anything about your writing!</p>

                {/* Quick Prompts */}
                <div className="space-y-2">
                  <p className="text-xs font-black uppercase mb-2">Quick Prompts:</p>
                  {[
                    'Is my argument strong?',
                    'Check for logical fallacies',
                    'Suggest improvements'
                  ].map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQuery(prompt)}
                      className="w-full p-2 bg-white border-2 border-bauhaus hover:bg-bauhaus-yellow transition-colors text-xs font-bold text-left"
                    >
                      → {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              chatHistory.map((chat) => (
                <div key={chat.id} className="space-y-3">
                  {/* User Message */}
                  <div className="flex gap-2 justify-end">
                    <div className="max-w-[80%] p-3 bg-bauhaus-blue border-2 border-bauhaus shadow-bauhaus-sm">
                      <p className="text-sm font-bold text-white">{chat.userPrompt}</p>
                    </div>
                    <div className="w-8 h-8 bg-bauhaus-yellow border-2 border-bauhaus flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4" strokeWidth={3} />
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-bauhaus-red border-2 border-bauhaus flex items-center justify-center flex-shrink-0">
                      <Brain className="w-4 h-4 text-white" strokeWidth={3} />
                    </div>
                    <div className="max-w-[80%] p-3 bg-white border-2 border-bauhaus shadow-bauhaus-sm">
                      <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
                        {chat.aiResponse}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </>
        )}
      </div>

      {/* Input Area - Bauhaus */}
      <div className="p-4 border-t-4 border-bauhaus bg-white">
        {isLocked ? (
          <div className="p-3 bg-gray-200 border-2 border-bauhaus text-center">
            <p className="text-xs font-black uppercase">🔒 Write {wordsToUnlock} more words to unlock</p>
          </div>
        ) : (
          <div className="space-y-2">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask MITRA AI..."
              disabled={isLoading}
              className="w-full p-3 border-2 border-bauhaus focus:outline-none focus:border-bauhaus-blue resize-none font-medium text-sm"
              rows={3}
            />
            <button
              onClick={handleSend}
              disabled={!query.trim() || isLoading}
              className="w-full bg-bauhaus-red text-white border-4 border-bauhaus shadow-bauhaus btn-press font-black uppercase tracking-wider py-3 hover:bg-bauhaus-red/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  THINKING...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" strokeWidth={3} />
                  SEND QUESTION
                </span>
              )}
            </button>
            <p className="text-xs font-bold text-center text-gray-600 uppercase">
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
