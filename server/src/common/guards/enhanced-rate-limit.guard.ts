import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

interface RateLimitOptions {
  windowMs: number;
  maxAttempts: number;
  keyGenerator?: (req: Request) => string;
  skipSuccessfulRequests?: boolean;
}

@Injectable()
export class EnhancedRateLimitGuard implements NestInterceptor {
  private readonly logger = new Logger(EnhancedRateLimitGuard.name);
  
  constructor(private readonly prisma: PrismaService) {}

  private readonly defaultOptions: RateLimitOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxAttempts: 5,
    skipSuccessfulRequests: false,
  };

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    
    // Apply stricter limits for login endpoint
    const isLoginEndpoint = request.path === '/auth/login';
    const options = isLoginEndpoint 
      ? { ...this.defaultOptions, windowMs: 5 * 60 * 1000, maxAttempts: 5 } // 5 attempts in 5 minutes
      : this.defaultOptions;
    
    const key = this.generateKey(request, options);
    
    return this.checkRateLimit(key, options).then(rateLimitResult => {
      if (!rateLimitResult.allowed) {
        this.logger.warn(`Rate limit exceeded for key: ${key}`);
        
        // Set rate limit headers
        response.set({
          'X-RateLimit-Limit': options.maxAttempts,
          'X-RateLimit-Remaining': Math.max(0, rateLimitResult.remaining),
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
          'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        });
        
        throw {
          statusCode: 429,
          message: isLoginEndpoint 
            ? 'Too many login attempts. Please try again in a few minutes.'
            : 'Too many requests. Please slow down.',
          error: 'Too Many Requests',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        };
      }
      
      // Set rate limit headers for successful requests
      response.set({
        'X-RateLimit-Limit': options.maxAttempts,
        'X-RateLimit-Remaining': rateLimitResult.remaining,
        'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
      });
      
      return next.handle().pipe(
        catchError(error => {
          // Only count rate limit on authentication failures for login endpoint
          if (isLoginEndpoint && (error.status === 401 || error.response?.status === 401)) {
            this.recordFailedAttempt(key, options);
          }
          throw error;
        })
      );
    });
  }

  private async checkRateLimit(key: string, options: RateLimitOptions): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    const now = new Date();
    const resetTime = new Date(now.getTime() + options.windowMs);
    
    try {
      // Check existing rate limit record
      const existing = await this.prisma.rateLimit.findUnique({
        where: { key },
      });
      
      if (!existing) {
        // Create new rate limit record
        await this.prisma.rateLimit.create({
          data: {
            key,
            count: 1,
            resetTime,
            createdAt: now,
            updatedAt: now,
          },
        });
        
        return {
          allowed: true,
          remaining: options.maxAttempts - 1,
          resetTime: resetTime.getTime(),
        };
      }
      
      // Check if the window has expired
      if (existing.resetTime <= now) {
        // Reset the counter
        await this.prisma.rateLimit.update({
          where: { key },
          data: {
            count: 1,
            resetTime,
            updatedAt: now,
          },
        });
        
        return {
          allowed: true,
          remaining: options.maxAttempts - 1,
          resetTime: resetTime.getTime(),
        };
      }
      
      // Check if limit exceeded
      const allowed = existing.count < options.maxAttempts;
      const remaining = Math.max(0, options.maxAttempts - existing.count - 1);
      
      if (allowed) {
        // Increment counter for allowed requests
        await this.prisma.rateLimit.update({
          where: { key },
          data: {
            count: existing.count + 1,
            updatedAt: now,
          },
        });
      }
      
      return {
        allowed,
        remaining,
        resetTime: existing.resetTime.getTime(),
      };
      
    } catch (error) {
      this.logger.error('Error checking rate limit:', error);
      // Fail open - allow request if rate limiting fails
      return {
        allowed: true,
        remaining: options.maxAttempts - 1,
        resetTime: resetTime.getTime(),
      };
    }
  }

  private async recordFailedAttempt(key: string, options: RateLimitOptions): Promise<void> {
    try {
      await this.prisma.rateLimit.update({
        where: { key },
        data: {
          count: {
            increment: 1,
          },
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error('Error recording failed attempt:', error);
    }
  }

  private generateKey(request: Request, options: RateLimitOptions): string {
    if (options.keyGenerator) {
      return options.keyGenerator(request);
    }
    
    const clientIp = this.getClientIp(request);
    const userAgent = request.headers['user-agent'] || 'unknown';
    const path = request.path;
    
    // Create a unique key based on IP, user agent, and endpoint
    return `${path}:${clientIp}:${Buffer.from(userAgent).toString('base64').slice(0, 16)}`;
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
}