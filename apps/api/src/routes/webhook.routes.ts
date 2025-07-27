import { Hono } from 'hono';
import { describeRoute } from 'hono-openapi';
import { validator as zValidator } from 'hono-openapi/zod';
import Stripe from 'stripe';
import z from 'zod';
import { AppContext } from '@/index';
import { BillingService } from '@/services/billing/Billing.service';
import { StripeService } from '@/services/third-party/Stripe.service';

export const webhookRouter = new Hono<AppContext>().post(
  '/stripe',
  describeRoute({
    description: 'Stripe webhook',
    responses: {
      200: {
        description: 'Stripe webhook',
      },
    },
  }),
  zValidator(
    'header',
    z.object({
      'stripe-signature': z.string(),
    })
  ),
  async (ctx) => {
    const headers = ctx.req.valid('header');
    const signature = headers['stripe-signature'];

    let event: Stripe.Event | null = null;

    if (!signature) {
      return ctx.text('No signature provided', 401);
    }

    const stripeService = new StripeService(ctx);
    const billingService = new BillingService(ctx);

    try {
      const body = await ctx.req.text();

      event = await stripeService.constructEvent({
        payload: body,
        signature,
      });
    } catch (err) {
      const errorMessage = `⚠️ Webhook signature verification failed. ${
        err instanceof Error ? err.message : 'Internal server error'
      }`;
      console.log(errorMessage);
      return ctx.text(errorMessage, 400);
    }

    if (!event) {
      return ctx.text('No event found', 400);
    }

    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          await billingService.upsertSubscriptionFromEvent(event);
          break;
        default:
          return ctx.text(`Unsupported event ${event.id} of type ${event.type}.`, 400);
      }
      return ctx.text(`Handled event ${event.id} of type ${event.type} successfully`, 200);
    } catch (err) {
      const errorMessage = `Webhook handling failed. ${
        err instanceof Error ? err.message : 'Internal server error'
      }`;
      console.error(errorMessage);
      return ctx.text(errorMessage, 400);
    }
  }
);
