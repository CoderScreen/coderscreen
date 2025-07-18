import { z } from 'zod';

export const CustomerSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  stripeCustomerId: z.string(),
  organizationId: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
});

export const SubscriptionSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  stripeSubscriptionId: z.string(),
  customerId: z.string(),
  status: z.enum([
    'active',
    'canceled',
    'incomplete',
    'incomplete_expired',
    'past_due',
    'trialing',
    'unpaid',
  ]),
  currentPeriodStart: z.date(),
  currentPeriodEnd: z.date(),
  cancelAtPeriodEnd: z.boolean(),
});

export const PlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  price: z.number(),
  currency: z.string(),
  interval: z.enum(['month', 'year']),
  stripePriceId: z.string(),
  features: z.array(z.string()).optional(),
});

export const CheckoutSessionSchema = z.object({
  sessionId: z.string(),
  url: z.string().url(),
});

export const PortalSessionSchema = z.object({
  url: z.string().url(),
});

export const CreateCheckoutSchema = z.object({
  priceId: z.string(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export const CreatePortalSchema = z.object({
  returnUrl: z.string().url(),
});
