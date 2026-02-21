import { idString } from '@coderscreen/common/id';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { describeRoute } from 'hono-openapi';
import { resolver, validator as zValidator } from 'hono-openapi/zod';
import { z } from 'zod';
import { partyKitMiddleware } from '@/middleware/partyKit.middleware';
import { publicRoomMiddleware } from '@/middleware/room.middleware';
import { whiteboardRouter } from '@/routes/room/whiteboard.router';
import { PublicRoomSchema, RoomLanguageSchema } from '@/schema/room.zod';
import { ExecOutputSchema } from '@/schema/sandbox.zod';
import { getSandboxId } from '@/lib/sandbox';
import { PreviewService } from '@/sandbox/PreviewService';
import { CodeRunService } from '@/services/CodeRun.service';
import { RoomService } from '@/services/Room.service';
import { AppContext } from '../..';
import { getSandbox, proxyTerminal } from '@cloudflare/sandbox';

export const publicRoomRouter = new Hono<AppContext>()
  .use(publicRoomMiddleware)
  .use('/connect/*', partyKitMiddleware)
  .get(
    '/',
    describeRoute({
      description: 'Get public room	 info',
      responses: {
        200: {
          description: 'Room info',
          content: {
            'application/json': {
              schema: resolver(PublicRoomSchema),
            },
          },
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

      const roomService = new RoomService(ctx);
      const publicRoom = await roomService.getPublicRoom(roomId);

      if (!publicRoom) {
        throw new HTTPException(404, {
          message: 'Room not found',
        });
      }

      return ctx.json(publicRoom);
    }
  )
  // POST /rooms/:id/run - Run the code in the room
  .post(
    '/run',
    describeRoute({
      description: 'Run the code in the room',
      responses: {
        200: {
          description: 'Room code run successfully',
          content: {
            'application/json': {
              schema: resolver(ExecOutputSchema),
            },
          },
        },
      },
    }),
    zValidator(
      'param',
      z.object({
        roomId: idString('room'),
      })
    ),
    zValidator('json', z.object({ code: z.string(), language: RoomLanguageSchema })),
    async (ctx) => {
      const { roomId } = ctx.req.valid('param');
      const { code, language } = ctx.req.valid('json');

      const codeRunService = new CodeRunService(ctx);
      const result = await codeRunService.runCode({ roomId, code, language });

      return ctx.json(result);
    }
  )
  .post(
    '/stop',
    zValidator('param', z.object({ roomId: idString('room') })),
    async (ctx) => {
      const { roomId } = ctx.req.valid('param');
      const sandboxId = getSandboxId(roomId);
      const sandbox = getSandbox(ctx.env.SANDBOX, sandboxId, { normalizeId: true });
      await sandbox.killAllProcesses();
      return ctx.json({ success: true });
    }
  )
  .post(
    '/run/stream',
    zValidator('param', z.object({ roomId: idString('room') })),
    zValidator('json', z.object({ code: z.string(), language: RoomLanguageSchema })),
    async (ctx) => {
      const { roomId } = ctx.req.valid('param');
      const { code, language } = ctx.req.valid('json');

      const codeRunService = new CodeRunService(ctx);
      const stream = await codeRunService.runCodeStream({ roomId, code, language });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }
  )
  .get(
    '/terminal',
    zValidator('param', z.object({ roomId: idString('room') })),
    async (ctx) => {
      const { roomId } = ctx.req.valid('param');
      const sandboxId = getSandboxId(roomId);
      const sandbox = getSandbox(ctx.env.SANDBOX, sandboxId, { normalizeId: true });
      const cols = parseInt(ctx.req.query('cols') || '80');
      const rows = parseInt(ctx.req.query('rows') || '24');
      return proxyTerminal(sandbox, 'default', ctx.req.raw, { cols, rows });
    }
  )
  .post(
    '/preview/start',
    zValidator('param', z.object({ roomId: idString('room') })),
    zValidator('json', z.object({ language: z.enum(['react', 'vue', 'svelte']) })),
    async (ctx) => {
      const { roomId } = ctx.req.valid('param');
      const { language } = ctx.req.valid('json');

      const previewService = new PreviewService();
      const result = await previewService.startPreview({
        sandboxBinding: ctx.env.SANDBOX,
        roomId,
        language,
        hostname: ctx.env.PREVIEW_HOSTNAME,
        useTunnel: !!ctx.env.USE_TUNNEL_FOR_PREVIEW,
      });

      return ctx.json(result);
    }
  )
  .post(
    '/preview/stop',
    zValidator('param', z.object({ roomId: idString('room') })),
    async (ctx) => {
      const { roomId } = ctx.req.valid('param');

      const previewService = new PreviewService();
      await previewService.stopPreview({
        sandboxBinding: ctx.env.SANDBOX,
        roomId,
      });

      return ctx.json({ success: true });
    }
  )
  .post(
    '/chat',
    describeRoute({
      description: 'Chat with the AI',
    }),
    zValidator('param', z.object({ roomId: idString('room') })),
    zValidator(
      'json',
      z.object({
        userMessage: z.object({
          id: z.string(),
          timestamp: z.number(),
          role: z.enum(['user', 'assistant', 'system']),
          content: z.string(),
          isStreaming: z.boolean(),
          user: z.object({
            id: z.string(),
            name: z.string(),
            color: z.string(),
            email: z.string(),
          }),
          success: z.literal(true),
          conversationId: z.string(),
        }),
        assistantMessage: z.object({
          id: z.string(),
          timestamp: z.number(),
          role: z.enum(['user', 'assistant', 'system']),
          content: z.string(),
          isStreaming: z.boolean(),
          user: z.null(),
          success: z.literal(true),
          conversationId: z.string(),
        }),
      })
    ),
    async (ctx) => {
      const { roomId } = ctx.req.valid('param');
      const params = ctx.req.valid('json');

      const roomService = new RoomService(ctx);

      await roomService.aiChat({
        roomId,
        ...params,
      });

      return ctx.json({ message: 'Chat with the AI' });
    }
  )
  .route('/whiteboard', whiteboardRouter);
