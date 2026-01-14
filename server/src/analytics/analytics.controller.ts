import { Controller, Post, Get, Body, Query, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('log')
  async logAnalytics(@Body() body: { userId?: string; feature: string; duration: number; metadata?: any }) {
    try {
      const { userId, feature, duration, metadata } = body;

      const analyticsLog = await this.prisma.analyticsLog.create({
        data: {
          userId,
          feature,
          duration,
          metadata: metadata || {}
        }
      });

      return analyticsLog;
    } catch (error) {
      console.error('Error logging analytics:', error);
      throw new HttpException('Failed to log analytics data', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('overview')
  async getAnalyticsOverview() {
    try {
      const data = await this.prisma.analyticsLog.groupBy({
        by: ['feature'],
        _count: { id: true },
        _avg: { duration: true },
        orderBy: { _count: { id: 'desc' } }
      });

      const result = data.map(item => ({
        feature: item.feature,
        usageCount: item._count.id,
        avgDuration: item._avg.duration
      }));

      return result;
    } catch (error) {
      console.error('Error fetching analytics overview:', error);
      throw new HttpException('Failed to fetch analytics overview', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('daily-stats')
  async getDailyUsageStats(@Query('days') days: string = '30') {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));

      const data = await this.prisma.analyticsLog.findMany({
        where: {
          timestamp: {
            gte: startDate
          }
        },
        select: {
          feature: true,
          timestamp: true,
          duration: true
        },
        orderBy: {
          timestamp: 'asc'
        }
      });

      // Group by date and feature
      const groupedData: { [date: string]: { [feature: string]: number } } = {};
      
      data.forEach(item => {
        const date = item.timestamp.toISOString().split('T')[0];
        if (!groupedData[date]) {
          groupedData[date] = {};
        }
        if (!groupedData[date][item.feature]) {
          groupedData[date][item.feature] = 0;
        }
        groupedData[date][item.feature]++;
      });

      return groupedData;
    } catch (error) {
      console.error('Error fetching daily usage stats:', error);
      throw new HttpException('Failed to fetch daily usage stats', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('performance')
  async getPerformanceMetrics(@Query('feature') feature?: string) {
    try {
      const whereClause = feature ? { feature } : {};

      const metrics = await this.prisma.analyticsLog.groupBy({
        by: ['feature'],
        where: whereClause,
        _min: { duration: true },
        _max: { duration: true },
        _avg: { duration: true },
        _count: { id: true }
      });

      const result = metrics.map(metric => ({
        feature: metric.feature,
        minDuration: metric._min.duration,
        maxDuration: metric._max.duration,
        avgDuration: metric._avg.duration,
        requestCount: metric._count.id
      }));

      return result;
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      throw new HttpException('Failed to fetch performance metrics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}