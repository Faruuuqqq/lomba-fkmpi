'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { Button } from '@/components/ui/button';
import { FileText, ArrowRight, CheckCircle } from 'lucide-react';

export default function ProjectsPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* LEFT SIDEBAR: Projects Navigation */}
            <ProjectSidebar />

            {/* CENTER: Welcome / Getting Started */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <div className="bg-white border-b-4 border-bauhaus px-6 py-4">
                    <h1 className="text-2xl font-black uppercase tracking-tight">Getting Started</h1>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto">
                    <div className="max-w-5xl mx-auto p-8 space-y-8">
                        {/* Hero Section */}
                        <div className="bg-white border-4 border-bauhaus shadow-bauhaus p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-12 h-12 bg-bauhaus-red border-2 border-bauhaus flex items-center justify-center">
                                        <span className="text-white font-black text-xl">M</span>
                                    </div>
                                    <div className="w-12 h-12 bg-bauhaus-yellow border-2 border-bauhaus flex items-center justify-center">
                                        <span className="text-black font-black text-xl">+</span>
                                    </div>
                                    <div className="w-12 h-12 bg-bauhaus-blue border-2 border-bauhaus flex items-center justify-center">
                                        <span className="text-white font-black text-xl">A</span>
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black uppercase tracking-tight">Welcome to MITRA AI</h2>
                                    <p className="text-sm font-bold text-gray-600 uppercase tracking-wide mt-1">
                                        Socratic Writing Companion for Critical Thinking
                                    </p>
                                </div>
                            </div>

                            <p className="text-base font-medium text-gray-700 mb-6">
                                MITRA AI helps you develop stronger arguments through the Socratic method.
                                Write your ideas first, then let AI challenge your thinking.
                            </p>

                            <div className="flex gap-3">
                                <Button
                                    onClick={() => router.push('/library')}
                                    className="bg-bauhaus-blue text-white border-4 border-bauhaus shadow-bauhaus btn-press font-black uppercase tracking-wide"
                                >
                                    <FileText className="w-4 h-4 mr-2" strokeWidth={3} />
                                    View All Projects
                                </Button>
                                <Button
                                    onClick={() => router.push('/')}
                                    variant="outline"
                                    className="border-2 border-bauhaus rounded-none font-bold uppercase tracking-wide hover:bg-gray-100"
                                >
                                    Learn More
                                    <ArrowRight className="w-4 h-4 ml-2" strokeWidth={3} />
                                </Button>
                            </div>
                        </div>

                        {/* Quick Start Steps */}
                        <div>
                            <h3 className="text-xl font-black uppercase mb-4">How to Get Started</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Step 1 */}
                                <div className="bg-white border-4 border-bauhaus shadow-bauhaus-sm p-6 flex gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-bauhaus-blue border-2 border-bauhaus flex items-center justify-center">
                                            <span className="text-white font-black text-lg">1</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-black uppercase text-sm mb-2">Create New Project</h4>
                                        <p className="text-sm font-medium text-gray-700">
                                            Click the <strong>"NEW PROJECT"</strong> button in the left sidebar to start writing.
                                        </p>
                                    </div>
                                </div>

                                {/* Step 2 */}
                                <div className="bg-white border-4 border-bauhaus shadow-bauhaus-sm p-6 flex gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-bauhaus-yellow border-2 border-bauhaus flex items-center justify-center">
                                            <span className="text-black font-black text-lg">2</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-black uppercase text-sm mb-2">Write 50 Words</h4>
                                        <p className="text-sm font-medium text-gray-700">
                                            Type your original ideas. AI unlocks automatically at <strong>50 words</strong>.
                                        </p>
                                    </div>
                                </div>

                                {/* Step 3 */}
                                <div className="bg-white border-4 border-bauhaus shadow-bauhaus-sm p-6 flex gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-bauhaus-red border-2 border-bauhaus flex items-center justify-center">
                                            <span className="text-white font-black text-lg">3</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-black uppercase text-sm mb-2">Get AI Feedback</h4>
                                        <p className="text-sm font-medium text-gray-700">
                                            Ask questions in the <strong>AI sidebar</strong>. Get Socratic challenges, not answers.
                                        </p>
                                    </div>
                                </div>

                                {/* Step 4 */}
                                <div className="bg-white border-4 border-bauhaus shadow-bauhaus-sm p-6 flex gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 bg-green-500 border-2 border-bauhaus flex items-center justify-center">
                                            <span className="text-white font-black text-lg">4</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-black uppercase text-sm mb-2">Focus Mode</h4>
                                        <p className="text-sm font-medium text-gray-700">
                                            Use <strong>"ZEN MODE"</strong> for distraction-free writing sessions.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Key Features */}
                        <div>
                            <h3 className="text-xl font-black uppercase mb-4">Key Features</h3>
                            <div className="bg-bauhaus-blue border-4 border-bauhaus shadow-bauhaus p-6 text-white">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-bauhaus-yellow flex-shrink-0 mt-0.5" strokeWidth={3} />
                                        <div>
                                            <h4 className="font-black uppercase text-sm mb-1">Socratic Method</h4>
                                            <p className="text-sm font-medium opacity-90">AI challenges your thinking, doesn't write for you</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-bauhaus-yellow flex-shrink-0 mt-0.5" strokeWidth={3} />
                                        <div>
                                            <h4 className="font-black uppercase text-sm mb-1">Anti-Plagiarism</h4>
                                            <p className="text-sm font-medium opacity-90">Write first, then AI helps refine your ideas</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-bauhaus-yellow flex-shrink-0 mt-0.5" strokeWidth={3} />
                                        <div>
                                            <h4 className="font-black uppercase text-sm mb-1">Logic Mapping</h4>
                                            <p className="text-sm font-medium opacity-90">Visualize argument structure and fallacies</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CheckCircle className="w-5 h-5 text-bauhaus-yellow flex-shrink-0 mt-0.5" strokeWidth={3} />
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
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                                Built for FKMPI 2026 Essay Competition
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
