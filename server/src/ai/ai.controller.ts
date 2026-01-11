import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiAnalyzeDto } from './ai.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('analyze')
  async analyze(@Body() dto: AiAnalyzeDto, @CurrentUser() user: any) {
    return this.aiService.analyze(dto.projectId, user.id, dto);
  }

  @Get('chat-history/:projectId')
  async getChatHistory(@Param('projectId') projectId: string, @CurrentUser() user: any) {
    return this.aiService.getChatHistory(projectId, user.id);
  }
}
