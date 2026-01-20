import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto, SaveProjectDto, FinishProjectDto } from './projects.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) { }

  async create(userId: string, dto: CreateProjectDto) {
    const project = await this.prisma.project.create({
      data: {
        title: dto.title,
        content: '',
        wordCount: 0,
        isAiUnlocked: false,
        userId,
      },
    });

    return project;
  }

  async findAll(userId: string) {
    return this.prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        aiChats: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.userId !== userId) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return project;
  }

  async save(id: string, userId: string, dto: SaveProjectDto) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.userId !== userId) {
      throw new ForbiddenException('You do not have access to this project');
    }

    const wordCount = this.countWords(dto.content);
    const isAiUnlocked = wordCount >= 150;

    const updatedProject = await this.prisma.project.update({
      where: { id },
      data: {
        content: dto.content,
        wordCount,
        isAiUnlocked,
      },
    });

    await this.createSnapshotIfNeeded(project, dto.content, wordCount);

    return {
      success: true,
      isAiUnlocked,
      wordCount,
      wordsToUnlock: Math.max(0, 150 - wordCount),
      project: updatedProject,
    };
  }

  async finish(id: string, userId: string, dto: FinishProjectDto) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.userId !== userId) {
      throw new ForbiddenException('You do not have access to this project');
    }

    await this.createSnapshot(project, project.content, 'FINAL_VERSION');

    const updatedProject = await this.prisma.project.update({
      where: { id },
      data: {
        status: 'FINAL',
        reflection: dto.reflection,
      },
    });

    return updatedProject;
  }

  async getSnapshots(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.userId !== userId) {
      throw new ForbiddenException('You do not have access to this project');
    }

    return this.prisma.projectSnapshot.findMany({
      where: { projectId },
      orderBy: { timestamp: 'desc' },
    });
  }

  async delete(id: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.userId !== userId) {
      throw new ForbiddenException('You do not have access to this project');
    }

    await this.prisma.project.delete({
      where: { id },
    });

    return { success: true };
  }

  private async createSnapshotIfNeeded(
    project: any,
    content: string,
    wordCount: number,
  ) {
    const latestSnapshot = await this.prisma.projectSnapshot.findFirst({
      where: { projectId: project.id },
      orderBy: { timestamp: 'desc' },
    });

    const shouldCreateSnapshot =
      !latestSnapshot ||
      (latestSnapshot.timestamp && new Date().getTime() - latestSnapshot.timestamp.getTime() > 600000) ||
      wordCount === 150 && project.wordCount < 150;

    if (shouldCreateSnapshot) {
      await this.createSnapshot(project, content, wordCount >= 150 ? 'POST_AI_FEEDBACK' : 'INITIAL_DRAFT');
    }
  }

  private async createSnapshot(project: any, content: string, stage: string) {
    await this.prisma.projectSnapshot.create({
      data: {
        content,
        stage,
        projectId: project.id,
      },
    });
  }

  private countWords(text: string): number {
    const trimmedText = text.trim();
    if (trimmedText === '') {
      return 0;
    }
    return trimmedText.split(/\s+/).length;
  }
}
