import { Hono } from 'hono';
import { describeRoute } from 'hono-openapi';
import { resolver, validator as zValidator } from 'hono-openapi/zod';
import { z } from 'zod';
import { SendSupportMessageSchema } from '@/schema/support.zod';
import { useAppFactory } from '@/services/AppFactory';
import { AppContext } from '..';

export const supportRouter = new Hono<AppContext>()
  // POST /support - Send a support message to the CoderScreen team
  .post(
    '/',
    describeRoute({
      description: 'Send a support message to the CoderScreen team',
      responses: {
        200: {
          description: 'Support message sent successfully',
          content: {
            'application/json': {
              schema: resolver(z.object({ success: z.boolean() })),
            },
          },
        },
      },
    }),
    zValidator('json', SendSupportMessageSchema),
    async (ctx) => {
      const { message } = ctx.req.valid('json');
      const user = ctx.get('user');
      const session = ctx.get('session');

      if (!user) {
        return ctx.json({ success: false }, 401);
      }

      const { resendService } = useAppFactory(ctx);
      await resendService.sendSupportMessage({
        user_name: user.name || user.email,
        user_email: user.email,
        user_id: user.id,
        org_id: session?.activeOrganizationId ?? null,
        message,
      });

      return ctx.json({ success: true });
    }
  );
