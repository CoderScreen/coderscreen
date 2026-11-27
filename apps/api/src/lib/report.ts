import * as Sentry from '@sentry/cloudflare';

export interface ReportContext {
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  level?: Sentry.SeverityLevel;
}

/**
 * Report an error we're about to swallow or turn into a response, so it isn't
 * only a `console.error` line. Non-Error values are wrapped so they group.
 */
export function reportError(err: unknown, context: ReportContext = {}): void {
  const error = err instanceof Error ? err : new Error(String(err));
  Sentry.captureException(error, {
    tags: context.tags,
    extra: context.extra,
    level: context.level,
  });
}

/**
 * For work handed to `ctx.waitUntil`: report a rejection instead of letting it
 * vanish after the response is sent. Flushes because the request's own flush
 * may already have run by the time background work fails.
 */
export function reportOnFailure(promise: Promise<unknown>, context: ReportContext): Promise<void> {
  return promise.then(
    () => undefined,
    async (err) => {
      console.error(`[background] ${context.tags?.feature ?? 'task'} failed:`, err);
      reportError(err, context);
      await Sentry.flush(2000).catch(() => {});
    }
  );
}
