import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RecaptchaService {
  private readonly logger = new Logger(RecaptchaService.name);
  private readonly secretKey: string;
  private readonly verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.secretKey = this.configService.get<string>('RECAPTCHA_SECRET_KEY');
    
    if (!this.secretKey && process.env.NODE_ENV === 'production') {
      this.logger.warn('reCAPTCHA secret key not configured for production');
    }
  }

  async verifyToken(token: string, remoteIp?: string): Promise<{ success: boolean; errorCodes?: string[] }> {
    // Skip verification in development if no key is configured
    if (!this.secretKey && process.env.NODE_ENV !== 'production') {
      return { success: true };
    }

    if (!this.secretKey) {
      this.logger.error('reCAPTCHA secret key not configured');
      return { success: false };
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.verifyUrl, null, {
          params: {
            secret: this.secretKey,
            response: token,
            remoteip: remoteIp,
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })
      );

      const result = response.data;
      
      if (!result.success) {
        this.logger.warn(`reCAPTCHA verification failed: ${JSON.stringify(result)}`);
      }

      return {
        success: result.success,
        errorCodes: result['error-codes'],
      };
    } catch (error) {
      this.logger.error('Error verifying reCAPTCHA token:', error);
      
      // Fail open for technical errors, but log the incident
      return { success: false };
    }
  }

  validateToken(token: string): { valid: boolean; error?: string } {
    if (!token) {
      return { valid: false, error: 'reCAPTCHA token is required' };
    }

    if (typeof token !== 'string') {
      return { valid: false, error: 'Invalid reCAPTCHA token format' };
    }

    if (token.length < 20 || token.length > 2000) {
      return { valid: false, error: 'reCAPTCHA token length is invalid' };
    }

    // Basic format validation for Google reCAPTCHA tokens
    const tokenPattern = /^[A-Za-z0-9_-]+$/;
    if (!tokenPattern.test(token)) {
      return { valid: false, error: 'Invalid reCAPTCHA token format' };
    }

    return { valid: true };
  }

  async isHumanScoreSufficient(token: string, remoteIp?: string): Promise<boolean> {
    const result = await this.verifyToken(token, remoteIp);
    return result.success;
  }

  async checkRiskScore(token: string, userAgent?: string, remoteIp?: string): Promise<{
    isHuman: boolean;
    riskScore: number;
    reasons: string[];
  }> {
    const verification = await this.verifyToken(token, remoteIp);
    
    const riskFactors = [];
    let riskScore = 0;

    if (!verification.success) {
      riskScore += 100;
      riskFactors.push('reCAPTCHA verification failed');
      if (verification.errorCodes) {
        riskFactors.push(`Error codes: ${verification.errorCodes.join(', ')}`);
      }
    }

    // Additional risk assessment based on user agent
    if (userAgent) {
      const suspiciousUAPatterns = [
        /bot/i,
        /crawler/i,
        /spider/i,
        /scraper/i,
        /headless/i,
        /phantom/i,
        /selenium/i,
        /webdriver/i,
      ];

      if (suspiciousUAPatterns.some(pattern => pattern.test(userAgent))) {
        riskScore += 50;
        riskFactors.push('Suspicious user agent');
      }
    }

    // IP-based risk assessment
    if (remoteIp) {
      // Check for known proxy/VPN patterns
      const suspiciousIPPatterns = [
        /^10\./,      // Private network
        /^192\.168\./, // Private network
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Private network
        /^127\./,      // Localhost
      ];

      if (suspiciousIPPatterns.some(pattern => pattern.test(remoteIp))) {
        riskScore += 20;
        riskFactors.push('Internal IP address');
      }
    }

    const isHuman = riskScore < 50;

    return {
      isHuman,
      riskScore,
      reasons: riskFactors,
    };
  }

  getRecaptchaConfig(): { siteKey: string; enabled: boolean } {
    const siteKey = this.configService.get<string>('RECAPTCHA_SITE_KEY');
    const enabled = !!(siteKey && this.secretKey && process.env.NODE_ENV === 'production');

    return {
      siteKey: siteKey || '',
      enabled,
    };
  }
}