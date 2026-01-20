import { Controller, Post, Get, Body, Param, UseGuards, NotFoundException, ForbiddenException, HttpCode, HttpStatus } from '@nestjs/common';
import { AiService } from './ai.service';
import { AdvancedAIService } from './advanced-ai.service';
import { AiAnalyzeDto, GenerateMapDto, EthicsCheckDto, CitationDto, GrammarCheckDto, PlagiarismCheckDto } from './ai.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('AI Features')
@ApiBearerAuth()
@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(
    private aiService: AiService,
    private advancedAIService: AdvancedAIService,
    private prisma: PrismaService,
  ) { }

  @Post('analyze')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Analyze text content' })
  @ApiResponse({ status: 200, description: 'Analysis result' })
  @ApiBody({ type: AiAnalyzeDto })
  async analyze(@Body() dto: AiAnalyzeDto, @CurrentUser() user: any) {
    return this.aiService.analyze(dto.projectId, user.id, dto);
  }

  @Get('chat-history/:projectId')
  @ApiOperation({ summary: 'Get chat history for a project' })
  @ApiResponse({ status: 200, description: 'Chat history retrieved' })
  async getChatHistory(@Param('projectId') projectId: string, @CurrentUser() user: any) {
    return this.aiService.getChatHistory(projectId, user.id);
  }

  @Post('generate-map')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate mind map' })
  @ApiResponse({ status: 200, description: 'Mind map generated' })
  @ApiBody({ type: GenerateMapDto })
  async generateMap(@Body() dto: GenerateMapDto, @CurrentUser() user: any) {
    return this.aiService.generateMap(dto.projectId, user.id, dto);
  }

  @Post('ethics-check')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Perform ethics check on text' })
  @ApiResponse({ status: 200, description: 'Ethics check result' })
  @ApiBody({ type: EthicsCheckDto })
  async ethicsCheck(@Body() dto: EthicsCheckDto, @CurrentUser() user: any) {
    return this.aiService.ethicsCheck(dto.projectId, user.id, dto);
  }

  @Post('citations')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get citation suggestions' })
  @ApiResponse({ status: 200, description: 'Citation suggestions' })
  @ApiBody({ type: CitationDto })
  async getCitations(@Body() dto: CitationDto, @CurrentUser() user: any) {
    const citations = await this.advancedAIService.getCitationSuggestions(
      dto.topic,
      dto.content || '',
    );
    return { citations };
  }

  @Post('grammar-check')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check grammar' })
  @ApiResponse({ status: 200, description: 'Grammar check result' })
  @ApiBody({ type: GrammarCheckDto })
  async checkGrammar(@Body() dto: GrammarCheckDto, @CurrentUser() user: any) {
    // Verify user owns the project
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
    });

    if (!project || project.userId !== user.id) {
      throw new NotFoundException('Project not found or access denied');
    }

    const result = await this.advancedAIService.checkGrammar(dto.text);
    return result;
  }

  @Post('plagiarism-check')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check for plagiarism' })
  @ApiResponse({ status: 200, description: 'Plagiarism check result' })
  @ApiBody({ type: PlagiarismCheckDto })
  async checkPlagiarism(@Body() dto: PlagiarismCheckDto, @CurrentUser() user: any) {
    // Verify user owns the project
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
    });

    if (!project || project.userId !== user.id) {
      throw new NotFoundException('Project not found or access denied');
    }

    const result = await this.advancedAIService.checkPlagiarism(dto.text);
    return result;
  }
}
