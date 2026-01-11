'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BookOpen, Lock, Bot, Shield, FileText } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <nav className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">MITRA AI</h1>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => router.push('/login')}>
              Sign In
            </Button>
            <Button onClick={() => router.push('/register')}>
              Get Started
            </Button>
          </div>
        </nav>

        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Write Better. Think Deeper.
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            MITRA AI forces you to think before collaborating. Unlock AI assistance only after demonstrating your own thoughts.
          </p>
          <Button size="lg" onClick={() => router.push('/register')} className="text-lg px-8 py-6">
            Start Writing Free
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Write First</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                AI is locked until you write 150 words. Copy-paste is prevented to encourage original thinking.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Collaborate Smart</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                After writing, unlock your Socratic AI tutor who challenges your arguments and sharpens your logic.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Track Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Every interaction is logged. Export complete reports with chat history for academic integrity.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-3xl">How MITRA AI Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-foreground/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-2">Initial Draft</h3>
                <p className="text-sm opacity-90">
                  Write your own thoughts. No AI assistance yet. Copy-paste is blocked for blocks over 20 words.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-foreground/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-2">AI Unlocks</h3>
                <p className="text-sm opacity-90">
                  After 150 words, unlock AI. Ask questions, get feedback, identify logical fallacies.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-foreground/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-2">Export Report</h3>
                <p className="text-sm opacity-90">
                  Download complete report with your essay, AI interactions, and word count statistics.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 MITRA AI. Built for academic integrity.</p>
        </footer>
      </div>
    </div>
  );
}
