import { Hono } from 'hono';
import { describeRoute } from 'hono-openapi';
import { resolver, validator as zValidator } from 'hono-openapi/zod';
import z from 'zod';
import { AppContext } from '..';

export const roomRouter = new Hono<AppContext>().get(
	'/',
	describeRoute({
		description: 'Say hello to the user',
		responses: {
			200: {
				description: 'Successful greeting response',
				content: {
					'text/plain': {
						schema: resolver(z.string()),
					},
				},
			},
		},
	}),
	zValidator(
		'query',
		z.object({
			roomId: z.string(),
		})
	),
	(ctx) => {
		const query = ctx.req.valid('query');
		return ctx.text(`Hello ${query?.roomId ?? 'Hono'}!`);
	}
);
