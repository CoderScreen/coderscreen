import type { ErrorEvent } from '@sentry/react';
import { describe, expect, it } from 'vitest';
import { dropReason } from '@/lib/sentryFilter';

const ORIGIN = 'https://app.coderscreen.com';

function event(
  value: string,
  frames: string[] = [`${ORIGIN}/assets/index-Ba3Pwwx9.js`]
): ErrorEvent {
  return {
    type: undefined,
    exception: {
      values: [
        {
          type: 'Error',
          value,
          stacktrace: { frames: frames.map((abs_path) => ({ abs_path, filename: abs_path })) },
        },
      ],
    },
  };
}

describe('dropReason', () => {
  it('keeps a real error thrown from our bundle', () => {
    expect(dropReason(event('Cannot read properties of undefined'), {}, ORIGIN)).toBeNull();
  });

  it('keeps an error with no frames, since we cannot tell where it came from', () => {
    expect(dropReason(event('Something broke', []), {}, ORIGIN)).toBeNull();
  });

  it('drops errors whose frames are all outside our code', () => {
    const fromExtension = event('x is not a function', [
      'chrome-extension://abcdef/content.js',
      'https://www.googletagmanager.com/gtag/js',
    ]);
    expect(dropReason(fromExtension, {}, ORIGIN)).toBe('no-own-frames');
  });

  it('treats relative /assets/ frames as ours', () => {
    expect(dropReason(event('Boom', ['/assets/index-abc.js']), {}, ORIGIN)).toBeNull();
  });

  it('drops expected API error bodies thrown by throwApiError', () => {
    const body = { id: 'ray', message: 'Not a member', timestamp: '2026-11-26T00:00:00Z' };
    expect(
      dropReason(event('Object captured as promise rejection'), { originalException: body }, ORIGIN)
    ).toBe('expected-api-error');
    const validation = { success: false, error: { issues: [] } };
    expect(dropReason(event('x'), { originalException: validation }, ORIGIN)).toBe(
      'expected-api-error'
    );
  });

  it('drops the serialized form of an API error rejection', () => {
    const serialized = event(
      'Object captured as promise rejection with keys: id, message, timestamp',
      []
    );
    expect(dropReason(serialized, {}, ORIGIN)).toBe('known-noise');
  });

  it('drops expected auth form errors', () => {
    expect(dropReason(event('Password too short'), {}, ORIGIN)).toBe('expected-user-error');
    expect(dropReason(event('Invalid email or password'), {}, ORIGIN)).toBe('expected-user-error');
    expect(dropReason(event('Invalid origin'), {}, ORIGIN)).toBe('expected-user-error');
  });

  it('drops translator DOM errors', () => {
    const translator = event(
      "Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node."
    );
    expect(dropReason(translator, {}, ORIGIN)).toBe('known-noise');
    expect(dropReason(event("Failed to execute 'insertBefore' on 'Node'"), {}, ORIGIN)).toBe(
      'known-noise'
    );
  });

  it('drops ResizeObserver and the LSP closed-socket write', () => {
    expect(
      dropReason(event('ResizeObserver loop completed with undelivered notifications.'), {}, ORIGIN)
    ).toBe('known-noise');
    expect(dropReason(event('WebSocket is not open'), {}, ORIGIN)).toBe('known-noise');
  });

  it('keeps a real Error even if it has id/message/timestamp-like text', () => {
    const real = new Error('Failed to update user');
    expect(
      dropReason(event('Failed to update user'), { originalException: real }, ORIGIN)
    ).toBeNull();
  });
});
