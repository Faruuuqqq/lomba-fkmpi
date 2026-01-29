'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { GamificationWidget } from '@/components/GamificationWidget';
import { Button } from '@/components/ui/button';
import { BookOpen, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';

export default function ProjectsPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    return (
        <div className="flex h-screen bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
            {/* LEFT SIDEBAR: Projects Navigation */}
            <ProjectSidebar />

            {/* CENTER: Welcome / Getting Started */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* Gamification Widget */}
                <div className="absolute top-4 right-4 z-10">
                    <GamificationWidget />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto">
                    <div className="max-w-5xl mx-auto p-8 space-y-8">
                        {/* Hero Section */}
                        <div className="bg-white dark:bg-zinc-800 border-4 border-bauhaus dark:border-zinc-700 rounded-none shadow-bauhaus-lg-bauhaus p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-12 h-12 bg-indigo-600 rounded-none flex items-center justify-center">
                                        <span className="text-white font-black text-xl">M</span>
                                    </div>
                                    <div className="w-12 h-12 bg-amber-500 rounded-none flex items-center justify-center">
                                        <span className="text-white font-black text-xl">+</span>
                                    </div>
                                    <div className="w-12 h-12 bg-indigo-600 rounded-none flex items-center justify-center">
                                        <span className="text-white font-black text-xl">A</span>
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black uppercase tracking-tight">Welcome to MITRA AI</h2>
                                    <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide mt-1">
                                        Socratic Writing Companion for Critical Thinking
                                    </p>
                                </div>
                            </div>

                            <p className="text-base font-medium text-zinc-700 dark:text-zinc-300 mb-6">
                                MITRA AI helps you develop stronger arguments through the Socratic method.
                                Write your ideas first, then let AI challenge your thinking.
                            </p>

                            <div className="flex gap-3 flex-wrap">
                                <Button
                                    onClick={() => router.push('/library')}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-none font-semibold uppercase tracking-wide shadow-bauhaus-lg-bauhaus"
                                >
                                    <BookOpen className="w-4 h-4 mr-2" />
                                    Explore Research Library
                                </Button>
                                <Button
                                    onClick={() => router.push('/ai-chat')}
                                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-none font-semibold uppercase tracking-wide shadow-bauhaus-lg-bauhaus"
                                >
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Start AI Chat
                                </Button>
                                <Button
                                    onClick={() => router.push('/gamification')}
                                    className="bg-amber-500 hover:bg-amber-600 text-white rounded-none font-semibold uppercase tracking-wide shadow-bauhaus-lg-bauhaus"
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    View Progress
                                </Button>
                            </div>
                        </div>

                        {/* Quick Start Steps */}
                        <div>
                            <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-indigo-600" />
                                How to Get Started
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Step 1 */}
                                <div className="bg-white dark:bg-zinc-800 border-4 border-bauhaus dark:border-zinc-700 rounded-none shadow-bauhaus-lg-bauhaus p-6 flex gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-indigo-600 rounded-none flex items-center justify-center">
                                            <span className="text-white font-black text-lg">1</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-black uppercase text-sm mb-2">Create New Project</h4>
                                        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                            Click the <strong>"NEW PROJECT"</strong> button in the left sidebar to start writing.
                                        </p>
                                    </div>
                                </div>

                                {/* Step 2 */}
                                <div className="bg-white dark:bg-zinc-800 border-4 border-bauhaus dark:border-zinc-700 rounded-none shadow-bauhaus-lg-bauhaus p-6 flex gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-amber-500 rounded-none flex items-center justify-center">
                                            <span className="text-white font-black text-lg">2</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-black uppercase text-sm mb-2">Write 50 Words</h4>
                                        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                            Type your original ideas. AI unlocks automatically at <strong>50 words</strong>.
                                        </p>
                                    </div>
                                </div>

                                {/* Step 3 */}
                                <div className="bg-white dark:bg-zinc-800 border-4 border-bauhaus dark:border-zinc-700 rounded-none shadow-bauhaus-lg-bauhaus p-6 flex gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-indigo-600 rounded-none flex items-center justify-center">
                                            <span className="text-white font-black text-lg">3</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-black uppercase text-sm mb-2">Get AI Feedback</h4>
                                        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                            Ask questions in the <strong>AI sidebar</strong>. Get Socratic challenges, not answers.
                                        </p>
                                    </div>
                                </div>

                                {/* Step 4 */}
                                <div className="bg-white dark:bg-zinc-800 border-4 border-bauhaus dark:border-zinc-700 rounded-none shadow-bauhaus-lg-bauhaus p-6 flex gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-green-600 rounded-none flex items-center justify-center">
                                            <span className="text-white font-black text-lg">4</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-black uppercase text-sm mb-2">Earn Tokens</h4>
                                        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                            Every <strong>50 words</strong> you write earns you 1 token for AI features.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Key Features */}
                        <div>
                            <h3 className="text-xl font-black uppercase mb-4">Key Features</h3>
                            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 border border-indigo-500 rounded-none shadow-bauhaus-lg-bauhaus p-6 text-white">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="font-black uppercase text-sm mb-1">Socratic Method</h4>
                                            <p className="text-sm font-medium opacity-90">AI challenges your thinking, doesn't write for you</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="font-black uppercase text-sm mb-1">Anti-Plagiarism</h4>
                                            <p className="text-sm font-medium opacity-90">Write first, then AI helps refine your ideas</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="font-black uppercase text-sm mb-1">Logic Mapping</h4>
                                            <p className="text-sm font-medium opacity-90">Visualize argument structure and fallacies</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="font-black uppercase text-sm mb-1">Real Citations</h4>
                                            <p className="text-sm font-medium opacity-90">Academic sources from OpenAlex database</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="text-center py-4">
                            <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                                Built for FKMPI 2026 Essay Competition
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
