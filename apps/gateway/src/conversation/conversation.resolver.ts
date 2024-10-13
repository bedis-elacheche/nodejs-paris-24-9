import { forwardRef, Inject } from '@nestjs/common';
import {
  Args,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { Message } from '../message/message.model';
import { MessageService } from '../message/message.service';
import { User } from '../user/user.model';
import { UserService } from '../user/user.service';
import { Conversation, CreateConversationInput } from './conversation.model';
import { ConversationService } from './conversation.service';

@Resolver(() => Conversation)
export class ConversationResolver {
  constructor(
    private conversationService: ConversationService,
    @Inject(forwardRef(() => MessageService))
    private messageService: MessageService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  @Mutation(() => Conversation)
  createConversation(
    @Args('createConversationData') conversationData: CreateConversationInput,
  ) {
    return this.conversationService.createConversation(conversationData);
  }

  @Query(() => Conversation)
  conversation(@Args('id', { type: () => ID }) id: string) {
    return this.conversationService.getConversationById(id);
  }

  @Query(() => [Conversation])
  conversations(@Args('memberId', { type: () => ID }) id: string) {
    return this.conversationService.getConversationsByMemberId(id);
  }

  @ResolveField(() => User)
  creator(@Parent() { creatorId }: Conversation) {
    return this.userService.getUserById(creatorId);
  }

  @ResolveField(() => [User])
  members(@Parent() { memberIds }: Conversation) {
    return Promise.all(
      memberIds.map((memberId) => this.userService.getUserById(memberId)),
    );
  }

  @ResolveField(() => [Message])
  messages(@Parent() { id }: Conversation) {
    return this.messageService.getMessagesByConversationId(id);
  }
}
