import { Controller, Get, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GamificationService } from './gamification.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SubmitChallengeDto, CheckBalanceDto, RewardWritingDto } from './gamification.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Gamification')
@ApiBearerAuth()
@Controller('gamification')
@UseGuards(JwtAuthGuard)
export class GamificationController {
    constructor(private gamificationService: GamificationService) { }

    // Get user's token stats
    @Get('stats')
    @ApiOperation({ summary: 'Get user token stats' })
    @ApiResponse({ status: 200, description: 'User stats retrieved' })
    async getStats(@CurrentUser() user: any) {
        return this.gamificationService.getUserStats(user.id);
    }

    // Get daily challenge
    @Get('challenge')
    @ApiOperation({ summary: 'Get daily challenge' })
    @ApiResponse({ status: 200, description: 'Daily challenge retrieved' })
    async getDailyChallenge(@CurrentUser() user: any) {
        return this.gamificationService.getDailyChallenge(user.id);
    }

    // Submit daily challenge answer
    @Post('challenge/submit')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Submit daily challenge answer' })
    @ApiResponse({ status: 200, description: 'Challenge submitted' })
    @ApiBody({ type: SubmitChallengeDto })
    async submitChallenge(
        @CurrentUser() user: any,
        @Body() dto: SubmitChallengeDto,
    ) {
        return this.gamificationService.submitDailyChallenge(
            user.id,
            dto.challengeId,
            dto.answerIndex,
        );
    }

    // Check if user has enough tokens (utility endpoint)
    @Post('check-balance')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Check token balance' })
    @ApiResponse({ status: 200, description: 'Balance check result' })
    @ApiBody({ type: CheckBalanceDto })
    async checkBalance(@CurrentUser() user: any, @Body() dto: CheckBalanceDto) {
        const stats = await this.gamificationService.getUserStats(user.id);
        return {
            hasEnough: stats.tokens >= dto.cost,
            currentBalance: stats.tokens,
            needed: dto.cost,
        };
    }

    // Reward user for writing (Write-to-Earn)
    @Post('reward-writing')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Reward user for writing' })
    @ApiResponse({ status: 200, description: 'Writing rewarded' })
    @ApiBody({ type: RewardWritingDto })
    async rewardWriting(@CurrentUser() user: any, @Body() dto: RewardWritingDto) {
        return this.gamificationService.rewardWriting(user.id, dto.wordCount);
    }
}
