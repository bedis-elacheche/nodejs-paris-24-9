export interface CreateMessageDto {
  readonly authorId: string;
  readonly conversationId: string;
  readonly content: string;
}
