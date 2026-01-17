'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Circle, Square, ArrowRight, Check } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/library');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      await register(email, password, name || undefined);
      router.push('/library');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Shapes */}
      <div className="absolute top-8 right-8 w-40 h-40 rounded-full bg-bauhaus-red opacity-20"></div>
      <div className="absolute bottom-8 left-8 w-32 h-32 bg-bauhaus-yellow opacity-20 rotate-45"></div>
      <div className="absolute top-1/3 left-1/4 w-24 h-24 bg-bauhaus-blue opacity-20"></div>

      <div className="w-full max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
          {/* Left: Benefits (2 columns) */}
          <div className="hidden lg:block lg:col-span-2 bg-bauhaus-red border-4 border-bauhaus shadow-bauhaus-lg p-12">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-bauhaus-yellow border-4 border-bauhaus"></div>
                <div className="w-10 h-10 bg-white border-4 border-bauhaus"></div>
              </div>
              <h2 className="text-4xl font-black uppercase tracking-tighter text-white mb-2">
                START YOUR<br />JOURNEY
              </h2>
              <p className="text-lg font-bold uppercase tracking-wide text-white/90">
                To Better Academic Writing
              </p>
            </div>

            <div className="space-y-6 text-white">
              {[
                {
                  title: 'AI-POWERED FEEDBACK',
                  description: 'Get intelligent suggestions that improve your arguments',
                  shape: 'circle'
                },
                {
                  title: 'LOGIC VISUALIZATION',
                  description: 'See your arguments mapped out in interactive graphs',
                  shape: 'square'
                },
                {
                  title: '100% FREE TO START',
                  description: 'No credit card required. Start writing immediately.',
                  shape: 'triangle'
                }
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {benefit.shape === 'circle' && (
                      <div className="w-8 h-8 rounded-full bg-bauhaus-yellow border-2 border-bauhaus flex items-center justify-center">
                        <Check className="w-5 h-5 text-bauhaus-red" strokeWidth={3} />
                      </div>
                    )}
                    {benefit.shape === 'square' && (
                      <div className="w-8 h-8 bg-bauhaus-blue border-2 border-bauhaus flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" strokeWidth={3} />
                      </div>
                    )}
                    {benefit.shape === 'triangle' && (
                      <div className="w-8 h-8 bg-bauhaus-yellow border-2 border-bauhaus flex items-center justify-center">
                        <Check className="w-5 h-5 text-bauhaus-red" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-black uppercase tracking-tight mb-1">
                      {benefit.title}
                    </h3>
                    <p className="font-medium opacity-90 text-sm">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Decorative Shapes */}
            <div className="mt-12 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white opacity-30"></div>
              <div className="w-12 h-12 bg-bauhaus-yellow opacity-30 rotate-45"></div>
              <div className="w-20 h-20 bg-bauhaus-blue opacity-30"></div>
            </div>
          </div>

          {/* Right: Registration Form (3 columns) */}
          <div className="lg:col-span-3 bg-white border-4 border-bauhaus shadow-bauhaus-lg p-8 sm:p-12">
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
                CREATE ACCOUNT
              </h2>
              <p className="font-medium text-lg">
                Get started with MITRA AI today
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Input */}
              <div>
                <label htmlFor="name" className="text-bauhaus-label mb-3 block">
                  Full Name <span className="text-gray-400">(Optional)</span>
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-14 border-4 border-bauhaus rounded-none font-medium text-lg focus-visible:ring-bauhaus-red focus-visible:ring-offset-0"
                  disabled={isLoading}
                />
              </div>

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
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 border-4 border-bauhaus rounded-none font-medium text-lg focus-visible:ring-bauhaus-red focus-visible:ring-offset-0"
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Confirm Password Input */}
              <div>
                <label htmlFor="confirmPassword" className="text-bauhaus-label mb-3 block">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                    <span>CREATING ACCOUNT...</span>
                  </div>
                ) : (
                  <>
                    CREATE ACCOUNT
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>

              {/* Terms */}
              <p className="text-xs font-medium text-center text-gray-600">
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </p>
            </form>

            {/* Sign In Link */}
            <div className="mt-8 text-center">
              <p className="font-medium">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  className="font-black text-bauhaus-blue uppercase tracking-wide hover:underline"
                >
                  SIGN IN
                </button>
              </p>
            </div>

            {/* Back to Home */}
            <div className="mt-6 text-center">
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
