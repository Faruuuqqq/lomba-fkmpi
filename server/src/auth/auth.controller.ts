import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  UseGuards, 
  UseFilters,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  ForbiddenException,

  Req
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { 
  RegisterDto, 
  LoginDto, 
  LoginWithRecaptchaDto,
  ChangePasswordDto,
  ResetPasswordDto,
  LoginResponseDto,
  RegisterResponseDto
} from './auth.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { EnhancedRateLimitGuard } from '../common/guards/enhanced-rate-limit.guard';
import { RecaptchaGuard } from '../common/guards/recaptcha.guard';
import { RequireRecaptcha } from '../common/decorators/recaptcha.decorator';
import { ValidationFilter } from '../common/filters/validation.filter';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
@UseFilters(ValidationFilter)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @UseInterceptors(EnhancedRateLimitGuard)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully', type: RegisterResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  @ApiBody({ type: RegisterDto })
  async register(@Body() dto: RegisterDto): Promise<RegisterResponseDto> {
    // Additional server-side validation
    this.validatePasswordStrength(dto.password);
    this.validateEmailDomain(dto.email);
    
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(EnhancedRateLimitGuard)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 403, description: 'Account locked' })
  @ApiResponse({ status: 429, description: 'Too many login attempts' })
  @ApiBody({ type: LoginDto })
  async login(@Body() dto: LoginDto, @Req() request: Request): Promise<LoginResponseDto> {
    // Additional security checks
    this.validateLoginAttempt(dto);
    
    return this.authService.login(dto, request);
  }

  @Post('login-with-recaptcha')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RecaptchaGuard)
  @UseInterceptors(EnhancedRateLimitGuard)
  @RequireRecaptcha()
  @ApiOperation({ summary: 'Login with reCAPTCHA verification' })
  @ApiResponse({ status: 200, description: 'Login successful', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials or reCAPTCHA failed' })
  @ApiResponse({ status: 403, description: 'reCAPTCHA verification failed' })
  @ApiResponse({ status: 429, description: 'Too many login attempts' })
  @ApiBody({ type: LoginWithRecaptchaDto })
  async loginWithRecaptcha(@Body() dto: LoginWithRecaptchaDto): Promise<LoginResponseDto> {
    return this.authService.login({
      email: dto.email,
      password: dto.password,
    });
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(EnhancedRateLimitGuard)
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async changePassword(
    @CurrentUser() user: any,
    @Body() dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    // Validate password confirmation
    if (dto.newPassword !== dto.newPasswordConfirm) {
      throw new ForbiddenException('New passwords do not match');
    }
    
    return this.authService.changePassword(user.id, dto);
  }

  @Post('reset-password')
  @UseInterceptors(EnhancedRateLimitGuard)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<{ message: string }> {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@CurrentUser() user: any) {
    return this.authService.getProfile(user.id);
  }

  @Get('security-status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get account security status' })
  @ApiResponse({ status: 200, description: 'Security status retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSecurityStatus(@CurrentUser() user: any) {
    return this.authService.getSecurityStatus(user.id);
  }

  private validatePasswordStrength(password: string): void {
    // Check for common weak passwords
    const commonPasswords = [
      'password', '123456', 'password123', 'admin', 'qwerty',
      'letmein', 'welcome', 'monkey', 'dragon', 'football'
    ];
    
    const lowerPassword = password.toLowerCase();
    if (commonPasswords.some(common => lowerPassword.includes(common))) {
      throw new ForbiddenException('Password is too common. Please choose a stronger password.');
    }
    
    // Check for sequential characters or numbers
    if (/(.)\1{2,}/.test(password)) {
      throw new ForbiddenException('Password cannot contain 3 or more repeated characters in a row.');
    }
    
    // Check for keyboard sequences
    if (this.isKeyboardSequence(password)) {
      throw new ForbiddenException('Password cannot contain keyboard sequences.');
    }
  }

  private validateEmailDomain(email: string): void {
    const domain = email.split('@')[1]?.toLowerCase();
    const blockedDomains = [
      'tempmail.org', '10minutemail.com', 'guerrillamail.com',
      'mailinator.com', 'yopmail.com', 'throwaway.email'
    ];
    
    if (blockedDomains.some(blocked => domain?.includes(blocked))) {
      throw new ForbiddenException('Disposable email addresses are not allowed.');
    }
  }

  private validateLoginAttempt(dto: LoginDto): void {
    // Check for SQL injection patterns
    const sqlPatterns = [
      /'(--)|(;)|(\|\|)|(\*\*)/,
      /(exec|insert|select|delete|update|count|drop|union|create|alter)/i
    ];
    
    if (sqlPatterns.some(pattern => pattern.test(dto.email + dto.password))) {
      throw new ForbiddenException('Invalid input format.');
    }
    
    // Check for XSS patterns
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi
    ];
    
    if (xssPatterns.some(pattern => pattern.test(dto.email + dto.password))) {
      throw new ForbiddenException('Invalid input format.');
    }
  }

  private isKeyboardSequence(password: string): boolean {
    const sequences = [
      'qwertyuiop', 'asdfghjkl', 'zxcvbnm',
      'qwerty', 'asdfgh', 'zxcvbn',
      '1234567890', '0987654321', '123456',
      'abcdef', 'ghijkl', 'mnopqr', 'stuvwx', 'yzabcd'
    ];
    
    const lowerPassword = password.toLowerCase();
    return sequences.some(seq => lowerPassword.includes(seq));
  }

  private async verifyRecaptcha(token: string): Promise<void> {
    // TODO: Implement Google reCAPTCHA verification
    // For now, we'll skip this in development
    if (process.env.NODE_ENV !== 'production') {
      return;
    }
    
    // This would be implemented later
    throw new ForbiddenException('reCAPTCHA verification not yet implemented');
  }
}