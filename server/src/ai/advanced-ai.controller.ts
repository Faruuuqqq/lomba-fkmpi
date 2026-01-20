import { Controller, Get, Post, Query, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdvancedAIService } from './advanced-ai.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { DevilsAdvocateDto, SimpleTextCheckDto } from './ai.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Advanced AI Features')
@ApiBearerAuth()
@Controller('ai/advanced')
@UseGuards(JwtAuthGuard)
export class AdvancedAIController {
  constructor(private advancedAIService: AdvancedAIService) { }

  @Post('devils-advocate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Devil\'s Advocate response' })
  @ApiResponse({ status: 200, description: 'Response generated' })
  @ApiBody({ type: DevilsAdvocateDto })
  async getDevilsAdvocateResponse(
    @Body() dto: DevilsAdvocateDto,
    @CurrentUser() user: any
  ) {
    return this.advancedAIService.getDevilsAdvocateResponse(
      dto.content,
      dto.chatHistory || []
    );
  }

  @Post('grammar-check')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check grammar (simple)' })
  @ApiResponse({ status: 200, description: 'Grammar check result' })
  @ApiBody({ type: SimpleTextCheckDto })
  async checkGrammar(
    @Body() dto: SimpleTextCheckDto,
    @CurrentUser() user: any
  ) {
    return this.advancedAIService.checkGrammar(dto.text);
  }

  @Post('plagiarism-check')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check for plagiarism (simple)' })
  @ApiResponse({ status: 200, description: 'Plagiarism check result' })
  @ApiBody({ type: SimpleTextCheckDto })
  async checkPlagiarism(
    @Body() dto: SimpleTextCheckDto,
    @CurrentUser() user: any
  ) {
    return this.advancedAIService.checkPlagiarism(dto.text);
  }

  @Get('citation-suggestions')
  @ApiOperation({ summary: 'Get citation suggestions' })
  @ApiQuery({ name: 'topic', required: true })
  @ApiQuery({ name: 'content', required: true })
  @ApiResponse({ status: 200, description: 'Citation suggestions' })
  async getCitationSuggestions(
    @Query('topic') topic: string,
    @Query('content') content: string,
    @CurrentUser() user: any
  ) {
    return this.advancedAIService.getCitationSuggestions(topic, content);
  }

  @Get('personas')
  @ApiOperation({ summary: 'Get available AI personas' })
  @ApiResponse({ status: 200, description: 'List of personas' })
  async getAvailablePersonas() {
    return {
      personas: [
        {
          id: 'socratic',
          name: 'Socratic Tutor',
          description: 'Asks probing questions to guide critical thinking',
          icon: '🤔'
        },
        {
          id: 'devils_advocate',
          name: 'Devil\'s Advocate',
          description: 'Challenges arguments and presents counterpoints',
          icon: '😈'
        }
      ]
    };
  }
}