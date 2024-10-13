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

import { Conversation } from '../conversation/conversation.model';
import { ConversationService } from '../conversation/conversation.service';
import { CreateUserInput, User } from './user.model';
import { UserService } from './user.service';

@Resolver(() => User)
export class UserResolver {
  constructor(
    private userService: UserService,
    @Inject(forwardRef(() => ConversationService))
    private conversationService: ConversationService,
  ) {}

  @Mutation(() => User)
  signup(@Args('createUserData') createUserData: CreateUserInput) {
    return this.userService.createUser(createUserData);
  }

  @Query(() => User)
  user(@Args('id', { type: () => ID }) id: string) {
    return this.userService.getUserById(id);
  }

  @Query(() => [User])
  users() {
    return this.userService.getAllUsers();
  }

  @ResolveField(() => [Conversation])
  conversations(@Parent() { _id }: User) {
    return this.conversationService.getConversationsByMemberId(_id);
  }
}
