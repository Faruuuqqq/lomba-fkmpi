import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { AdvancedAIService } from './advanced-ai.service';
import { AiAnalyzeDto, GenerateMapDto, EthicsCheckDto } from './ai.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(
    private aiService: AiService,
    private advancedAIService: AdvancedAIService,
  ) { }

  @Post('analyze')
  async analyze(@Body() dto: AiAnalyzeDto, @CurrentUser() user: any) {
    return this.aiService.analyze(dto.projectId, user.id, dto);
  }

  @Get('chat-history/:projectId')
  async getChatHistory(@Param('projectId') projectId: string, @CurrentUser() user: any) {
    return this.aiService.getChatHistory(projectId, user.id);
  }

  @Post('generate-map')
  async generateMap(@Body() dto: GenerateMapDto, @CurrentUser() user: any) {
    return this.aiService.generateMap(dto.projectId, user.id, dto);
  }

  @Post('ethics-check')
  async ethicsCheck(@Body() dto: EthicsCheckDto, @CurrentUser() user: any) {
    return this.aiService.ethicsCheck(dto.projectId, user.id, dto);
  }

  @Post('citations')
  async getCitations(@Body() body: { topic: string; content: string }) {
    const citations = await this.advancedAIService.getCitationSuggestions(
      body.topic,
      body.content || '',
    );
    return { citations };
  }

  @Post('grammar-check')
  async checkGrammar(@Body() body: { projectId: string; text: string }) {
    const result = await this.advancedAIService.checkGrammar(body.text);
    return result;
  }

  @Post('plagiarism-check')
  async checkPlagiarism(@Body() body: { projectId: string; text: string }) {
    const result = await this.advancedAIService.checkPlagiarism(body.text);
    return result;
  }
}
