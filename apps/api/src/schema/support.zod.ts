import { z } from 'zod';

export const SendSupportMessageSchema = z.object({
  message: z.string().min(1).max(5000),
});

export type SendSupportMessageSchema = z.infer<typeof SendSupportMessageSchema>;
