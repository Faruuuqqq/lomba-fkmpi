import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GamificationService } from './gamification.service';

@Controller('gamification')
@UseGuards(JwtAuthGuard)
export class GamificationController {
    constructor(private gamificationService: GamificationService) { }

    // Get user's token stats
    @Get('stats')
    async getStats(@Request() req) {
        return this.gamificationService.getUserStats(req.user.sub);
    }

    // Get daily challenge
    @Get('challenge')
    async getDailyChallenge(@Request() req) {
        return this.gamificationService.getDailyChallenge(req.user.sub);
    }

    // Submit daily challenge answer
    @Post('challenge/submit')
    async submitChallenge(
        @Request() req,
        @Body() body: { challengeId: number; answerIndex: number },
    ) {
        return this.gamificationService.submitDailyChallenge(
            req.user.sub,
            body.challengeId,
            body.answerIndex,
        );
    }

    // Check if user has enough tokens (utility endpoint)
    @Post('check-balance')
    async checkBalance(@Request() req, @Body() body: { cost: number }) {
        const stats = await this.gamificationService.getUserStats(req.user.sub);
        return {
            hasEnough: stats.tokens >= body.cost,
            currentBalance: stats.tokens,
            needed: body.cost,
        };
    }

    // Reward user for writing (Write-to-Earn)
    @Post('reward-writing')
    async rewardWriting(@Request() req, @Body() body: { wordCount: number }) {
        return this.gamificationService.rewardWriting(req.user.sub, body.wordCount);
    }
}
