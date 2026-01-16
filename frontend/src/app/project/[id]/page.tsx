'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

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

  const handleSave = async () => {
    if (!project) return;
    
    try {
      const response = await fetch(`/api/projects/${id}/save`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setProject((prev: any) => ({
          ...prev,
          content,
          wordCount: content.split(/\s+/).length,
          updatedAt: new Date().toISOString(),
        }));
      }
    } catch (error) {
      console.error('Failed to save project:', error);
    }
  };

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
            <div className="mt-4 flex justify-between">
              <Button onClick={handleSave} className="flex items-center gap-2">
                <span>Save</span>
                <span className="text-sm text-muted-foreground">
                  ({content.split(/\s+/).length} words)
                </span>
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">AI Assistant</h3>
            <p className="text-sm text-muted-foreground">
              Get AI-powered suggestions for your writing
            </p>
            <Button className="w-full">
              Get Suggestions
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}