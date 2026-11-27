import * as Sentry from '@sentry/cloudflare';
import { checkOpenRouterKey, pingPostgres } from '@/lib/health';

/** Must match `triggers.crons` in wrangler.jsonc. */
export const CANARY_CRONS = {
  roomDb: '*/5 * * * *',
  providers: '*/15 * * * *',
} as const;

function monitorConfig(crontab: string) {
  return {
    schedule: { type: 'crontab' as const, value: crontab },
    checkinMargin: 2,
    maxRuntime: 2,
    failureIssueThreshold: 2,
    recoveryThreshold: 1,
    timezone: 'UTC',
  };
}

/**
 * Checks that would have caught our two silent outages:
 * - `canary-room-db`: room DOs connect with `INFISCAL_DATABASE_URL`, not
 *   Hyperdrive. When the Railway password rotated on 2026-10-23 only that path
 *   broke, and `/health` (Hyperdrive) stayed green.
 * - `canary-providers`: the OpenRouter key was revoked around 2026-10-26 and
 *   every AI reply failed for weeks without an alert.
 *
 * Each run sends a Sentry cron check-in. A failed check also throws, so the
 * underlying error is reported with its message.
 */
export async function runScheduled(controller: ScheduledController, env: Env): Promise<void> {
  if (env.NODE_ENV !== 'production') {
    return;
  }

  switch (controller.cron) {
    case CANARY_CRONS.roomDb:
      await Sentry.withMonitor(
        'canary-room-db',
        () => pingPostgres(env.INFISCAL_DATABASE_URL, 5000),
        monitorConfig(CANARY_CRONS.roomDb)
      );
      return;
    case CANARY_CRONS.providers:
      await Sentry.withMonitor(
        'canary-providers',
        () => checkOpenRouterKey(env.INFISCAL_OPENROUTER_API_KEY),
        monitorConfig(CANARY_CRONS.providers)
      );
      return;
    default:
      console.warn(`[cron] no handler for schedule ${controller.cron}`);
  }
}
