'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Circle,
  Square,
  Triangle,
  ArrowRight,
  Check,
  Brain,
  Target,
  Shield,
  Zap
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
      return;
    }
    setIsLoading(false);
  }, [isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-bauhaus-red border-t-transparent mb-4"></div>
          <p className="text-foreground font-bold uppercase tracking-widest">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b-4 border-bauhaus bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo - Geometric Shapes */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-bauhaus-red"></div>
                <div className="w-8 h-8 bg-bauhaus-blue"></div>
                <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-b-[28px] border-b-bauhaus-yellow"></div>
              </div>
              <span className="text-2xl font-black uppercase tracking-tighter">MITRA AI</span>
            </div>

            {/* Nav Links - Desktop */}
            <div className="hidden md:flex items-center gap-6">
              <Button
                onClick={() => router.push('/login')}
                variant="ghost"
                className="font-bold uppercase tracking-wider hover:text-bauhaus-red"
              >
                Sign In
              </Button>
              <Button
                onClick={() => router.push('/register')}
                className="bg-bauhaus-red text-white border-2 border-bauhaus shadow-bauhaus btn-press font-bold uppercase tracking-wider rounded-none hover:bg-bauhaus-red/90"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="border-b-4 border-bauhaus">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div className="space-y-8">
              <div className="inline-block px-4 py-2 bg-bauhaus-yellow border-2 border-bauhaus shadow-bauhaus-sm">
                <span className="text-bauhaus-label">Academic Writing Assistant</span>
              </div>

              <h1 className="text-bauhaus-display">
                THINK<br />
                CRITICALLY<br />
                <span className="text-bauhaus-red">WRITE BETTER</span>
              </h1>

              <p className="text-lg sm:text-xl font-medium leading-relaxed max-w-xl">
                MITRA AI helps you develop stronger arguments, identify logical fallacies,
                and write academic papers that demonstrate genuine critical thinking.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => router.push('/register')}
                  className="bg-bauhaus-red text-white border-4 border-bauhaus shadow-bauhaus-lg btn-press font-black uppercase tracking-wider text-lg px-8 py-6 h-auto rounded-none hover:bg-bauhaus-red/90"
                >
                  START WRITING FREE
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  onClick={() => router.push('/login')}
                  className="bg-white text-foreground border-4 border-bauhaus shadow-bauhaus-lg btn-press font-bold uppercase tracking-wider text-lg px-8 py-6 h-auto rounded-none hover:bg-gray-100"
                >
                  SIGN IN
                </Button>
              </div>
            </div>

            {/* Right: Geometric Composition */}
            <div className="relative h-[400px] lg:h-[500px] bg-bauhaus-blue border-4 border-bauhaus shadow-bauhaus-lg">
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Overlapping Geometric Shapes */}
                <div className="relative w-full h-full p-12">
                  {/* Large Circle */}
                  <div className="absolute top-1/4 left-1/4 w-48 h-48 rounded-full bg-bauhaus-yellow opacity-80 border-4 border-bauhaus"></div>

                  {/* Rotated Square */}
                  <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-bauhaus-red opacity-80 border-4 border-bauhaus rotate-45"></div>

                  {/* Center Square with Triangle */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white border-4 border-bauhaus shadow-bauhaus flex items-center justify-center">
                    <Brain className="w-16 h-16 text-bauhaus-blue" strokeWidth={3} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-bauhaus-yellow border-b-4 border-bauhaus">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y-4 sm:divide-y-0 sm:divide-x-4 divide-bauhaus">
            {[
              { number: '1,000+', label: 'Students', icon: Circle },
              { number: '150+', label: 'Papers Written', icon: Square },
              { number: '95%', label: 'Logic Score', icon: Triangle },
              { number: '24/7', label: 'AI Assistant', icon: Circle }
            ].map((stat, idx) => (
              <div key={idx} className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 border-4 border-bauhaus bg-white">
                  <stat.icon className="w-8 h-8" strokeWidth={3} />
                </div>
                <div className="text-5xl font-black mb-2">{stat.number}</div>
                <div className="text-bauhaus-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-b-4 border-bauhaus">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center mb-16">
            <h2 className="text-bauhaus-heading mb-4">
              WHY CHOOSE MITRA AI?
            </h2>
            <p className="text-lg font-medium max-w-2xl mx-auto">
              Designed specifically for academic writing with features that encourage genuine thinking
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: 'CRITICAL THINKING FIRST',
                description: 'AI assistance unlocks only after you\'ve written your own thoughts. No shortcuts, just genuine learning.',
                color: 'bauhaus-red',
                shape: 'circle'
              },
              {
                icon: Target,
                title: 'LOGIC MAPPING',
                description: 'Visualize your arguments with interactive reasoning graphs. See connections and strengthen your logic.',
                color: 'bauhaus-blue',
                shape: 'square'
              },
              {
                icon: Shield,
                title: 'BIAS DETECTION',
                description: 'Identify logical fallacies and cognitive biases in your writing. Build stronger, more objective arguments.',
                color: 'bauhaus-yellow',
                shape: 'triangle'
              },
              {
                icon: Zap,
                title: 'REAL-TIME FEEDBACK',
                description: 'Get instant suggestions on argument structure, evidence quality, and logical consistency as you write.',
                color: 'bauhaus-red',
                shape: 'square'
              },
              {
                icon: Check,
                title: 'ACADEMIC FOCUS',
                description: 'Distraction-free editor designed specifically for academic writing and critical thinking.',
                color: 'bauhaus-blue',
                shape: 'circle'
              },
              {
                icon: Brain,
                title: 'PROGRESS TRACKING',
                description: 'Monitor your writing habits and logic score over time. See your critical thinking skills improve.',
                color: 'bauhaus-yellow',
                shape: 'square'
              }
            ].map((feature, idx) => (
              <Card
                key={idx}
                className="relative bg-white border-4 border-bauhaus shadow-bauhaus-lg hover:-translate-y-2 transition-transform duration-200 rounded-none overflow-hidden"
              >
                {/* Corner Decoration */}
                <div className="absolute top-4 right-4">
                  {feature.shape === 'circle' && (
                    <div className={`w-4 h-4 rounded-full bg-${feature.color}`}></div>
                  )}
                  {feature.shape === 'square' && (
                    <div className={`w-4 h-4 bg-${feature.color}`}></div>
                  )}
                  {feature.shape === 'triangle' && (
                    <div className={`w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[14px] border-b-${feature.color}`}></div>
                  )}
                </div>

                <CardContent className="p-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 mb-6 border-4 border-bauhaus bg-${feature.color}`}>
                    <feature.icon className="w-8 h-8 text-white" strokeWidth={3} />
                  </div>
                  <h3 className="text-xl font-bold uppercase tracking-tight mb-4">
                    {feature.title}
                  </h3>
                  <p className="font-medium leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-bauhaus-yellow border-b-4 border-bauhaus relative overflow-hidden">
        {/* Decorative Shapes */}
        <div className="absolute top-8 right-8 w-32 h-32 rounded-full bg-bauhaus-red opacity-50"></div>
        <div className="absolute bottom-8 left-8 w-40 h-40 bg-bauhaus-blue opacity-50 rotate-45"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-bauhaus-display mb-6">
              READY TO WRITE<br />
              <span className="text-bauhaus-red">BETTER PAPERS?</span>
            </h2>
            <p className="text-xl font-bold mb-8 uppercase tracking-wide">
              Join thousands of students improving their critical thinking
            </p>
            <Button
              onClick={() => router.push('/register')}
              className="bg-bauhaus-red text-white border-4 border-bauhaus shadow-bauhaus-lg btn-press font-black uppercase tracking-wider text-xl px-12 py-8 h-auto rounded-none hover:bg-bauhaus-red/90"
            >
              GET STARTED FOR FREE
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#121212] text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 rounded-full bg-bauhaus-red"></div>
                <div className="w-6 h-6 bg-bauhaus-blue"></div>
                <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[21px] border-b-bauhaus-yellow"></div>
              </div>
              <span className="text-xl font-black uppercase tracking-tighter">MITRA AI</span>
            </div>
            <p className="text-sm font-bold uppercase tracking-widest">
              © 2026 MITRA AI • EMPOWERING CRITICAL THINKING
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}