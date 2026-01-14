import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Request } from 'express';

@Injectable()
export class AccountSecurityService {
  private readonly logger = new Logger(AccountSecurityService.name);

  // Configuration
  private readonly maxFailedAttempts = 5;
  private readonly lockoutDurationMinutes = 15;
  private readonly lockoutEscalationMinutes = 60; // For repeated lockouts
  private readonly resetAfterHours = 24;

  constructor(private readonly prisma: PrismaService) {}

  async recordFailedLoginAttempt(email: string, request: Request): Promise<void> {
    const ipAddress = this.getClientIp(request);
    const userAgent = request.headers['user-agent'] || 'unknown';

    try {
      // Record the failed attempt
      await this.prisma.failedLoginAttempt.create({
        data: {
          email: email.toLowerCase(),
          ipAddress,
          userAgent,
          timestamp: new Date(),
        },
      });

      // Check if this email should be locked out
      await this.checkAndUpdateLockout(email);

    } catch (error) {
      this.logger.error('Error recording failed login attempt:', error);
    }
  }

  async isAccountLocked(email: string): Promise<{
    isLocked: boolean;
    reason?: string;
    lockedUntil?: Date;
  }> {
    try {
      const lockout = await this.prisma.accountLockout.findFirst({
        where: {
          email: email.toLowerCase(),
          isActive: true,
          lockedUntil: {
            gt: new Date(),
          },
        },
        orderBy: {
          lockedUntil: 'desc',
        },
      });

      if (!lockout) {
        return { isLocked: false };
      }

      // Check if lockout has expired
      if (lockout.lockedUntil <= new Date()) {
        await this.deactivateLockout(lockout.id);
        return { isLocked: false };
      }

      return {
        isLocked: true,
        reason: lockout.lockReason,
        lockedUntil: lockout.lockedUntil,
      };

    } catch (error) {
      this.logger.error('Error checking account lockout:', error);
      return { isLocked: false }; // Fail open for technical errors
    }
  }

  async clearFailedAttempts(email: string): Promise<void> {
    try {
      await this.prisma.failedLoginAttempt.deleteMany({
        where: {
          email: email.toLowerCase(),
        },
      });

      // Deactivate any active lockouts
      await this.prisma.accountLockout.updateMany({
        where: {
          email: email.toLowerCase(),
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

      this.logger.log(`Cleared failed attempts and deactivated lockouts for ${email}`);

    } catch (error) {
      this.logger.error('Error clearing failed attempts:', error);
    }
  }

  private async checkAndUpdateLockout(email: string): Promise<void> {
    const normalizedEmail = email.toLowerCase();

    // Count failed attempts in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentAttempts = await this.prisma.failedLoginAttempt.count({
      where: {
        email: normalizedEmail,
        timestamp: {
          gte: oneHourAgo,
        },
      },
    });

    // Check for existing active lockout
    const existingLockout = await this.prisma.accountLockout.findFirst({
      where: {
        email: normalizedEmail,
        isActive: true,
        lockedUntil: {
          gt: new Date(),
        },
      },
    });

    // Determine if account should be locked
    let shouldLock = false;
    let lockoutDuration = this.lockoutDurationMinutes;
    let lockReason = '';

    if (recentAttempts >= this.maxFailedAttempts) {
      shouldLock = true;
      lockReason = `Too many failed login attempts (${recentAttempts} attempts)`;

      // Escalate lockout duration for repeated offenses
      if (existingLockout) {
        const lockoutCount = await this.prisma.accountLockout.count({
          where: {
            email: normalizedEmail,
            lockedAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
            },
          },
        });

        if (lockoutCount > 1) {
          lockoutDuration = this.lockoutEscalationMinutes;
          lockReason += ` - Repeated offenses detected`;
        }
      }
    }

    if (shouldLock) {
      const lockedUntil = new Date(Date.now() + lockoutDuration * 60 * 1000);

      if (existingLockout) {
        // Update existing lockout
        await this.prisma.accountLockout.update({
          where: { id: existingLockout.id },
          data: {
            lockedUntil,
            lockReason,
            attempts: recentAttempts,
          },
        });
      } else {
        // Create new lockout
        await this.prisma.accountLockout.create({
          data: {
            email: normalizedEmail,
            lockReason,
            lockedUntil,
            attempts: recentAttempts,
          },
        });
      }

      this.logger.warn(`Account locked: ${email} - ${lockReason} - Locked until ${lockedUntil}`);

      // Clean up old failed attempts
      await this.cleanupOldFailedAttempts();
    }
  }

  private async deactivateLockout(lockoutId: string): Promise<void> {
    try {
      await this.prisma.accountLockout.update({
        where: { id: lockoutId },
        data: {
          isActive: false,
        },
      });
    } catch (error) {
      this.logger.error('Error deactivating lockout:', error);
    }
  }

  private async cleanupOldFailedAttempts(): Promise<void> {
    try {
      const cutoffDate = new Date(Date.now() - this.resetAfterHours * 60 * 60 * 1000);
      
      await this.prisma.failedLoginAttempt.deleteMany({
        where: {
          timestamp: {
            lt: cutoffDate,
          },
        },
      });

      // Also clean up expired lockouts
      await this.prisma.accountLockout.updateMany({
        where: {
          lockedUntil: {
            lt: new Date(),
          },
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

    } catch (error) {
      this.logger.error('Error cleaning up old data:', error);
    }
  }

  private getClientIp(request: Request): string {
    return (
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (request.headers['x-real-ip'] as string) ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      (request as any).ip ||
      'unknown'
    );
  }

  async getSecurityReport(email?: string): Promise<{
    totalFailedAttempts: number;
    recentFailedAttempts: number;
    activeLockouts: number;
    lockoutHistory: any[];
  }> {
    try {
      const whereClause = email 
        ? { email: email.toLowerCase() }
        : {};

      const totalFailed = await this.prisma.failedLoginAttempt.count({
        where: whereClause,
      });

      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentFailed = await this.prisma.failedLoginAttempt.count({
        where: {
          ...whereClause,
          timestamp: {
            gte: oneHourAgo,
          },
        },
      });

      const activeLockouts = await this.prisma.accountLockout.count({
        where: {
          ...whereClause,
          isActive: true,
          lockedUntil: {
            gt: new Date(),
          },
        },
      });

      const lockoutHistory = await this.prisma.accountLockout.findMany({
        where: whereClause,
        orderBy: {
          lockedAt: 'desc',
        },
        take: 10,
      });

      return {
        totalFailedAttempts: totalFailed,
        recentFailedAttempts: recentFailed,
        activeLockouts,
        lockoutHistory,
      };

    } catch (error) {
      this.logger.error('Error generating security report:', error);
      return {
        totalFailedAttempts: 0,
        recentFailedAttempts: 0,
        activeLockouts: 0,
        lockoutHistory: [],
      };
    }
  }

  async isSuspiciousActivity(request: Request): Promise<{
    isSuspicious: boolean;
    score: number;
    reasons: string[];
  }> {
    const ipAddress = this.getClientIp(request);
    const userAgent = request.headers['user-agent'] || 'unknown';
    const reasons = [];
    let score = 0;

    try {
      // Check IP-based patterns
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const recentAttemptsFromIp = await this.prisma.failedLoginAttempt.count({
        where: {
          ipAddress,
          timestamp: {
            gte: oneHourAgo,
          },
        },
      },
      });

      if (recentAttemptsFromIp > 20) {
        score += 40;
        reasons.push(`High failed login rate from IP: ${recentAttemptsFromIp} attempts`);
      }

      // Check for multiple IPs for same email
      const uniqueIps = await this.prisma.failedLoginAttempt.groupBy({
        by: ['ipAddress'],
        where: {
          timestamp: {
            gte: oneHourAgo,
          },
        },
        _count: {
          id: true,
        },
      });

      if (uniqueIps.length > 10) {
        score += 30;
        reasons.push(`Multiple IP addresses detected: ${uniqueIps.length} different IPs`);
      }

      // Check user agent patterns
      const recentAttemptsFromUA = await this.prisma.failedLoginAttempt.count({
        where: {
          userAgent,
          timestamp: {
            gte: oneHourAgo,
          },
        },
      },
      });

      if (recentAttemptsFromUA > 15) {
        score += 20;
        reasons.push(`High failed login rate from user agent: ${recentAttemptsFromUA} attempts`);
      }

      // Check for automated patterns
      const automatedUAPatterns = [
        /bot/i, /crawler/i, /spider/i, /scraper/i,
        /headless/i, /phantom/i, /selenium/i, /webdriver/i,
      ];

      if (automatedUAPatterns.some(pattern => pattern.test(userAgent))) {
        score += 50;
        reasons.push('Automated/suspicious user agent detected');
      }

      return {
        isSuspicious: score > 40,
        score,
        reasons,
      };

    } catch (error) {
      this.logger.error('Error checking suspicious activity:', error);
      return { isSuspicious: false, score: 0, reasons: [] };
    }
  }
}