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
  NotFoundException,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MediaService } from '../common/services/media.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';

@ApiTags('Media')
@ApiBearerAuth()
@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private mediaService: MediaService) { }

  @Post('upload')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        projectId: {
          type: 'string',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'File uploaded successfully' })
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
    @CurrentUser() user: any,
    @Request() req: any
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const projectId = req.body.projectId;

    return this.mediaService.uploadFile(file, user.id, projectId);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get project files' })
  @ApiResponse({ status: 200, description: 'Project files retrieved' })
  async getProjectFiles(
    @Param('projectId') projectId: string,
    @CurrentUser() user: any
  ) {
    return this.mediaService.getProjectFiles(projectId, user.id);
  }

  @Get('user')
  @ApiOperation({ summary: 'Get user files' })
  @ApiResponse({ status: 200, description: 'User files retrieved' })
  async getUserFiles(@CurrentUser() user: any) {
    return this.mediaService.getUserFiles(user.id);
  }

  @Get(':fileId')
  @ApiOperation({ summary: 'Get file URL' })
  @ApiResponse({ status: 200, description: 'File URL retrieved' })
  async getFileUrl(
    @Param('fileId') fileId: string,
    @CurrentUser() user: any
  ) {
    return this.mediaService.getFileUrl(fileId, user.id);
  }

  @Delete(':fileId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a file' })
  @ApiResponse({ status: 204, description: 'File deleted successfully' })
  async deleteFile(
    @Param('fileId') fileId: string,
    @CurrentUser() user: any
  ) {
    return this.mediaService.deleteFile(fileId, user.id);
  }
}