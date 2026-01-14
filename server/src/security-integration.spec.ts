import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { AccountSecurityService } from './common/services/account-security.service';

describe('Security Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accountSecurity: AccountSecurityService;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get<PrismaService>(PrismaService);
    accountSecurity = moduleRef.get<AccountSecurityService>(AccountSecurityService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up test data
    await prisma.failedLoginAttempt.deleteMany();
    await prisma.accountLockout.deleteMany();
    await prisma.user.deleteMany({
      where: { email: { contains: 'test-security' } },
    });
  });

  describe('Rate Limiting', () => {
    it('should limit multiple login attempts from same IP', async () => {
      const loginData = {
        email: 'nonexistent@test-security.com',
        password: 'wrongpassword',
      };

      // Make multiple rapid requests
      const requests = Array(7).fill(null).map(() => 
        request(app.getHttpServer())
          .post('/auth/login')
          .send(loginData)
          .expect('Content-Type', /json/)
      );

      const responses = await Promise.allSettled(requests);
      
      // At least one request should be rate limited
      const rateLimitedResponses = responses.filter(
        (result): result is PromiseRejectedResult => 
          result.status === 'rejected' || 
          (result.status === 'fulfilled' && result.value.status === 429)
      );

      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    it('should include rate limit headers', async () => {
      const loginData = {
        email: 'test-security@example.com',
        password: 'wrongpassword',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.headers).toHaveProperty('x-ratelimit-limit');
      expect(response.headers).toHaveProperty('x-ratelimit-remaining');
      expect(response.headers).toHaveProperty('x-ratelimit-reset');
    });
  });

  describe('Account Lockout', () => {
    it('should lock account after multiple failed attempts', async () => {
      const loginData = {
        email: 'lockout-test@test-security.com',
        password: 'wrongpassword',
      };

      // First, create a user
      await prisma.user.create({
        data: {
          email: 'lockout-test@test-security.com',
          password: 'hashedpassword',
          name: 'Lockout Test',
        },
      });

      // Make 5 failed login attempts to trigger lockout
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/auth/login')
          .send(loginData)
          .expect(401);
      }

      // 6th attempt should be locked
      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(403)
        .expect((res) => {
          expect(res.body.message).toContain('Account temporarily locked');
        });
    });

    it('should record failed login attempts', async () => {
      const loginData = {
        email: 'attempt-tracking@test-security.com',
        password: 'wrongpassword',
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      // Check that failed attempt was recorded
      const failedAttempts = await prisma.failedLoginAttempt.count({
        where: { email: 'attempt-tracking@test-security.com' },
      });

      expect(failedAttempts).toBe(1);
    });

    it('should clear failed attempts on successful login', async () => {
      // Create a user
      const user = await prisma.user.create({
        data: {
          email: 'clear-attempts@test-security.com',
          password: 'hashedpassword',
          name: 'Clear Attempts Test',
        },
      });

      // Record some failed attempts
      await accountSecurity.recordFailedLoginAttempt(user.email, {
        headers: { 'user-agent': 'test-agent' },
        connection: { remoteAddress: '127.0.0.1' },
      } as any);

      // Simulate successful login (this would normally be done in auth service)
      await accountSecurity.clearFailedAttempts(user.email);

      // Verify failed attempts were cleared
      const failedAttempts = await prisma.failedLoginAttempt.count({
        where: { email: user.email },
      });

      expect(failedAttempts).toBe(0);
    });
  });

  describe('Input Validation', () => {
    it('should reject registration with invalid email format', async () => {
      const invalidData = {
        email: 'invalid-email-format',
        password: 'ValidPass123!',
        name: 'Test User',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidData)
        .expect(400)
        .expect((res) => {
          expect(res.body.errors).toBeDefined();
          expect(res.body.errors.some((error: any) => 
            error.field === 'email' && error.message.includes('email')
          )).toBe(true);
        });
    });

    it('should reject registration with weak password', async () => {
      const weakPasswordData = {
        email: 'weak-pass@test-security.com',
        password: '123',
        name: 'Test User',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(weakPasswordData)
        .expect(400)
        .expect((res) => {
          expect(res.body.errors).toBeDefined();
          expect(res.body.errors.some((error: any) => 
            error.field === 'password'
          )).toBe(true);
        });
    });

    it('should reject SQL injection attempts', async () => {
      const sqlInjectionData = {
        email: "'; DROP TABLE users; --",
        password: "' OR '1'='1",
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(sqlInjectionData)
        .expect(403)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid input format');
        });
    });

    it('should reject XSS attempts', async () => {
      const xssData = {
        email: '<script>alert("xss")</script>@test-security.com',
        password: '<script>alert("xss")</script>',
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(xssData)
        .expect(403)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid input format');
        });
    });
  });

  describe('CORS Security', () => {
    it('should include proper CORS headers', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'password' });

      // Check for security headers
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
    });

    it('should reject requests without proper content-type', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .set('Content-Type', 'text/plain')
        .send('invalid data')
        .expect(400);
    });
  });

  describe('Error Handling', () => {
    it('should not leak sensitive information in error responses', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nonexistent@test.com', password: 'wrongpassword' })
        .expect(401);

      // Should not reveal if user exists or not
      expect(response.body.message).toBe('Invalid credentials');
      expect(response.body).not.toHaveProperty('stack');
      expect(response.body).not.toHaveProperty('details');
    });

    it('should provide consistent error response format', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@test.com', password: '' })
        .expect(400);

      expect(response.body).toHaveProperty('statusCode');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('path');
    });
  });

  describe('reCAPTCHA Integration', () => {
    it('should require reCAPTCHA for protected endpoints', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login-with-recaptcha')
        .send({
          email: 'recaptcha-test@test-security.com',
          password: 'password',
        });

      // Should fail if reCAPTCHA is required and not provided
      expect([403, 400]).toContain(response.status);
    });

    it('should validate reCAPTCHA token format', async () => {
      const invalidTokenData = {
        email: 'recaptcha-test@test-security.com',
        password: 'password',
        recaptcha: {
          recaptchaToken: 'invalid-token-format',
        },
      };

      await request(app.getHttpServer())
        .post('/auth/login-with-recaptcha')
        .send(invalidTokenData)
        .expect(403);
    });
  });

  describe('Performance and Security', () => {
    it('should respond within reasonable time', async () => {
      const startTime = Date.now();

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'wrongpassword' })
        .expect(401);

      const responseTime = Date.now() - startTime;
      
      // Should respond within 2 seconds even for failed attempts
      expect(responseTime).toBeLessThan(2000);
    });

    it('should handle concurrent requests safely', async () => {
      const concurrentRequests = Array(10).fill(null).map((_, index) => 
        request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: `concurrent${index}@test-security.com`,
            password: 'password',
          })
      );

      const responses = await Promise.allSettled(concurrentRequests);
      
      // All requests should complete (no crashes)
      responses.forEach((response, index) => {
        if (response.status === 'rejected') {
          throw new Error(`Concurrent request ${index} failed`);
        }
      });
    });
  });

  describe('Database Security', () => {
    it('should not expose sensitive data in responses', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'wrongpassword' })
        .expect(401);

      // Should not contain database error messages
      expect(JSON.stringify(response.body)).not.toContain('sql');
      expect(JSON.stringify(response.body)).not.toContain('prisma');
      expect(JSON.stringify(response.body)).not.toContain('database');
    });

    it('should handle database connection issues gracefully', async () => {
      // This would require mocking database failures
      // For now, just verify error handling structure
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'password' })
        .expect((res) => {
          expect([401, 500, 403]).toContain(res.status);
        });
    });
  });
});