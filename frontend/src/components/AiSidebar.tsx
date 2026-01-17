'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Lock, Brain, User, Sparkles, BookOpen, Wrench, MessageSquare, CheckCircle, AlertTriangle } from 'lucide-react';
import { AiInteraction } from '@/types';
import { aiAPI } from '@/lib/api';
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
}

type TabType = 'chat' | 'citations' | 'tools';

interface Citation {
  type: string;
  title: string;
  authors: string[];
  year: number;
  relevance: number;
  description: string;
  url?: string;
}

interface GrammarIssue {
  type: string;
  message: string;
  suggestion: string;
}

interface PlagiarismResult {
  similarityScore: number;
  isOriginal: boolean;
  sources: Array<{
    url: string;
    title: string;
    similarity: number;
  }>;
}

interface LogicMapNode {
  id: string;
  type: 'premise' | 'evidence' | 'conclusion';
  label: string;
  position?: { x: number; y: number };
}

interface LogicMapEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  hasFallacy?: boolean;
}

interface LogicMapResult {
  graphData: {
    nodes: LogicMapNode[];
    edges: LogicMapEdge[];
  };
  analysis: string;
}

export function AiSidebar({
  projectId,
  isLocked,
  wordCount,
  wordsToUnlock,
  chatHistory,
  onNewChat,
  currentContent,
}: AiSidebarProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [citations, setCitations] = useState<Citation[]>([]);
  const [citationTopic, setCitationTopic] = useState('');
  const [isLoadingCitations, setIsLoadingCitations] = useState(false);

  // Modal states
  const [showGrammarModal, setShowGrammarModal] = useState(false);
  const [showPlagiarismModal, setShowPlagiarismModal] = useState(false);
  const [showLogicMapModal, setShowLogicMapModal] = useState(false);
  const [grammarResult, setGrammarResult] = useState<any>(null);
  const [plagiarismResult, setPlagiarismResult] = useState<PlagiarismResult | null>(null);
  const [logicMapResult, setLogicMapResult] = useState<LogicMapResult | null>(null);
  const [isCheckingGrammar, setIsCheckingGrammar] = useState(false);
  const [isCheckingPlagiarism, setIsCheckingPlagiarism] = useState(false);
  const [isGeneratingMap, setIsGeneratingMap] = useState(false);

  const { stats, setShowDailyChallenge, addTokens } = useGamification();
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSend = async () => {
    if (!query.trim() || isLocked) return;

    // Check tokens (Cost: 5)
    if (stats.tokens < 5) {
      toast.error('Not enough tokens!');
      setShowDailyChallenge(true);
      return;
    }

    const userQuery = query.trim();
    setQuery('');
    setIsLoading(true);

    try {
      // Deduct optimistically
      addTokens(-5);
      const { data } = await aiAPI.analyze(projectId, '', userQuery);
      const newInteraction: AiInteraction = {
        id: Date.now().toString(),
        userPrompt: userQuery,
        aiResponse: data.response,
        timestamp: new Date().toISOString(),
        projectId,
      };
      onNewChat(newInteraction);
      toast.success('Analysis complete', { duration: 2000 });
    } catch (error) {
      console.error('Error analyzing:', error);
      toast.error('Critical analysis unavailable. Ensure minimum 50 words written.');
      setQuery(userQuery);
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

  const handleSearchCitations = async () => {
    if (!citationTopic.trim()) {
      toast.error('Research topic required');
      return;
    }

    setIsLoadingCitations(true);
    try {
      const { data } = await aiAPI.getCitations(citationTopic, currentContent);
      setCitations(data.citations || []);
      toast.success(`Retrieved ${data.citations?.length || 0} academic sources`);
    } catch (error) {
      console.error('Citation search error:', error);
      toast.error('Citation retrieval failed');
    } finally {
      setIsLoadingCitations(false);
    }
  };

  const handleGrammarCheck = async () => {
    if (!currentContent || currentContent.length < 10) {
      toast.error('Insufficient content for analysis');
      return;
    }

    // Check tokens (Cost: 10)
    if (stats.tokens < 10) {
      toast.error('Not enough tokens! Need 10.');
      setShowDailyChallenge(true);
      return;
    }

    setIsCheckingGrammar(true);
    try {
      addTokens(-10);
      const { data } = await aiAPI.checkGrammar(projectId, currentContent);
      setGrammarResult(data);
      setShowGrammarModal(true);
      toast.success('Linguistic analysis complete');
    } catch (error) {
      console.error('Grammar check error:', error);
      toast.error('Grammar analysis failed');
    } finally {
      setIsCheckingGrammar(false);
    }
  };

  const handlePlagiarismCheck = async () => {
    if (!currentContent || currentContent.length < 10) {
      toast.error('Insufficient content for originality verification');
      return;
    }

    // Check tokens (Cost: 10)
    if (stats.tokens < 10) {
      toast.error('Not enough tokens! Need 10.');
      setShowDailyChallenge(true);
      return;
    }

    setIsCheckingPlagiarism(true);
    try {
      addTokens(-10);
      const { data } = await aiAPI.checkPlagiarism(projectId, currentContent);
      setPlagiarismResult(data);
      setShowPlagiarismModal(true);
      toast.success('Originality assessment complete');
    } catch (error) {
      console.error('Plagiarism check error:', error);
      toast.error('Originality check failed');
    } finally {
      setIsCheckingPlagiarism(false);
    }
  };

  const handleGenerateLogicMap = async () => {
    if (!currentContent || currentContent.length < 50) {
      toast.error('Minimum 50 words required for structural analysis');
      return;
    }

    // Check tokens (Cost: 15)
    if (stats.tokens < 15) {
      toast.error('Not enough tokens! Need 15.');
      setShowDailyChallenge(true);
      return;
    }

    setIsGeneratingMap(true);
    try {
      addTokens(-15);
      const { data } = await aiAPI.generateMap(projectId, currentContent);
      setLogicMapResult(data);
      setShowLogicMapModal(true);
      toast.success('Argument structure mapped');
    } catch (error) {
      console.error('Logic map error:', error);
      toast.error('Structural analysis failed');
    } finally {
      setIsGeneratingMap(false);
    }
  };

  const progress = Math.min((wordCount / 50) * 100, 100);

  return (
    <>
      <div className="flex flex-col h-full bg-white border-l-4 border-bauhaus">
        {/* Header */}
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

        {/* Tabs */}
        <div className="flex border-b-2 border-bauhaus bg-gray-50">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 px-4 py-3 font-black uppercase text-xs tracking-wide transition-colors ${activeTab === 'chat'
              ? 'bg-white border-b-4 border-bauhaus-blue text-bauhaus-blue'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <MessageSquare className="w-4 h-4 mx-auto mb-1" strokeWidth={3} />
            Chat
          </button>
          <button
            onClick={() => setActiveTab('citations')}
            className={`flex-1 px-4 py-3 font-black uppercase text-xs tracking-wide transition-colors ${activeTab === 'citations'
              ? 'bg-white border-b-4 border-bauhaus-yellow text-black'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <BookOpen className="w-4 h-4 mx-auto mb-1" strokeWidth={3} />
            Citations
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`flex-1 px-4 py-3 font-black uppercase text-xs tracking-wide transition-colors ${activeTab === 'tools'
              ? 'bg-white border-b-4 border-bauhaus-red text-bauhaus-red'
              : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <Wrench className="w-4 h-4 mx-auto mb-1" strokeWidth={3} />
            Tools
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {/* CHAT TAB */}
          {activeTab === 'chat' && (
            <>
              {isLocked ? (
                <div className="text-center py-8 px-4">
                  <div className="w-20 h-20 bg-bauhaus-yellow border-4 border-bauhaus shadow-bauhaus mx-auto mb-4 flex items-center justify-center">
                    <Lock className="w-10 h-10 text-black" strokeWidth={3} />
                  </div>
                  <h3 className="font-black uppercase tracking-tight mb-3 text-lg">AI LOCKED</h3>
                  <p className="text-sm font-bold mb-6">
                    Write <span className="text-bauhaus-red text-xl font-black">{wordsToUnlock}</span> more words to unlock
                  </p>

                  <div className="w-full bg-gray-200 border-2 border-bauhaus h-6 mb-2 overflow-hidden">
                    <div
                      className="h-full bg-bauhaus-blue border-r-2 border-bauhaus transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs font-black uppercase tracking-wide">
                    {wordCount}/50 words ({Math.round(progress)}%)
                  </p>
                </div>
              ) : (
                <>
                  {chatHistory.length === 0 ? (
                    <div className="text-center py-8 px-4">
                      <div className="w-16 h-16 bg-bauhaus-blue border-4 border-bauhaus shadow-bauhaus mx-auto mb-4 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-white" strokeWidth={3} />
                      </div>
                      <h3 className="font-black uppercase tracking-tight mb-2">AI READY</h3>
                      <p className="text-sm font-bold mb-4">Ask me anything!</p>

                      <div className="space-y-2">
                        <p className="text-xs font-black uppercase mb-2">Suggested Inquiries:</p>
                        {[
                          'Evaluate my argument structure',
                          'Identify logical fallacies',
                          'Strengthen my thesis'
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
                        <div className="flex gap-2 justify-end">
                          <div className="max-w-[80%] p-3 bg-bauhaus-blue border-2 border-bauhaus shadow-bauhaus-sm">
                            <p className="text-sm font-bold text-white">{chat.userPrompt}</p>
                          </div>
                          <div className="w-8 h-8 bg-bauhaus-yellow border-2 border-bauhaus flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4" strokeWidth={3} />
                          </div>
                        </div>

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
            </>
          )}

          {/* CITATIONS TAB */}
          {activeTab === 'citations' && (
            <div className="space-y-4">
              <div className="bg-white border-2 border-bauhaus p-4">
                <h3 className="font-black uppercase text-sm mb-3">Search Academic Sources</h3>
                <input
                  type="text"
                  placeholder="Enter topic (e.g., 'climate change')"
                  value={citationTopic}
                  onChange={(e) => setCitationTopic(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchCitations()}
                  className="w-full p-2 border-2 border-bauhaus focus:outline-none focus:border-bauhaus-blue font-medium text-sm mb-3"
                />
                <button
                  onClick={handleSearchCitations}
                  disabled={isLoadingCitations || !citationTopic.trim()}
                  className="w-full bg-bauhaus-yellow border-4 border-bauhaus shadow-bauhaus btn-press font-black uppercase text-xs py-2 hover:bg-bauhaus-yellow/90 disabled:opacity-50"
                >
                  {isLoadingCitations ? 'Searching...' : 'Search Citations'}
                </button>
              </div>

              {citations.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-black uppercase text-xs text-gray-600">
                    {citations.length} Sources Found
                  </h4>
                  {citations.map((citation, idx) => (
                    <div key={idx} className="bg-white border-2 border-bauhaus p-4">
                      <div className="flex items-start gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-bauhaus-blue text-white text-xs font-black uppercase">
                          {citation.type}
                        </span>
                        <span className="text-xs font-bold text-gray-600">
                          Relevance: {citation.relevance}%
                        </span>
                      </div>
                      <h5 className="font-bold text-sm mb-1">{citation.title}</h5>
                      <p className="text-xs font-medium text-gray-700 mb-2">
                        {citation.authors.join(', ')} ({citation.year})
                      </p>
                      <p className="text-xs text-gray-600 mb-2">{citation.description}</p>
                      {citation.url && (
                        <a
                          href={citation.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-bauhaus-blue hover:underline"
                        >
                          View Source →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {citations.length === 0 && !isLoadingCitations && (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-2" strokeWidth={2} />
                  <p className="text-xs font-bold uppercase">No citations yet</p>
                  <p className="text-xs font-medium">Search for academic sources above</p>
                </div>
              )}
            </div>
          )}

          {/* TOOLS TAB */}
          {activeTab === 'tools' && (
            <div className="space-y-3">
              <div className="bg-white border-2 border-bauhaus p-4">
                <h4 className="font-black uppercase text-sm mb-2">Grammar Check</h4>
                <p className="text-xs font-medium text-gray-600 mb-3">
                  Analyze your text for grammar, style, and punctuation issues.
                </p>
                <button
                  onClick={handleGrammarCheck}
                  disabled={isCheckingGrammar || !currentContent}
                  className="w-full bg-green-500 border-2 border-bauhaus font-bold uppercase text-xs py-2 text-white hover:bg-green-600 disabled:opacity-50"
                >
                  {isCheckingGrammar ? 'Checking...' : 'Check Grammar'}
                </button>
              </div>

              <div className="bg-white border-2 border-bauhaus p-4">
                <h4 className="font-black uppercase text-sm mb-2">Plagiarism Check</h4>
                <p className="text-xs font-medium text-gray-600 mb-3">
                  Check originality and similarity scores.
                </p>
                <button
                  onClick={handlePlagiarismCheck}
                  disabled={isCheckingPlagiarism || !currentContent}
                  className="w-full bg-bauhaus-red text-white border-2 border-bauhaus font-bold uppercase text-xs py-2 hover:bg-bauhaus-red/90 disabled:opacity-50"
                >
                  {isCheckingPlagiarism ? 'Checking...' : 'Check Originality'}
                </button>
              </div>

              <div className="bg-white border-2 border-bauhaus p-4">
                <h4 className="font-black uppercase text-sm mb-2">Logic Map</h4>
                <p className="text-xs font-medium text-gray-600 mb-3">
                  Visualize your argument structure and identify fallacies.
                </p>
                <button
                  onClick={handleGenerateLogicMap}
                  disabled={isGeneratingMap || !currentContent}
                  className="w-full bg-bauhaus-blue text-white border-2 border-bauhaus font-bold uppercase text-xs py-2 hover:bg-bauhaus-blue/90 disabled:opacity-50"
                >
                  {isGeneratingMap ? 'Generating...' : 'Generate Map'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Input Area - Only for Chat Tab */}
        {activeTab === 'chat' && (
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
                  placeholder="Pose your intellectual challenge..."
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
                      DECONSTRUCTING ARGUMENTS...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Send className="w-4 h-4" strokeWidth={3} />
                      CHALLENGE MY IDEA
                    </span>
                  )}
                </button>
                <p className="text-xs font-bold text-center text-gray-600 uppercase">
                  Press Enter to send • Shift+Enter for new line
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Grammar Check Modal */}
      <Modal
        isOpen={showGrammarModal}
        onClose={() => setShowGrammarModal(false)}
        title="Grammar Check Results"
      >
        {grammarResult && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 border-2 border-green-500">
              <span className="font-black uppercase">Score</span>
              <span className="text-3xl font-black text-green-600">{grammarResult.score}/100</span>
            </div>

            {grammarResult.issues && grammarResult.issues.length > 0 ? (
              <div className="space-y-3">
                <h3 className="font-black uppercase text-sm">Issues Found:</h3>
                {grammarResult.issues.map((issue: GrammarIssue, idx: number) => (
                  <div key={idx} className="p-3 bg-yellow-50 border-2 border-bauhaus">
                    <div className="flex items-start gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-sm uppercase">{issue.type}</p>
                        <p className="text-sm font-medium text-gray-700">{issue.message}</p>
                        <p className="text-xs font-bold text-green-600 mt-1">
                          Suggestion: {issue.suggestion}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-2" />
                <p className="font-black uppercase">No Issues Found!</p>
                <p className="text-sm font-medium text-gray-600">Your writing looks great.</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Plagiarism Check Modal */}
      <Modal
        isOpen={showPlagiarismModal}
        onClose={() => setShowPlagiarismModal(false)}
        title="Plagiarism Check Results"
      >
        {plagiarismResult && (
          <div className="space-y-4">
            <div className={`flex items-center justify-between p-4 border-2 ${plagiarismResult.isOriginal ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
              }`}>
              <span className="font-black uppercase">Similarity Score</span>
              <span className={`text-3xl font-black ${plagiarismResult.isOriginal ? 'text-green-600' : 'text-red-600'
                }`}>
                {plagiarismResult.similarityScore}%
              </span>
            </div>

            <div className="p-4 bg-gray-50 border-2 border-bauhaus">
              <p className="font-black uppercase text-sm mb-2">Verdict:</p>
              {plagiarismResult.isOriginal ? (
                <p className="text-sm font-bold text-green-600">✓ Content appears original</p>
              ) : (
                <p className="text-sm font-bold text-red-600">⚠ High similarity detected</p>
              )}
            </div>

            {plagiarismResult.sources && plagiarismResult.sources.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-black uppercase text-sm">Potential Sources:</h3>
                {plagiarismResult.sources.map((source, idx) => (
                  <div key={idx} className="p-3 bg-white border-2 border-bauhaus">
                    <p className="font-bold text-sm mb-1">{source.title}</p>
                    <p className="text-xs font-medium text-gray-600 mb-2">
                      Similarity: {source.similarity}%
                    </p>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-bauhaus-blue hover:underline"
                    >
                      Check Source →
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Logic Map Modal */}
      <Modal
        isOpen={showLogicMapModal}
        onClose={() => setShowLogicMapModal(false)}
        title="Logic Map - Argument Structure"
      >
        {logicMapResult && (
          <div className="space-y-6">
            {/* Analysis */}
            <div className="p-4 bg-bauhaus-blue border-2 border-bauhaus text-white">
              <h3 className="font-black uppercase text-sm mb-2">AI Analysis</h3>
              <p className="text-sm font-medium leading-relaxed">{logicMapResult.analysis}</p>
            </div>

            {/* Nodes */}
            {logicMapResult.graphData.nodes.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-black uppercase text-sm">Argument Components:</h3>
                {logicMapResult.graphData.nodes.map((node) => {
                  const colors = {
                    premise: { bg: 'bg-bauhaus-yellow', border: 'border-yellow-600', icon: '📍' },
                    evidence: { bg: 'bg-green-100', border: 'border-green-600', icon: '📊' },
                    conclusion: { bg: 'bg-bauhaus-red', border: 'border-red-700', icon: '🎯', text: 'text-white' }
                  };
                  const style = colors[node.type] || colors.premise;

                  return (
                    <div
                      key={node.id}
                      className={`p-4 ${style.bg} border-2 ${style.border} ${'text' in style ? style.text : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{style.icon}</span>
                        <div className="flex-1">
                          <p className="font-black uppercase text-xs mb-1">{node.type}</p>
                          <p className="text-sm font-bold leading-relaxed">{node.label}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Edges (Connections) */}
            {logicMapResult.graphData.edges.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-black uppercase text-sm">Logical Connections:</h3>
                <div className="space-y-2">
                  {logicMapResult.graphData.edges.map((edge) => {
                    const sourceNode = logicMapResult.graphData.nodes.find(n => n.id === edge.source);
                    const targetNode = logicMapResult.graphData.nodes.find(n => n.id === edge.target);

                    return (
                      <div
                        key={edge.id}
                        className={`p-3 border-2 ${edge.hasFallacy ? 'bg-red-50 border-red-500' : 'bg-white border-bauhaus'
                          }`}
                      >
                        <div className="flex items-center gap-2 text-xs font-bold">
                          <span className="px-2 py-1 bg-gray-200 border border-bauhaus">
                            {sourceNode?.type || 'Node'}
                          </span>
                          <span className="text-bauhaus-blue font-black">→ {edge.label}</span>
                          <span className="px-2 py-1 bg-gray-200 border border-bauhaus">
                            {targetNode?.type || 'Node'}
                          </span>
                          {edge.hasFallacy && (
                            <span className="ml-auto px-2 py-1 bg-red-500 text-white font-black uppercase">
                              ⚠ Fallacy
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty State */}
            {logicMapResult.graphData.nodes.length === 0 && (
              <div className="text-center py-8">
                <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-2" />
                <p className="font-black uppercase">No Structure Detected</p>
                <p className="text-sm font-medium text-gray-600">
                  Try writing a more structured argument with clear premises and conclusions.
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
