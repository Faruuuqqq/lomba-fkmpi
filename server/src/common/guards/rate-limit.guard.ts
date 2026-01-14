import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

@Injectable()
export class RateLimitGuard implements NestInterceptor {
  private readonly logger = new Logger(RateLimitGuard.name);
  private readonly store: RateLimitStore = {};
  
  // Configuration: 5 attempts per minute
  private readonly maxAttempts = 5;
  private readonly windowMs = 60 * 1000; // 1 minute

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    
    const clientIp = this.getClientIp(request);
    
    // Check rate limit
    const rateLimitResult = this.checkRateLimit(clientIp);
    
    if (!rateLimitResult.allowed) {
      this.logger.warn(`Rate limit exceeded for IP: ${clientIp}`);
      
      // Set rate limit headers
      response.set({
        'X-RateLimit-Limit': this.maxAttempts,
        'X-RateLimit-Remaining': Math.max(0, rateLimitResult.remaining),
        'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
      });
      
      return throwError(() => ({
        statusCode: 429,
        message: 'Too many login attempts. Please try again later.',
        error: 'Too Many Requests',
        retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
      }));
    }
    
    // Set rate limit headers for successful requests
    response.set({
      'X-RateLimit-Limit': this.maxAttempts,
      'X-RateLimit-Remaining': rateLimitResult.remaining,
      'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
    });
    
    return next.handle().pipe(
      catchError(error => {
        // Only count rate limit on authentication failures
        if (error.status === 401 || error.response?.status === 401) {
          this.recordFailedAttempt(clientIp);
        }
        throw error;
      })
    );
  }

  private getClientIp(request: Request): string {
    return (
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (request.headers['x-real-ip'] as string) ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      'unknown'
    );
  }

  private checkRateLimit(clientIp: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const key = `login_${clientIp}`;
    
    // Clean up expired entries
    this.cleanupExpiredEntries(now);
    
    let entry = this.store[key];
    
    if (!entry) {
      entry = {
        count: 0,
        resetTime: now + this.windowMs,
      };
      this.store[key] = entry;
    }
    
    const remaining = Math.max(0, this.maxAttempts - entry.count);
    const allowed = entry.count < this.maxAttempts;
    
    return {
      allowed,
      remaining,
      resetTime: entry.resetTime,
    };
  }

  private recordFailedAttempt(clientIp: string): void {
    const key = `login_${clientIp}`;
    const entry = this.store[key];
    
    if (entry) {
      entry.count++;
      this.logger.debug(`Failed login attempt recorded for IP: ${clientIp}, count: ${entry.count}`);
    }
  }

  private cleanupExpiredEntries(now: number): void {
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime <= now) {
        delete this.store[key];
      }
    });
  }
}