import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Log analytics data
export const logAnalytics = async (req: Request, res: Response) => {
  try {
    const { userId, feature, duration, metadata } = req.body;

    const analyticsLog = await prisma.analyticsLog.create({
      data: {
        userId,
        feature,
        duration,
        metadata: metadata || {}
      }
    });

    res.status(201).json(analyticsLog);
  } catch (error) {
    console.error('Error logging analytics:', error);
    res.status(500).json({ error: 'Failed to log analytics data' });
  }
};

// Get analytics overview
export const getAnalyticsOverview = async (req: Request, res: Response) => {
  try {
    const data = await prisma.analyticsLog.groupBy({
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

    res.json(result);
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    res.status(500).json({ error: 'Failed to fetch analytics overview' });
  }
};

// Get daily usage stats
export const getDailyUsageStats = async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days as string));

    const data = await prisma.analyticsLog.findMany({
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

    res.json(groupedData);
  } catch (error) {
    console.error('Error fetching daily usage stats:', error);
    res.status(500).json({ error: 'Failed to fetch daily usage stats' });
  }
};

// Get performance metrics
export const getPerformanceMetrics = async (req: Request, res: Response) => {
  try {
    const { feature } = req.query;

    const whereClause = feature ? { feature: feature as string } : {};

    const metrics = await prisma.analyticsLog.groupBy({
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

    res.json(result);
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({ error: 'Failed to fetch performance metrics' });
  }
};