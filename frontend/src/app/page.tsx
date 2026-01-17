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
            {/* Logo - Integrated Geometric Design */}
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-24 flex items-center">
                {/* Blue Square with M */}
                <div className="absolute left-0 top-0 bottom-0 w-10 bg-bauhaus-blue border-4 border-bauhaus flex items-center justify-center">
                  <span className="text-white font-black text-xl">M</span>
                </div>

                {/* Red Triangle with A */}
                <svg className="absolute left-7 top-0 w-12 h-10" viewBox="0 0 48 40">
                  <polygon points="24,0 0,40 48,40" fill="#D02020" stroke="#121212" strokeWidth="3" />
                  <text x="24" y="30" textAnchor="middle" fill="white" fontSize="20" fontWeight="900">A</text>
                </svg>

                {/* Yellow Circle */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-bauhaus-yellow border-4 border-bauhaus"></div>
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
                CONSTRUCT LOGIC<br />
                DECONSTRUCT BIAS<br />
                <span className="text-bauhaus-red">MASTER YOUR THESIS</span>
              </h1>

              <p className="text-lg sm:text-xl font-medium leading-relaxed max-w-xl">
                Stop letting AI do the thinking. MITRA AI forces you to build strong arguments first,
                then helps you polish them. The only writing assistant that respects your intellect.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => router.push('/register')}
                  className="bg-bauhaus-red text-white border-4 border-bauhaus shadow-bauhaus-lg btn-press font-black uppercase tracking-wider text-lg px-8 py-6 h-auto rounded-none hover:bg-bauhaus-red/90"
                >
                  CHALLENGE YOUR IDEAS
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
                title: 'EARN YOUR AI',
                description: 'No lazy prompting. The AI generation unlocks only after you demonstrate original thought. We build discipline, not dependency.',
                color: 'bauhaus-red',
                shape: 'circle'
              },
              {
                icon: Target,
                title: 'ARGUMENT MAPPING',
                description: 'Visualize the anatomy of your thesis. See exactly where your premises support your conclusion—and where they collapse.',
                color: 'bauhaus-blue',
                shape: 'square'
              },
              {
                icon: Shield,
                title: 'FALLACY DETECTOR',
                description: 'Your personal "Devil\'s Advocate". We flag Strawmans, Ad Hominems, and emotional bias before your professor does.',
                color: 'bauhaus-yellow',
                shape: 'triangle'
              },
              {
                icon: Zap,
                title: 'SOCRATIC FEEDBACK',
                description: 'Instead of fixing your answers, we ask the right questions. Refine your logic through a guided dialectic process.',
                color: 'bauhaus-red',
                shape: 'square'
              },
              {
                icon: Check,
                title: 'THE DISTRACTION-FREE LAB',
                description: 'A minimalist workspace designed for deep work. No clutter, just you and your argument.',
                color: 'bauhaus-blue',
                shape: 'circle'
              },
              {
                icon: Brain,
                title: 'COGNITIVE METRICS',
                description: 'Track your "Logic Score" and writing consistency. Gamify your intellectual growth.',
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
              DON'T JUST WRITE.<br />
              <span className="text-bauhaus-red">REASON.</span>
            </h2>
            <p className="text-xl font-bold mb-8 uppercase tracking-wide">
              Join the new wave of scholars utilizing AI responsibly.
            </p>
            <Button
              onClick={() => router.push('/register')}
              className="bg-bauhaus-red text-white border-4 border-bauhaus shadow-bauhaus-lg btn-press font-black uppercase tracking-wider text-xl px-12 py-8 h-auto rounded-none hover:bg-bauhaus-red/90"
            >
              CHALLENGE YOUR IDEAS
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
              <div className="relative h-8 w-20 flex items-center">
                {/* Blue Square with M */}
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-bauhaus-blue border-2 border-white flex items-center justify-center">
                  <span className="text-white font-black text-base">M</span>
                </div>

                {/* Red Triangle with A */}
                <svg className="absolute left-6 top-0 w-10 h-8" viewBox="0 0 40 32">
                  <polygon points="20,0 0,32 40,32" fill="#D02020" stroke="white" strokeWidth="2" />
                  <text x="20" y="24" textAnchor="middle" fill="white" fontSize="16" fontWeight="900">A</text>
                </svg>

                {/* Yellow Circle */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-bauhaus-yellow border-2 border-white"></div>
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