import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // For development, use ethereal.email (test email service)
    if (this.configService.get('NODE_ENV') === 'development') {
      this.createTestAccount().then(account => {
        this.transporter = nodemailer.createTransport({
          host: account.smtp.host,
          port: account.smtp.port,
          secure: account.smtp.secure,
          auth: {
            user: account.user,
            pass: account.pass,
          },
        });
        
        this.logger.log(`Test email account created: ${account.user} / ${account.pass}`);
        this.logger.log(`Preview URL: ${(account as any).url || 'No URL available'}`);
      });
    } else {
      // In production, configure with real SMTP settings
      this.transporter = nodemailer.createTransport({
        host: this.configService.get('SMTP_HOST'),
        port: parseInt(this.configService.get('SMTP_PORT') || '587'),
        secure: this.configService.get('SMTP_SECURE') === 'true',
        auth: {
          user: this.configService.get('SMTP_USER'),
          pass: this.configService.get('SMTP_PASS'),
        },
      });
    }
  }

  private async createTestAccount() {
    return await nodemailer.createTestAccount();
  }

  async sendPasswordResetEmail(email: string, resetToken: string, userName?: string) {
    const resetLink = `${this.configService.get('FRONTEND_URL') || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const htmlContent = `
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
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p>${resetLink}</p>
            
            <div class="security-notice">
              <strong>Security Notice:</strong> If you did not request this password reset, please ignore this email or contact our support team immediately.
            </div>
            
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

    const textContent = `
      MITRA AI - Password Reset Request
      
      Hello ${userName || 'there'},
      
      We received a request to reset the password for your MITRA AI account. 
      Please visit this link to set a new password:
      
      ${resetLink}
      
      This link will expire in 24 hours for your security.
      
      If you did not request this password reset, please ignore this email or contact our support team immediately.
      
      © 2026 MITRA AI. All rights reserved.
    `;

    const mailOptions = {
      from: this.configService.get('EMAIL_FROM') || '"MITRA AI" <noreply@mitra-ai.com>',
      to: email,
      subject: 'MITRA AI - Password Reset Request',
      text: textContent,
      html: htmlContent,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      
      if (this.configService.get('NODE_ENV') === 'development') {
        this.logger.log(`Email sent to ${email}`);
        this.logger.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
      
      return { success: true, message: 'Email sent successfully' };
    } catch (error) {
      this.logger.error(`Failed to send email to ${email}`, error);
      return { success: false, error: error.message };
    }
  }
}