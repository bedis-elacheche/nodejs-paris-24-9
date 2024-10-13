import { z } from 'zod';

export const ConfigSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.number().positive().max(65535).default(3000),
  MS_USERS_API_URL: z.string().url().default('http://localhost:3001'),
  MS_CHAT_API_URL: z.string().url().default('http://localhost:3002'),
});

export type Config = z.infer<typeof ConfigSchema>;
