import { Controller, Get, Post, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { LibraryService } from './library.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('library')
@UseGuards(JwtAuthGuard)
export class LibraryController {
    constructor(private libraryService: LibraryService) { }

    @Post('save')
    async savePaper(@Body() dto: any, @CurrentUser() user: any) {
        return this.libraryService.savePaper(user.id, dto);
    }

    @Get()
    async getPapers(@CurrentUser() user: any, @Query('projectId') projectId?: string) {
        return this.libraryService.getSavedPapers(user.id, projectId);
    }

    @Delete(':id')
    async removePaper(@Param('id') id: string, @CurrentUser() user: any) {
        return this.libraryService.removePaper(user.id, id);
    }
}
