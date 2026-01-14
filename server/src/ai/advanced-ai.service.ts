import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface AIResponse {
  text: string;
  persona?: string;
  suggestions?: string[];
}

interface GrammarCheckResult {
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

interface PlagiarismResult {
  similarityScore: number;
  sources: {
    url: string;
    title: string;
    similarity: number;
    matchedText: string;
  }[];
  isOriginal: boolean;
}

interface CitationSuggestion {
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
  constructor(private prisma: PrismaService) {}

  async getDevilsAdvocateResponse(
    userContent: string,
    chatHistory: any[]
  ): Promise<AIResponse> {
    const prompt = `You are a Devil's Advocate AI tutor. Your role is to:

1. Challenge the student's assumptions and arguments
2. Present counterarguments and alternative perspectives
3. Point out logical fallacies or weak reasoning
4. Push the student to defend and strengthen their position
5. Ask probing questions that reveal potential flaws

CRITICAL RULES:
- Maximum 2-3 sentences per response
- Be constructively critical, not dismissive
- Focus on argument strength, not personal opinions
- Use phrases like "Have you considered...", "What if...", "How would you respond to..."
- Maintain academic tone

User content: "${userContent}"

Recent conversation context: ${chatHistory.slice(-3).map(h => h.userPrompt).join('. ')}

Respond as Devil's Advocate:`;

    const response = await this.callAI(prompt);
    
    return {
      text: response.text,
      persona: 'devils_advocate',
      suggestions: [
        'Consider alternative viewpoints',
        'Challenge your assumptions',
        'Look for counterarguments'
      ]
    };
  }

  async checkGrammar(text: string): Promise<GrammarCheckResult> {
    // Simulate grammar checking API call
    const mockGrammarIssues = this.analyzeGrammarIssues(text);
    
    return {
      issues: mockGrammarIssues,
      score: this.calculateGrammarScore(text, mockGrammarIssues),
      correctedText: this.generateCorrectedText(text, mockGrammarIssues)
    };
  }

  async checkPlagiarism(text: string): Promise<PlagiarismResult> {
    // Simulate plagiarism detection API call
    const mockSources = this.findPotentialSources(text);
    const similarityScore = this.calculateSimilarityScore(text, mockSources);
    
    return {
      similarityScore,
      sources: mockSources,
      isOriginal: similarityScore < 15 // Original if less than 15% similarity
    };
  }

  async getCitationSuggestions(topic: string, content: string): Promise<CitationSuggestion[]> {
    // Simulate academic database search
    const suggestions = this.generateCitationSuggestions(topic, content);
    
    return suggestions;
  }

  private async callAI(prompt: string): Promise<{ text: string }> {
    // Simulate AI API call - in production, call actual AI service
    const responses = {
      devils_advocate: [
        "Have you considered how opposing viewpoints might challenge your main argument?",
        "What evidence would critics demand to support your claims?",
        "How would you respond to someone who disagrees with your premise?",
        "Are you overlooking any important counterarguments here?",
        "What assumptions are you making that might need justification?"
      ]
    };

    const responseArray = responses.devils_advocate;
    const randomResponse = responseArray[Math.floor(Math.random() * responseArray.length)];
    
    return { text: randomResponse };
  }

  private analyzeGrammarIssues(text: string): GrammarCheckResult['issues'] {
    const issues: GrammarCheckResult['issues'] = [];
    
    // Simulate grammar analysis
    const sentences = text.split('.');
    sentences.forEach((sentence, index) => {
      if (sentence.trim().length < 10) return;
      
      // Mock common grammar issues
      if (sentence.toLowerCase().includes('their is')) {
        issues.push({
          type: 'grammar',
          message: 'Incorrect word usage',
          suggestion: 'Use "there is" instead of "their is"',
          position: { start: text.indexOf('their is'), end: text.indexOf('their is') + 8, line: index + 1 }
        });
      }
      
      if (sentence.includes(',') && sentence.split(',').length > 3) {
        issues.push({
          type: 'style',
          message: 'Too many commas in sentence',
          suggestion: 'Consider breaking this into multiple sentences',
          position: { start: text.indexOf(sentence), end: text.indexOf(sentence) + sentence.length, line: index + 1 }
        });
      }
    });
    
    return issues;
  }

  private calculateGrammarScore(text: string, issues: GrammarCheckResult['issues']): number {
    const baseScore = 100;
    const penaltyPerIssue = 5;
    return Math.max(0, baseScore - (issues.length * penaltyPerIssue));
  }

  private generateCorrectedText(text: string, issues: GrammarCheckResult['issues']): string {
    let corrected = text;
    
    // Apply corrections based on issues
    issues.forEach(issue => {
      if (issue.type === 'grammar' && issue.message === 'Incorrect word usage') {
        corrected = corrected.replace(/their is/g, 'there is');
      }
    });
    
    return corrected;
  }

  private findPotentialSources(text: string): PlagiarismResult['sources'] {
    // Simulate finding similar sources
    const keywords = this.extractKeywords(text);
    const mockSources: PlagiarismResult['sources'] = [];
    
    if (keywords.includes('climate change')) {
      mockSources.push({
        url: 'https://example.com/climate-research',
        title: 'Climate Change: A Comprehensive Study',
        similarity: 12,
        matchedText: 'Climate change is one of the most pressing issues'
      });
    }
    
    if (keywords.includes('artificial intelligence')) {
      mockSources.push({
        url: 'https://example.com/ai-research',
        title: 'The Future of Artificial Intelligence',
        similarity: 8,
        matchedText: 'Artificial intelligence has transformed various industries'
      });
    }
    
    return mockSources;
  }

  private calculateSimilarityScore(text: string, sources: PlagiarismResult['sources']): number {
    if (sources.length === 0) return 0;
    
    const totalSimilarity = sources.reduce((sum, source) => sum + source.similarity, 0);
    return Math.min(100, totalSimilarity / sources.length);
  }

  private generateCitationSuggestions(topic: string, content: string): CitationSuggestion[] {
    const suggestions: CitationSuggestion[] = [];
    const keywords = this.extractKeywords(content);
    
    // Mock academic database suggestions
    if (keywords.includes('artificial intelligence') || keywords.includes('ai')) {
      suggestions.push({
        type: 'academic',
        title: 'Artificial Intelligence: A Modern Approach',
        authors: ['Stuart Russell', 'Peter Norvig'],
        year: 2021,
        relevance: 95,
        description: 'Comprehensive textbook on AI theory and practice',
        url: 'https://example.com/ai-textbook'
      });
    }
    
    if (keywords.includes('climate') || keywords.includes('environment')) {
      suggestions.push({
        type: 'journal',
        title: 'Climate Change: Evidence and Causes',
        authors: ['IPCC'],
        year: 2023,
        relevance: 88,
        description: 'Latest IPCC report on climate change evidence',
        url: 'https://example.com/ipcc-report'
      });
    }
    
    return suggestions.sort((a, b) => b.relevance - a.relevance).slice(0, 5);
  }

  private extractKeywords(text: string): string[] {
    // Simple keyword extraction
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    
    return words
      .filter(word => word.length > 3 && !commonWords.includes(word))
      .filter((word, index, array) => array.indexOf(word) === index);
  }
}