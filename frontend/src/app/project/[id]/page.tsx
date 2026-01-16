'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function ProjectPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  const [project, setProject] = useState<any>(null);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Load project data
    fetch(`/api/projects/${id}`)
      .then(res => res.json())
      .then(data => {
        setProject(data);
        setContent(data.content || '');
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Failed to load project:', error);
        setIsLoading(false);
      });
  }, [id, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div>Project not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">{project.title}</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <textarea
              className="w-full min-h-[500px] p-4 border rounded-lg"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your paper..."
            />
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">AI Assistant</h3>
            <p className="text-sm text-muted-foreground">
              Get AI-powered suggestions for your writing
            </p>
            <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg">
              Get Suggestions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}