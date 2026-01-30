'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FileText, BookOpen, Users, ArrowRight } from 'lucide-react';

export default function TemplatesPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Please log in to view templates</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Project Templates</h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Start your writing with structured templates</p>
            </div>
            <button
              onClick={() => router.push('/projects')}
              className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              <ArrowRight className="w-4 h-4 inline mr-2" />
              Back to Projects
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-6">
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-zinc-400 mb-4" />
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Templates Page
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
              Choose from various templates to start your writing project
            </p>
            <Button
              onClick={() => router.push('/projects')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Browse Templates
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}