import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ObjectId } from 'bson';
import { Cache } from 'cache-manager';

import { Conversation, ConversationSchema } from './conversation.model';
import { CreateConversationDto } from './dto/create-conversation.dto';

@Injectable()
export class ConversationService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  private async addConversationToMember(
    memberId: string,
    conversationId: string,
  ) {
    const memberConversationIds =
      (await this.cacheManager.get<string[]>(`member:${memberId}`)) || [];

    await this.cacheManager.set(
      `member:${memberId}`,
      [...new Set([...memberConversationIds, conversationId])],
      0,
    );
  }

  async create(
    createConversationDto: CreateConversationDto,
  ): Promise<Conversation> {
    const item: Conversation = {
      ...createConversationDto,
      id: new ObjectId().toString(),
      createdAt: new Date(),
    };

    await this.cacheManager.set(`conversation:${item.id}`, item, 0);

    this.addConversationToMember(createConversationDto.creatorId, item.id);

    await Promise.all(
      createConversationDto.memberIds.map((memberId) =>
        this.addConversationToMember(memberId, item.id),
      ),
    );

    return item;
  }

  async findById(id: string): Promise<Conversation | null> {
    const conversation = await this.cacheManager.get(`conversation:${id}`);

    return conversation ? ConversationSchema.parse(conversation) : null;
  }

  async findByMemberId(id: string): Promise<Conversation[]> {
    const memberConversationIds =
      (await this.cacheManager.get<string[]>(`member:${id}`)) || [];

    if (!memberConversationIds.length) {
      return [];
    }

    const items = await this.cacheManager.store.mget(
      ...memberConversationIds.map(
        (conversationId) => `conversation:${conversationId}`,
      ),
    );

    return items.map((item) => ConversationSchema.parse(item));
  }
}
