import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ObjectId } from 'bson';
import { Cache } from 'cache-manager';

import { CreateMessageDto } from './dto/create-message.dto';
import { Message, MessageSchema } from './message.model';

@Injectable()
export class MessageService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async create(createMessageDto: CreateMessageDto) {
    const item: Message = {
      ...createMessageDto,
      id: new ObjectId().toString(),
      createdAt: new Date(),
    };

    const SECOND = 1000;
    const MINUTE = SECOND * 60;
    const HOUR = MINUTE * 60;
    const DAY = HOUR * 24;

    await this.cacheManager.set(
      `message:${item.conversationId}:${item.id}`,
      item,
      7 * DAY,
    );

    return item;
  }

  async findByConversationId(id: string): Promise<Message[]> {
    const keys = await this.cacheManager.store.keys(`message:${id}:*`);

    if (!keys.length) {
      return [];
    }

    const messages = await this.cacheManager.store.mget(...keys);

    return messages
      .map((item) => MessageSchema.parse(item))
      .sort((a, b) => a.createdAt.valueOf() - b.createdAt.valueOf());
  }
}
