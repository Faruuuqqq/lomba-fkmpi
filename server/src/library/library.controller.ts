import { Controller, Get, Post, Delete, Body, Param, UseGuards, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { LibraryService } from './library.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SavePaperDto } from './library.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Library')
@ApiBearerAuth()
@Controller('library')
@UseGuards(JwtAuthGuard)
export class LibraryController {
    constructor(private libraryService: LibraryService) { }

    @Post('save')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Save a paper to library' })
    @ApiResponse({ status: 200, description: 'Paper saved successfully' })
    @ApiBody({ type: SavePaperDto })
    async savePaper(@Body() dto: SavePaperDto, @CurrentUser() user: any) {
        return this.libraryService.savePaper(user.id, dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get saved papers' })
    @ApiQuery({ name: 'projectId', required: false })
    @ApiResponse({ status: 200, description: 'Papers retrieved successfully' })
    async getPapers(@CurrentUser() user: any, @Query('projectId') projectId?: string) {
        return this.libraryService.getSavedPapers(user.id, projectId);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Remove a paper from library' })
    @ApiResponse({ status: 204, description: 'Paper removed successfully' })
    async removePaper(@Param('id') id: string, @CurrentUser() user: any) {
        return this.libraryService.removePaper(user.id, id);
    }
}
