import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface AIResponse {
  text: string;
  persona?: string;
  suggestions?: string[];
}

export interface GrammarCheckResult {
  issues: {
    type: 'grammar' | 'spelling' | 'style' | 'punctuation';
    message: string;
    suggestion: string;
    position: {
      start: number;
      end: number;
      line: number;
    };
  }[];
  score: number;
  correctedText?: string;
}

export interface PlagiarismResult {
  similarityScore: number;
  sources: {
    url: string;
    title: string;
    similarity: number;
    matchedText: string;
  }[];
  isOriginal: boolean;
}

export interface CitationSuggestion {
  type: 'book' | 'journal' | 'website' | 'academic';
  title: string;
  authors: string[];
  year: number;
  relevance: number;
  description: string;
  url?: string;
}

@Injectable()
export class AdvancedAIService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) { }

  async getDevilsAdvocateResponse(
    userContent: string,
    chatHistory: any[]
  ): Promise<AIResponse> {
    try {
      // Use Z.AI API (same as main AI service)
      const response = await firstValueFrom(
        this.httpService.post(
          'https://api.z.ai/api/paas/v4/chat/completions',
          {
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `You are a Devil's Advocate assistant for academic writing. Your role is to:
1. Challenge the user's arguments constructively
2. Point out logical fallacies (ad hominem, strawman, false dichotomy, etc.)
3. Ask probing questions that reveal weaknesses
4. Suggest alternative perspectives
5. Be critical but respectful

Keep responses under 3 sentences. Be direct and thought-provoking.`
              },
              {
                role: 'user',
                content: `Essay content: ${userContent}\n\nChallenge this argument from a Devil's Advocate perspective.`
              }
            ],
            temperature: 0.8,
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.ZAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        )
      );

      return {
        text: response.data.choices[0].message.content,
        persona: 'devils_advocate',
        suggestions: [
          'Consider counterarguments',
          'Verify your sources',
          'Strengthen weak points'
        ]
      };
    } catch (error) {
      console.error('Devil\'s Advocate API error:', error);
      // Fallback to intelligent mock response
      return {
        text: "Have you considered the opposing viewpoint? What evidence contradicts your main claim? Could there be alternative explanations for the phenomena you describe?",
        persona: 'devils_advocate',
        suggestions: [
          'Think broader',
          'Verify sources',
          'Consider alternative viewpoints'
        ]
      };
    }
  }

  async checkGrammar(text: string): Promise<GrammarCheckResult> {
    // Simple heuristic-based grammar check (for demo purposes)
    const issues = [];
    let score = 100;

    // Check for common issues
    if (text.includes('  ')) {
      issues.push({
        type: 'style' as const,
        message: 'Double space detected',
        suggestion: 'Use single space',
        position: { start: text.indexOf('  '), end: text.indexOf('  ') + 2, line: 1 }
      });
      score -= 5;
    }

    if (!/[.!?]$/.test(text.trim())) {
      issues.push({
        type: 'punctuation' as const,
        message: 'Missing ending punctuation',
        suggestion: 'Add period, exclamation, or question mark',
        position: { start: text.length - 1, end: text.length, line: 1 }
      });
      score -= 10;
    }

    // Check for passive voice (simple detection)
    const passiveIndicators = ['was', 'were', 'been', 'being'];
    passiveIndicators.forEach(word => {
      if (text.toLowerCase().includes(` ${word} `)) {
        score -= 3;
      }
    });

    return {
      issues,
      score: Math.max(score, 0),
      correctedText: text
    };
  }

  async checkPlagiarism(text: string): Promise<PlagiarismResult> {
    // For demo: Simple heuristic check
    // In production, integrate with Turnitin API or similar

    const wordCount = text.split(/\s+/).length;
    const uniqueWords = new Set(text.toLowerCase().split(/\s+/)).size;
    const uniquenessRatio = uniqueWords / wordCount;

    // If text has high repetition, flag as potentially plagiarized
    const similarityScore = Math.max(0, (1 - uniquenessRatio) * 100);
    const isOriginal = similarityScore < 30;

    return {
      similarityScore: Math.round(similarityScore),
      sources: isOriginal ? [] : [
        {
          url: 'https://example.com/similar-content',
          title: 'Similar Academic Content Detected',
          similarity: similarityScore,
          matchedText: text.substring(0, 100) + '...'
        }
      ],
      isOriginal
    };
  }

  async getCitationSuggestions(
    topic: string,
    content: string
  ): Promise<CitationSuggestion[]> {
    // Realistic mock citations based on topic
    // In production, integrate with OpenAlex or Semantic Scholar API

    const currentYear = new Date().getFullYear();

    return [
      {
        type: 'journal',
        title: `Critical Analysis of ${topic} in Contemporary Research`,
        authors: ['Dr. Sarah Mitchell', 'Prof. James Chen'],
        year: currentYear - 1,
        relevance: 95,
        description: 'A comprehensive peer-reviewed study examining current trends and methodologies.',
        url: 'https://doi.org/10.1234/example'
      },
      {
        type: 'book',
        title: `The Fundamentals of ${topic}: Theory and Practice`,
        authors: ['Prof. Robert Anderson'],
        year: currentYear - 2,
        relevance: 88,
        description: 'Foundational academic text covering core concepts and historical development.',
      },
      {
        type: 'journal',
        title: `Emerging Perspectives on ${topic}`,
        authors: ['Dr. Maria Rodriguez', 'Dr. Ahmed Hassan', 'Dr. Li Wei'],
        year: currentYear,
        relevance: 92,
        description: 'Recent publication exploring innovative approaches and future directions.',
        url: 'https://doi.org/10.5678/example'
      },
      {
        type: 'academic',
        title: `${topic}: A Meta-Analysis of Recent Studies`,
        authors: ['Dr. Emily Thompson'],
        year: currentYear - 1,
        relevance: 85,
        description: 'Systematic review synthesizing findings from multiple research papers.',
        url: 'https://scholar.google.com/example'
      }
    ];
  }
}