import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Daily Challenge Questions
const DAILY_CHALLENGES = [
    {
        id: 1,
        question: 'Manakah yang merupakan FAKTA?',
        options: ['Nasi goreng adalah makanan terenak di dunia', 'Indonesia memiliki 17.000+ pulau'],
        correctAnswer: 1,
        explanation: 'Fakta adalah pernyataan yang dapat diverifikasi. Jumlah pulau bisa dibuktikan, sedangkan "terenak" adalah opini.',
    },
    {
        id: 2,
        question: 'Identifikasi LOGICAL FALLACY: "Semua orang melakukannya, jadi pasti benar."',
        options: ['Ad Hominem', 'Bandwagon Fallacy', 'Straw Man'],
        correctAnswer: 1,
        explanation: 'Bandwagon Fallacy (Appeal to Popularity) = mengasumsikan sesuatu benar karena banyak orang melakukannya.',
    },
    {
        id: 3,
        question: 'Manakah yang BUKAN bagian dari argumen yang valid?',
        options: ['Premis yang jelas', 'Kesimpulan logis', 'Emosi yang kuat'],
        correctAnswer: 2,
        explanation: 'Argumen yang valid berdasarkan logika, bukan emosi. Emotional appeal bisa memperkuat retorika tapi bukan fondasi argumen.',
    },
    {
        id: 4,
        question: '"Kamu tidak bisa percaya pendapatnya karena dia masih muda." Ini adalah fallacy apa?',
        options: ['Ad Hominem', 'False Dilemma', 'Slippery Slope'],
        correctAnswer: 0,
        explanation: 'Ad Hominem = menyerang karakter/atribut orang, bukan argumennya. Usia tidak relevan dengan kualitas argumen.',
    },
    {
        id: 5,
        question: 'Apa tujuan utama dari "Socratic Method"?',
        options: ['Memberikan jawaban langsung', 'Menanyakan pertanyaan untuk memicu pemikiran kritis', 'Membuktikan orang lain salah'],
        correctAnswer: 1,
        explanation: 'Socratic Method menggunakan pertanyaan untuk mendorong pemikiran mendalam, bukan memberikan jawaban langsung.',
    },
];

// Token costs for different AI features
export const TOKEN_COSTS = {
    AI_CHAT: 1,
    REASONING_MAP: 2,
    ETHICS_CHECK: 1,
};

// Token rewards
export const TOKEN_REWARDS = {
    DAILY_CHALLENGE: 3,
    WRITE_50_WORDS: 1,
    CITATION_CHALLENGE: 2,
};

@Injectable()
export class GamificationService {
    constructor(private prisma: PrismaService) { }

    // Get user's current token balance and streak
    async getUserStats(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                tokens: true,
                currentStreak: true,
                lastChallenge: true,
                lastActive: true,
            },
        });

        if (!user) {
            throw new Error('User not found');
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const hasDoneChallenge = user.lastChallenge
            ? new Date(user.lastChallenge).setHours(0, 0, 0, 0) >= today.getTime()
            : false;

        return {
            tokens: user.tokens,
            currentStreak: user.currentStreak,
            hasDoneChallenge,
            nextChallengeAvailable: !hasDoneChallenge,
        };
    }

    // Get a random daily challenge
    async getDailyChallenge(userId: string) {
        const stats = await this.getUserStats(userId);

        if (stats.hasDoneChallenge) {
            return {
                available: false,
                message: 'Kamu sudah menyelesaikan Daily Challenge hari ini! Kembali besok untuk challenge baru.',
                nextAvailable: this.getNextMidnight(),
            };
        }

        // Pick a random challenge
        const challenge = DAILY_CHALLENGES[Math.floor(Math.random() * DAILY_CHALLENGES.length)];

        return {
            available: true,
            challenge: {
                id: challenge.id,
                question: challenge.question,
                options: challenge.options,
            },
            reward: TOKEN_REWARDS.DAILY_CHALLENGE,
        };
    }

    // Submit daily challenge answer
    async submitDailyChallenge(userId: string, challengeId: number, answerIndex: number) {
        const stats = await this.getUserStats(userId);

        if (stats.hasDoneChallenge) {
            return {
                success: false,
                message: 'Kamu sudah menyelesaikan challenge hari ini!',
            };
        }

        const challenge = DAILY_CHALLENGES.find(c => c.id === challengeId);
        if (!challenge) {
            return {
                success: false,
                message: 'Challenge tidak ditemukan',
            };
        }

        const isCorrect = answerIndex === challenge.correctAnswer;
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        // Calculate new streak
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        let newStreak = 1;

        if (user?.lastChallenge) {
            const lastChallengeDate = new Date(user.lastChallenge);
            lastChallengeDate.setHours(0, 0, 0, 0);

            // If last challenge was yesterday, continue streak
            if (lastChallengeDate.getTime() === yesterday.getTime()) {
                newStreak = (user.currentStreak || 0) + 1;
            }
        }

        // Update user
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: {
                tokens: { increment: isCorrect ? TOKEN_REWARDS.DAILY_CHALLENGE : 1 }, // Even wrong answer gets 1 token for trying
                currentStreak: isCorrect ? newStreak : 0, // Wrong answer breaks streak
                lastChallenge: new Date(),
                lastActive: new Date(),
            },
        });

        return {
            success: true,
            isCorrect,
            explanation: challenge.explanation,
            tokensEarned: isCorrect ? TOKEN_REWARDS.DAILY_CHALLENGE : 1,
            newBalance: updatedUser.tokens,
            newStreak: isCorrect ? newStreak : 0,
            message: isCorrect
                ? `Benar! +${TOKEN_REWARDS.DAILY_CHALLENGE} tokens 🎉`
                : 'Belum tepat, tapi tetap dapat +1 token untuk usahamu!',
        };
    }

    // Spend tokens (middleware check)
    async spendTokens(userId: string, cost: number, feature: string): Promise<{ success: boolean; message?: string; newBalance?: number }> {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            return { success: false, message: 'User tidak ditemukan' };
        }

        if (user.tokens < cost) {
            return {
                success: false,
                message: `Token tidak cukup! Butuh ${cost} token, kamu punya ${user.tokens}. Selesaikan Daily Challenge atau tulis lebih banyak untuk mendapat token.`,
            };
        }

        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: {
                tokens: { decrement: cost },
                lastActive: new Date(),
            },
        });

        // Log analytics
        await this.prisma.analyticsLog.create({
            data: {
                userId,
                feature: `TOKEN_SPEND_${feature}`,
                duration: cost,
                metadata: { cost, remaining: updated.tokens },
            },
        });

        return { success: true, newBalance: updated.tokens };
    }

    // Earn tokens from writing
    async earnTokensFromWriting(userId: string, wordCount: number, previousWordCount: number) {
        // Award 1 token for every 50 new words written
        const newWords = wordCount - previousWordCount;
        const tokensEarned = Math.floor(newWords / 50);

        if (tokensEarned > 0) {
            const updated = await this.prisma.user.update({
                where: { id: userId },
                data: {
                    tokens: { increment: tokensEarned },
                    lastActive: new Date(),
                },
            });

            return {
                tokensEarned,
                newBalance: updated.tokens,
            };
        }

        return { tokensEarned: 0 };
    }

    // Add tokens manually (for rewards)
    async addTokens(userId: string, amount: number, reason: string) {
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: {
                tokens: { increment: amount },
            },
        });

        // Log analytics
        await this.prisma.analyticsLog.create({
            data: {
                userId,
                feature: `TOKEN_EARN_${reason}`,
                duration: amount,
            },
        });

        return { newBalance: updated.tokens };
    }

    // Reward writing (simplified endpoint)
    async rewardWriting(userId: string, wordCount: number) {
        // Simple implementation: award 1 token per 50 words threshold
        const tokensToAward = Math.floor(wordCount / 50);

        if (tokensToAward > 0) {
            const updated = await this.prisma.user.update({
                where: { id: userId },
                data: {
                    tokens: { increment: tokensToAward },
                    lastActive: new Date(),
                },
            });

            return {
                success: true,
                tokensEarned: tokensToAward,
                newBalance: updated.tokens,
            };
        }

        return { success: false, tokensEarned: 0 };
    }

    private getNextMidnight(): Date {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return tomorrow;
    }
}
