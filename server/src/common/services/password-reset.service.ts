import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from './email.service';
import * as crypto from 'crypto';
import { ResetPasswordDto } from '../../auth/auth.dto';

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService
  ) {}

  async requestPasswordReset(email: string): Promise<void> {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      this.logger.log(`Password reset requested for non-existent email: ${email}`);
      return;
    }

    // Generate a secure 32-byte token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Delete any existing tokens for this user
    await this.prisma.passwordResetToken.deleteMany({
      where: { userId: user.id }
    });

    // Save new token to database
    await this.prisma.passwordResetToken.create({
      data: {
        token,
        email: email.toLowerCase(),
        expiresAt,
        userId: user.id
      }
    });

    // Send email with reset link
    await this.emailService.sendPasswordResetEmail(email, token, user.name);

    this.logger.log(`Password reset token generated for user: ${email}`);
  }

  async verifyToken(token: string): Promise<boolean> {
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!resetToken) {
      return false;
    }

    // Check if token has expired
    if (resetToken.expiresAt < new Date()) {
      // Clean up expired token
      await this.prisma.passwordResetToken.delete({
        where: { id: resetToken.id }
      });
      return false;
    }

    return true;
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { token, newPassword } = resetPasswordDto;

    // Find the reset token
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!resetToken) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Check if token has expired
    if (resetToken.expiresAt < new Date()) {
      await this.prisma.passwordResetToken.delete({
        where: { id: resetToken.id }
      });
      throw new BadRequestException('Reset token has expired');
    }

    // Hash the new password
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    await this.prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword }
    });

    // Delete the used token
    await this.prisma.passwordResetToken.delete({
      where: { id: resetToken.id }
    });

    this.logger.log(`Password reset successfully for user: ${resetToken.user.email}`);
  }

  async generateResetTokenEmail(email: string, userName?: string): Promise<string> {
    // This method is kept for backward compatibility but should use EmailService directly
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=RESET_TOKEN_PLACEHOLDER`;
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MITRA AI - Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 40px 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; margin: -20px -20px 0 0; }
          .logo { font-size: 24px; font-weight: bold; letter-spacing: 2px; margin-bottom: 8px; }
          .content { padding: 20px 0; }
          .reset-button { display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 20px; }
          .reset-button:hover { background-color: #2563eb; }
          .security-notice { background-color: #fef2f2; border: 1px solid #fbbf24; color: #92400e; padding: 12px; border-radius: 4px; margin-top: 20px; font-size: 12px; }
          .footer { text-align: center; margin-top: 40px; color: #64748b; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">MITRA AI</div>
            <h1>Password Reset Request</h1>
          </div>
          
          <div class="content">
            <p>Hello ${userName || 'there'},</p>
            
            <p>We received a request to reset the password for your MITRA AI account. Click the button below to set a new password:</p>
            
            <a href="${resetLink}" class="reset-button">Reset Your Password</a>
            
            <p>If you did not request this password reset, please ignore this email or contact our support team.</p>
            
            <p>This link will expire in 24 hours for your security.</p>
          </div>
          
          <div class="footer">
            <p>This is an automated message from MITRA AI. Please do not reply to this email.</p>
            <p>© 2026 MITRA AI. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return emailHtml;
  }
}