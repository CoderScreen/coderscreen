import { describe, expect, it } from 'vitest';
import { getSentryOptions, traceSampleRate } from '@/lib/sentry';

describe('traceSampleRate', () => {
  it('keeps every HTTP request', () => {
    expect(traceSampleRate('GET /rooms')).toBe(1);
    expect(traceSampleRate('POST /webhook/stripe')).toBe(1);
  });

  it('samples websocket events at 1%', () => {
    expect(traceSampleRate('webSocketMessage')).toBe(0.01);
    expect(traceSampleRate('webSocketClose')).toBe(0.01);
  });
});

describe('getSentryOptions', () => {
  const env = { SENTRY_DSN: 'https://k@o1.ingest.sentry.io/1', NODE_ENV: 'production' } as Env;

  it('does not send PII', () => {
    expect(getSentryOptions(env).sendDefaultPii).toBe(false);
  });

  it('tags the release from SENTRY_RELEASE', () => {
    const options = getSentryOptions({ ...env, SENTRY_RELEASE: 'abc1234' } as Env);
    expect(options.release).toBe('abc1234');
  });

  it('is disabled in development', () => {
    expect(getSentryOptions({ ...env, NODE_ENV: 'development' } as Env).enabled).toBe(false);
  });
});
