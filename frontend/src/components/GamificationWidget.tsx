'use client';

import { useState } from 'react';
import { Coins, Flame, Target, Check, RefreshCw } from 'lucide-react';
import { useGamification } from '@/contexts/GamificationContext';
import { Modal } from './Modal';
import toast from 'react-hot-toast';

export function GamificationWidget() {
    const { stats, isLoading, showDailyChallenge, setShowDailyChallenge, addTokens } = useGamification();
    const [isExpanded, setIsExpanded] = useState(false);
    const [answer, setAnswer] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (isLoading && !stats.tokens) { // Show if we have stale data at least
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
            {/* Daily Challenge Modal */}
            <Modal
                isOpen={showDailyChallenge}
                onClose={() => setShowDailyChallenge(false)}
                title="🧠 Brain Fuel Depleted!"
            >
                <div className="space-y-6">
                    <div className="text-center p-6 bg-gray-100 border-2 border-bauhaus">
                        <Coins className="w-16 h-16 mx-auto mb-3 text-bauhaus-yellow" />
                        <h3 className="font-black uppercase text-xl mb-2">Oops, Token Habis!</h3>
                        <p className="text-sm font-medium text-gray-600">
                            Fasilitas AI butuh "bensin". Jawab kuis logika ini untuk dapat 50 Token instan!
                        </p>
                    </div>

                    <div className="bg-bauhaus-blue p-6 border-2 border-bauhaus text-white">
                        <div className="flex items-center gap-2 mb-4">
                            <Target className="w-6 h-6" />
                            <h4 className="font-black uppercase">Daily Logic Challenge</h4>
                        </div>

                        <p className="font-bold text-lg mb-4">
                            {stats.dailyChallenge?.question || "All dogs are animals. Some animals are pets. Therefore, some dogs are pets. Vaid or Invalid?"}
                        </p>

                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Type your answer..."
                                autoFocus
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                className="w-full p-3 text-black border-2 border-bauhaus font-medium focus:outline-none focus:border-bauhaus-yellow"
                            />
                            <button
                                onClick={() => {
                                    setIsSubmitting(true);
                                    setTimeout(() => {
                                        addTokens(50);
                                        setShowDailyChallenge(false);
                                        setAnswer('');
                                        setIsSubmitting(false);
                                        toast.success('🎉 +50 Tokens! Brain refueled.');
                                    }, 1000);
                                }}
                                disabled={!answer || isSubmitting}
                                className="w-full bg-bauhaus-yellow text-black border-2 border-bauhaus font-black uppercase py-3 hover:bg-bauhaus-yellow/90 disabled:opacity-50 transition-all shadow-bauhaus-sm btn-press"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Validating...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        <Check className="w-4 h-4" strokeWidth={3} />
                                        Submit Answer (+50 Tokens)
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
