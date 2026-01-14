import { 
  Injectable, 
  CanActivate, 
  ExecutionContext, 
  ForbiddenException,
  Logger 
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RecaptchaService } from '../services/recaptcha.service';
import { Request } from 'express';

@Injectable()
export class RecaptchaGuard implements CanActivate {
  private readonly logger = new Logger(RecaptchaGuard.name);

  constructor(
    private readonly recaptchaService: RecaptchaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if reCAPTCHA is required for this endpoint
    const requireRecaptcha = this.reflector.get<boolean>('requireRecaptcha', context.getHandler());
    
    if (!requireRecaptcha) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const body = request.body;
    
    // Extract reCAPTCHA token from request body
    const recaptchaToken = this.extractRecaptchaToken(body);
    
    if (!recaptchaToken) {
      throw new ForbiddenException('reCAPTCHA token is required');
    }

    // Validate token format
    const tokenValidation = this.recaptchaService.validateToken(recaptchaToken);
    if (!tokenValidation.valid) {
      throw new ForbiddenException(tokenValidation.error);
    }

    // Get client IP for additional verification
    const clientIp = this.getClientIp(request);
    const userAgent = request.headers['user-agent'];

    // Verify token with Google
    const isHuman = await this.recaptchaService.isHumanScoreSufficient(recaptchaToken, clientIp);
    
    if (!isHuman) {
      this.logger.warn(`reCAPTCHA verification failed for IP: ${clientIp}`);
      throw new ForbiddenException('reCAPTCHA verification failed. Please try again.');
    }

    // Additional risk assessment (optional)
    const riskAssessment = await this.recaptchaService.checkRiskScore(
      recaptchaToken, 
      userAgent, 
      clientIp
    );
    
    if (riskAssessment.riskScore > 75) {
      this.logger.warn(`High risk login attempt detected: ${JSON.stringify(riskAssessment)}`);
      throw new ForbiddenException('Suspicious activity detected. Please try again later.');
    }

    return true;
  }

  private extractRecaptchaToken(body: any): string | null {
    if (!body) {
      return null;
    }

    // Check common token field names
    const possibleFields = [
      'recaptchaToken',
      'recaptcha_token',
      'g-recaptcha-response',
      'token',
      'captcha',
    ];

    for (const field of possibleFields) {
      if (body[field]) {
        return body[field];
      }
    }

    // Check nested recaptcha object
    if (body.recaptcha && typeof body.recaptcha === 'object') {
      if (body.recaptcha.token) {
        return body.recaptcha.token;
      }
      if (body.recaptcha.recaptchaToken) {
        return body.recaptcha.recaptchaToken;
      }
    }

    return null;
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