'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

interface GamificationContextType {
    stats: GamificationStats;
    isLoading: boolean;
    refreshStats: () => Promise<void>;
    addTokens: (amount: number) => void;
    showDailyChallenge: boolean;
    setShowDailyChallenge: (show: boolean) => void;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export function GamificationProvider({ children }: { children: ReactNode }) {
    const [stats, setStats] = useState<GamificationStats>({ tokens: 0, streak: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [showDailyChallenge, setShowDailyChallenge] = useState(false);

    const refreshStats = async () => {
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

    // Optimistic update for immediate UI feedback
    const addTokens = (amount: number) => {
        setStats(prev => ({
            ...prev,
            tokens: prev.tokens + amount
        }));
        // Refresh from server to confirm
        setTimeout(refreshStats, 500);
    };

    useEffect(() => {
        refreshStats();

        // Poll every 30 seconds
        const interval = setInterval(refreshStats, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <GamificationContext.Provider value={{
            stats,
            isLoading,
            refreshStats,
            addTokens,
            showDailyChallenge,
            setShowDailyChallenge
        }}>
            {children}
        </GamificationContext.Provider>
    );
}

export function useGamification() {
    const context = useContext(GamificationContext);
    if (!context) {
        throw new Error('useGamification must be used within GamificationProvider');
    }
    return context;
}
