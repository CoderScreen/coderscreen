import { idString } from '@coderscreen/common/id';
import { z } from 'zod';

export const AssetSchema = z.object({
  id: idString('asset'),
  createdAt: z.string(),
  organizationId: z.string(),
  userId: z.string(),
  url: z.string(),
  type: z.string(),
});

export type AssetSchema = z.infer<typeof AssetSchema>;
