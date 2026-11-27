import { createExecutionContext, env, SELF, waitOnExecutionContext } from 'cloudflare:test';
import { generateId } from '@coderscreen/common/id';
import { customerTable, planTable, subscriptionTable } from '@coderscreen/db/billing.db';
import { member, organization, user } from '@coderscreen/db/user.db';
import { eq } from 'drizzle-orm';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { hc } from 'hono/client';
import postgres from 'postgres';
import { vi } from 'vitest';
import worker, { type AppRouter } from '@/index';
import { ResendService } from '@/services/third-party/Resend.service';

// Everything here runs inside workerd next to the Worker under test.

const ORIGIN = 'http://localhost:3000';
const BASE_URL = 'http://api.test';
const PASSWORD = 'api-test-password';

let _db: PostgresJsDatabase | undefined;

/** Direct access to the test database, for seeding and for asserting on rows. */
export const db = () => {
  if (!_db) {
    const url = env.HYPERDRIVE?.connectionString;
    if (!url) throw new Error('HYPERDRIVE binding is missing; run through vitest.api.config.mts');
    _db = drizzle(postgres(url, { max: 2, fetch_types: false }));
  }
  return _db;
};

const unique = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

/** A typed client for the API, the same one the web app uses. */
export const apiClient = (cookie?: string) =>
  hc<AppRouter>(BASE_URL, {
    fetch: (input: RequestInfo | URL, init?: RequestInit) => SELF.fetch(input, init),
    headers: { Origin: ORIGIN, ...(cookie ? { cookie } : {}) },
  });

export type ApiClient = ReturnType<typeof apiClient>;

export interface TestOrg {
  id: string;
  userId: string;
  email: string;
  /** Signed in as this org's owner. */
  api: ApiClient;
}

const authPost = (path: string, body: unknown) =>
  SELF.fetch(`${BASE_URL}/auth/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: ORIGIN },
    body: JSON.stringify(body),
  });

/**
 * A new organization with one signed-in owner on the free plan. Each test
 * should make its own, so tests never share rows and can run in any order.
 */
export async function createOrg(opts: { name?: string } = {}): Promise<TestOrg> {
  const email = `owner-${unique()}@api-test.example`;
  const signUp = await authPost('sign-up/email', { email, password: PASSWORD, name: 'Test Owner' });
  if (!signUp.ok) throw new Error(`sign-up failed: ${signUp.status} ${await signUp.text()}`);

  // Verification normally happens by email; tests flip the flag directly.
  const [owner] = await db()
    .update(user)
    .set({ emailVerified: true, isOnboarded: true })
    .where(eq(user.email, email))
    .returning({ id: user.id });

  // Billing is seeded directly so creating an org never calls Stripe.
  const orgId = `org_test_${unique()}`;
  await db()
    .insert(planTable)
    .values({
      id: 'free',
      name: 'Free',
      stripePriceId: 'price_test_free',
      price: 0,
      interval: 'monthly',
      limits: { live_interview: 1000, assessment_invite: 1000, team_members: 1000 },
    })
    .onConflictDoNothing();
  await db()
    .insert(organization)
    .values({ id: orgId, name: opts.name ?? 'Test Org', createdAt: new Date() });
  await db()
    .insert(member)
    .values({
      id: `mem_${unique()}`,
      organizationId: orgId,
      userId: owner.id,
      role: 'owner',
      createdAt: new Date(),
    });
  const stripeCustomerId = `cus_test_${orgId}`;
  await db().insert(customerTable).values({ organizationId: orgId, stripeCustomerId, email });
  await db()
    .insert(subscriptionTable)
    .values({
      id: generateId('subscription'),
      planId: 'free',
      stripeCustomerId,
      stripeSubscriptionId: `sub_test_${orgId}`,
      stripeSubscriptionItemId: `si_test_${orgId}`,
      status: 'active',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 86_400_000).toISOString(),
    });

  // Signing in after the membership exists makes it the session's active org.
  const signIn = await authPost('sign-in/email', { email, password: PASSWORD });
  const cookie = signIn.headers.get('set-cookie')?.split(';')[0];
  if (!signIn.ok || !cookie) throw new Error(`sign-in failed: ${signIn.status}`);

  return { id: orgId, userId: owner.id, email, api: apiClient(cookie) };
}

type SentEmail = { type: string; to: string; params: Record<string, unknown> };

/**
 * Records transactional emails instead of sending them. Sends usually happen
 * in waitUntil after the response, so assert with `await vi.waitFor(...)`.
 */
export function captureEmails() {
  const sent: SentEmail[] = [];
  vi.spyOn(ResendService.prototype, 'sendTransactionalEmail').mockImplementation(
    async (type, to, params) => {
      sent.push({ type, to, params: params as Record<string, unknown> });
    }
  );
  return sent;
}

/** Runs the Worker's scheduled (cron) handler and waits for it to finish. */
export async function runCron(cron = '*/10 * * * *') {
  const ctx = createExecutionContext();
  // biome-ignore lint/style/noNonNullAssertion: the Worker exports a scheduled handler
  await worker.scheduled!({ cron, scheduledTime: Date.now(), noRetry() {} }, env, ctx);
  await waitOnExecutionContext(ctx);
}

export const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * 60_000).toISOString();
export const minutesFromNow = (minutes: number) => minutesAgo(-minutes);
