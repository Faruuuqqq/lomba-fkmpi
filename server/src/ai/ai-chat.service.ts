import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { 
  AIEditSuggestionDto, 
  ApplyEditDto, 
  ContextualChatDto, 
  UserDetectionDto 
} from './ai-chat.dto';

interface ChatHistory {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  projectId?: string;
}

interface AIEdit {
  id: string;
  type: 'grammar' | 'style' | 'content';
  original: string;
  suggestion: string;
  start: number;
  end: number;
  explanation?: string;
  projectId?: string;
  isApplied: boolean;
  createdAt: Date;
  userId: string;
}

@Injectable()
export class AIChatService {
  private readonly logger = new Logger(AIChatService.name);

  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {}

  async suggestEdit(userId: string, dto: AIEditSuggestionDto) {
    const editId = `edit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simpan suggestion ke database (bisa menggunakan AI Interactions atau table baru)
    await this.prisma.aiInteraction.create({
      data: {
        userPrompt: `EDIT_SUGGESTION_${dto.type.toUpperCase()}`,
        aiResponse: JSON.stringify({
          type: dto.type,
          original: dto.original,
          suggestion: dto.suggestion,
          start: dto.start,
          end: dto.end,
          explanation: dto.explanation,
        }),
        projectId: dto.projectId || null,
      },
    });

    this.logger.log(`AI edit suggestion created: ${editId}`);
    
    return {
      suggestionId: editId,
      type: dto.type,
      original: dto.original,
      suggestion: dto.suggestion,
      explanation: dto.explanation,
      start: dto.start,
      end: dto.end,
      canApply: true,
    };
  }

  async applyEdit(userId: string, dto: ApplyEditDto) {
    // Dalam implementasi sederhana, apply langsung ke project
    if (dto.projectId) {
      const project = await this.prisma.project.findUnique({
        where: { id: dto.projectId },
      });

      if (!project || project.userId !== userId) {
        throw new NotFoundException('Project not found');
      }

      // Untuk sekarang, log saja dulu
      this.logger.log(`User ${userId} applied edit ${dto.suggestionId}: ${dto.action}`);
      
      return {
        success: dto.action === 'accept',
        message: dto.action === 'accept' ? 'Edit applied successfully' : 'Edit rejected',
        editId: dto.suggestionId,
      };
    }

    return {
      success: false,
      message: 'No project specified',
    };
  }

  async contextualChat(userId: string, dto: ContextualChatDto) {
    const groqKey = process.env.GROQ_API_KEY;
    let context = '';

    // Build context jika project-specific
    if (dto.projectId && dto.mode === 'project-specific') {
      const project = await this.prisma.project.findUnique({
        where: { id: dto.projectId },
      });

      if (project && project.userId === userId) {
        context = `Context: User is working on project "${project.title}". Current content: "${project.content.substring(0, 200)}...". `;
      }
    }

    try {
      if (groqKey) {
        const response = await firstValueFrom(
          this.httpService.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
              model: 'llama-3.3-70b-versatile',
              messages: [
                { 
                  role: 'system', 
                  content: `You are a helpful AI assistant for academic writing. ${context}Be conversational and helpful.` 
                },
                { role: 'user', content: dto.message },
              ],
              max_tokens: 500,
              temperature: 0.7,
            },
            {
              headers: {
                Authorization: `Bearer ${groqKey}`,
                'Content-Type': 'application/json',
              },
              timeout: 15000,
            }
          )
        );

        const aiResponse = response.data.choices?.[0]?.message?.content;

        // Save chat history
        await this.prisma.aiInteraction.create({
          data: {
            userPrompt: dto.message,
            aiResponse,
            projectId: dto.projectId || null,
          },
        });

        this.logger.log(`Contextual chat successful for user ${userId}`);

        return {
          response: aiResponse,
          mode: dto.mode,
          context: context ? 'active' : 'none',
          canApplyToEditor: !!dto.projectId, // Bisa apply ke editor jika ada project
        };
      }
    } catch (error) {
      this.logger.error('Contextual chat failed:', error);
      throw error;
    }
  }

  async detectUserNeed(userId: string, dto: UserDetectionDto) {
    // Deteksi pola user butuh bantuan
    const helpPatterns = [
      'help',
      'stuck',
      'confused',
      'how',
      'what',
      'why',
      'improve',
      'better',
      'suggest',
    ];

    const needHelp = helpPatterns.some(pattern => 
      dto.currentText.toLowerCase().includes(pattern) ||
      (dto.currentText.endsWith('...') && dto.currentText.length > 20)
    );

    // Deteksi jika user mengetik terlalu lama tanpa submit
    const typingTooLong = dto.currentText.length > 100 && dto.currentText.includes('...');

    const result = {
      needHelp: needHelp || typingTooLong,
      confidence: Math.min(0.9, dto.currentText.length / 200), // Confidence based on activity
      suggestions: [],
    };

    if (result.needHelp) {
      if (dto.projectId) {
        result.suggestions?.push('Need help with your thesis? Click the AI Assistant tab!');
      } else {
        result.suggestions?.push('Click the AI Assistant tab for help!');
      }
    }

    if (typingTooLong) {
      result.suggestions?.push('Are you stuck? Let me help you continue!');
    }

    return result;
  }

  async getChatHistory(userId: string, projectId?: string) {
    const whereClause = projectId 
      ? { userId, projectId }
      : { userId };

    const history = await this.prisma.aiInteraction.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' },
      take: 50,
    });

    return history.map(item => ({
      id: item.id,
      role: 'user',
      content: item.userPrompt,
      timestamp: item.timestamp,
    }));
  }
}