import { Hono } from 'hono';
import { describeRoute } from 'hono-openapi';
import { resolver, validator as zValidator } from 'hono-openapi/zod';
import { z } from 'zod';
import { AppContext } from '@/index';
import { BillingService } from '@/services/billing/Billing.service';
import {
  SubscriptionSchema,
  PlanSchema,
  CheckoutSessionSchema,
  PortalSessionSchema,
  CreateCheckoutSchema,
  CreatePortalSchema,
} from '@/schema/billing.zod';
import { getSession } from '@/lib/session';

export const billingRouter = new Hono<AppContext>()
  // GET /billing/customer - Get customer and subscription info
  .get(
    '/customer',
    describeRoute({
      description: 'Get customer and subscription information',
      responses: {
        200: {
          description: 'Customer and subscription details',
          content: {
            'application/json': {
              schema: resolver(SubscriptionSchema),
            },
          },
        },
      },
    }),
    async (ctx) => {
      const { orgId } = getSession(ctx);
      const billingService = new BillingService(ctx);

      const result = await billingService.getActiveSubscription(orgId);

      return ctx.json(result);
    }
  )
  // GET /billing/plans - Get available plans
  .get(
    '/plans',
    describeRoute({
      description: 'Get available billing plans',
      responses: {
        200: {
          description: 'List of available plans',
          content: {
            'application/json': {
              schema: resolver(z.array(PlanSchema)),
            },
          },
        },
      },
    }),
    async (ctx) => {
      const billingService = new BillingService(ctx);

      const plans = await billingService.getPlans();
      return ctx.json(plans);
    }
  )
  // POST /billing/checkout - Create checkout session
  .post(
    '/checkout',
    describeRoute({
      description: 'Create a checkout session for billing',
      responses: {
        200: {
          description: 'Checkout session created successfully',
          content: {
            'application/json': {
              schema: resolver(CheckoutSessionSchema),
            },
          },
        },
      },
    }),
    zValidator('json', CreateCheckoutSchema),
    async (ctx) => {
      const { orgId } = getSession(ctx);
      const { priceId, successUrl, cancelUrl } = ctx.req.valid('json');
      const billingService = new BillingService(ctx);

      // Get customer by organization
      const customer = await billingService.getCustomerByOrganizationId(orgId);

      if (!customer) {
        return ctx.json({ error: 'Customer not found' }, 404);
      }

      // Create checkout session
      const checkoutSession = await billingService.createCheckoutSession({
        organizationId: orgId,
        priceId,
        returnUrl: successUrl,
      });

      return ctx.json({
        sessionId: checkoutSession.id,
        url: checkoutSession.url,
      });
    }
  )
  // POST /billing/portal - Create billing portal session
  .post(
    '/portal',
    describeRoute({
      description: 'Create a billing portal session',
      responses: {
        200: {
          description: 'Portal session created successfully',
          content: {
            'application/json': {
              schema: resolver(PortalSessionSchema),
            },
          },
        },
      },
    }),
    zValidator('json', CreatePortalSchema),
    async (ctx) => {
      const { orgId } = getSession(ctx);
      const { returnUrl } = ctx.req.valid('json');
      const billingService = new BillingService(ctx);

      // Get customer by organization
      const customer = await billingService.getCustomerByOrganizationId(orgId);

      if (!customer) {
        return ctx.json({ error: 'Customer not found' }, 404);
      }

      // Create billing portal session
      const portalSession = await billingService.createBillingPortalSession(
        customer.stripeCustomerId,
        returnUrl
      );

      return ctx.json({
        url: portalSession.url,
      });
    }
  );
