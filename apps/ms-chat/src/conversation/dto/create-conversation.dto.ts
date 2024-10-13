export interface CreateConversationDto {
  readonly subject: string;
  readonly creatorId: string;
  readonly memberIds: string[];
}
