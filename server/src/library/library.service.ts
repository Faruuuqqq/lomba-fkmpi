import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LibraryService {
    constructor(private prisma: PrismaService) { }

    async savePaper(userId: string, data: any) {
        // Check if duplicate
        const existing = await this.prisma.savedPaper.findUnique({
            where: {
                userId_paperId: {
                    userId,
                    paperId: data.id || data.paperId
                }
            }
        });

        if (existing) {
            return existing;
        }

        return this.prisma.savedPaper.create({
            data: {
                userId,
                paperId: data.id || data.paperId,
                title: data.title,
                authors: data.authors || [],
                year: data.year || new Date().getFullYear(),
                abstract: data.abstract || data.description || '',
                url: data.url || '',
                type: data.type || 'journal',
                relevance: data.relevance || 0,
                projectId: data.projectId,
            }
        });
    }

    async getSavedPapers(userId: string, projectId?: string) {
        const where: any = { userId };

        // Optional: filter by project or show all user's papers
        // if (projectId) where.projectId = projectId;

        return this.prisma.savedPaper.findMany({
            where,
            orderBy: { savedAt: 'desc' }
        });
    }

    async removePaper(userId: string, paperId: string) {
        // Delete by compound key or ID. 
        // Since we get the ID usually, we might need to find first.
        // For simplicity, assuming paperId is the internal UUID or openalex ID
        // Try delete by internal ID first
        try {
            return await this.prisma.savedPaper.delete({
                where: { id: paperId } // Ensure only owner can delete
            });
        } catch {
            // Find by userId + paperId (OpenAlex ID)
            return await this.prisma.savedPaper.deleteMany({
                where: {
                    userId,
                    paperId
                }
            });
        }
    }
}
