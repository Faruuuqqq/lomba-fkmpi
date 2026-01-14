'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SnapshotComparison } from '@/components/SnapshotComparison';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { projectsAPI } from '@/lib/api';
import { ProjectSnapshot } from '@/types';
import { ArrowLeft, History, Calendar } from 'lucide-react';

export default function SnapshotsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  const [project, setProject] = useState<any>(null);
  const [snapshots, setSnapshots] = useState<ProjectSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (id) {
      fetchProjectAndSnapshots(id as string);
    }
  }, [id, isAuthenticated, router]);

  const fetchProjectAndSnapshots = async (projectId: string) => {
    try {
      setIsLoading(true);
      
      const [projectResponse, snapshotsResponse] = await Promise.all([
        projectsAPI.getOne(projectId),
        projectsAPI.getSnapshots(projectId)
      ]);

      setProject(projectResponse.data);
      setSnapshots(snapshotsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load snapshots');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Project not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push(`/project/${id}`)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Project
            </Button>
            <div>
              <h1 className="text-xl font-semibold">{project.title}</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <History className="w-3 h-3" />
                Version History & Comparison
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <SnapshotComparison projectId={id as string} snapshots={snapshots} />
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Project Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">Title</h4>
                  <p className="text-sm text-muted-foreground">{project.title}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Status</h4>
                  <Badge variant={project.status === 'FINAL' ? 'success' : 'secondary'}>
                    {project.status}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Word Count</h4>
                  <p className="text-sm text-muted-foreground">{project.wordCount} words</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">AI Status</h4>
                  <Badge variant={project.isAiUnlocked ? 'success' : 'warning'}>
                    {project.isAiUnlocked ? 'Unlocked' : 'Locked'}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Created</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Last Updated</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Snapshot Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total Versions</span>
                  <Badge variant="outline">{snapshots.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Initial Drafts</span>
                  <Badge variant="secondary">
                    {snapshots.filter(s => s.stage === 'INITIAL_DRAFT').length}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Post AI Feedback</span>
                  <Badge variant="secondary">
                    {snapshots.filter(s => s.stage === 'POST_AI_FEEDBACK').length}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Final Version</span>
                  <Badge variant="secondary">
                    {snapshots.filter(s => s.stage === 'FINAL_VERSION').length}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  className="w-full" 
                  onClick={() => router.push(`/project/${id}`)}
                >
                  Back to Editor
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/dashboard')}
                >
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
