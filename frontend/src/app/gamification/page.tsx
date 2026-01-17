'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useGamification } from '@/contexts/GamificationContext';
import { Coins, Flame, Trophy, Target, TrendingUp, Calendar, Award, Zap, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TokenTransaction {
    id: string;
    type: 'earn' | 'spend';
    amount: number;
    reason: string;
    timestamp: Date;
}

export default function GamificationPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const { stats, isLoading, setShowDailyChallenge } = useGamification();
    const [transactions, setTransactions] = useState<TokenTransaction[]>([]);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    // Mock transactions (TODO: Fetch from backend)
    useEffect(() => {
        setTransactions([
            { id: '1', type: 'earn', amount: 100, reason: 'Starter Pack', timestamp: new Date() },
            { id: '2', type: 'earn', amount: 1, reason: 'Wrote 50 words', timestamp: new Date(Date.now() - 3600000) },
            { id: '3', type: 'spend', amount: 5, reason: 'AI Chat', timestamp: new Date(Date.now() - 7200000) },
        ]);
    }, []);

    const achievements = [
        { id: 1, title: 'First Steps', description: 'Create your first project', unlocked: true, icon: '🎯' },
        { id: 2, title: 'Writer', description: 'Write 500 words', unlocked: true, icon: '✍️' },
        { id: 3, title: 'Thinker', description: 'Use AI Chat 10 times', unlocked: false, icon: '🧠' },
        { id: 4, title: 'Scholar', description: 'Save 5 research papers', unlocked: false, icon: '📚' },
        { id: 5, title: 'Streak Master', description: 'Maintain 7-day streak', unlocked: false, icon: '🔥' },
        { id: 6, title: 'Perfectionist', description: 'Use Grammar Check 5 times', unlocked: false, icon: '✨' },
    ];

    return (
        <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 border-b border-indigo-500 p-8 shadow-sm">
                <div className="max-w-6xl mx-auto">
                    <Button
                        onClick={() => router.push('/projects')}
                        variant="ghost"
                        className="mb-4 text-white hover:bg-white/10"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Projects
                    </Button>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg flex items-center justify-center">
                            <Trophy className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="font-black uppercase text-4xl text-white tracking-tight">PROGRESS TRACKER</h1>
                            <p className="text-sm font-semibold text-white/90 mt-1">
                                Your Intellectual Journey
                            </p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Tokens */}
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-2">
                                <Coins className="w-6 h-6 text-amber-400" />
                                <span className="text-xs font-bold text-white/70 uppercase">Tokens</span>
                            </div>
                            <p className="text-3xl font-black text-white">{stats.tokens}</p>
                            <p className="text-xs text-white/70 mt-1">Intellectual Currency</p>
                        </div>

                        {/* Streak */}
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-2">
                                <Flame className="w-6 h-6 text-orange-400" />
                                <span className="text-xs font-bold text-white/70 uppercase">Streak</span>
                            </div>
                            <p className="text-3xl font-black text-white">{stats.streak || 0} days</p>
                            <p className="text-xs text-white/70 mt-1">Keep it going!</p>
                        </div>

                        {/* Level */}
                        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-2">
                                <TrendingUp className="w-6 h-6 text-green-400" />
                                <span className="text-xs font-bold text-white/70 uppercase">Level</span>
                            </div>
                            <p className="text-3xl font-black text-white">{Math.floor(stats.tokens / 100) + 1}</p>
                            <p className="text-xs text-white/70 mt-1">Scholar Rank</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto p-8 space-y-8">
                {/* Daily Challenge */}
                <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Target className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            <h2 className="font-black uppercase text-xl">Daily Challenge</h2>
                        </div>
                        <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 text-xs font-bold rounded-full">
                            +50 Tokens
                        </span>
                    </div>

                    {stats.dailyChallenge?.completed ? (
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                                <p className="font-semibold text-green-900 dark:text-green-100">
                                    Challenge Completed Today!
                                </p>
                            </div>
                            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                Come back tomorrow for a new challenge.
                            </p>
                        </div>
                    ) : (
                        <div>
                            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-4">
                                Answer today's logic question to earn 50 tokens and maintain your streak.
                            </p>
                            <Button
                                onClick={() => setShowDailyChallenge(true)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold uppercase"
                            >
                                <Zap className="w-4 h-4 mr-2" />
                                Start Challenge
                            </Button>
                        </div>
                    )}
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Token History */}
                    <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Calendar className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            <h2 className="font-black uppercase text-xl">Token History</h2>
                        </div>

                        <div className="space-y-2">
                            {transactions.length === 0 ? (
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-8">
                                    No transactions yet
                                </p>
                            ) : (
                                transactions.map((tx) => (
                                    <div
                                        key={tx.id}
                                        className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'earn'
                                                    ? 'bg-green-100 dark:bg-green-900/30'
                                                    : 'bg-red-100 dark:bg-red-900/30'
                                                }`}>
                                                {tx.type === 'earn' ? (
                                                    <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                ) : (
                                                    <Coins className="w-4 h-4 text-red-600 dark:text-red-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                                    {tx.reason}
                                                </p>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                    {new Date(tx.timestamp).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`font-bold text-sm ${tx.type === 'earn'
                                                ? 'text-green-600 dark:text-green-400'
                                                : 'text-red-600 dark:text-red-400'
                                            }`}>
                                            {tx.type === 'earn' ? '+' : '-'}{tx.amount}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Achievements */}
                    <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Award className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            <h2 className="font-black uppercase text-xl">Achievements</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {achievements.map((achievement) => (
                                <div
                                    key={achievement.id}
                                    className={`p-4 border rounded-lg transition-all ${achievement.unlocked
                                            ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'
                                            : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 opacity-50'
                                        }`}
                                >
                                    <div className="text-3xl mb-2">{achievement.icon}</div>
                                    <h3 className="font-bold text-sm mb-1 text-zinc-900 dark:text-zinc-100">
                                        {achievement.title}
                                    </h3>
                                    <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                        {achievement.description}
                                    </p>
                                    {achievement.unlocked && (
                                        <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Unlocked
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* How to Earn More */}
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
                    <h2 className="font-black uppercase text-xl mb-4 text-amber-900 dark:text-amber-100">
                        💡 How to Earn More Tokens
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-amber-200 dark:bg-amber-800 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-black">1</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-sm mb-1">Write More</h3>
                                <p className="text-xs text-zinc-700 dark:text-zinc-300">
                                    Earn 1 token for every 50 words you write
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-amber-200 dark:bg-amber-800 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-black">2</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-sm mb-1">Daily Challenge</h3>
                                <p className="text-xs text-zinc-700 dark:text-zinc-300">
                                    Complete logic questions for 50 tokens daily
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-amber-200 dark:bg-amber-800 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-black">3</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-sm mb-1">Maintain Streak</h3>
                                <p className="text-xs text-zinc-700 dark:text-zinc-300">
                                    Earn bonus tokens for consecutive days
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
