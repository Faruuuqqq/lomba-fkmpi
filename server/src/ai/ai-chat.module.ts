import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AIChatController } from './ai-chat.controller';
import { AIChatService } from './ai-chat.service';

@Module({
  imports: [HttpModule],
  controllers: [AIChatController],
  providers: [AIChatService],
  exports: [AIChatService],
})
export class AIChatModule {}