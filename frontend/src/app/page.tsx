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
  Zap,
  Flame,
  Award,
  X
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/projects');
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

      {/* Hero Section - OPTIMIZED */}
      <section className="border-b-4 border-bauhaus bg-gradient-to-br from-white via-gray-50 to-bauhaus-yellow/10 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div className="space-y-8">
              {/* Pill Badge with Animation */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-bauhaus-yellow border-2 border-bauhaus shadow-bauhaus-sm animate-pulse">
                <span className="w-2 h-2 rounded-full bg-bauhaus-red animate-ping"></span>
                <span className="text-bauhaus-label">AI-Powered Academic Writing</span>
              </div>

              {/* Main Headline - Shorter & Punchier */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-none">
                CONSTRUCT LOGIC<br />
                <span className="text-bauhaus-red">DECONSTRUCT BIAS</span>
              </h1>

              {/* Subheadline - More direct */}
              <p className="text-lg sm:text-xl font-medium leading-relaxed max-w-lg">
                <strong>Write 50 words.</strong> Earn AI assistance.
                The only writing tool that makes you <em>think</em> before it helps.
              </p>

              {/* Social Proof */}
              <div className="flex items-center gap-4 py-2">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 rounded-full bg-bauhaus-blue border-2 border-white flex items-center justify-center text-white font-bold text-sm">F</div>
                  <div className="w-10 h-10 rounded-full bg-bauhaus-red border-2 border-white flex items-center justify-center text-white font-bold text-sm">N</div>
                  <div className="w-10 h-10 rounded-full bg-bauhaus-yellow border-2 border-white flex items-center justify-center font-bold text-sm">I</div>
                </div>
                <div className="text-sm">
                  <span className="font-bold">Built for FKMPI 2026</span>
                  <br />
                  <span className="text-gray-600">Essai Competition</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => router.push('/register')}
                  className="group bg-bauhaus-red text-white border-4 border-bauhaus shadow-bauhaus-lg btn-press font-black uppercase tracking-wider text-lg px-8 py-6 h-auto rounded-none hover:bg-bauhaus-red/90 transition-all"
                >
                  START FREE
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  onClick={() => router.push('/login')}
                  className="bg-white text-foreground border-4 border-bauhaus shadow-bauhaus btn-press font-bold uppercase tracking-wider px-8 py-6 h-auto rounded-none hover:bg-gray-100"
                >
                  SIGN IN
                </Button>
              </div>
            </div>

            {/* Right: Interactive Demo Preview */}
            <div className="relative h-[450px] lg:h-[550px]">
              {/* Main Card - Editor Preview */}
              <div className="absolute inset-4 bg-white border-4 border-bauhaus shadow-bauhaus-lg overflow-hidden">
                {/* Fake Editor Header */}
                <div className="flex items-center gap-2 px-4 py-3 bg-[#121212] text-white border-b-4 border-bauhaus">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-bauhaus-red"></div>
                    <div className="w-3 h-3 rounded-full bg-bauhaus-yellow"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="ml-2 text-sm font-bold uppercase tracking-wider">MITRA AI Editor</span>
                </div>

                {/* Fake Editor Content */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="font-bold">12 🔥 Streak</span>
                    <span className="mx-2">•</span>
                    <span>47/50 words</span>
                  </div>

                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-bauhaus-blue" style={{ width: '94%' }}></div>
                  </div>

                  <p className="text-gray-700 leading-relaxed">
                    <span className="text-black font-medium">Artificial intelligence is transforming education. However, students must develop critical thinking rather than relying on AI...</span>
                  </p>

                  <div className="mt-6 p-4 bg-bauhaus-blue/10 border-2 border-bauhaus-blue">
                    <div className="flex items-start gap-3">
                      <Brain className="w-6 h-6 text-bauhaus-blue flex-shrink-0" />
                      <div>
                        <p className="font-bold text-bauhaus-blue text-sm">MITRA AI</p>
                        <p className="text-sm text-gray-700">"Interesting premise! What evidence supports your claim about 'relying on AI'? Consider defining 'critical thinking' first."</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Badge - Token */}
              <div className="absolute -top-4 -right-4 bg-bauhaus-yellow border-4 border-bauhaus shadow-bauhaus px-4 py-2 animate-bounce">
                <span className="font-black text-lg">+3 🧠</span>
              </div>

              {/* Floating Badge - AI Unlocked */}
              <div className="absolute -bottom-2 -left-2 bg-bauhaus-red text-white border-4 border-bauhaus shadow-bauhaus px-4 py-2">
                <span className="font-bold text-sm uppercase tracking-wider">AI UNLOCKED!</span>
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

      {/* Comparison Section - THE KILLSHOT */}
      <section className="bg-[#121212] text-white border-b-4 border-bauhaus">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <h2 className="text-bauhaus-heading text-center mb-12">
            WHY NOT JUST USE <span className="text-bauhaus-red">CHATGPT?</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Generic AI (The Bad Way) */}
            <div className="p-8 border-2 border-gray-700 opacity-60">
              <h3 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
                <X className="w-6 h-6 text-bauhaus-red" />
                GENERIC AI MODELS
              </h3>
              <ul className="space-y-4 text-gray-400">
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-bauhaus-red flex-shrink-0 mt-0.5" />
                  <span>Encourages "Copy-Paste" culture</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-bauhaus-red flex-shrink-0 mt-0.5" />
                  <span>Often hallucinates citations</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-bauhaus-red flex-shrink-0 mt-0.5" />
                  <span>Writes FOR you (Passive learning)</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-bauhaus-red flex-shrink-0 mt-0.5" />
                  <span>Ignores logical fallacies</span>
                </li>
              </ul>
            </div>

            {/* MITRA AI (The Good Way) */}
            <div className="relative p-8 border-4 border-bauhaus-blue bg-gray-900">
              <div className="absolute top-0 right-0 bg-bauhaus-blue text-white text-xs font-black uppercase tracking-widest px-4 py-2">
                RECOMMENDED
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
                <Check className="w-6 h-6 text-bauhaus-blue" />
                MITRA AI
              </h3>
              <ul className="space-y-4 text-white">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-bauhaus-blue flex-shrink-0 mt-0.5" />
                  <span>Forces you to structure arguments first</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-bauhaus-blue flex-shrink-0 mt-0.5" />
                  <span>Validates real academic sources</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-bauhaus-blue flex-shrink-0 mt-0.5" />
                  <span>Writes WITH you (Active learning)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-bauhaus-blue flex-shrink-0 mt-0.5" />
                  <span>Detects bias & weak logic instantly</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Gamification Teaser */}
      <section className="bg-bauhaus-yellow/20 border-b-4 border-bauhaus">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-bauhaus-heading text-center mb-12">
            EARN YOUR INTELLECT. PAY WITH <span className="bg-black text-bauhaus-yellow px-3 py-1">LOGIC.</span>
          </h2>

          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-4 border-bauhaus shadow-bauhaus mb-4">
                <Flame className="w-10 h-10 text-orange-500" />
              </div>
              <p className="font-black uppercase tracking-tight text-center">DAILY STREAK</p>
              <p className="text-sm text-gray-600 text-center">Build consistency</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-4 border-bauhaus shadow-bauhaus mb-4">
                <Brain className="w-10 h-10 text-bauhaus-blue" />
              </div>
              <p className="font-black uppercase tracking-tight text-center">NALAR POINTS</p>
              <p className="text-sm text-gray-600 text-center">Solve quizzes to earn AI</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-4 border-bauhaus shadow-bauhaus mb-4">
                <Award className="w-10 h-10 text-bauhaus-red" />
              </div>
              <p className="font-black uppercase tracking-tight text-center">BADGES</p>
              <p className="text-sm text-gray-600 text-center">Prove your critical skills</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-bauhaus-yellow border-b-4 border-bauhaus relative overflow-hidden">
        {/* Decorative Shapes */}
        <div className="absolute top-8 right-8 w-32 h-32 rounded-full bg-bauhaus-red opacity-50"></div>

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