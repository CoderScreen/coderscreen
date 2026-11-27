# API tests

These tests run the real Worker (routes, auth, middleware, services) inside
workerd, the same runtime as production, and call it over HTTP with the typed
client the web app uses. Data lives in a real Postgres. Nothing in our own code
is mocked.

```bash
pnpm --filter @coderscreen/api test:api   # just these
pnpm --filter @coderscreen/api test       # unit tests, then these
```

With Docker running, the suite starts its own Postgres (`coderscreen-test-pg`,
port 55434) and runs the migrations in `packages/db/drizzle` before every run. CI sets
`TEST_DATABASE_URL` to its Postgres service instead.

## Writing a test

```ts
import { describe, expect, it } from 'vitest';
import { createAssessment, createSubmission } from './factories';
import { createOrg } from './helpers';

describe('submissions', () => {
  it('lists an org’s submissions', async () => {
    const org = await createOrg(); // new org + signed-in owner
    const assessment = await createAssessment(org);
    const sub = await createSubmission(org, { assessmentId: assessment.id });

    const res = await org.api.assessments[':id'].submissions.$get({
      param: { id: assessment.id },
    });

    expect(res.status).toBe(200);
    expect((await res.json()).map((s) => s.id)).toContain(sub.id);
  });
});
```

1. **Make your own org with `createOrg()`.** Every test gets fresh rows, so
   tests never depend on each other and can run in any order. There is no
   cleanup step.
2. **Seed with `factories.ts`.** Each factory fills in defaults; pass only the
   fields your test is about. Add a factory when you need a new kind of row.
3. **Act through `org.api`.** It's typed from the routes, so params, bodies and
   responses are checked. Use `apiClient()` for unauthenticated callers, such
   as a candidate opening their link.
4. **Assert on the response, or on the database with `db()`.**

## Helpers

| Helper | Use it for |
| --- | --- |
| `createOrg()` | An org on the free plan with a signed-in owner (`org.api`, `org.email`) |
| `apiClient(cookie?)` | A typed client with no session, or with your own cookie |
| `db()` | Drizzle on the test database, to seed or check rows |
| `captureEmails()` | Records emails instead of sending. Sends often happen after the response, so use `await vi.waitFor(...)` |
| `runCron()` | Runs the Worker's scheduled handler and waits for it to finish |
| `minutesAgo(n)`, `minutesFromNow(n)` | Timestamps for deadlines and expiry |

## What runs differently from production

- `NODE_ENV=development`: emails are logged, not sent. Sentry is off.
- Billing rows are seeded, so nothing calls Stripe.
- Every secret is a placeholder set in `vitest.api.config.mts`. `.dev.vars` is
  never loaded.
- The code-run sandbox container isn't available, so anything that runs
  candidate code needs a different approach.

Pure functions with no Worker or database dependencies can still be unit tests
in `test/*.spec.ts`, which run in Node.
