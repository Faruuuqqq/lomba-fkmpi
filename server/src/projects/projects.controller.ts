import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, SaveProjectDto, FinishProjectDto } from './projects.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private projectsService: ProjectsService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({ status: 201, description: 'Project created successfully' })
  @ApiBody({ type: CreateProjectDto })
  async create(@Body() dto: CreateProjectDto, @CurrentUser() user: any) {
    return this.projectsService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user projects' })
  @ApiResponse({ status: 200, description: 'Projects retrieved successfully' })
  async findAll(@CurrentUser() user: any) {
    return this.projectsService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  @ApiResponse({ status: 200, description: 'Project retrieved successfully' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.projectsService.findOne(id, user.id);
  }

  @Patch(':id/save')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save project progress' })
  @ApiResponse({ status: 200, description: 'Project saved successfully' })
  @ApiBody({ type: SaveProjectDto })
  async save(@Param('id') id: string, @Body() dto: SaveProjectDto, @CurrentUser() user: any) {
    return this.projectsService.save(id, user.id, dto);
  }

  @Patch(':id/finish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Finish project' })
  @ApiResponse({ status: 200, description: 'Project finished successfully' })
  @ApiBody({ type: FinishProjectDto })
  async finish(@Param('id') id: string, @Body() dto: FinishProjectDto, @CurrentUser() user: any) {
    return this.projectsService.finish(id, user.id, dto);
  }

  @Get(':id/snapshots')
  @ApiOperation({ summary: 'Get project snapshots' })
  @ApiResponse({ status: 200, description: 'Snapshots retrieved successfully' })
  async getSnapshots(@Param('id') id: string, @CurrentUser() user: any) {
    return this.projectsService.getSnapshots(id, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a project' })
  @ApiResponse({ status: 204, description: 'Project deleted successfully' })
  async delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.projectsService.delete(id, user.id);
  }
}
