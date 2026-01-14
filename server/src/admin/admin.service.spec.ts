import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('AdminService', () => {
  let service: AdminService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    project: {
      findMany: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    analyticsLog: {
      findMany: jest.fn(),
      groupBy: jest.fn(),
      aggregate: jest.fn(),
    },
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    const mockUsers = [
      {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { projects: 5, mediaFiles: 10 },
      },
    ];

    it('should return paginated users', async () => {
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);
      mockPrismaService.user.count.mockResolvedValue(1);

      const result = await service.getUsers(1, 10);

      expect(result).toEqual({
        users: mockUsers,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      });

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
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
              mediaFiles: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should search users by email or name', async () => {
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);
      mockPrismaService.user.count.mockResolvedValue(1);

      await service.getUsers(1, 10, 'test');

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: { contains: 'test', mode: 'insensitive' } },
            { name: { contains: 'test', mode: 'insensitive' } },
          ],
        },
        skip: 0,
        take: 10,
        select: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('toggleUserStatus', () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      role: 'USER',
      isActive: true,
    };

    it('should toggle user status successfully', async () => {
      const updatedUser = { ...mockUser, isActive: false };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.toggleUserStatus('user-1');

      expect(result).toEqual(updatedUser);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { isActive: false },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
        },
      });
    });

    it('should throw NotFoundException for non-existent user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.toggleUserStatus('invalid-id'))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for admin users', async () => {
      const adminUser = { ...mockUser, role: 'ADMIN' };
      mockPrismaService.user.findUnique.mockResolvedValue(adminUser);

      await expect(service.toggleUserStatus('admin-id'))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('updateUserRole', () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      role: 'USER',
      isActive: true,
    };

    it('should update user role successfully', async () => {
      const updatedUser = { ...mockUser, role: 'ADMIN' };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateUserRole('user-1', 'ADMIN');

      expect(result).toEqual(updatedUser);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { role: 'ADMIN' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
        },
      });
    });

    it('should throw NotFoundException for non-existent user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.updateUserRole('invalid-id', 'ADMIN'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('getProjectAnalytics', () => {
    it('should return project analytics', async () => {
      const mockAnalytics = {
        totalProjects: 100,
        totalUsers: 50,
        activeProjects: 60,
        completedProjects: 40,
        avgWordCount: { _avg: { wordCount: 1500 } },
        recentActivity: [
          {
            id: 'activity-1',
            feature: 'ai_chat',
            duration: 1200,
            timestamp: new Date(),
            metadata: {},
          },
        ],
      };

      mockPrismaService.project.count.mockResolvedValueOnce(mockAnalytics.totalProjects);
      mockPrismaService.user.count.mockResolvedValue(mockAnalytics.totalUsers);
      mockPrismaService.project.count
        .mockResolvedValueOnce(mockAnalytics.activeProjects)
        .mockResolvedValueOnce(mockAnalytics.completedProjects);
      mockPrismaService.project.aggregate.mockResolvedValue(mockAnalytics.avgWordCount);
      mockPrismaService.analyticsLog.findMany.mockResolvedValue(mockAnalytics.recentActivity);

      const result = await service.getProjectAnalytics();

      expect(result).toEqual({
        overview: {
          totalProjects: 100,
          totalUsers: 50,
          activeProjects: 60,
          completedProjects: 40,
          avgWordCount: 1500,
        },
        recentActivity: mockAnalytics.recentActivity,
      });
    });
  });

  describe('getSystemConfiguration', () => {
    it('should return system configuration', async () => {
      const result = await service.getSystemConfiguration();

      expect(result).toEqual({
        aiConfig: {
          maxTokens: 2000,
          temperature: 0.7,
          model: 'GLM-4.7',
        },
        uploadConfig: {
          maxFileSize: '10MB',
          allowedTypes: expect.arrayContaining([
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/pdf',
            'application/msword',
            'text/plain',
          ]),
        },
        securityConfig: {
          rateLimitWindow: 300,
          rateLimitMax: 5,
          lockoutDuration: 900,
        },
      });
    });
  });
});