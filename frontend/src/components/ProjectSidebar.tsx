'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, FileText, User, LogOut, Home, ChevronLeft, ChevronRight } from 'lucide-react';
import { projectsAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Project {
    id: string;
    title: string;
    updatedAt: string;
    isAiUnlocked: boolean;
}

export function ProjectSidebar() {
    const router = useRouter();
    const { logout } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const { data } = await projectsAPI.getAll();
            setProjects(data.sort((a: Project, b: Project) =>
                new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            ));
        } catch (error) {
            console.error('Failed to load projects:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const createNewProject = async () => {
        try {
            const { data } = await projectsAPI.create(`Untitled Essay ${new Date().toLocaleDateString()}`);
            toast.success('New project created!');
            router.push(`/project/${data.id}`);
        } catch (error) {
            toast.error('Failed to create project');
        }
    };

    const filteredProjects = projects.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={`${isCollapsed ? 'w-16' : 'w-64'} h-screen bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col transition-all duration-300`}>
            {/* Header */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
                {!isCollapsed ? (
                    <>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
                                    <span className="text-white font-black text-sm">M</span>
                                </div>
                                <h1 className="font-bold text-sm uppercase tracking-tight">MITRA AI</h1>
                            </div>
                            <button
                                onClick={() => setIsCollapsed(true)}
                                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
                                title="Collapse"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                        </div>

                        {/* New Project Button */}
                        <button
                            onClick={createNewProject}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-md py-2.5 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                        >
                            <Plus className="w-4 h-4" strokeWidth={2.5} />
                            New Project
                        </button>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
                            <span className="text-white font-black text-sm">M</span>
                        </div>
                        <button
                            onClick={createNewProject}
                            className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center justify-center transition-colors"
                            title="New Project"
                        >
                            <Plus className="w-5 h-5" strokeWidth={2.5} />
                        </button>
                        <button
                            onClick={() => setIsCollapsed(false)}
                            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
                            title="Expand"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Search */}
            {!isCollapsed && (
                <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                    </div>
                </div>
            )}

            {/* Projects List */}
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="p-3 space-y-2">
                        {/* Loading Skeletons */}
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex flex-col gap-2 p-3 rounded-md bg-zinc-50 dark:bg-zinc-800/50 animate-pulse">
                                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4"></div>
                                <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredProjects.length === 0 ? (
                    !isCollapsed && (
                        <div className="h-full flex flex-col items-center justify-center p-6 text-center opacity-80">
                            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 border-2 border-dashed border-zinc-300 dark:border-zinc-700">
                                <FileText className="w-8 h-8 text-zinc-400" />
                            </div>
                            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                                {searchQuery ? 'No matches' : 'No projects'}
                            </h3>
                            <p className="text-xs text-zinc-500 max-w-[150px]">
                                {searchQuery
                                    ? "Try checking your spelling or use different keywords"
                                    : "Start your first critical thinking journey today"}
                            </p>
                            {!searchQuery && (
                                <button
                                    onClick={createNewProject}
                                    className="mt-4 text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wide flex items-center gap-1"
                                >
                                    Create Project <Plus className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    )
                ) : (
                    <div className="p-2">
                        {filteredProjects.map((project) => (
                            <button
                                key={project.id}
                                onClick={() => router.push(`/project/${project.id}`)}
                                className="w-full p-3 mb-1 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-left group border-l-2 border-transparent hover:border-indigo-600"
                                title={isCollapsed ? project.title : undefined}
                            >
                                {isCollapsed ? (
                                    <div className="flex justify-center">
                                        <FileText className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                                    </div>
                                ) : (
                                    <div className="flex items-start gap-2">
                                        <FileText className="w-4 h-4 mt-0.5 flex-shrink-0 text-zinc-600 dark:text-zinc-400 transition-colors group-hover:text-indigo-600" />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-sm truncate text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-700 transition-colors">
                                                {project.title}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <p className="text-xs text-zinc-500">
                                                    {new Date(project.updatedAt).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                                {project.isAiUnlocked && (
                                                    <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-[10px] uppercase font-bold tracking-wider rounded-sm">
                                                        AI
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* User Profile Footer */}
            <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                {!isCollapsed ? (
                    <>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-700 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-xs truncate text-zinc-900 dark:text-zinc-100">User</p>
                                <p className="text-xs text-zinc-500">Free Plan</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => router.push('/projects')}
                                className="flex-1 p-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-1.5 text-xs font-medium"
                                title="Home"
                            >
                                <Home className="w-3.5 h-3.5" />
                                Home
                            </button>
                            <button
                                onClick={() => {
                                    logout();
                                    router.push('/login');
                                }}
                                className="flex-1 p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors flex items-center justify-center gap-1.5 text-xs font-medium"
                                title="Logout"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                Logout
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <button
                            onClick={() => router.push('/projects')}
                            className="w-10 h-10 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center"
                            title="Home"
                        >
                            <Home className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => {
                                logout();
                                router.push('/login');
                            }}
                            className="w-10 h-10 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors flex items-center justify-center"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
