import * as Sentry from '@sentry/cloudflare';

const RETRY_DELAYS_MS = [500, 2000];
const FOREIGN_KEY_VIOLATION = '23503';

/**
 * Run a Yjs room's DB write, retrying transient failures.
 *
 * y-partyserver swallows `onSave` errors into a `console.error` and only saves
 * again on the next document edit, so a failed save near the end of an
 * interview silently drops everything after the last good one. The final
 * failure is reported to Sentry with the payload size and the underlying
 * Postgres error. Drizzle's own error message embeds every query param (the
 * whole document), which pushes the real cause past the Workers log limit.
 */
export async function persistWithRetry(params: {
  party: 'room' | 'private-room';
  roomId: string;
  payloadBytes: number;
  write: () => Promise<unknown>;
}) {
  const { party, roomId, payloadBytes, write } = params;

  for (let attempt = 0; ; attempt++) {
    try {
      await write();
      return;
    } catch (err) {
      // Drizzle wraps the driver error in `cause`. A Postgres error code means
      // the server rejected the statement, so retrying won't help.
      const cause = (err as { cause?: unknown }).cause ?? err;
      const pgCode =
        typeof cause === 'object' && cause ? (cause as { code?: unknown }).code : undefined;
      const rejectedByPostgres = typeof pgCode === 'string' && /^[0-9A-Z]{5}$/.test(pgCode);

      // The room was deleted while its document was still open.
      if (pgCode === FOREIGN_KEY_VIOLATION) {
        console.warn(`[${party}] skipped saving ${roomId}: room no longer exists`);
        return;
      }

      if (!rejectedByPostgres && attempt < RETRY_DELAYS_MS.length) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
        continue;
      }

      const causeMessage = cause instanceof Error ? cause.message : String(cause);
      console.error(
        `[${party}] failed to persist ${roomId} (${payloadBytes} bytes, ${attempt + 1} attempts): ${causeMessage}`
      );

      const error = Object.assign(
        new Error(`Failed to persist ${party} document: ${causeMessage}`),
        { cause }
      );
      Sentry.captureException(error, {
        tags: { party, roomId, pgCode: typeof pgCode === 'string' ? pgCode : 'none' },
        extra: { payloadBytes, attempts: attempt + 1 },
      });
      await Sentry.flush(2000).catch(() => {});

      throw error;
    }
  }
}
