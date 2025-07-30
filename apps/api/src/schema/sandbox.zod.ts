import { z } from 'zod';

export const ExecOutputSchema = z.object({
  success: z.boolean(),
  timestamp: z.string(),
  stdout: z.string(),
  stderr: z.string(),
  exitCode: z.number(),
  elapsedTime: z.number(),
  compileTime: z.number().optional(),
});
