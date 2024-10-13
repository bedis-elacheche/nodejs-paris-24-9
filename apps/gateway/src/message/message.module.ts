import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';

import { UserModule } from '../user/user.module';
import { MessageResolver } from './message.resolver';
import { MessageService } from './message.service';

@Module({
  imports: [HttpModule, forwardRef(() => UserModule)],
  providers: [MessageService, MessageResolver],
  exports: [MessageService],
})
export class MessageModule {}
