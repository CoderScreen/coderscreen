import { z } from 'zod';

export const UsageResultSchema = z.object({
  eventType: z.enum(['live_interview', 'assessment_invite', 'team_members']),
  count: z.number(),
  limit: z.number(),
  exceeded: z.boolean(),
});

export type UsageResultSchema = z.infer<typeof UsageResultSchema>;
