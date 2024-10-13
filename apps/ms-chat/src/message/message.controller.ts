import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { CreateMessageDto } from './dto/create-message.dto';
import type { Message } from './message.model';
import { MessageService } from './message.service';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  async create(@Body() createMessageDto: CreateMessageDto) {
    return this.messageService.create(createMessageDto);
  }

  @Get('/conversation/:id')
  async findByMemberId(@Param('id') id: string): Promise<Message[]> {
    return this.messageService.findByConversationId(id);
  }
}
