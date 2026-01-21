import { Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AIChatService } from './ai-chat.service';
import { 
  AIEditSuggestionDto, 
  ApplyEditDto, 
  ContextualChatDto, 
  UserDetectionDto 
} from './ai-chat.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('AI Chat & Edit')
@ApiBearerAuth()
@Controller('ai/chat')
@UseGuards(JwtAuthGuard)
export class AIChatController {
  constructor(private aiChatService: AIChatService) {}

  @Post('suggest-edit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Suggest text edits to user' })
  @ApiResponse({ status: 200, description: 'Edit suggestion created' })
  @ApiBody({ type: AIEditSuggestionDto })
  async suggestEdit(@Body() dto: AIEditSuggestionDto, @CurrentUser() user: any) {
    return this.aiChatService.suggestEdit(user.id, dto);
  }

  @Post('apply-edit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Apply or reject AI edit suggestion' })
  @ApiResponse({ status: 200, description: 'Edit action processed' })
  @ApiBody({ type: ApplyEditDto })
  async applyEdit(@Body() dto: ApplyEditDto, @CurrentUser() user: any) {
    return this.aiChatService.applyEdit(user.id, dto);
  }

  @Post('contextual')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Contextual AI chat with apply-to-editor capability' })
  @ApiResponse({ status: 200, description: 'Chat response with context' })
  @ApiBody({ type: ContextualChatDto })
  async contextualChat(@Body() dto: ContextualChatDto, @CurrentUser() user: any) {
    return this.aiChatService.contextualChat(user.id, dto);
  }

  @Post('detect-help')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Detect if user needs AI assistance' })
  @ApiResponse({ status: 200, description: 'User need detection result' })
  @ApiBody({ type: UserDetectionDto })
  async detectHelp(@Body() dto: UserDetectionDto, @CurrentUser() user: any) {
    return this.aiChatService.detectUserNeed(user.id, dto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get AI chat history' })
  @ApiResponse({ status: 200, description: 'Chat history retrieved' })
  async getHistory(@CurrentUser() user: any, @Get('projectId') projectId?: string) {
    return this.aiChatService.getChatHistory(user.id, projectId);
  }
}