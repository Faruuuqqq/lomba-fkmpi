import { Controller, Post, Get, Body, Param, BadRequestException } from '@nestjs/common';
import { ResetPasswordDto } from './auth.dto';
import { PasswordResetService } from '../common/services/password-reset.service';

@Controller('auth/password-reset')
export class PasswordResetController {
  constructor(private passwordResetService: PasswordResetService) {}

  @Post('request-reset')
  async requestPasswordReset(@Body() body: { email: string }) {
    if (!body.email) {
      throw new BadRequestException('Email is required');
    }

    await this.passwordResetService.requestPasswordReset(body.email);
    
    return {
      message: 'If the email exists in our system, a password reset link has been sent.',
      // In development, include the token for testing
      ...(process.env.NODE_ENV !== 'production' && {
        development: true,
        note: 'Check console for reset token'
      })
    };
  }

  @Post('reset')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    if (!dto.token || !dto.newPassword) {
      throw new BadRequestException('Token and new password are required');
    }

    await this.passwordResetService.resetPassword(dto);
    
    return {
      message: 'Password has been reset successfully'
    };
  }

  @Get('verify/:token')
  async verifyToken(@Param('token') token: string) {
    // This endpoint can be used by the frontend to check if a token is valid
    // before showing the password reset form
    const isValid = await this.passwordResetService.verifyToken(token);
    
    return {
      isValid,
      message: isValid ? 'Token is valid' : 'Token is invalid or expired'
    };
  }
}