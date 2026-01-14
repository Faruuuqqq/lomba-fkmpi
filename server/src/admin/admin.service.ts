import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { hash } from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getUsers(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;
    
    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { name: { contains: search, mode: 'insensitive' as const } }
          ]
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              projects: true,
              mediaFiles: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.user.count({ where })
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async toggleUserStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'ADMIN') {
      throw new BadRequestException('Cannot change admin user status');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true
      }
    });

    return updatedUser;
  }

  async updateUserRole(userId: string, role: 'USER' | 'ADMIN') {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent user from removing their own admin role
    if (user.id === userId && role !== 'ADMIN') {
      throw new BadRequestException('Cannot remove your own admin role');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true
      }
    });

    return updatedUser;
  }

  async getProjects(page = 1, limit = 10, status?: string, userId?: string) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (userId) {
      where.userId = userId;
    }

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          wordCount: true,
          isAiUnlocked: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          },
          _count: {
            select: {
              aiChats: true,
              snapshots: true,
              mediaFiles: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.project.count({ where })
    ]);

    return {
      projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getProjectAnalytics() {
    const [
      totalProjects,
      totalUsers,
      activeProjects,
      completedProjects,
      avgWordCount,
      recentActivity
    ] = await Promise.all([
      this.prisma.project.count(),
      this.prisma.user.count(),
      this.prisma.project.count({ where: { status: 'DRAFT' } }),
      this.prisma.project.count({ where: { status: 'COMPLETED' } }),
      this.prisma.project.aggregate({
        _avg: { wordCount: true }
      }),
      this.prisma.analyticsLog.findMany({
        take: 10,
        orderBy: { timestamp: 'desc' },
        select: {
          id: true,
          feature: true,
          duration: true,
          timestamp: true,
          metadata: true
        }
      })
    ]);

    return {
      overview: {
        totalProjects,
        totalUsers,
        activeProjects,
        completedProjects,
        avgWordCount: Math.round(avgWordCount._avg.wordCount || 0)
      },
      recentActivity
    };
  }

  async getSystemAnalytics() {
    const [
      usageByFeature,
      responseTimeStats,
      dailyUsage,
      errorRates
    ] = await Promise.all([
      this.prisma.analyticsLog.groupBy({
        by: ['feature'],
        _count: { feature: true },
        _avg: { duration: true }
      }),
      this.prisma.analyticsLog.aggregate({
        _min: { duration: true },
        _max: { duration: true },
        _avg: { duration: true }
      }),
      this.prisma.$queryRaw`
        SELECT 
          DATE(timestamp) as date,
          COUNT(*) as count
        FROM analytics_logs
        WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY DATE(timestamp)
        ORDER BY date DESC
      `,
      this.prisma.analyticsLog.groupBy({
        by: ['feature'],
        where: {
          duration: { gt: 5000 } // Assuming errors are operations taking > 5s
        },
        _count: { feature: true }
      })
    ]);

    return {
      usageByFeature,
      performance: responseTimeStats,
      dailyUsage,
      errorRates
    };
  }

  async getSystemConfiguration() {
    // This would typically come from a configuration table
    // For now, return default configuration
    return {
      aiConfig: {
        maxTokens: 2000,
        temperature: 0.7,
        model: 'GLM-4.7'
      },
      uploadConfig: {
        maxFileSize: '10MB',
        allowedTypes: [
          'image/jpeg',
          'image/png',
          'image/gif',
          'application/pdf',
          'application/msword',
          'text/plain'
        ]
      },
      securityConfig: {
        rateLimitWindow: 300, // 5 minutes
        rateLimitMax: 5,
        lockoutDuration: 900 // 15 minutes
      }
    };
  }
}