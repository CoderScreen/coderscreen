import { idString } from '@coderscreen/common/id';
import { z } from 'zod';

export const TemplateSchema = z.object({
  id: idString('template'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  title: z.string(),
  code: z.string(),
  language: z.enum(['typescript', 'javascript', 'python', 'rust', 'c++']),
  instructions: z.record(z.any()),
});

export type TemplateSchema = z.infer<typeof TemplateSchema>;
