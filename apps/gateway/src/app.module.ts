import { YogaDriver, type YogaDriverConfig } from '@graphql-yoga/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';

import { ConfigSchema } from './config';
import { ConversationModule } from './conversation/conversation.module';
import { MessageModule } from './message/message.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: ConfigSchema.parse,
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    UserModule,
    MessageModule,
    ConversationModule,
    GraphQLModule.forRoot<YogaDriverConfig>({
      driver: YogaDriver,
      autoSchemaFile: 'schema.gql',
    }),
  ],
})
export class AppModule {}
