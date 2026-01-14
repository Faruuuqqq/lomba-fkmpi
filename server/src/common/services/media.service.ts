import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { promises as fs } from 'fs';
import { join } from 'path';

@Injectable()
export class MediaService {
  constructor(private prisma: PrismaService) {}

  async uploadFile(file: Express.Multer.File, userId: string, projectId?: string) {
    // Validate file type
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png', 
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/csv'
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('File type not allowed');
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.originalname.split('.').pop();
    const filename = `${timestamp}_${randomString}.${extension}`;

    // Ensure uploads directory exists
    const uploadsDir = join(process.cwd(), 'uploads');
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }

    // Save file to disk
    const filePath = join(uploadsDir, filename);
    await fs.writeFile(filePath, file.buffer);

    // Save file info to database
    const mediaFile = await this.prisma.mediaFile.create({
      data: {
        filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: filePath,
        userId,
        projectId
      }
    });

    return {
      id: mediaFile.id,
      filename: mediaFile.originalName,
      size: mediaFile.size,
      mimeType: mediaFile.mimeType,
      uploadedAt: mediaFile.uploadedAt
    };
  }

  async getProjectFiles(projectId: string, userId: string) {
    // Verify user owns the project
    const project = await this.prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project || project.userId !== userId) {
      throw new NotFoundException('Project not found or access denied');
    }

    return this.prisma.mediaFile.findMany({
      where: { projectId },
      select: {
        id: true,
        filename: true,
        originalName: true,
        mimeType: true,
        size: true,
        uploadedAt: true
      },
      orderBy: { uploadedAt: 'desc' }
    });
  }

  async getUserFiles(userId: string) {
    return this.prisma.mediaFile.findMany({
      where: { userId },
      select: {
        id: true,
        filename: true,
        originalName: true,
        mimeType: true,
        size: true,
        uploadedAt: true,
        project: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: { uploadedAt: 'desc' }
    });
  }

  async deleteFile(fileId: string, userId: string) {
    const file = await this.prisma.mediaFile.findUnique({
      where: { id: fileId }
    });

    if (!file || file.userId !== userId) {
      throw new NotFoundException('File not found or access denied');
    }

    // Delete file from disk
    try {
      await fs.unlink(file.path);
    } catch (error) {
      console.error('Failed to delete file from disk:', error);
    }

    // Delete from database
    await this.prisma.mediaFile.delete({
      where: { id: fileId }
    });

    return { message: 'File deleted successfully' };
  }

  async getFileUrl(fileId: string, userId: string) {
    const file = await this.prisma.mediaFile.findUnique({
      where: { id: fileId }
    });

    if (!file || file.userId !== userId) {
      throw new NotFoundException('File not found or access denied');
    }

    return {
      id: file.id,
      filename: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      path: file.path
    };
  }
}