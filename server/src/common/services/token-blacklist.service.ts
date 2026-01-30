import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface TokenBlacklist {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
}

@Injectable()
export class TokenBlacklistService {
  constructor(private prisma: PrismaService) {}

  async addToBlacklist(token: string, userId: string): Promise<void> {
    // Extract token payload to get expiry
    const [header, payload, signature] = token.split('.');
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString());
    const tokenExpiry = new Date(decodedPayload.exp * 1000);

    await this.prisma.blacklistedToken.create({
      data: {
        token: this.hashToken(token),
        userId,
        expiresAt: tokenExpiry,
        createdAt: new Date(),
      },
    });

    // Clean up expired tokens periodically
    await this.cleanupExpiredTokens();
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const tokenHash = this.hashToken(token);
    const blacklistedToken = await this.prisma.blacklistedToken.findFirst({
      where: {
        token: tokenHash,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    return !!blacklistedToken;
  }

  private hashToken(token: string): string {
    // Use crypto to hash the token (in a real implementation)
    // For now, using simple hash - in production, use proper hashing
    return require('crypto').createHash('sha256').update(token).digest('hex');
  }

  private async cleanupExpiredTokens(): Promise<void> {
    await this.prisma.blacklistedToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}