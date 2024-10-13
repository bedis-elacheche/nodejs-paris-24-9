import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';

import { ConversationModule } from '../conversation/conversation.module';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

@Module({
  imports: [HttpModule, forwardRef(() => ConversationModule)],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UserModule {}
