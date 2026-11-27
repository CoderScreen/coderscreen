import { Hono } from 'hono';
import type { AppContext } from '@/index';
import { reportError } from '@/lib/report';
import { appFactoryMiddleware } from '@/services/AppFactory';
import { AssessmentSubmissionService } from '@/services/AssessmentSubmission.service';

// Scheduled jobs run through their own Hono app so services get the same
// context they have in requests. It is never mounted on the public router.
const cronApp = new Hono<AppContext>()
  .use(appFactoryMiddleware)
  .post('/expire-assessments', async (ctx) => {
    try {
      await new AssessmentSubmissionService(ctx).expireAllOverdue();
    } catch (err) {
      reportError(err, { tags: { feature: 'cron', job: 'expire-assessments' } });
      return ctx.body(null, 500);
    }
    return ctx.body(null, 204);
  });

export async function runScheduled(env: Env, ctx: ExecutionContext) {
  await cronApp.fetch(
    new Request('https://cron.internal/expire-assessments', { method: 'POST' }),
    env,
    ctx
  );
}
