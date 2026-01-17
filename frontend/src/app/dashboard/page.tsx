'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { projectsAPI, gamificationAPI } from '@/lib/api';
import { Project } from '@/types';
import { Plus, FileText, LogOut, Trash2, Search, Circle, Square, Flame, Coins } from 'lucide-react';
import { DailyChallengeModal } from '@/components/DailyChallengeModal';
import { useDebounce } from '@/hooks/useDebounce';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'DRAFT' | 'FINAL'>('all');

  // Gamification state
  const [tokens, setTokens] = useState(5);
  const [streak, setStreak] = useState(0);
  const [showChallenge, setShowChallenge] = useState(false);
  const [challengeAvailable, setChallengeAvailable] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchProjects();
    fetchGamificationStats();
  }, [user, router]);

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

  const fetchGamificationStats = async () => {
    try {
      const { data } = await gamificationAPI.getStats();
      setTokens(data.tokens);
      setStreak(data.currentStreak);
      setChallengeAvailable(data.nextChallengeAvailable);

      // Auto-show Daily Challenge if available
      if (data.nextChallengeAvailable) {
        setTimeout(() => setShowChallenge(true), 500);
      }
    } catch (error) {
      console.error('Error fetching gamification stats:', error);
    }
  };

  const handleChallengeComplete = (tokensEarned: number, newStreak: number) => {
    setTokens(prev => prev + tokensEarned);
    setStreak(newStreak);
    setChallengeAvailable(false);
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
      toast.error('Failed to create project. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('⚠️ Delete this project? This action cannot be undone.')) return;

    try {
      await projectsAPI.delete(id);
      setProjects(projects.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project. Please try again.');
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-bauhaus-red border-t-transparent mb-4"></div>
          <p className="text-bauhaus-label">LOADING...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Bauhaus Style */}
      <header className="border-b-4 border-bauhaus bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-24 flex items-center">
                <div className="absolute left-0 top-0 bottom-0 w-10 bg-bauhaus-blue border-4 border-bauhaus flex items-center justify-center">
                  <span className="text-white font-black text-xl">M</span>
                </div>
                <svg className="absolute left-7 top-0 w-12 h-10" viewBox="0 0 48 40">
                  <polygon points="24,0 0,40 48,40" fill="#D02020" stroke="#121212" strokeWidth="3" />
                  <text x="24" y="30" textAnchor="middle" fill="white" fontSize="20" fontWeight="900">A</text>
                </svg>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-bauhaus-yellow border-4 border-bauhaus"></div>
              </div>
              <div className="hidden sm:block">
                <div className="text-2xl font-black uppercase tracking-tighter">MITRA AI</div>
                <div className="text-xs font-medium">Dashboard</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Token & Streak Display */}
              <div className="hidden sm:flex items-center gap-4 mr-4">
                {streak > 0 && (
                  <div className="flex items-center gap-1 px-3 py-1 bg-bauhaus-red border-2 border-bauhaus">
                    <Flame className="w-4 h-4 text-white" />
                    <span className="font-bold text-white text-sm">{streak}🔥</span>
                  </div>
                )}
                <div className="flex items-center gap-1 px-3 py-1 bg-bauhaus-yellow border-2 border-bauhaus">
                  <Coins className="w-4 h-4" />
                  <span className="font-bold text-sm">{tokens}</span>
                </div>
                {challengeAvailable && (
                  <Button
                    onClick={() => setShowChallenge(true)}
                    className="bg-white border-2 border-bauhaus rounded-none font-bold uppercase tracking-wide text-xs px-2 py-1 h-auto btn-press animate-pulse"
                    size="sm"
                  >
                    DAILY QUIZ!
                  </Button>
                )}
              </div>

              <Button
                onClick={logout}
                className="bg-bauhaus-red text-white border-4 border-bauhaus shadow-bauhaus btn-press font-bold uppercase tracking-wide rounded-none hover:bg-bauhaus-red/90"
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">LOGOUT</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Section - Bauhaus Color Blocking */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {/* Total Projects - Yellow */}
          <div className="bg-bauhaus-yellow border-4 border-bauhaus shadow-bauhaus-lg p-8 hover:-translate-y-1 transition-transform">
            <div className="flex items-start justify-between mb-4">
              <div className="text-6xl sm:text-7xl font-black">{projectCount}</div>
              <div className="w-8 h-8 bg-white border-2 border-bauhaus"></div>
            </div>
            <div className="text-bauhaus-label">TOTAL PROJECTS</div>
          </div>

          {/* Total Words - Blue */}
          <div className="bg-bauhaus-blue border-4 border-bauhaus shadow-bauhaus-lg p-8 hover:-translate-y-1 transition-transform">
            <div className="flex items-start justify-between mb-4">
              <div className="text-6xl sm:text-7xl font-black text-white">{wordCount.toLocaleString()}</div>
              <div className="w-8 h-8 rounded-full bg-bauhaus-yellow border-2 border-bauhaus"></div>
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-white">TOTAL WORDS</div>
          </div>

          {/* AI Unlocked - Red */}
          <div className="bg-bauhaus-red border-4 border-bauhaus shadow-bauhaus-lg p-8 hover:-translate-y-1 transition-transform">
            <div className="flex items-start justify-between mb-4">
              <div className="text-6xl sm:text-7xl font-black text-white">{aiUnlockedCount}</div>
              <svg className="w-8 h-8" viewBox="0 0 32 32">
                <polygon points="16,0 0,32 32,32" fill="white" stroke="#121212" strokeWidth="2" />
              </svg>
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-white">AI UNLOCKED</div>
          </div>
        </div>


        {/* Create New Project - Bauhaus Style */}
        <Card className="mb-8 border-4 border-bauhaus shadow-bauhaus-lg rounded-none bg-white">
          <CardHeader className="border-b-4 border-bauhaus bg-gradient-to-r from-gray-50 to-white">
            <CardTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
              <div className="w-2 h-8 bg-bauhaus-red"></div>
              CREATE NEW PROJECT
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Enter project title..."
                value={newProjectTitle}
                onChange={(e) => setNewProjectTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateProject()}
                className="flex-1 h-14 border-4 border-bauhaus rounded-none font-medium text-lg focus-visible:ring-bauhaus-red focus-visible:ring-offset-0"
                disabled={isCreating}
              />
              <Button
                onClick={handleCreateProject}
                disabled={isCreating || !newProjectTitle.trim()}
                className="bg-bauhaus-red text-white border-4 border-bauhaus shadow-bauhaus btn-press font-black uppercase tracking-wider h-14 px-8 rounded-none hover:bg-bauhaus-red/90"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                    CREATING...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    CREATE
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 border-4 border-bauhaus rounded-none font-medium"
            />
          </div>

          <div className="flex gap-2">
            {(['all', 'DRAFT', 'FINAL'] as const).map((status) => (
              <Button
                key={status}
                onClick={() => setFilterStatus(status)}
                variant={filterStatus === status ? "default" : "outline"}
                className={`border-2 border-bauhaus rounded-none font-bold uppercase tracking-wide ${filterStatus === status
                  ? 'bg-bauhaus-blue text-white'
                  : 'bg-white hover:bg-gray-100'
                  }`}
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        {/* Projects Grid - Bauhaus Cards */}
        {filteredProjects.length === 0 ? (
          <Card className="border-4 border-bauhaus shadow-bauhaus-lg rounded-none">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 border-4 border-bauhaus flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight mb-2">NO PROJECTS YET</h3>
              <p className="text-gray-600 font-medium mb-6">
                {searchQuery ? 'No projects match your search' : 'Create your first project to get started'}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => document.querySelector<HTMLInputElement>('input[placeholder="Enter project title..."]')?.focus()}
                  className="bg-bauhaus-yellow text-black border-4 border-bauhaus shadow-bauhaus btn-press font-black uppercase tracking-wider rounded-none hover:bg-bauhaus-yellow/90"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  CREATE FIRST PROJECT
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, idx) => (
              <Card
                key={project.id}
                className="border-4 border-bauhaus shadow-bauhaus-lg hover:-translate-y-2 transition-transform duration-200 rounded-none bg-white relative overflow-hidden"
              >
                {/* Corner Decoration */}
                <div className="absolute top-4 right-4">
                  {idx % 3 === 0 && <div className="w-4 h-4 rounded-full bg-bauhaus-red"></div>}
                  {idx % 3 === 1 && <div className="w-4 h-4 bg-bauhaus-blue"></div>}
                  {idx % 3 === 2 && <div className="w-4 h-4 bg-bauhaus-yellow"></div>}
                </div>

                <CardHeader className="pb-3 border-b-2 border-gray-100">
                  <CardTitle className="text-lg font-black uppercase tracking-tight pr-8 truncate">
                    {project.title}
                  </CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge
                      className={`text-xs font-bold uppercase tracking-wide rounded-none border-2 ${project.status === 'FINAL'
                        ? 'bg-bauhaus-blue text-white border-bauhaus'
                        : 'bg-white text-black border-bauhaus'
                        }`}
                    >
                      {project.status}
                    </Badge>
                    {project.isAiUnlocked && (
                      <Badge className="text-xs font-bold uppercase tracking-wide rounded-none bg-bauhaus-yellow text-black border-2 border-bauhaus">
                        AI
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold uppercase tracking-wide text-gray-600">Words:</span>
                      <span className="text-2xl font-black">{project.wordCount}</span>
                    </div>

                    <div className="text-xs text-gray-500 font-medium">
                      Updated {new Date(project.updatedAt).toLocaleDateString()}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => router.push(`/project/${project.id}`)}
                        className="flex-1 bg-bauhaus-red text-white border-2 border-bauhaus shadow-bauhaus-sm btn-press font-bold uppercase tracking-wide rounded-none hover:bg-bauhaus-red/90"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        OPEN
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDeleteProject(project.id)}
                        className="border-2 border-bauhaus rounded-none hover:bg-gray-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Daily Challenge Modal */}
      <DailyChallengeModal
        isOpen={showChallenge}
        onClose={() => setShowChallenge(false)}
        onComplete={handleChallengeComplete}
      />
    </div>
  );
}