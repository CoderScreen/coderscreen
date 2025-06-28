import { z } from 'zod';
import { idString } from '@coderscreen/common/id';

export const CreateOrganizationSchema = z.object({
	name: z.string().min(1, 'Organization name is required').max(100, 'Organization name must be less than 100 characters'),
	slug: z
		.string()
		.min(1, 'Organization slug is required')
		.max(50, 'Organization slug must be less than 50 characters')
		.regex(/^[a-z0-9-]+$/, 'Organization slug can only contain lowercase letters, numbers, and hyphens'),
	logo: z.string().url('Please enter a valid URL').optional(),
});

export const OrganizationSchema = z.object({
	id: idString('organization'),
	name: z.string(),
	slug: z.string().optional(),
	logo: z.string().optional(),
	createdAt: z.string().datetime(),
	metadata: z.string().optional(),
});

export type CreateOrganizationSchema = z.infer<typeof CreateOrganizationSchema>;
export type OrganizationSchema = z.infer<typeof OrganizationSchema>;
