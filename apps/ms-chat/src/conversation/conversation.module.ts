import { Module } from '@nestjs/common';

import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';

@Module({
  providers: [ConversationService],
  controllers: [ConversationController],
})
export class ConversationModule {}
