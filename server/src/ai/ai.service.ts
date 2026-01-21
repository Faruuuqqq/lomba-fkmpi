import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { AiAnalyzeDto, GenerateMapDto, EthicsCheckDto } from './ai.dto';

// Define types for missing database models
interface AiInteraction {
  id: string;
  userPrompt: string;
  aiResponse: string;
  timestamp: Date;
  projectId: string;
}

interface ReasoningLog {
  id: string;
  projectId: string;
  graphData: any;
  analysis: string;
  timestamp: Date;
}

interface AnalyticsLog {
  id: string;
  userId?: string;
  feature: string;
  duration: number;
  timestamp: Date;
  metadata?: any;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) { }

  async analyze(projectId: string, userId: string, dto: AiAnalyzeDto) {
    // Validate input parameters
    if (!projectId || !userId) {
      throw new Error('Missing required parameters: projectId and userId');
    }

    if (!dto.userQuery || dto.userQuery.trim().length === 0) {
      throw new Error('User query cannot be empty');
    }

    if (dto.userQuery.length > 1000) {
      throw new Error('User query too long (max 1000 characters)');
    }

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.userId !== userId) {
      throw new NotFoundException('Project not found or access denied');
    }

    if (!project.isAiUnlocked) {
      throw new Error('AI is locked. Write at least 150 words to unlock AI assistance.');
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

    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    const zaiKey = process.env.ZAI_API_KEY;

    // Try Groq First (Primary - Fast and Free)
    if (groqKey && groqKey !== 'your-groq-api-key-here') {
      try {
        const groqResponse = await firstValueFrom(
          this.httpService.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
              model: 'llama-3.3-70b-versatile',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
              ],
              max_tokens: 200,
              temperature: 0.7,
            },
            {
              headers: {
                'Authorization': `Bearer ${groqKey}`,
                'Content-Type': 'application/json',
              },
              timeout: 15000,
            }
          )
        );
        aiResponse = groqResponse.data.choices?.[0]?.message?.content;
        if (aiResponse && aiResponse.trim()) {
        this.logger.log('✅ Groq API successful - Primary');
       } catch (e: any) {
        this.logger.error('Groq API call failed:', {
          message: e.message,
          status: e.response?.status,
          data: e.response?.data,
          config: e.config
        });
        
        if (e.response?.data?.error?.code === 'invalid_api_key') {
          this.logger.error('❌ Groq API Key invalid. Get your free key at: https://console.groq.com/keys');
        } else if (e.response?.status === 429) {
          this.logger.warn('⚠️ Groq rate limit exceeded, trying Gemini...');
        } else {
          this.logger.error('❌ Groq failed, trying Gemini...', e.response?.data?.error || e.message);
        }
      }
    }

    // Try Gemini as Secondary
    if (!aiResponse && geminiKey && geminiKey !== 'your-gemini-api-key-here') {
      try {
        const geminiResponse = await firstValueFrom(
          this.httpService.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
            {
              contents: [{ role: 'user', parts: [{ text: systemPrompt + "\n\n" + userPrompt }] }],
              generationConfig: { maxOutputTokens: 200, temperature: 0.7 }
            },
            { timeout: 15000 }
          )
        );
        aiResponse = geminiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (aiResponse && aiResponse.trim()) {
        this.logger.log('✅ Gemini API successful - Secondary');
      } catch (e: any) {
        this.logger.error('❌ Gemini failed, trying ZAI...', e.response?.data?.error?.message || e.message);
      }
    }

    // Try ZAI as Tertiary
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
        if (aiResponse && aiResponse.trim()) {
          this.logger.log('✅ ZAI API successful - Tertiary');
        }
      } catch (e: any) {
        console.error('❌ ZAI failed, using fallback...', e.response?.data?.error || e.message);
      }
    }
      } catch (e) {
        this.logger.error('Gemini failed, trying ZAI...', e.response?.data?.error?.message || e.message);
      }
    }

    // FINAL FALLBACK: Smart Socratic Mock
    if (!aiResponse) {
      this.logger.warn('API failure or insufficient balance. Triggering Socratic Lite Mode.');
      aiResponse = this.getSmartSocraticResponse(dto.userQuery, dto.currentText);
    }
      try {
        const groqResponse = await firstValueFrom(
          this.httpService.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
              model: 'llama-3.3-70b-versatile',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
              ],
              max_tokens: 200,
              temperature: 0.7,
            },
            {
              headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json',
              },
              timeout: 15000,
            }
          )
        );
        aiResponse = groqResponse.data.choices?.[0]?.message?.content;
        if (aiResponse && aiResponse.trim()) {
          console.log('✅ Groq API successful');
        }
      } catch (e: any) {
        if (e.response?.data?.error?.code === 'invalid_api_key') {
          console.error('❌ Groq API Key invalid. Get your free key at: https://console.groq.com/keys');
        } else {
          console.error('❌ Groq failed:', e.response?.data || e.message);
        }
      }
    }

    // Try ZAI tertiary
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
        if (aiResponse && aiResponse.trim()) {
          console.log('ZAI API successful');
        }
      } catch (e) {
          this.logger.error('ZAI failed...', e.response?.data || e.message);
      }
    }

    // FINAL FALLBACK: Smart Socratic Mock
    if (!aiResponse) {
      this.logger.warn('API failure or insufficient balance. Triggering Socratic Lite Mode.');
      aiResponse = this.getSmartSocraticResponse(dto.userQuery, dto.currentText);
    }

    try {
      await this.prisma.aiInteraction.create({
        data: {
          userPrompt: dto.userQuery,
          aiResponse,
          projectId,
        },
      });
    } catch (dbError) {
      this.logger.error('Failed to save AI interaction:', dbError);
      // Continue without failing the main functionality
    }

    // Mask API keys in logs for security
    const maskedGroqKey = groqKey ? `${groqKey.substring(0, 8)}...${groqKey.substring(groqKey.length - 4)}` : 'not set';
    this.logger.log(`API keys status - Groq: ${maskedGroqKey}, Gemini: ${geminiKey ? 'set' : 'not set'}, ZAI: ${zaiKey ? 'set' : 'not set'}`);

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
      throw new NotFoundException('Project not found');
    }

    if (project.userId !== userId) {
      throw new ForbiddenException('You do not have access to this project');
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
      throw new NotFoundException('Project not found');
    }

    if (project.userId !== userId) {
      throw new ForbiddenException('You do not have access to this project');
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

    let aiResponse = '{}';

    try {
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
            timeout: 20000,
          }
        )
      );

      const response = (zAiResponse as any).data.choices?.[0]?.message?.content;
      if (response && response.trim()) {
        aiResponse = response;
        console.log('Reasoning map API successful');
      }
    } catch (error) {
      console.error('Reasoning map API failed:', error.response?.data || error.message);
    }

    let graphData;
    let analysis = '';

    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : aiResponse;
      const parsed = JSON.parse(jsonStr);
      graphData = { nodes: parsed.nodes || [], edges: parsed.edges || [] };
      analysis = parsed.analysis || '';
    } catch (e) {
      console.error('Logic map generation failed, using fallback:', e);
      // Fallback: Generate a simple static map structure for demo/robustness
      graphData = {
        nodes: [
          { id: "1", type: "premise", label: "Core Argument", position: { x: 0, y: 50 } },
          { id: "2", type: "evidence", label: "Supporting Point 1", position: { x: 200, y: 0 } },
          { id: "3", type: "evidence", label: "Supporting Point 2", position: { x: 200, y: 100 } },
          { id: "4", type: "conclusion", label: "Main Conclusion", position: { x: 400, y: 50 } }
        ],
        edges: [
          { id: "e1", source: "1", "target": "4", label: "leads to", hasFallacy: false },
          { id: "e2", source: "2", "target": "1", label: "supports", hasFallacy: false },
          { id: "e3", source: "3", "target": "1", label: "supports", hasFallacy: false }
        ]
      };
      analysis = 'Visualization generated based on structural analysis (Fallback Mode). Please verify API Connectivity for full depth.';
    }

    try {
      await this.prisma.reasoningLog.create({
        data: {
          projectId,
          graphData,
          analysis,
        },
      });
    } catch (dbError) {
      console.error('Failed to save reasoning log:', dbError);
    }

    // Log analytics
    const duration = Date.now() - startTime;
    try {
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
      });
    } catch (dbError) {
      console.error('Failed to log analytics:', dbError);
      // Don't fail if analytics logging fails
    }

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
      throw new NotFoundException('Project not found');
    }

    if (project.userId !== userId) {
      throw new ForbiddenException('You do not have access to this project');
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

    let aiResponse = '{}';

    try {
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
            timeout: 20000,
          }
        )
      );

      const response = (zAiResponse as any).data.choices?.[0]?.message?.content;
      if (response && response.trim()) {
        aiResponse = response;
        console.log('Ethics check API successful');
      }
    } catch (error) {
      console.error('Ethics check API failed:', error.response?.data || error.message);
    }

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
    try {
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
      });
    } catch (dbError) {
      console.error('Failed to log analytics:', dbError);
      // Don't fail if analytics logging fails
    }

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
