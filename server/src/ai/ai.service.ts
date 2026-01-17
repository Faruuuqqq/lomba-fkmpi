import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { AiAnalyzeDto, GenerateMapDto, EthicsCheckDto } from './ai.dto';

@Injectable()
export class AiService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) { }

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
      throw new Error('AI is locked. Write at least 50 words to unlock AI assistance.');
    }

    const systemPrompt = `You are MITRA, a Socratic Tutor for academic writing. Your goal is to sharpen the student's logic.

Rules:
1. DO NOT write the essay for them.
2. DO NOT provide direct answers to factual questions. Always guide them to think critically.
3. DO NOT rewrite their text. Only ask clarifying questions or critique their logic.
4. Identify if there are logical fallacies (Strawman, Ad Hominem, Circular Reasoning, etc.).
5. Answer with a question or a critique that forces the student to rethink.
6. Keep your response under 3 sentences.
7. Be supportive but critical in a constructive way.`;

    const userPrompt = `Current essay content:\n\n${dto.currentText}\n\nStudent's question: ${dto.userQuery}`;

    let aiResponse = '';

    const geminiKey = process.env.GEMINI_API_KEY;
    const zaiKey = process.env.ZAI_API_KEY;

    // Try Gemini First (using 1.5-flash for reliability and free tier)
    if (geminiKey && geminiKey !== 'your-gemini-api-key-here') {
      try {
        const geminiResponse = await firstValueFrom(
          this.httpService.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
            {
              contents: [{ role: 'user', parts: [{ text: systemPrompt + "\n\n" + userPrompt }] }],
              generationConfig: { maxOutputTokens: 200, temperature: 0.7 }
            },
            { timeout: 15000 }
          )
        );
        aiResponse = geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text;
      } catch (e) {
        console.error('Gemini failed, trying ZAI...', e.message);
      }
    }

    // Try ZAI secondary
    if (!aiResponse && zaiKey) {
      try {
        const zAiResponse = await firstValueFrom(
          this.httpService.post(
            'https://api.z.ai/api/paas/v4/chat/completions',
            {
              model: 'glm-4-plus',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
              ],
              max_tokens: 200,
              temperature: 0.7,
            },
            {
              headers: {
                'Authorization': `Bearer ${zaiKey}`,
                'Content-Type': 'application/json',
              },
              timeout: 15000,
            }
          )
        );
        aiResponse = zAiResponse.data.choices?.[0]?.message?.content;
      } catch (e) {
        console.error('ZAI failed...', e.message);
      }
    }

    // FINAL FALLBACK: Smart Socratic Mock
    if (!aiResponse) {
      console.log('API failure or insufficient balance. Triggering Socratic Lite Mode.');
      aiResponse = this.getSmartSocraticResponse(dto.userQuery, dto.currentText);
    }

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

  private getSmartSocraticResponse(query: string, text: string): string {
    const q = query.toLowerCase();

    if (q.includes('bias') || q.includes('adil') || q.includes('objektif')) {
      return "Menarik sekali. Menurut Anda, apakah data yang Anda gunakan sudah mencakup semua sudut pandang, atau masih ada kelompok yang belum terwakili dalam argumen ini?";
    }
    if (q.includes('struktur') || q.includes('alir') || q.includes('susun')) {
      return "Mari kita lihat alur pikir Anda. Jika premis kedua Anda dihapus, apakah kesimpulan utama Anda masih tetap berdiri? Mengapa demikian?";
    }
    if (q.includes('bukti') || q.includes('data') || q.includes('fakta')) {
      return "Anda menyebutkan bukti penting di sini. Sejauh mana bukti tersebut secara langsung mendukung klaim utama Anda, dan apakah ada interpretasi lain dari data tersebut?";
    }
    if (q.includes('saran') || q.includes('bagaimana') || q.includes('apa')) {
      return "Daripada saya memberi tahu caranya, coba renungkan: jika seseorang ingin menyanggah argumen terkuat Anda sekarang, bagian mana yang akan mereka serang pertama kali?";
    }

    // Default high-quality fallbacks
    const defaults = [
      "Itu pertanyaan yang bagus. Jika Anda memposisikan diri sebagai lawan bicara, apa asumsi tersembunyi yang mungkin mereka temukan dalam paragraf ini?",
      "Mari kita bedah lebih dalam. Bagaimana jika konteks situasi ini diubah 180 derajat, apakah prinsip yang Anda pegang di sini masih relevan?",
      "Coba perhatikan kaitan antara dua poin terakhir Anda. Apakah hubungannya sudah cukup kuat, atau ada langkah logika yang terlewat?"
    ];
    return defaults[Math.floor(Math.random() * defaults.length)];
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

  async generateMap(projectId: string, userId: string, dto: GenerateMapDto) {
    const startTime = Date.now();

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    if (project.userId !== userId) {
      throw new Error('You do not have access to this project');
    }

    const systemPrompt = `Analyze the user's argument structure. Identify Premises, Evidence, and Conclusions. Output a JSON object representing a graph node-edge structure where nodes are statements and edges are logical connections (e.g., 'supports', 'contradicts'). Also identify any logical fallacies.

Return ONLY valid JSON in this exact format:
{
  "nodes": [
    { "id": "1", "type": "premise", "label": "Statement text", "position": { "x": 0, "y": 0 } },
    { "id": "2", "type": "evidence", "label": "Evidence text", "position": { "x": 250, "y": 0 } },
    { "id": "3", "type": "conclusion", "label": "Conclusion text", "position": { "x": 500, "y": 0 } }
  ],
  "edges": [
    { "id": "e1", "source": "1", "target": "3", "label": "supports", "hasFallacy": false },
    { "id": "e2", "source": "2", "target": "3", "label": "supports", "hasFallacy": false }
  ],
  "analysis": "Brief explanation of the logical structure and any fallacies found."
}`;

    const userPrompt = `Essay content:\n\n${dto.text}`;

    const zAiResponse = await firstValueFrom(
      this.httpService.post(
        'https://api.z.ai/api/paas/v4/chat/completions',
        {
          model: 'glm-4.5',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 1000,
          temperature: 0.3,
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.ZAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      )
    );

    const aiResponse = (zAiResponse as any).data.choices?.[0]?.message?.content || '{}';

    let graphData;
    let analysis = '';

    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : aiResponse;
      const parsed = JSON.parse(jsonStr);
      graphData = { nodes: parsed.nodes || [], edges: parsed.edges || [] };
      analysis = parsed.analysis || '';
    } catch (e) {
      graphData = { nodes: [], edges: [] };
      analysis = 'Failed to generate reasoning map. Please try again.';
    }

    await this.prisma.reasoningLog.create({
      data: {
        projectId,
        graphData,
        analysis,
      },
    });

    // Log analytics
    const duration = Date.now() - startTime;
    await this.prisma.analyticsLog.create({
      data: {
        userId,
        feature: 'reasoning_map',
        duration,
        metadata: {
          projectId,
          nodeCount: graphData.nodes?.length || 0,
          edgeCount: graphData.edges?.length || 0
        }
      }
    }).catch(() => {
      // Don't fail if analytics logging fails
    });

    return {
      graphData,
      analysis,
      timestamp: new Date(),
    };
  }

  async ethicsCheck(projectId: string, userId: string, dto: EthicsCheckDto) {
    const startTime = Date.now();

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    if (project.userId !== userId) {
      throw new Error('You do not have access to this project');
    }

    const systemPrompt = `Scan the text for algorithmic bias, stereotypes, or generalized assumptions lacking evidence. Highlight specific sentences and explain *why* they might be ethically problematic. Do not rewrite them.

Return ONLY valid JSON in this exact format:
{
  "issues": [
    {
      "sentence": "The problematic sentence",
      "type": "bias_type (e.g., stereotype, generalization, unverified claim)",
      "explanation": "Why this is ethically problematic"
    }
  ],
  "summary": "Overall assessment of ethical considerations in the text."
}`;

    const userPrompt = `Essay content:\n\n${dto.text}`;

    const zAiResponse = await firstValueFrom(
      this.httpService.post(
        'https://api.z.ai/api/paas/v4/chat/completions',
        {
          model: 'glm-4.5',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 800,
          temperature: 0.3,
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.ZAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      )
    );

    const aiResponse = (zAiResponse as any).data.choices?.[0]?.message?.content || '{}';

    let issues = [];
    let summary = '';

    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : aiResponse;
      const parsed = JSON.parse(jsonStr);
      issues = parsed.issues || [];
      summary = parsed.summary || '';
    } catch (e) {
      issues = [];
      summary = 'Failed to analyze ethics. Please try again.';
    }

    // Log analytics
    const duration = Date.now() - startTime;
    await this.prisma.analyticsLog.create({
      data: {
        userId,
        feature: 'ethics_check',
        duration,
        metadata: {
          projectId,
          issuesFound: issues.length
        }
      }
    }).catch(() => {
      // Don't fail if analytics logging fails
    });

    return {
      issues,
      summary,
      timestamp: new Date(),
    };
  }

  private async logAnalytics(userId: string, feature: string, duration: number, metadata?: any) {
    try {
      await this.prisma.analyticsLog.create({
        data: {
          userId,
          feature,
          duration,
          metadata: metadata || {}
        }
      });
    } catch (error) {
      // Silently fail analytics logging to not break main functionality
      console.error('Failed to log analytics:', error);
    }
  }
}
