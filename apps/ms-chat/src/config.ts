import { z } from 'zod';

export const ConfigSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.number().positive().max(65535).default(3000),
  KV_STORE_URL: z.string().url().default('redis://localhost:6379/0'),
});

export type Config = z.infer<typeof ConfigSchema>;
