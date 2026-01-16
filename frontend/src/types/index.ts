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
