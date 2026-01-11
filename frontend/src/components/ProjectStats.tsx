'use client';

import { cn } from '@/lib/utils';
import { FileText, Clock, MessageSquare } from 'lucide-react';

interface ProjectStatsProps {
  wordCount: number;
  aiInteractions: number;
  isAiUnlocked: boolean;
}

export function ProjectStats({ wordCount, aiInteractions, isAiUnlocked }: ProjectStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Word Count</span>
        </div>
        <p className="text-2xl font-bold">{wordCount}</p>
      </div>

      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">AI Chats</span>
        </div>
        <p className="text-2xl font-bold">{aiInteractions}</p>
      </div>

      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">AI Status</span>
        </div>
        <p className={`text-2xl font-bold ${isAiUnlocked ? 'text-green-600' : 'text-muted-foreground'}`}>
          {isAiUnlocked ? 'Unlocked' : 'Locked'}
        </p>
      </div>
    </div>
  );
}
