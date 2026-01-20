import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { AdminGuard } from "../common/guards/admin.guard";
import { AdminService } from "./admin.service";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { UpdateUserRoleDto, UpdateConfigurationDto } from "./admin.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller("admin")
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private adminService: AdminService) { }

  @Get("dashboard")
  @ApiOperation({ summary: 'Get admin dashboard data' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved' })
  async getDashboard(@CurrentUser() user: any) {
    const [analytics, systemAnalytics] = await Promise.all([
      this.adminService.getProjectAnalytics(),
      this.adminService.getSystemAnalytics(),
    ]);

    return {
      user,
      analytics,
      systemAnalytics,
    };
  }

  @Get("users")
  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async getUsers(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
    @Query("search") search?: string,
  ) {
    return this.adminService.getUsers(parseInt(page), parseInt(limit), search);
  }

  @Put("users/:userId/toggle-status")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle user active status' })
  @ApiResponse({ status: 200, description: 'User status toggled' })
  async toggleUserStatus(@Param("userId") userId: string) {
    return this.adminService.toggleUserStatus(userId);
  }

  @Put("users/:userId/role")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user role' })
  @ApiResponse({ status: 200, description: 'User role updated' })
  @ApiBody({ type: UpdateUserRoleDto })
  async updateUserRole(
    @Param("userId") userId: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.adminService.updateUserRole(userId, dto.role);
  }

  @Get("projects")
  @ApiOperation({ summary: 'Get all projects' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiResponse({ status: 200, description: 'Projects retrieved successfully' })
  async getProjects(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
    @Query("status") status?: string,
    @Query("userId") userId?: string,
  ) {
    return this.adminService.getProjects(
      parseInt(page),
      parseInt(limit),
      status,
      userId,
    );
  }

  @Get("analytics")
  @ApiOperation({ summary: 'Get system analytics' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  async getAnalytics() {
    const [projectAnalytics, systemAnalytics] = await Promise.all([
      this.adminService.getProjectAnalytics(),
      this.adminService.getSystemAnalytics(),
    ]);

    return {
      projectAnalytics,
      systemAnalytics,
    };
  }

  @Get("configuration")
  @ApiOperation({ summary: 'Get system configuration' })
  @ApiResponse({ status: 200, description: 'Configuration retrieved successfully' })
  async getConfiguration() {
    return this.adminService.getSystemConfiguration();
  }

  @Post("configuration")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update system configuration' })
  @ApiResponse({ status: 200, description: 'Configuration updated successfully' })
  @ApiBody({ type: UpdateConfigurationDto })
  async updateConfiguration(@Body() dto: UpdateConfigurationDto) {
    // This would typically update configuration in database
    // For now, just return success
    return { message: "Configuration updated successfully", config: dto.config };
  }
}
