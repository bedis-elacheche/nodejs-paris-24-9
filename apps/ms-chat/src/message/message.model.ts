import { z } from 'zod';

export const MessageSchema = z.object({
  id: z.string(),
  authorId: z.string(),
  conversationId: z.string(),
  content: z.string(),
  createdAt: z.coerce.date(),
});

export type Message = z.infer<typeof MessageSchema>;
