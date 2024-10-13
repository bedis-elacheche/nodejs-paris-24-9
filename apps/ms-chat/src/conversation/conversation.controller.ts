import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';

import type { Conversation } from './conversation.model';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './dto/create-conversation.dto';

@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  async create(@Body() createConversationDto: CreateConversationDto) {
    return this.conversationService.create(createConversationDto);
  }

  @Get('/:id')
  async findById(@Param('id') id: string): Promise<Conversation> {
    const conversation = await this.conversationService.findById(id);

    if (!conversation) {
      throw new NotFoundException();
    }

    return conversation;
  }

  @Get('/member/:id')
  async findByMemberId(@Param('id') id: string): Promise<Conversation[]> {
    return this.conversationService.findByMemberId(id);
  }
}
