// Polite HTTP helpers: retry with exponential backoff, a bounded concurrency
// pool, and a per-slot floor delay. Nothing here logs in or accepts a ToS — we
// only fetch public, logged-off pages.
import { USER_AGENT, DEFAULTS } from "./config.ts";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly url: string,
  ) {
    super(`HTTP ${status} for ${url}`);
  }
}

export interface FetchOpts {
  accept?: string;
  retries?: number;
  timeoutMs?: number;
}

/** GET a URL as text, retrying on transient failures. Throws HttpError on a
 *  non-retryable 4xx (except 429). */
export async function fetchText(url: string, opts: FetchOpts = {}): Promise<string> {
  const { accept = "text/html,application/json;q=0.9,*/*;q=0.8", retries = DEFAULTS.retries, timeoutMs = 30_000 } = opts;

  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) {
      // exponential backoff with jitter: 0.5s, 1s, 2s, 4s ...
      await sleep(Math.min(500 * 2 ** (attempt - 1), 8_000) + Math.random() * 250);
    }
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: accept,
          "Accept-Language": "en-US,en;q=0.9",
        },
        signal: AbortSignal.timeout(timeoutMs),
        redirect: "follow",
      });

      if (res.status === 429 || res.status >= 500) {
        const retryAfter = Number(res.headers.get("retry-after"));
        if (Number.isFinite(retryAfter) && retryAfter > 0) await sleep(retryAfter * 1000);
        lastErr = new HttpError(res.status, url);
        continue; // retry
      }
      if (!res.ok) throw new HttpError(res.status, url); // non-retryable (404, 403, 406...)
      return await res.text();
    } catch (err) {
      // network error / timeout → retry; HttpError from !res.ok → rethrow
      if (err instanceof HttpError) throw err;
      lastErr = err;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(`fetch failed: ${url}`);
}

export async function fetchJson<T>(url: string, opts: FetchOpts = {}): Promise<T> {
  return JSON.parse(await fetchText(url, { accept: "application/json", ...opts })) as T;
}

/** Run `fn` over `items` with bounded concurrency and a floor delay per slot.
 *  Errors are surfaced to `onError` (if given) and do not abort the pool. */
export async function mapPool<T>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<void>,
  onError?: (item: T, index: number, err: unknown) => void,
): Promise<void> {
  let cursor = 0;
  const worker = async () => {
    while (cursor < items.length) {
      const i = cursor++;
      try {
        await fn(items[i]!, i);
      } catch (err) {
        onError?.(items[i]!, i, err);
      }
      await sleep(DEFAULTS.minDelayMs + Math.random() * DEFAULTS.minDelayMs);
    }
  };
  await Promise.all(Array.from({ length: Math.max(1, concurrency) }, worker));
}
