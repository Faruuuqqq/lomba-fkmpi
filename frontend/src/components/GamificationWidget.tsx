'use client';

import { useState, useEffect } from 'react';
import { Coins, Flame, Target } from 'lucide-react';
import { gamificationAPI } from '@/lib/api';

interface GamificationStats {
    tokens: number;
    streak: number;
    dailyChallenge?: {
        id: number;
        question: string;
        completed: boolean;
    };
}

export function GamificationWidget() {
    const [stats, setStats] = useState<GamificationStats>({ tokens: 0, streak: 0 });
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const { data } = await gamificationAPI.getStats();
            setStats({
                tokens: data.tokens || 0,
                streak: data.streak || 0,
                dailyChallenge: data.dailyChallenge,
            });
        } catch (error) {
            console.error('Failed to load gamification stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-bauhaus-blue border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Compact View */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-1.5 px-2 py-1 bg-bauhaus-yellow border-2 border-bauhaus hover:bg-bauhaus-yellow/90 transition-colors"
                    title="Tokens"
                >
                    <Coins className="w-4 h-4" strokeWidth={3} />
                    <span className="font-black text-sm">{stats.tokens}</span>
                </button>

                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-1.5 px-2 py-1 bg-bauhaus-red border-2 border-bauhaus hover:bg-bauhaus-red/90 transition-colors"
                    title="Streak"
                >
                    <Flame className="w-4 h-4 text-white" strokeWidth={3} />
                    <span className="font-black text-sm text-white">{stats.streak}</span>
                </button>
            </div>

            {/* Expanded Dropdown */}
            {isExpanded && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsExpanded(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white border-4 border-bauhaus shadow-bauhaus-lg z-50">
                        <div className="p-4 space-y-3">
                            {/* Tokens */}
                            <div className="flex items-center justify-between p-3 bg-bauhaus-yellow border-2 border-bauhaus">
                                <div className="flex items-center gap-2">
                                    <Coins className="w-5 h-5" strokeWidth={3} />
                                    <span className="font-black uppercase text-sm">Tokens</span>
                                </div>
                                <span className="font-black text-2xl">{stats.tokens}</span>
                            </div>

                            {/* Streak */}
                            <div className="flex items-center justify-between p-3 bg-bauhaus-red border-2 border-bauhaus text-white">
                                <div className="flex items-center gap-2">
                                    <Flame className="w-5 h-5" strokeWidth={3} />
                                    <span className="font-black uppercase text-sm">Streak</span>
                                </div>
                                <span className="font-black text-2xl">{stats.streak} days</span>
                            </div>

                            {/* Daily Challenge */}
                            {stats.dailyChallenge && (
                                <div className="p-3 bg-bauhaus-blue border-2 border-bauhaus text-white">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Target className="w-5 h-5" strokeWidth={3} />
                                        <span className="font-black uppercase text-sm">Daily Challenge</span>
                                    </div>
                                    {stats.dailyChallenge.completed ? (
                                        <p className="text-xs font-bold">✓ Completed Today!</p>
                                    ) : (
                                        <p className="text-xs font-medium">Click to view challenge →</p>
                                    )}
                                </div>
                            )}

                            {/* Info */}
                            <div className="p-3 bg-gray-50 border-2 border-bauhaus">
                                <p className="text-xs font-bold uppercase mb-1">How to Earn Tokens:</p>
                                <ul className="text-xs font-medium space-y-1">
                                    <li>• Write 100 words: +10 tokens</li>
                                    <li>• Complete daily challenge: +50 tokens</li>
                                    <li>• Maintain streak: +5 tokens/day</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
