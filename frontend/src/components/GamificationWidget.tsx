'use client';

import { useState } from 'react';
import { Coins, Flame, Target, Check, RefreshCw, X } from 'lucide-react';
import { useGamification } from '@/contexts/GamificationContext';
import { Modal } from './Modal';
import toast from 'react-hot-toast';

export function GamificationWidget() {
    const { stats, isLoading, showDailyChallenge, setShowDailyChallenge, addTokens } = useGamification();
    const [isExpanded, setIsExpanded] = useState(false);
    const [answer, setAnswer] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (isLoading && !stats.tokens) {
        return (
            <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <>
            {/* Compact Widget */}
            <div className="relative">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-lg transition-colors"
                >
                    <div className="flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5 text-amber-500" />
                        <span className="font-bold text-sm text-amber-600 dark:text-amber-400">{stats.tokens}</span>
                    </div>
                    <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-600"></div>
                    <div className="flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-orange-500" />
                        <span className="font-bold text-sm text-orange-600 dark:text-orange-400">{stats.streak || 0}</span>
                    </div>
                </button>

                {/* Expanded Dropdown */}
                {isExpanded && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsExpanded(false)}
                        />
                        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg z-50">
                            <div className="p-4 space-y-3">
                                {/* Header */}
                                <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                                    <h3 className="font-bold text-sm uppercase tracking-tight">Academic Progress</h3>
                                    <button
                                        onClick={() => setIsExpanded(false)}
                                        className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Tokens */}
                                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                            <span className="font-semibold text-xs uppercase tracking-wide text-amber-900 dark:text-amber-100">Tokens</span>
                                        </div>
                                        <span className="font-black text-xl text-amber-700 dark:text-amber-300">{stats.tokens}</span>
                                    </div>
                                    {/* Elegant Progress Bar */}
                                    <div className="w-full h-1 bg-amber-200 dark:bg-amber-900 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-amber-500 dark:bg-amber-400 transition-all duration-500"
                                            style={{ width: `${Math.min((stats.tokens / 100) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                                        {stats.tokens < 100 ? `${100 - stats.tokens} more to reach 100` : 'Excellent progress!'}
                                    </p>
                                </div>

                                {/* Streak */}
                                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Flame className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                            <span className="font-semibold text-xs uppercase tracking-wide text-orange-900 dark:text-orange-100">Streak</span>
                                        </div>
                                        <span className="font-black text-xl text-orange-700 dark:text-orange-300">{stats.streak || 0} days</span>
                                    </div>
                                </div>

                                {/* Daily Challenge */}
                                {stats.dailyChallenge && (
                                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                            <span className="font-semibold text-xs uppercase tracking-wide text-indigo-900 dark:text-indigo-100">Daily Challenge</span>
                                        </div>
                                        {stats.dailyChallenge.completed ? (
                                            <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300">✓ Completed Today!</p>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setShowDailyChallenge(true);
                                                    setIsExpanded(false);
                                                }}
                                                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                                            >
                                                Start Challenge →
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* How to Earn */}
                                <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                                    <p className="text-xs font-bold uppercase mb-2 text-zinc-700 dark:text-zinc-300">How to Earn Tokens:</p>
                                    <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
                                        <li>• Write 50 words: +1 token</li>
                                        <li>• Complete daily challenge: +50 tokens</li>
                                        <li>• Maintain streak: +5 tokens/day</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Daily Challenge Modal */}
            <Modal
                isOpen={showDailyChallenge}
                onClose={() => setShowDailyChallenge(false)}
                title="Daily Logic Challenge"
            >
                <div className="space-y-6">
                    <div className="text-center p-6 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                        <Coins className="w-16 h-16 mx-auto mb-3 text-amber-500" />
                        <h3 className="font-black uppercase text-xl mb-2">Token Boost!</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            Answer this logic question to earn <strong className="text-amber-600 dark:text-amber-400">50 tokens</strong>
                        </p>
                    </div>

                    <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
                        <div className="flex items-center gap-2 mb-4">
                            <Target className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            <h4 className="font-bold uppercase text-indigo-900 dark:text-indigo-100">Question</h4>
                        </div>

                        <p className="font-semibold text-lg mb-4 text-zinc-900 dark:text-zinc-100">
                            {stats.dailyChallenge?.question || "All dogs are animals. Some animals are pets. Therefore, some dogs are pets. Valid or Invalid?"}
                        </p>

                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Type your answer..."
                                autoFocus
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <button
                                onClick={() => {
                                    setIsSubmitting(true);
                                    setTimeout(() => {
                                        addTokens(50);
                                        setShowDailyChallenge(false);
                                        setAnswer('');
                                        setIsSubmitting(false);
                                        toast.success('🎉 +50 Tokens! Excellent work.');
                                    }, 1000);
                                }}
                                disabled={!answer || isSubmitting}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold uppercase py-3 disabled:opacity-50 transition-all shadow-sm flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Validating...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Submit Answer
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
}
