import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

import { TanstackQueryClient } from '@/query/client';

describe('query cache errors', () => {
  afterEach(() => {
    TanstackQueryClient.clear();
  });

  it('does not turn a failed query into an unhandled rejection', async () => {
    const reasons: unknown[] = [];
    const onUnhandled = (reason: unknown) => {
      reasons.push(reason);
    };
    process.on('unhandledRejection', onUnhandled);

    try {
      const query = TanstackQueryClient.fetchQuery({
        queryKey: ['rooms', 'unhandled-check'],
        queryFn: async () => {
          throw new Error('Failed to fetch rooms');
        },
        retry: false,
        meta: { ERROR_MESSAGE: 'Failed to fetch rooms' },
      });

      await expect(query).rejects.toThrow('Failed to fetch rooms');
      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(reasons).toEqual([]);
    } finally {
      process.off('unhandledRejection', onUnhandled);
    }
  });
});
