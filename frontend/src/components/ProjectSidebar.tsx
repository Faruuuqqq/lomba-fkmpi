'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, FileText, User, Settings, LogOut, Home } from 'lucide-react';
import { projectsAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface Project {
    id: string;
    title: string;
    updatedAt: string;
    isAiUnlocked: boolean;
}

export function ProjectSidebar() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

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
        <div className="w-64 h-screen bg-white border-r-4 border-bauhaus flex flex-col">
            {/* Header */}
            <div className="p-4 border-b-4 border-bauhaus bg-bauhaus-yellow">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-bauhaus-red border-2 border-bauhaus flex items-center justify-center">
                        <span className="text-white font-black text-sm">M</span>
                    </div>
                    <h1 className="font-black uppercase tracking-tight">MITRA AI</h1>
                </div>

                {/* New Project Button */}
                <button
                    onClick={createNewProject}
                    className="w-full bg-bauhaus-red text-white border-4 border-bauhaus shadow-bauhaus btn-press font-black uppercase tracking-wide text-xs py-3 hover:bg-bauhaus-red/90 transition-all flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4" strokeWidth={3} />
                    NEW PROJECT
                </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b-2 border-bauhaus">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" strokeWidth={3} />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border-2 border-bauhaus focus:outline-none focus:border-bauhaus-blue font-bold text-sm"
                    />
                </div>
            </div>

            {/* Projects List */}
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="p-4 text-center">
                        <div className="w-8 h-8 border-4 border-bauhaus-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-xs font-bold mt-2 uppercase">Loading...</p>
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="p-4 text-center">
                        <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" strokeWidth={2} />
                        <p className="text-xs font-bold uppercase text-gray-500">
                            {searchQuery ? 'No projects found' : 'No projects yet'}
                        </p>
                    </div>
                ) : (
                    <div className="p-2">
                        {filteredProjects.map((project) => (
                            <button
                                key={project.id}
                                onClick={() => router.push(`/project/${project.id}`)}
                                className="w-full p-3 mb-2 bg-white border-2 border-bauhaus hover:bg-bauhaus-yellow transition-colors text-left group"
                            >
                                <div className="flex items-start gap-2">
                                    <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-sm truncate group-hover:text-black">
                                            {project.title}
                                        </h3>
                                        <p className="text-xs font-medium text-gray-600 mt-1">
                                            {new Date(project.updatedAt).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </p>
                                        {project.isAiUnlocked && (
                                            <span className="inline-block mt-1 px-2 py-0.5 bg-green-500 text-white text-xs font-black uppercase">
                                                AI ✓
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* User Profile Footer */}
            <div className="p-4 border-t-4 border-bauhaus bg-gray-50">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-bauhaus-blue border-2 border-bauhaus flex items-center justify-center">
                        <User className="w-4 h-4 text-white" strokeWidth={3} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-black text-xs uppercase truncate">User</p>
                        <p className="text-xs font-medium text-gray-600">Free Plan</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => router.push('/projects')}
                        className="flex-1 p-2 border-2 border-bauhaus hover:bg-bauhaus-blue hover:text-white transition-colors"
                        title="Home"
                    >
                        <Home className="w-4 h-4 mx-auto" strokeWidth={2.5} />
                    </button>
                    <button
                        onClick={() => router.push('/login')}
                        className="flex-1 p-2 border-2 border-bauhaus hover:bg-bauhaus-red hover:text-white transition-colors"
                        title="Logout"
                    >
                        <LogOut className="w-4 h-4 mx-auto" strokeWidth={2.5} />
                    </button>
                </div>
            </div>
        </div>
    );
}
