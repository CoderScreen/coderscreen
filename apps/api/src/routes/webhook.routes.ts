import { Hono } from 'hono';
import { describeRoute } from 'hono-openapi';
import { validator as zValidator } from 'hono-openapi/zod';
import Stripe from 'stripe';
import z from 'zod';
import { AppContext } from '@/index';
import { reportError } from '@/lib/report';
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
      console.warn(errorMessage);
      // Usually junk traffic, but a rotated webhook secret looks the same and
      // means every real event is rejected. A warning lands in triage only.
      reportError(err, { level: 'warning', tags: { webhook: 'stripe', reason: 'signature' } });
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
          // A 4xx makes Stripe retry for days and eventually disable the
          // endpoint, so acknowledge event types we don't use.
          return ctx.text(`Ignored event ${event.id} of type ${event.type}.`, 200);
      }
      return ctx.text(`Handled event ${event.id} of type ${event.type} successfully`, 200);
    } catch (err) {
      console.error(`Webhook handling failed for ${event.id} (${event.type}):`, err);
      reportError(err, {
        tags: { webhook: 'stripe', stripeEventType: event.type },
        extra: { stripeEventId: event.id },
      });
      // 5xx so Stripe retries once the bug is fixed.
      return ctx.text(`Webhook handling failed for event ${event.id}.`, 500);
    }
  }
);
