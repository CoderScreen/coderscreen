import { AppContext } from '@/index';
import { Context } from 'hono';
import { Stripe } from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;
if (!STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

/**
 * Wraps Stripe API
 */
export class StripeService {
  private stripe: Stripe;

  constructor(private readonly ctx: Context<AppContext>) {
    this.stripe = new Stripe(STRIPE_SECRET_KEY);
  }

  async createCustomer(params: { name: string; email: string; metadata?: Record<string, string> }) {
    const customer = await this.stripe.customers.create(params);
    return customer;
  }

  async createSubscription(params: { customerId: string; priceId: string }) {
    const { customerId, priceId } = params;
    const subscription = await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });
    return subscription;
  }

  async createCheckoutSession(params: {
    customerId: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
  }) {
    const { customerId, priceId, successUrl, cancelUrl } = params;

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
    });

    return session;
  }

  async createBillingPortalSession(customerId: string, returnUrl: string) {
    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return session;
  }

  async getCustomer(customerId: string) {
    return await this.stripe.customers.retrieve(customerId);
  }

  async getSubscription(subscriptionId: string) {
    return await this.stripe.subscriptions.retrieve(subscriptionId);
  }

  async constructEvent(params: { payload: string; signature: string }) {
    const { payload, signature } = params;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not set');
    }

    return this.stripe.webhooks.constructEventAsync(payload, signature, webhookSecret);
  }

  async getLineItems(params: { sessionId: string; ctx: Context<AppContext> }) {
    const { sessionId } = params;
    return await this.stripe.checkout.sessions.listLineItems(sessionId);
  }
}
