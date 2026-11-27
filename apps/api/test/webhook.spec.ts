import { Hono } from 'hono';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const constructEvent = vi.fn();
const upsertSubscriptionFromEvent = vi.fn();
const reportError = vi.fn();

vi.mock('@/services/third-party/Stripe.service', () => ({
  StripeService: class {
    constructEvent = constructEvent;
  },
}));
vi.mock('@/services/billing/Billing.service', () => ({
  BillingService: class {
    upsertSubscriptionFromEvent = upsertSubscriptionFromEvent;
  },
}));
vi.mock('@/lib/report', () => ({ reportError }));

const { webhookRouter } = await import('@/routes/webhook.routes');
const app = new Hono().route('/webhook', webhookRouter);

function post() {
  return app.request('/webhook/stripe', {
    method: 'POST',
    headers: { 'stripe-signature': 't=1,v1=abc' },
    body: '{}',
  });
}

describe('POST /webhook/stripe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('handles subscription events', async () => {
    constructEvent.mockResolvedValue({ id: 'evt_1', type: 'customer.subscription.updated' });
    const res = await post();
    expect(res.status).toBe(200);
    expect(upsertSubscriptionFromEvent).toHaveBeenCalledOnce();
    expect(reportError).not.toHaveBeenCalled();
  });

  it('acknowledges event types it ignores with a 200 so Stripe stops retrying', async () => {
    constructEvent.mockResolvedValue({ id: 'evt_2', type: 'invoice.paid' });
    const res = await post();
    expect(res.status).toBe(200);
    expect(upsertSubscriptionFromEvent).not.toHaveBeenCalled();
  });

  it('reports a handler failure and answers 500 so Stripe retries', async () => {
    constructEvent.mockResolvedValue({ id: 'evt_3', type: 'customer.subscription.created' });
    upsertSubscriptionFromEvent.mockRejectedValue(new Error('db down'));
    const res = await post();
    expect(res.status).toBe(500);
    expect(reportError).toHaveBeenCalledWith(expect.any(Error), {
      tags: { webhook: 'stripe', stripeEventType: 'customer.subscription.created' },
      extra: { stripeEventId: 'evt_3' },
    });
  });

  it('rejects a bad signature with 400 and reports it as a warning', async () => {
    constructEvent.mockRejectedValue(new Error('No signatures found'));
    const res = await post();
    expect(res.status).toBe(400);
    expect(reportError).toHaveBeenCalledWith(expect.any(Error), {
      level: 'warning',
      tags: { webhook: 'stripe', reason: 'signature' },
    });
  });
});
