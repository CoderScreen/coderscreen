import { Hono } from 'hono';
import { describeRoute } from 'hono-openapi';
import { resolver, validator as zValidator } from 'hono-openapi/zod';
import { z } from 'zod';
import { AppContext } from '..';
import { TemplateService } from '@/services/Template.service';
import { TemplateSchema } from '@/schema/template.zod';
import { idString } from '@coderscreen/common/id';

export const templateRouter = new Hono<AppContext>()
	// GET /templates - List all templates
	.get(
		'/',
		describeRoute({
			description: 'Get all templates',
			responses: {
				200: {
					description: 'List of templates',
					content: {
						'application/json': {
							schema: resolver(z.array(TemplateSchema)),
						},
					},
				},
			},
		}),
		async (ctx) => {
			const templateService = new TemplateService(ctx);
			const templates = await templateService.listTemplates();
			return ctx.json(templates);
		},
	)
	// POST /templates - Create a new template
	.post(
		'/',
		describeRoute({
			description: 'Create a new template',
			responses: {
				200: {
					description: 'Template created successfully',
					content: {
						'application/json': {
							schema: resolver(TemplateSchema),
						},
					},
				},
			},
		}),
		zValidator('json', TemplateSchema.omit({ id: true, createdAt: true, updatedAt: true })),
		async (ctx) => {
			const templateService = new TemplateService(ctx);
			const body = ctx.req.valid('json');

			const result = await templateService.createTemplate({
				...body,
			});

			return ctx.json(result, 201);
		},
	)
	// GET /templates/:id - Get a specific template
	.get(
		'/:id',
		describeRoute({
			description: 'Get a specific template by ID',
			responses: {
				200: {
					description: 'Template details',
					content: {
						'application/json': {
							schema: resolver(TemplateSchema),
						},
					},
				},
				404: {
					description: 'Template not found',
				},
			},
		}),
		zValidator(
			'param',
			z.object({
				id: idString('template'),
			}),
		),
		async (ctx) => {
			const templateService = new TemplateService(ctx);
			const { id } = ctx.req.valid('param');
			const template = await templateService.getTemplate(id);

			if (!template) {
				return ctx.json({ error: 'Template not found' }, 404);
			}

			return ctx.json(template);
		},
	)
	// PATCH /templates/:id - Update a template
	.patch(
		'/:id',
		describeRoute({
			description: 'Update a template',
			responses: {
				200: {
					description: 'Template updated successfully',
					content: {
						'application/json': {
							schema: resolver(TemplateSchema),
						},
					},
				},
				404: {
					description: 'Template not found',
				},
			},
		}),
		zValidator(
			'param',
			z.object({
				id: idString('template'),
			}),
		),
		zValidator('json', TemplateSchema.partial()),
		async (ctx) => {
			const templateService = new TemplateService(ctx);
			const { id } = ctx.req.valid('param');
			const body = ctx.req.valid('json');

			const result = await templateService.updateTemplate(id, body);
			return ctx.json(result);
		},
	)
	// DELETE /templates/:id - Delete a template
	.delete(
		'/:id',
		describeRoute({
			description: 'Delete a template',
			responses: {
				200: {
					description: 'Template deleted successfully',
				},
			},
		}),
		zValidator(
			'param',
			z.object({
				id: idString('template'),
			}),
		),
		async (ctx) => {
			const templateService = new TemplateService(ctx);
			const { id } = ctx.req.valid('param');

			await templateService.deleteTemplate(id);
			return ctx.json(null, 200);
		},
	);
