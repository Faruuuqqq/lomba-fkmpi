import { Controller, Get, Post, Query, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AdvancedAIService } from './advanced-ai.service';
import { User } from '../common/decorators/current-user.decorator';

@Controller('ai/advanced')
@UseGuards(JwtAuthGuard)
export class AdvancedAIController {
  constructor(private advancedAIService: AdvancedAIService) {}

  @Post('devils-advocate')
  @HttpCode(HttpStatus.OK)
  async getDevilsAdvocateResponse(
    @Body() body: { content: string; chatHistory: any[] },
    @User() user: any
  ) {
    return this.advancedAIService.getDevilsAdvocateResponse(
      body.content,
      body.chatHistory || []
    );
  }

  @Post('grammar-check')
  @HttpCode(HttpStatus.OK)
  async checkGrammar(
    @Body() body: { text: string },
    @User() user: any
  ) {
    return this.advancedAIService.checkGrammar(body.text);
  }

  @Post('plagiarism-check')
  @HttpCode(HttpStatus.OK)
  async checkPlagiarism(
    @Body() body: { text: string },
    @User() user: any
  ) {
    return this.advancedAIService.checkPlagiarism(body.text);
  }

  @Get('citation-suggestions')
  async getCitationSuggestions(
    @Query('topic') topic: string,
    @Query('content') content: string,
    @User() user: any
  ) {
    return this.advancedAIService.getCitationSuggestions(topic, content);
  }

  @Get('personas')
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