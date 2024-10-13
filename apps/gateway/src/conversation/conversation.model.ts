import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { GraphQLDateTime } from 'graphql-iso-date';

import { Message } from '../message/message.model';
import { User } from '../user/user.model';

@ObjectType({ description: 'Coversation schema' })
export class Conversation {
  @Field(() => ID, { name: 'id' })
  id: string;

  @Field(() => GraphQLDateTime)
  createdAt: Date;

  creatorId: User['_id'];

  @Field(() => User)
  creator: User;

  memberIds: User['_id'][];

  @Field(() => [User])
  members: User[];

  @Field(() => [Message], { nullable: 'items' })
  messages: Message[];
}

@InputType()
export class CreateConversationInput {
  @Field(() => ID)
  creatorId: User['_id'];

  @Field(() => [ID])
  memberIds: User['_id'][];

  @Field(() => String, { nullable: true })
  subject?: string;
}
