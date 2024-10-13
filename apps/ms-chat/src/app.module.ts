import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';

import { Config, ConfigSchema } from './config';
import { ConversationModule } from './conversation/conversation.module';
import { MessageModule } from './message/message.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: ConfigSchema.parse,
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<Config, true>) => ({
        store: await redisStore({
          url: configService.get('KV_STORE_URL'),
        }),
      }),
      isGlobal: true,
    }),
    ConversationModule,
    MessageModule,
  ],
})
export class AppModule {}
