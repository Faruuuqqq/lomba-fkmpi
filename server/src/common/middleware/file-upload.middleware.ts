import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FileUploadMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if (req.headers['content-type']?.startsWith('multipart/form-data')) {
      const contentLength = req.headers['content-length'];
      
      // Check file size (max 10MB)
      if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
        throw new BadRequestException('File size exceeds 10MB limit');
      }

      // Validate file types
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

      // This will be handled by multer middleware
      req['allowedMimeTypes'] = allowedMimeTypes;
    }
    
    next();
  }
}