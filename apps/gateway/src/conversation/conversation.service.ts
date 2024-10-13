import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

import { Config } from '../config';
import { Conversation, CreateConversationInput } from './conversation.model';

@Injectable()
export class ConversationService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<Config>,
  ) {}

  async createConversation(
    message: CreateConversationInput,
  ): Promise<Conversation> {
    const { data } = await firstValueFrom(
      this.httpService.post<Conversation>(
        `${this.configService.get('MS_CHAT_API_URL')}/conversations`,
        message,
      ),
    );

    return data;
  }

  async getConversationById(id: string) {
    const { data } = await firstValueFrom(
      this.httpService.get<Conversation>(
        `${this.configService.get('MS_CHAT_API_URL')}/conversations/${id}`,
      ),
    );

    return data;
  }

  async getConversationsByMemberId(id: string) {
    const { data } = await firstValueFrom(
      this.httpService.get<Conversation[]>(
        `${this.configService.get('MS_CHAT_API_URL')}/conversations/member/${id}`,
      ),
    );

    return data;
  }
}
