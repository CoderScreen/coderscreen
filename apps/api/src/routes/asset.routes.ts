import { AppContext } from '@/index';
import { AssetSchema } from '@/schema/asset.zod';
import { AssetService } from '@/services/Asset.service';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { describeRoute } from 'hono-openapi';
import { resolver } from 'hono-openapi/zod';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';

export const assetRouter = new Hono<AppContext>()
	// PUT /assets/logo - Upload an organization logo
	.put(
		'/logo',
		describeRoute({
			description: 'Upload an organization logo',
			responses: {
				200: {
					description: 'Logo uploaded successfully',
					content: {
						'application/json': {
							schema: resolver(AssetSchema),
						},
					},
				},
			},
		}),
		zValidator(
			'json',
			z.object({
				data: z.string().describe('The base64 encoded image data'),
			}),
		),
		async (ctx) => {
			const assetService = new AssetService(ctx);
			const body = ctx.req.valid('json');

			// if data is over 10mb, return a 413 error
			if (body.data.length > 10 * 1024 * 1024) {
				throw new HTTPException(413, {
					message: 'Image is too large',
				});
			}

			const result = await assetService.uploadImage(body.data);
			return ctx.json(result, 201);
		},
	);
