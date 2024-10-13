import { forwardRef, Inject } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { User } from '../user/user.model';
import { UserService } from '../user/user.service';
import { CreateMessageInput, Message } from './message.model';
import { MessageService } from './message.service';

@Resolver(() => Message)
export class MessageResolver {
  constructor(
    private messageService: MessageService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  @Mutation(() => Message)
  sendMessage(@Args('sendMessageData') messageData: CreateMessageInput) {
    return this.messageService.sendMessage(messageData);
  }

  @ResolveField(() => User)
  author(@Parent() { authorId }: Message) {
    return this.userService.getUserById(authorId);
  }
}
