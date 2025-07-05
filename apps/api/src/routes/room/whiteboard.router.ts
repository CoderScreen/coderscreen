import { z } from 'zod';
import { Hono } from 'hono';
import { describeRoute } from 'hono-openapi';
import { resolver, validator as zValidator } from 'hono-openapi/zod';
import { AppContext } from '../..';
import { idString } from '@coderscreen/common/id';

// Schema definitions for OpenAPI
const UploadResponseSchema = z.object({
	success: z.boolean(),
	url: z.string().optional(),
	error: z.string().optional(),
});

const UnfurlResponseSchema = z.object({
	title: z.string().optional(),
	description: z.string().optional(),
	image: z.string().optional(),
	url: z.string(),
});

export const whiteboardRouter = new Hono<AppContext>()
	// GET /whiteboard/connect - Connect to the whiteboard websocket
	.get(
		'/connect',
		describeRoute({
			description: 'Connect to the whiteboard websocket for realtime syncing',
			responses: {
				101: {
					description: 'Websocket connected',
				},
			},
		}),
		zValidator(
			'param',
			z.object({
				roomId: idString('room'),
			})
		),
		async (ctx) => {
			const { roomId } = ctx.req.valid('param');

			// Route to the Whiteboard Durable Object for realtime websocket syncing
			// Note: WHITEBOARD_DO needs to be added to the environment bindings
			const whiteboardDo = (ctx.env as any).WHITEBOARD_DO;
			if (!whiteboardDo) {
				return ctx.json({ error: 'Whiteboard service not available' }, 503);
			}

			const id = whiteboardDo.idFromName(roomId);
			const room = whiteboardDo.get(id);

			return room.fetch(ctx.req.raw, {
				headers: ctx.req.raw.headers,
				body: ctx.req.raw.body,
			});
		}
	)
	// POST /whiteboard/uploads/:uploadId - Upload assets to the bucket
	.post(
		'/uploads/:uploadId',
		describeRoute({
			description: 'Upload assets to the whiteboard bucket',
			responses: {
				200: {
					description: 'Asset uploaded successfully',
					content: {
						'application/json': {
							schema: resolver(UploadResponseSchema),
						},
					},
				},
			},
		}),
		zValidator(
			'param',
			z.object({
				uploadId: z.string(),
			})
		),
		async (ctx) => {
			const { uploadId } = ctx.req.valid('param');

			try {
				// Get the file data from the request
				const formData = await ctx.req.formData();
				const file = formData.get('file') as File;

				if (!file) {
					return ctx.json({ success: false, error: 'No file provided' }, 400);
				}

				// Upload to the whiteboard assets bucket
				await ctx.env.WHITEBOARD_ASSETS_BUCKET.put(uploadId, file, {
					httpMetadata: {
						contentType: file.type,
					},
				});

				const url = `${ctx.env.ASSETS_URL}/whiteboard/uploads/${uploadId}`;

				return ctx.json({ success: true, url });
			} catch (error) {
				console.error('Error uploading asset:', error);
				return ctx.json({ success: false, error: 'Upload failed' }, 500);
			}
		}
	)
	// GET /whiteboard/uploads/:uploadId - Download assets from the bucket
	.get(
		'/uploads/:uploadId',
		describeRoute({
			description: 'Download assets from the whiteboard bucket',
			responses: {
				200: {
					description: 'Asset downloaded successfully',
					content: {
						'application/octet-stream': {
							schema: {
								type: 'string',
								format: 'binary',
							},
						},
					},
				},
				404: {
					description: 'Asset not found',
				},
			},
		}),
		zValidator(
			'param',
			z.object({
				uploadId: z.string(),
			})
		),
		async (ctx) => {
			const { uploadId } = ctx.req.valid('param');

			try {
				const object = await ctx.env.WHITEBOARD_ASSETS_BUCKET.get(uploadId);

				if (!object) {
					return ctx.json({ error: 'Asset not found' }, 404);
				}

				// Return the asset with appropriate headers
				const headers = new Headers();
				if (object.httpMetadata?.contentType) {
					headers.set('Content-Type', object.httpMetadata.contentType);
				}
				headers.set('Content-Length', object.size.toString());
				headers.set('Cache-Control', 'public, max-age=31536000'); // 1 year cache

				return new Response(object.body, {
					headers,
					status: 200,
				});
			} catch (error) {
				console.error('Error downloading asset:', error);
				return ctx.json({ error: 'Download failed' }, 500);
			}
		}
	)
	// GET /whiteboard/unfurl - Extract metadata from pasted URLs
	.get(
		'/unfurl',
		describeRoute({
			description: 'Extract metadata from pasted URLs for bookmarks',
			responses: {
				200: {
					description: 'URL metadata extracted successfully',
					content: {
						'application/json': {
							schema: resolver(UnfurlResponseSchema),
						},
					},
				},
			},
		}),
		zValidator(
			'query',
			z.object({
				url: z.string().url(),
			})
		),
		async (ctx) => {
			const { url } = ctx.req.valid('query');

			try {
				// Fetch the URL to extract metadata
				const response = await fetch(url, {
					headers: {
						'User-Agent': 'Mozilla/5.0 (compatible; WhiteboardBot/1.0)',
					},
				});

				if (!response.ok) {
					return ctx.json({ error: 'Failed to fetch URL' }, 400);
				}

				const html = await response.text();

				// Extract metadata using regex patterns
				const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
				const descriptionMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
				const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
				const twitterImageMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i);

				const title = titleMatch ? titleMatch[1].trim() : undefined;
				const description = descriptionMatch ? descriptionMatch[1].trim() : undefined;
				const image = ogImageMatch ? ogImageMatch[1] : twitterImageMatch ? twitterImageMatch[1] : undefined;

				return ctx.json({
					title,
					description,
					image,
					url,
				});
			} catch (error) {
				console.error('Error unfurling URL:', error);
				return ctx.json({ error: 'Failed to extract metadata' }, 500);
			}
		}
	);
