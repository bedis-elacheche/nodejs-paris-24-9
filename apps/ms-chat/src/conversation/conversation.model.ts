import { z } from 'zod';

export const ConversationSchema = z.object({
  id: z.string(),
  creatorId: z.string(),
  memberIds: z.array(z.string()),
  subject: z.string().optional(),
  createdAt: z.coerce.date(),
});

export type Conversation = z.infer<typeof ConversationSchema>;
