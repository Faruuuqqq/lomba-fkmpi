'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Circle, Square, ArrowRight, Sparkles } from 'lucide-react';

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

    setIsLoading(true);

    try {
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Shapes */}
      <div className="absolute top-12 left-12 w-32 h-32 rounded-full bg-bauhaus-yellow opacity-20"></div>
      <div className="absolute bottom-12 right-12 w-40 h-40 bg-bauhaus-blue opacity-20 rotate-45"></div>
      <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-bauhaus-red opacity-20"></div>

      <div className="w-full max-w-5xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Left: Branding */}
          <div className="hidden lg:flex flex-col justify-center bg-bauhaus-blue border-4 border-bauhaus shadow-bauhaus-lg p-12 relative">
            {/* Geometric Logo */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-12 h-12 rounded-full bg-bauhaus-red border-4 border-bauhaus"></div>
                <div className="w-12 h-12 bg-bauhaus-yellow border-4 border-bauhaus"></div>
                <div className="w-0 h-0 border-l-[24px] border-l-transparent border-r-[24px] border-r-transparent border-b-[42px] border-b-white"></div>
              </div>
              <h1 className="text-5xl font-black uppercase tracking-tighter text-white mb-2">
                MITRA AI
              </h1>
              <p className="text-xl font-bold uppercase tracking-wide text-white/90">
                Academic Writing Assistant
              </p>
            </div>

            <div className="space-y-6 text-white">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-bauhaus-yellow border-2 border-bauhaus flex items-center justify-center flex-shrink-0">
                  <Circle className="w-4 h-4 text-bauhaus-blue" fill="currentColor" />
                </div>
                <div>
                  <h3 className="font-bold uppercase tracking-wide mb-1">PROVE YOUR POINT</h3>
                  <p className="font-medium opacity-90">Write 150 words of raw ideas. Let AI polish the diamond.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-bauhaus-red border-2 border-bauhaus flex items-center justify-center flex-shrink-0">
                  <Square className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold uppercase tracking-wide mb-1">SEE THE STRUCTURE</h3>
                  <p className="font-medium opacity-90">Turn complex paragraphs into clear, visual logic nodes.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-bauhaus-yellow border-2 border-bauhaus flex items-center justify-center flex-shrink-0">
                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-bauhaus-blue"></div>
                </div>
                <div>
                  <h3 className="font-bold uppercase tracking-wide mb-1">DEFEND YOUR THESIS</h3>
                  <p className="font-medium opacity-90">Identify weak spots before your defense day.</p>
                </div>
              </div>
            </div>

            {/* Decorative Shape */}
            <div className="absolute bottom-8 right-8 w-24 h-24 bg-white opacity-20 rotate-45"></div>
          </div>

          {/* Right: Login Form */}
          <div className="bg-white border-4 border-bauhaus shadow-bauhaus-lg p-8 sm:p-12">
            {/* Mobile Logo */}
            <div className="lg:hidden mb-8 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-bauhaus-red"></div>
                <div className="w-8 h-8 bg-bauhaus-blue"></div>
                <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-b-[28px] border-b-bauhaus-yellow"></div>
              </div>
              <h1 className="text-3xl font-black uppercase tracking-tighter">MITRA AI</h1>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter mb-2">
                ENTER THE LAB
              </h2>
              <p className="font-medium text-lg">
                Resume your intellectual pursuit.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="text-bauhaus-label mb-3 block">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 border-4 border-bauhaus rounded-none font-medium text-lg focus-visible:ring-bauhaus-red focus-visible:ring-offset-0"
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="text-bauhaus-label mb-3 block">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 border-4 border-bauhaus rounded-none font-medium text-lg focus-visible:ring-bauhaus-red focus-visible:ring-offset-0"
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-bauhaus-red/10 border-4 border-bauhaus-red">
                  <p className="font-bold text-bauhaus-red uppercase tracking-wide">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-14 bg-bauhaus-red text-white border-4 border-bauhaus shadow-bauhaus btn-press font-black uppercase tracking-wider text-lg rounded-none hover:bg-bauhaus-red/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    <span>SIGNING IN...</span>
                  </div>
                ) : (
                  <>
                    SIGN IN
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-4 border-bauhaus" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white font-bold uppercase tracking-widest text-sm">
                  OR
                </span>
              </div>
            </div>

            {/* Jury Access */}
            <div className="p-6 bg-bauhaus-yellow border-4 border-bauhaus shadow-bauhaus-sm mb-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-white border-2 border-bauhaus">
                  <Sparkles className="w-5 h-5 text-bauhaus-blue" strokeWidth={3} />
                </div>
                <div>
                  <h3 className="font-black uppercase tracking-tight mb-1">
                    COMPETITION JUDGES
                  </h3>
                  <p className="font-medium text-sm">
                    Quick access for demo and evaluation
                  </p>
                </div>
              </div>
              <Button
                onClick={handleJuryAccess}
                type="button"
                className="w-full h-12 bg-white text-foreground border-4 border-bauhaus shadow-bauhaus-sm btn-press font-bold uppercase tracking-wide rounded-none hover:bg-gray-100"
              >
                USE DEMO ACCOUNT
              </Button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="font-medium">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => router.push('/register')}
                  className="font-black text-bauhaus-red uppercase tracking-wide hover:underline"
                >
                  SIGN UP FREE
                </button>
              </p>
            </div>

            {/* Back to Home */}
            <div className="mt-8 text-center">
              <button
                onClick={() => router.push('/')}
                className="font-bold uppercase tracking-widest text-sm hover:text-bauhaus-red transition-colors"
              >
                ← BACK TO HOME
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}