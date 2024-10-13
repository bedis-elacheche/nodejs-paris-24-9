import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

import { Config } from '../config';
import { CreateMessageInput, Message } from './message.model';

@Injectable()
export class MessageService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<Config>,
  ) {}

  async sendMessage(message: CreateMessageInput): Promise<Message> {
    const { data } = await firstValueFrom(
      this.httpService.post<Message>(
        `${this.configService.get('MS_CHAT_API_URL')}/messages`,
        message,
      ),
    );

    return data;
  }

  async getMessagesByConversationId(id: string): Promise<Message[]> {
    const { data } = await firstValueFrom(
      this.httpService.get<Message[]>(
        `${this.configService.get('MS_CHAT_API_URL')}/messages/conversation/${id}`,
      ),
    );

    return data;
  }
}
