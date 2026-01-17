'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Check, X, Flame, Coins } from 'lucide-react';
import { gamificationAPI } from '@/lib/api';

interface ChallengeData {
    available: boolean;
    message?: string;
    challenge?: {
        id: number;
        question: string;
        options: string[];
    };
    reward?: number;
}

interface DailyChallengeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (tokensEarned: number, newStreak: number) => void;
}

export function DailyChallengeModal({ isOpen, onClose, onComplete }: DailyChallengeModalProps) {
    const [challengeData, setChallengeData] = useState<ChallengeData | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<{
        isCorrect: boolean;
        explanation: string;
        tokensEarned: number;
        newStreak: number;
    } | null>(null);

    useEffect(() => {
        if (isOpen) {
            loadChallenge();
        }
    }, [isOpen]);

    const loadChallenge = async () => {
        try {
            setIsLoading(true);
            const { data } = await gamificationAPI.getDailyChallenge();
            setChallengeData(data);
        } catch (error) {
            console.error('Failed to load challenge:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (selectedAnswer === null || !challengeData?.challenge) return;

        try {
            setIsSubmitting(true);
            const { data } = await gamificationAPI.submitChallenge(
                challengeData.challenge.id,
                selectedAnswer
            );
            setResult({
                isCorrect: data.isCorrect,
                explanation: data.explanation,
                tokensEarned: data.tokensEarned,
                newStreak: data.newStreak,
            });
        } catch (error) {
            console.error('Failed to submit challenge:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (result) {
            onComplete(result.tokensEarned, result.newStreak);
        }
        setResult(null);
        setSelectedAnswer(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
            <Card className="w-full max-w-lg border-4 border-bauhaus shadow-bauhaus-lg rounded-none bg-white animate-in zoom-in-95">
                <CardHeader className="border-b-4 border-bauhaus bg-bauhaus-yellow">
                    <CardTitle className="flex items-center gap-3 text-2xl font-black uppercase tracking-tighter">
                        <Brain className="w-8 h-8" />
                        DAILY LOGIC CHALLENGE
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-6">
                    {isLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-none h-12 w-12 border-4 border-bauhaus-red border-t-transparent mx-auto mb-4"></div>
                            <p className="font-bold uppercase tracking-wide">LOADING CHALLENGE...</p>
                        </div>
                    ) : !challengeData?.available ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 rounded-none bg-bauhaus-blue mx-auto mb-4 flex items-center justify-center">
                                <Check className="w-8 h-8 text-white" />
                            </div>
                            <p className="font-bold uppercase tracking-wide mb-4">{challengeData?.message}</p>
                            <Button
                                onClick={handleClose}
                                className="bg-bauhaus-blue text-white border-4 border-bauhaus shadow-bauhaus btn-press font-black uppercase tracking-wider rounded-none"
                            >
                                TUTUP
                            </Button>
                        </div>
                    ) : result ? (
                        <div className="text-center py-4">
                            <div className={`w-20 h-20 rounded-none mx-auto mb-4 flex items-center justify-center ${result.isCorrect ? 'bg-bauhaus-yellow' : 'bg-bauhaus-red'
                                }`}>
                                {result.isCorrect ? (
                                    <Check className="w-10 h-10 text-black" />
                                ) : (
                                    <X className="w-10 h-10 text-white" />
                                )}
                            </div>

                            <h3 className="text-3xl font-black uppercase tracking-tighter mb-2">
                                {result.isCorrect ? 'BENAR!' : 'BELUM TEPAT'}
                            </h3>

                            <div className="flex items-center justify-center gap-2 mb-4">
                                <Coins className="w-5 h-5 text-bauhaus-yellow" />
                                <span className="font-black text-xl">+{result.tokensEarned} TOKENS</span>
                            </div>

                            {result.newStreak > 0 && (
                                <div className="flex items-center justify-center gap-2 mb-4 text-bauhaus-red">
                                    <Flame className="w-5 h-5" />
                                    <span className="font-black">STREAK: {result.newStreak} HARI 🔥</span>
                                </div>
                            )}

                            <div className="p-4 bg-gray-100 border-2 border-bauhaus mb-6 text-left">
                                <h4 className="font-bold uppercase tracking-wide mb-2">PENJELASAN:</h4>
                                <p className="text-sm">{result.explanation}</p>
                            </div>

                            <Button
                                onClick={handleClose}
                                className="bg-bauhaus-red text-white border-4 border-bauhaus shadow-bauhaus btn-press font-black uppercase tracking-wider rounded-none"
                            >
                                LANJUT KE DASHBOARD
                            </Button>
                        </div>
                    ) : (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                                    REWARD: +{challengeData.reward} TOKENS
                                </span>
                                <div className="flex items-center gap-1">
                                    <Coins className="w-4 h-4 text-bauhaus-yellow" />
                                    <span className="font-bold">{challengeData.reward}</span>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold mb-6">
                                {challengeData.challenge?.question}
                            </h3>

                            <div className="space-y-3 mb-6">
                                {challengeData.challenge?.options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedAnswer(idx)}
                                        className={`w-full p-4 text-left border-4 rounded-none transition-all font-medium ${selectedAnswer === idx
                                                ? 'border-bauhaus-red bg-bauhaus-red/10 shadow-bauhaus-sm'
                                                : 'border-bauhaus hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="font-bold mr-2">{String.fromCharCode(65 + idx)}.</span>
                                        {option}
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    onClick={handleClose}
                                    variant="outline"
                                    className="flex-1 border-2 border-bauhaus rounded-none font-bold uppercase tracking-wide"
                                >
                                    SKIP
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={selectedAnswer === null || isSubmitting}
                                    className="flex-1 bg-bauhaus-red text-white border-4 border-bauhaus shadow-bauhaus btn-press font-black uppercase tracking-wider rounded-none hover:bg-bauhaus-red/90 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'CHECKING...' : 'SUBMIT JAWABAN'}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
