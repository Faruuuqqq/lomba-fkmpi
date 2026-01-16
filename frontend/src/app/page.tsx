'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { projectsAPI } from '@/lib/api';
import { Project } from '@/types';
import { 
  BookOpen, 
  Lock, 
  Bot, 
  Shield, 
  FileText,
  TrendingUp, 
  Activity, 
  Smartphone
} from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { isInstalled } = usePWA();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
      return;
    }

  const loadProjects = async () => {
    try {
        const response = await projectsAPI.getAll();
        const projects = response.data;
        setProjects(projects);
      } catch (error) {
        console.error('Failed to load projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, [isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Welcome to MITRA AI
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            AI-Powered Academic Writing Assistant
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              onClick={() => router.push('/login')}
              variant="outline"
              size="lg"
            >
              <Lock className="w-5 h-5 mr-2" />
              Login
            </Button>
            <Button
              onClick={() => router.push('/register')}
              variant="outline" 
              size="lg"
            >
              <FileText className="w-5 h-5 mr-2" />
              Register
            </Button>
          </div>
        </div>

        {/* PWA Install Prompt */}
        {!isInstalled && (
          <Card className="mb-8 max-w-md mx-auto">
            <CardContent className="text-center p-6">
              <Smartphone className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Install MITRA AI</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get the full experience with our mobile app
              </p>
              <Button className="w-full" size="lg">
                <Bot className="w-5 h-5 mr-2" />
                Install App
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        {projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Projects</span>
                    <span className="text-2xl font-bold">{projects.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Active Users</span>
                    <span className="text-2xl font-bold">1,234</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Your recent writing activity and AI interactions will appear here.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Projects */}
        {projects.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Recent Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.slice(0, 6).map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{project.title}</span>
                      <Shield className="w-4 h-4 text-green-600" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {project.content}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        {project.wordCount} words
                      </span>
                      <Button
                        size="sm"
                        onClick={() => router.push(`/project/${project.id}`)}
                      >
                        <BookOpen className="w-4 h-4 mr-1" />
                        Open
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {projects.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start your first academic paper with AI assistance
              </p>
              <Button
                onClick={() => router.push('/project/new')}
                size="lg"
              >
                <Bot className="w-5 h-5 mr-2" />
                Create First Project
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}