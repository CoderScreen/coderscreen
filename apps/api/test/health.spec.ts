import { describe, expect, it, vi } from 'vitest';
import { checkHealth, withTimeout } from '@/lib/health';

describe('checkHealth', () => {
  it('is ok when the probe resolves', async () => {
    await expect(checkHealth(async () => {})).resolves.toEqual({ ok: true });
  });

  it('is not ok when the probe fails, and does not throw', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(
      checkHealth(async () => {
        throw new Error('password authentication failed');
      })
    ).resolves.toEqual({ ok: false });
  });
});

describe('withTimeout', () => {
  it('rejects when the promise is too slow', async () => {
    const never = new Promise(() => {});
    await expect(withTimeout(never, 10, 'postgres ping')).rejects.toThrow(
      'postgres ping timed out after 10ms'
    );
  });
});
