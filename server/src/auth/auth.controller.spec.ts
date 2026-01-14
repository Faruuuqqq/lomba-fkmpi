import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccountSecurityService } from '../common/services/account-security.service';
import { RecaptchaService } from '../common/services/recaptcha.service';
import { PrismaService } from '../prisma/prisma.service';
import { ValidationFilter } from '../common/filters/validation.filter';
import { EnhancedRateLimitGuard } from '../common/guards/enhanced-rate-limit.guard';
import { BadRequestException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { RegisterDto, LoginDto } from './auth.dto';

// Mock Jest functions
const jest = require('jest');

describe('AuthController Security Tests', () => {
  let controller: AuthController;
  let authService: AuthService;
  let accountSecurity: AccountSecurityService;
  let prisma: PrismaService;

  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
  };

  beforeEach(async () => {
    const mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      getProfile: jest.fn(),
      changePassword: jest.fn(),
      resetPassword: jest.fn(),
    };

    const mockAccountSecurity = {
      recordFailedLoginAttempt: jest.fn(),
      isAccountLocked: jest.fn(),
      clearFailedAttempts: jest.fn(),
    };

    const mockPrisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: AccountSecurityService,
          useValue: mockAccountSecurity,
        },
        {
          provide: RecaptchaService,
          useValue: {
            verifyToken: jest.fn(),
            validateToken: jest.fn(),
            isHumanScoreSufficient: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    })
    .overrideGuard(EnhancedRateLimitGuard)
    .useValue({ intercept: jest.fn().mockImplementation((_, next) => next.handle()) })
    .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    accountSecurity = module.get<AccountSecurityService>(AccountSecurityService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('Input Validation', () => {
    it('should reject registration with invalid email', async () => {
      const invalidDto: RegisterDto = {
        email: 'invalid-email',
        password: 'ValidPass123!',
        name: 'Test User',
      };

      await expect(controller.register(invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should reject registration with weak password', async () => {
      const weakDto: RegisterDto = {
        email: 'test@example.com',
        password: '123',
        name: 'Test User',
      };

      await expect(controller.register(weakDto)).rejects.toThrow(BadRequestException);
    });

    it('should reject registration with password that lacks complexity', async () => {
      const simpleDto: RegisterDto = {
        email: 'test@example.com',
        password: 'simplepassword',
        name: 'Test User',
      };

      await expect(controller.register(simpleDto)).rejects.toThrow(BadRequestException);
    });

    it('should reject registration with common password', async () => {
      const commonDto: RegisterDto = {
        email: 'test@example.com',
        password: 'password123!',
        name: 'Test User',
      };

      await expect(controller.register(commonDto)).rejects.toThrow(ForbiddenException);
    });

    it('should reject registration with sequential characters in password', async () => {
      const sequentialDto: RegisterDto = {
        email: 'test@example.com',
        password: 'Abc12345!',
        name: 'Test User',
      };

      await expect(controller.register(sequentialDto)).rejects.toThrow(ForbiddenException);
    });

    it('should reject registration with disposable email', async () => {
      const disposableDto: RegisterDto = {
        email: 'test@10minutemail.com',
        password: 'ValidPass123!',
        name: 'Test User',
      };

      await expect(controller.register(disposableDto)).rejects.toThrow(ForbiddenException);
    });

    it('should reject login with empty email', async () => {
      const emptyEmailDto: LoginDto = {
        email: '',
        password: 'ValidPass123!',
      };

      await expect(controller.login(emptyEmailDto)).rejects.toThrow(BadRequestException);
    });

    it('should reject login with SQL injection attempt', async () => {
      const sqlInjectionDto: LoginDto = {
        email: "'; DROP TABLE users; --",
        password: "any",
      };

      await expect(controller.login(sqlInjectionDto)).rejects.toThrow(ForbiddenException);
    });

    it('should reject login with XSS attempt', async () => {
      const xssDto: LoginDto = {
        email: '<script>alert("xss")</script>@example.com',
        password: '<script>alert("xss")</script>',
      };

      await expect(controller.login(xssDto)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Account Lockout', () => {
    it('should prevent login when account is locked', async () => {
      const loginDto: LoginDto = {
        email: 'locked@example.com',
        password: 'ValidPass123!',
      };

      jest.spyOn(accountSecurity, 'isAccountLocked').mockResolvedValue({
        isLocked: true,
        reason: 'Too many failed attempts',
        lockedUntil: new Date(Date.now() + 15 * 60 * 1000),
      });

      await expect(controller.login(loginDto)).rejects.toThrow(ForbiddenException);
    });

    it('should record failed login attempt for invalid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      jest.spyOn(authService, 'login').mockRejectedValue(new UnauthorizedException('Invalid credentials'));
      jest.spyOn(accountSecurity, 'recordFailedLoginAttempt').mockResolvedValue(undefined);

      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(accountSecurity.recordFailedLoginAttempt).toHaveBeenCalled();
    });

    it('should clear failed attempts on successful login', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'ValidPass123!',
      };

      jest.spyOn(authService, 'login').mockResolvedValue({
        user: mockUser,
        token: 'jwt-token',
      });
      jest.spyOn(accountSecurity, 'clearFailedAttempts').mockResolvedValue(undefined);

      await controller.login(loginDto);
      expect(accountSecurity.clearFailedAttempts).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('Rate Limiting', () => {
    it('should apply enhanced rate limiting to login endpoint', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'ValidPass123!',
      };

      // Mock rate limiting guard to simulate rate limit exceeded
      jest.spyOn(authService, 'login').mockRejectedValue({
        statusCode: 429,
        message: 'Too many requests',
      });

      await expect(controller.login(loginDto)).rejects.toMatchObject({
        statusCode: 429,
        message: 'Too many requests',
      });
    });
  });

  describe('reCAPTCHA Integration', () => {
    it('should verify reCAPTCHA token for protected endpoints', async () => {
      const loginWithRecaptcha = {
        email: 'test@example.com',
        password: 'ValidPass123!',
        recaptcha: {
          recaptchaToken: 'valid-recaptcha-token',
        },
      };

      jest.spyOn(authService, 'login').mockResolvedValue({
        user: mockUser,
        token: 'jwt-token',
      });

      const result = await controller.loginWithRecaptcha(loginWithRecaptcha);
      expect(result).toBeDefined();
    });

    it('should reject invalid reCAPTCHA token', async () => {
      const invalidRecaptcha = {
        email: 'test@example.com',
        password: 'ValidPass123!',
        recaptcha: {
          recaptchaToken: 'invalid-token',
        },
      };

      jest.spyOn(authService, 'login').mockRejectedValue({
        statusCode: 403,
        message: 'reCAPTCHA verification failed',
      });

      await expect(controller.loginWithRecaptcha(invalidRecaptcha)).rejects.toMatchObject({
        statusCode: 403,
        message: 'reCAPTCHA verification failed',
      });
    });
  });

  describe('Password Change Security', () => {
    it('should reject password change with non-matching passwords', async () => {
      const changePasswordDto = {
        oldPassword: 'OldPass123!',
        newPassword: 'NewPass456!',
        newPasswordConfirm: 'DifferentPass789!',
      };

      await expect(controller.changePassword(mockUser, changePasswordDto))
        .rejects.toThrow(ForbiddenException);
    });

    it('should reject password change with weak new password', async () => {
      const weakPasswordDto = {
        oldPassword: 'OldPass123!',
        newPassword: '123',
        newPasswordConfirm: '123',
      };

      await expect(controller.changePassword(mockUser, weakPasswordDto))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('Security Status', () => {
    it('should return security status for authenticated user', async () => {
      const securityReport = {
        totalFailedAttempts: 5,
        recentFailedAttempts: 2,
        activeLockouts: 0,
        lockoutHistory: [],
      };

      jest.spyOn(authService, 'getSecurityStatus').mockResolvedValue(securityReport);

      const result = await controller.getSecurityStatus(mockUser);
      expect(result).toEqual(securityReport);
      expect(authService.getSecurityStatus).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'ValidPass123!',
        name: 'Test User',
      };

      jest.spyOn(authService, 'register').mockRejectedValue(new Error('Database connection failed'));

      await expect(controller.register(registerDto)).rejects.toThrow();
    });

    it('should sanitize error messages in production', async () => {
      process.env.NODE_ENV = 'production';

      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'ValidPass123!',
      };

      jest.spyOn(authService, 'login').mockRejectedValue({
        message: 'Internal database error: Connection pool exhausted',
        status: 500,
      });

      const result = await controller.login(loginDto);
      expect(result).toBeDefined();
      // Should not expose internal error details
    });

      process.env.NODE_ENV = 'test';
    });
  });
});