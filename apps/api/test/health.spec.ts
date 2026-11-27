import { describe, expect, it, vi } from 'vitest';
import { checkHealth, checkOpenRouterKey, withTimeout } from '@/lib/health';

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

describe('checkOpenRouterKey', () => {
  it('passes on 200', async () => {
    const fetchImpl = vi.fn(async () => new Response('{}', { status: 200 }));
    await expect(checkOpenRouterKey('sk-good', fetchImpl)).resolves.toBeUndefined();
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://openrouter.ai/api/v1/key',
      expect.objectContaining({ headers: { Authorization: 'Bearer sk-good' } })
    );
  });

  it('fails on 401, the revoked-key response', async () => {
    const fetchImpl = vi.fn(async () => new Response('{}', { status: 401 }));
    await expect(checkOpenRouterKey('sk-revoked', fetchImpl)).rejects.toThrow('HTTP 401');
  });
});
