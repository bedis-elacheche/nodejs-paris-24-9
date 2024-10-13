import { z } from 'zod';

export const ConfigSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.number().positive().max(65535).default(3000),
  DB_URL: z.string().url().default('mongodb://localhost:27017/ms-users'),
});

export type Config = z.infer<typeof ConfigSchema>;
