import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { AiModule } from './ai/ai.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { MediaModule } from './media/media.module';
import { AdminModule } from './admin/admin.module';
import { GamificationModule } from './gamification/gamification.module';
import { LibraryModule } from './library/library.module';
import { AIChatModule } from './ai/ai-chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    ProjectsModule,
    AiModule,
    AnalyticsModule,
    MediaModule,
    AdminModule,
    GamificationModule,
    LibraryModule,
    AIChatModule,
  ],
})
export class AppModule { }
