import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, SaveProjectDto, FinishProjectDto } from './projects.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post()
  async create(@Body() dto: CreateProjectDto, @CurrentUser() user: any) {
    return this.projectsService.create(user.id, dto);
  }

  @Get()
  async findAll(@CurrentUser() user: any) {
    return this.projectsService.findAll(user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.projectsService.findOne(id, user.id);
  }

  @Patch(':id/save')
  async save(@Param('id') id: string, @Body() dto: SaveProjectDto, @CurrentUser() user: any) {
    return this.projectsService.save(id, user.id, dto);
  }

  @Patch(':id/finish')
  async finish(@Param('id') id: string, @Body() dto: FinishProjectDto, @CurrentUser() user: any) {
    return this.projectsService.finish(id, user.id, dto);
  }

  @Get(':id/snapshots')
  async getSnapshots(@Param('id') id: string, @CurrentUser() user: any) {
    return this.projectsService.getSnapshots(id, user.id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.projectsService.delete(id, user.id);
  }
}
