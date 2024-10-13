import { Module } from '@nestjs/common';

import { ConversationService } from '../conversation/conversation.service';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';

@Module({
  imports: [ConversationService],
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessageModule {}
