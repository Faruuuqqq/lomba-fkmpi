export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
}

export interface Project {
  id: string;
  title: string;
  content: string;
  wordCount: number;
  isAiUnlocked: boolean;
  status: 'DRAFT' | 'FINAL';
  reflection?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  aiChats?: AiInteraction[];
}

export interface AiInteraction {
  id: string;
  userPrompt: string;
  aiResponse: string;
  timestamp: string;
  projectId: string;
}

export interface ProjectSnapshot {
  id: string;
  content: string;
  timestamp: string;
  stage: string;
  projectId: string;
}

export interface SaveResponse {
  success: boolean;
  isAiUnlocked: boolean;
  wordCount: number;
  wordsToUnlock: number;
  project: Project;
}

export interface ReasoningNode {
  id: string;
  type: 'premise' | 'evidence' | 'conclusion';
  label: string;
  position: { x: number; y: number };
}

export interface ReasoningEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  hasFallacy: boolean;
}

export interface ReasoningMap {
  nodes: ReasoningNode[];
  edges: ReasoningEdge[];
  analysis: string;
  timestamp: string;
}

export interface EthicsIssue {
  sentence: string;
  type: string;
  explanation: string;
}

export interface EthicsCheck {
  issues: EthicsIssue[];
  summary: string;
  timestamp: string;
}

export interface GrammarIssue {
  type: string;
  message: string;
  suggestion?: string;
}

export interface GrammarResult {
  summary: string;
  issues: GrammarIssue[];
  timestamp: string;
}

export interface PlagiarismSource {
  title: string;
  similarity: number;
  url?: string;
}

export interface PlagiarismResult {
  isOriginal: boolean;
  similarityScore: number;
  sources: PlagiarismSource[];
  timestamp: string;
}

export interface LogicMapNode {
  id: string;
  type: 'premise' | 'evidence' | 'conclusion';
  label: string;
}

export interface LogicMapResult {
  analysis: string;
  graphData: {
    nodes: LogicMapNode[];
    edges?: LogicMapEdge[];
  };
  timestamp: string;
}

export type ToolResultType = 'grammar' | 'plagiarism' | 'logicMap';

export interface ToolResult {
  id: string;
  type: ToolResultType;
  data: GrammarResult | PlagiarismResult | LogicMapResult;
  timestamp: string;
}

export interface ApiError extends Error {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
}

export interface LibraryPaper {
  id: string;
  title: string;
  authors: string;
  year: number;
  abstract?: string;
  keywords?: string[];
  url?: string;
  addedAt: string;
}

export interface LogicMapEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  hasFallacy: boolean;
}
