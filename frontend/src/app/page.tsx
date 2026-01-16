'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  BookOpen,
  Lock,
  Shield,
  Sparkles,
  TrendingUp,
  Zap,
  CheckCircle2,
  ArrowRight,
  Brain,
  Target,
  Users
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 dark:from-slate-950 dark:via-indigo-950/20 dark:to-purple-950/10">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                NALAR.AI
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => router.push('/login')}
                variant="ghost"
                className="hidden sm:inline-flex"
              >
                Sign In
              </Button>
              <Button
                onClick={() => router.push('/register')}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
              Academic Writing Assistant
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 dark:text-slate-100 mb-6 leading-tight">
            Write Better Papers with{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Critical Thinking
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            NALAR.AI helps you develop stronger arguments, identify logical fallacies,
            and write academic papers that demonstrate genuine critical thinking.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => router.push('/register')}
              size="lg"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-lg px-8 py-6 w-full sm:w-auto"
            >
              Start Writing Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              onClick={() => router.push('/login')}
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 w-full sm:w-auto"
            >
              Sign In
            </Button>
          </div>

          {/* Social Proof */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>1,000+ Students</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>Trusted by Universities</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-600" />
              <span>100% Privacy</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Why Choose NALAR.AI?
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Designed specifically for academic writing with features that encourage genuine thinking
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Feature 1 */}
          <Card className="border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
                Critical Thinking First
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                AI assistance unlocks only after you've written your own thoughts.
                No shortcuts, just genuine learning.
              </p>
            </CardContent>
          </Card>

          {/* Feature 2 */}
          <Card className="border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
                Logic Mapping
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Visualize your arguments with interactive reasoning graphs.
                See connections and strengthen your logic.
              </p>
            </CardContent>
          </Card>

          {/* Feature 3 */}
          <Card className="border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
                Bias Detection
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Identify logical fallacies and cognitive biases in your writing.
                Build stronger, more objective arguments.
              </p>
            </CardContent>
          </Card>

          {/* Feature 4 */}
          <Card className="border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
                Academic Focus
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Distraction-free editor with serif fonts and paper-like design.
                Write like you're working on a real manuscript.
              </p>
            </CardContent>
          </Card>

          {/* Feature 5 */}
          <Card className="border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
                Real-time Feedback
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Get instant suggestions on argument structure, evidence quality,
                and logical consistency as you write.
              </p>
            </CardContent>
          </Card>

          {/* Feature 6 */}
          <Card className="border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-slate-100">
                Progress Tracking
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Monitor your writing habits and logic score over time.
                See your critical thinking skills improve.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="max-w-4xl mx-auto bg-gradient-to-br from-indigo-600 to-purple-600 border-0 text-white">
          <CardContent className="p-8 sm:p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Write Better Papers?
            </h2>
            <p className="text-lg text-indigo-100 mb-8 max-w-2xl mx-auto">
              Join thousands of students who are improving their critical thinking
              and academic writing skills with NALAR.AI
            </p>
            <Button
              onClick={() => router.push('/register')}
              size="lg"
              className="bg-white text-indigo-600 hover:bg-slate-100 text-lg px-8 py-6"
            >
              Get Started for Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-600" />
              <span className="font-semibold text-slate-900 dark:text-slate-100">NALAR.AI</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              © 2026 NALAR.AI. Empowering critical thinking in academic writing.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}