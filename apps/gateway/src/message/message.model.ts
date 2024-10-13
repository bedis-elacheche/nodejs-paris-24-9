import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { GraphQLDateTime } from 'graphql-iso-date';

import { Conversation } from '../conversation/conversation.model';
import { User } from '../user/user.model';

@ObjectType({ description: 'Message schema' })
export class Message {
  @Field(() => GraphQLDateTime)
  createdAt: Date;

  @Field()
  content: string;

  authorId: User['_id'];

  @Field(() => User)
  author: User;
}

@InputType()
export class CreateMessageInput {
  @Field()
  content: string;

  @Field(() => ID)
  authorId: User['_id'];

  @Field(() => ID)
  conversationId: Conversation['id'];
}
