export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
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
