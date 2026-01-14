import { Test, TestingModule } from '@nestjs/testing';
import { MediaService } from '../common/services/media.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { promises as fs } from 'fs';

describe('MediaService', () => {
  let service: MediaService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    mediaFile: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    project: {
      findUnique: jest.fn(),
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MediaService>(MediaService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadFile', () => {
    const mockFile = {
      originalname: 'test.jpg',
      mimetype: 'image/jpeg',
      size: 1024,
      buffer: Buffer.from('test'),
    };

    const mockUser = { id: 'user-1' };
    const mockProject = { id: 'project-1' };

    it('should successfully upload a valid file', async () => {
      const expectedFile = {
        id: 'file-1',
        filename: 'test.jpg',
        originalName: 'test.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
        uploadedAt: new Date(),
      };

      mockPrismaService.mediaFile.create.mockResolvedValue(expectedFile);
      jest.spyOn(fs, 'mkdir').mockResolvedValue(undefined);
      jest.spyOn(fs, 'writeFile').mockResolvedValue(undefined);

      const result = await service.uploadFile(mockFile, mockUser.id, mockProject.id);

      expect(result).toEqual({
        id: expectedFile.id,
        filename: expectedFile.originalName,
        size: expectedFile.size,
        mimeType: expectedFile.mimeType,
        uploadedAt: expectedFile.uploadedAt,
      });

      expect(fs.writeFile).toHaveBeenCalled();
      expect(mockPrismaService.mediaFile.create).toHaveBeenCalledWith({
        data: {
          filename: expect.any(String),
          originalName: mockFile.originalname,
          mimeType: mockFile.mimetype,
          size: mockFile.size,
          path: expect.any(String),
          userId: mockUser.id,
          projectId: mockProject.id,
        },
      });
    });

    it('should throw BadRequestException for invalid file type', async () => {
      const invalidFile = {
        ...mockFile,
        mimetype: 'application/zip',
      };

      await expect(service.uploadFile(invalidFile, mockUser.id))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for oversized file', async () => {
      const oversizedFile = {
        ...mockFile,
        size: 11 * 1024 * 1024, // 11MB
      };

      await expect(service.uploadFile(oversizedFile, mockUser.id))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('getProjectFiles', () => {
    const mockProject = {
      id: 'project-1',
      userId: 'user-1',
    };

    const mockFiles = [
      {
        id: 'file-1',
        filename: 'test1.jpg',
        originalName: 'test1.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
        uploadedAt: new Date(),
      },
    ];

    it('should return files for valid project', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue(mockProject);
      mockPrismaService.mediaFile.findMany.mockResolvedValue(mockFiles);

      const result = await service.getProjectFiles(mockProject.id, mockProject.userId);

      expect(result).toEqual(mockFiles);
      expect(mockPrismaService.project.findUnique).toHaveBeenCalledWith({
        where: { id: mockProject.id },
      });
    });

    it('should throw NotFoundException for non-existent project', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue(null);

      await expect(service.getProjectFiles('invalid-id', 'user-1'))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for unauthorized access', async () => {
      const otherUser = { id: 'user-2' };
      mockPrismaService.project.findUnique.mockResolvedValue(mockProject);

      await expect(service.getProjectFiles(mockProject.id, otherUser.id))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteFile', () => {
    const mockFile = {
      id: 'file-1',
      userId: 'user-1',
      path: '/uploads/test.jpg',
    };

    it('should successfully delete user-owned file', async () => {
      mockPrismaService.mediaFile.findUnique.mockResolvedValue(mockFile);
      mockPrismaService.mediaFile.delete.mockResolvedValue(mockFile);
      jest.spyOn(fs, 'unlink').mockResolvedValue(undefined);

      const result = await service.deleteFile(mockFile.id, mockFile.userId);

      expect(result).toEqual({ message: 'File deleted successfully' });
      expect(fs.unlink).toHaveBeenCalledWith(mockFile.path);
      expect(mockPrismaService.mediaFile.delete).toHaveBeenCalledWith({
        where: { id: mockFile.id },
      });
    });

    it('should throw NotFoundException for non-existent file', async () => {
      mockPrismaService.mediaFile.findUnique.mockResolvedValue(null);

      await expect(service.deleteFile('invalid-id', 'user-1'))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for unauthorized access', async () => {
      const otherUser = { id: 'user-2' };
      mockPrismaService.mediaFile.findUnique.mockResolvedValue(mockFile);

      await expect(service.deleteFile(mockFile.id, otherUser.id))
        .rejects.toThrow(NotFoundException);
    });
  });
});