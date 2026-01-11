import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import { PrismaService } from '../prisma/prisma.service';
import { AiAnalyzeDto } from './ai.dto';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(private prisma: PrismaService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async analyze(projectId: string, userId: string, dto: AiAnalyzeDto) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    if (project.userId !== userId) {
      throw new Error('You do not have access to this project');
    }

    if (!project.isAiUnlocked) {
      throw new Error('AI is locked. Write at least 150 words to unlock AI assistance.');
    }

    const systemPrompt = `You are MITRA, a Socratic Tutor for academic writing. Your goal is to sharpen the student's logic.

Rules:
1. DO NOT write the essay for them.
2. Identify if there are logical fallacies (Strawman, Ad Hominem, Circular Reasoning, etc.).
3. Answer with a question or a critique that forces the student to rethink.
4. Keep your response under 3 sentences.
5. Be supportive but critical in a constructive way.`;

    const userPrompt = `Current essay content:\n\n${dto.currentText}\n\nStudent's question: ${dto.userQuery}`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0]?.message?.content || 'No response generated.';

    await this.prisma.aiInteraction.create({
      data: {
        userPrompt: dto.userQuery,
        aiResponse,
        projectId,
      },
    });

    return {
      response: aiResponse,
      timestamp: new Date(),
    };
  }

  async getChatHistory(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    if (project.userId !== userId) {
      throw new Error('You do not have access to this project');
    }

    return this.prisma.aiInteraction.findMany({
      where: { projectId },
      orderBy: { timestamp: 'asc' },
    });
  }
}
