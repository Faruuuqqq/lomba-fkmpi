import { 
  Controller, 
  Post, 
  Get, 
  Delete, 
  Param, 
  UseGuards, 
  Request,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  NotFoundException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MediaService } from '../common/services/media.service';
import { User } from '../auth/decorators/user.decorator';

@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (req, file, callback) => {
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

      if (allowedMimeTypes.includes(file.mimetype)) {
        callback(null, true);
      } else {
        callback(new BadRequestException('File type not allowed'), false);
      }
    }
  }))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @User() user: any,
    @Request() req: any
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const projectId = req.body.projectId;
    
    return this.mediaService.uploadFile(file, user.id, projectId);
  }

  @Get('project/:projectId')
  async getProjectFiles(
    @Param('projectId') projectId: string,
    @User() user: any
  ) {
    return this.mediaService.getProjectFiles(projectId, user.id);
  }

  @Get('user')
  async getUserFiles(@User() user: any) {
    return this.mediaService.getUserFiles(user.id);
  }

  @Get(':fileId')
  async getFileUrl(
    @Param('fileId') fileId: string,
    @User() user: any
  ) {
    return this.mediaService.getFileUrl(fileId, user.id);
  }

  @Delete(':fileId')
  async deleteFile(
    @Param('fileId') fileId: string,
    @User() user: any
  ) {
    return this.mediaService.deleteFile(fileId, user.id);
  }
}