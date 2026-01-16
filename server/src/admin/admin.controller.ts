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
import { User } from "../common/decorators/current-user.decorator";

@Controller("admin")
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get("dashboard")
  async getDashboard(@User() user: any) {
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
  async getUsers(
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
    @Query("search") search?: string,
  ) {
    return this.adminService.getUsers(parseInt(page), parseInt(limit), search);
  }

  @Put("users/:userId/toggle-status")
  @HttpCode(HttpStatus.OK)
  async toggleUserStatus(@Param("userId") userId: string) {
    return this.adminService.toggleUserStatus(userId);
  }

  @Put("users/:userId/role")
  @HttpCode(HttpStatus.OK)
  async updateUserRole(
    @Param("userId") userId: string,
    @Body("role") role: "USER" | "ADMIN",
  ) {
    return this.adminService.updateUserRole(userId, role);
  }

  @Get("projects")
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
  async getConfiguration() {
    return this.adminService.getSystemConfiguration();
  }

  @Post("configuration")
  @HttpCode(HttpStatus.OK)
  async updateConfiguration(@Body() config: any) {
    // This would typically update configuration in database
    // For now, just return success
    return { message: "Configuration updated successfully", config };
  }
}
