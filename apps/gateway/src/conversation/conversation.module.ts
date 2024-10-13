import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';

import { MessageModule } from '../message/message.module';
import { UserModule } from '../user/user.module';
import { ConversationResolver } from './conversation.resolver';
import { ConversationService } from './conversation.service';

@Module({
  imports: [
    HttpModule,
    forwardRef(() => UserModule),
    forwardRef(() => MessageModule),
  ],
  providers: [ConversationResolver, ConversationService],
  exports: [ConversationService],
})
export class ConversationModule {}
