import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PasswordResetController } from './password-reset.controller';
import { JwtStrategy } from '../common/guards/jwt.strategy';
import { RecaptchaService } from '../common/services/recaptcha.service';
import { AccountSecurityService } from '../common/services/account-security.service';
import { EmailService } from '../common/services/email.service';
import { PasswordResetService } from '../common/services/password-reset.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret-key-change-in-production',
      signOptions: { expiresIn: '7d' },
    }),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    ConfigModule,
  ],
  controllers: [AuthController, PasswordResetController],
  providers: [
    AuthService, 
    JwtStrategy, 
    RecaptchaService, 
    AccountSecurityService,
    EmailService,
    PasswordResetService
  ],
  exports: [AuthService, RecaptchaService, AccountSecurityService, EmailService, PasswordResetService],
})
export class AuthModule {}
