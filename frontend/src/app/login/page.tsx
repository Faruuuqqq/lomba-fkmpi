'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BookOpen } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJuryAccess = () => {
    setEmail('demo@gmail.com');
    setPassword('demo123');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Jury Access Section */}
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-600 rounded-full mb-3">
              <span className="text-white text-xl font-bold">🏆</span>
            </div>
            <h3 className="text-lg font-bold text-green-900 mb-1">Juri Access</h3>
            <p className="text-sm text-green-700 mb-3">Quick demo access for judges</p>
            
            <div className="bg-white rounded-lg p-3 mb-3 text-sm">
              <div className="space-y-1">
                <div><strong>Email:</strong> demo@gmail.com</div>
                <div><strong>Password:</strong> demo123</div>
              </div>
            </div>
            
            <Button
              onClick={handleJuryAccess}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              🚀 Use Juri Credentials
            </Button>
          </div>
        </div>

        {/* Regular Login Form */}
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">Welcome to MITRA AI</CardTitle>
            <p className="text-muted-foreground">
              Your AI-powered academic writing assistant
            </p>
          </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="text-sm font-medium mb-2 block">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-medium mb-2 block">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <button
                type="button"
                onClick={() => router.push('/register')}
                className="text-primary hover:underline font-medium"
              >
                Sign up
              </button>
            </div>
          </form>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
