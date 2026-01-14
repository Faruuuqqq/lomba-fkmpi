'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { projectsAPI } from '@/lib/api';
import { Project } from '@/types';
import { Plus, FileText, LogOut, Trash2, Search, Filter, BarChart3, Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import { SkeletonCard, SkeletonList } from '@/components/ui/skeleton';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useDebounce } from '@/hooks/useDebounce';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'DRAFT' | 'FINAL'>('all');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Debounced search for better performance
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchProjects();
  }, [user, router]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    
    // Close mobile menu when clicking outside
    const handleOutsideClick = () => setIsMobileMenuOpen(false);
    document.addEventListener('mousedown', handleOutsideClick);
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isMobileMenuOpen]);

  const fetchProjects = async () => {
    try {
      const { data } = await projectsAPI.getAll();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      if ((error as any)?.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectTitle.trim()) return;

    try {
      setIsCreating(true);
      const { data } = await projectsAPI.create(newProjectTitle);
      setProjects([data, ...projects]);
      setNewProjectTitle('');
      router.push(`/project/${data.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await projectsAPI.delete(id);
      setProjects(projects.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const projectCount = filteredProjects.length;
  const wordCount = projects.reduce((sum, project) => sum + project.wordCount, 0);
  const aiUnlockedCount = projects.filter(p => p.isAiUnlocked).length;

  // Mobile project grid
  const ProjectCard = ({ project }: { project: Project }) => (
    <Card className="hover:shadow-lg transition-all duration-200 transform hover:scale-105">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <CardTitle className="text-base sm:text-lg truncate pr-2">{project.title}</CardTitle>
          <div className="flex gap-1 sm:gap-2">
            <Badge 
              variant={project.status === 'FINAL' ? 'default' : 'secondary'} 
              className="text-xs"
            >
              {project.status}
            </Badge>
            <Badge 
              variant={project.isAiUnlocked ? 'default' : 'outline'} 
              className="text-xs"
            >
              {project.isAiUnlocked ? 'AI' : 'AI'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs">
              {project.wordCount} words
            </Badge>
            <Badge variant="outline" className="text-xs">
              {new Date(project.updatedAt).toLocaleDateString()}
            </Badge>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              size="sm"
              className="flex-1 sm:flex-initial"
              onClick={() => router.push(`/project/${project.id}`)}
            >
              <FileText className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Open</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteProject(project.id)}
              className="p-2"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="h-8 w-32 bg-muted rounded animate-pulse" />
              <div className="h-6 w-20 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <SkeletonCard />
          </div>
          
          <div className="mb-6">
            <SkeletonCard />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">MITRA AI</h1>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                Welcome, {user?.name || user?.email}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Analytics Toggle - Hidden on Mobile */}
              <div className="hidden sm:flex">
                <Button
                  variant={showAnalytics ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowAnalytics(!showAnalytics)}
                  className="flex items-center"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Analytics</span>
                </Button>
              </div>

              <ThemeToggle />
              
              <Button variant="outline" onClick={logout}>
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>

              {/* Mobile Menu Toggle */}
              <Button
                variant="outline"
                size="sm"
                className="sm:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="sm:hidden fixed inset-0 z-40 bg-black/50">
          <div className="bg-background w-64 h-full shadow-xl p-4">
            <div className="space-y-4">
              <Button
                variant={showAnalytics ? "default" : "outline"}
                onClick={() => {
                  setShowAnalytics(!showAnalytics);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full justify-start"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
              <Button variant="outline" onClick={logout} className="w-full justify-start">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {showAnalytics ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-semibold">AI Feature Analytics</h2>
              <Button 
                variant="outline" 
                onClick={() => setShowAnalytics(false)}
                className="sm:hidden"
              >
                Back
              </Button>
            </div>
            <AnalyticsDashboard />
          </div>
        ) : (
          <>
            {/* Project Creation Card */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Input
                    placeholder="Enter project title..."
                    value={newProjectTitle}
                    onChange={(e) => setNewProjectTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                    className="text-sm sm:text-base"
                    disabled={isCreating}
                  />
                  <Button 
                    onClick={handleCreateProject} 
                    disabled={isCreating || !newProjectTitle.trim()}
                    className="w-full sm:w-auto"
                  >
                    {isCreating ? (
                      <>
                        <LoadingSpinner size="sm" text="" />
                        <span className="ml-2">Creating...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">New Project</span>
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Search and Filter */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search projects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 text-sm sm:text-base"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground hidden sm:block" />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as 'all' | 'DRAFT' | 'FINAL')}
                      className="px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                    >
                      <option value="all">All Projects</option>
                      <option value="DRAFT">Draft Only</option>
                      <option value="FINAL">Completed</option>
                    </select>
                  </div>
                </div>
                
                {(searchQuery || filterStatus !== 'all') && (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                    Showing {projectCount} of {projects.length} projects
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Project Grid */}
            {filteredProjects.length === 0 ? (
              <Card>
                <CardContent className="py-8 sm:py-12 text-center">
                  <FileText className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-base sm:text-lg font-medium mb-2">No projects yet</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Create your first project to start writing with MITRA AI
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}

            {/* Project Stats Summary */}
            <Card className="mt-6">
              <CardContent className="pt-6">
                <h3 className="text-base sm:text-lg font-semibold mb-4">Project Overview</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl sm:text-3xl font-bold text-primary">{projects.length}</div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">Total Projects</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl sm:text-3xl font-bold text-primary">{wordCount}</div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">Total Words</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl sm:text-3xl font-bold text-primary">{aiUnlockedCount}</div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">AI Unlocked</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}