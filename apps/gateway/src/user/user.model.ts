import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql';

import { Conversation } from '../conversation/conversation.model';

@ObjectType({ description: 'User schema' })
export class User {
  @Field(() => ID, { name: 'id' })
  _id: string;

  @Field()
  username: string;

  @Field()
  firstname: string;

  @Field()
  lastname: string;

  @Field(() => Int)
  age: number;

  @Field(() => [Conversation], { nullable: 'items' })
  conversations: Conversation[];
}

@InputType()
export class CreateUserInput {
  @Field()
  username: string;

  @Field()
  password: string;

  @Field()
  firstname: string;

  @Field()
  lastname: string;

  @Field(() => Int)
  age: number;
}
