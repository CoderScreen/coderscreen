import { describe, expect, it } from 'vitest';
import { parseApiError } from '@/query/error.query';

describe('parseApiError', () => {
  it('reads structured API errors', () => {
    const result = parseApiError({
      id: 'a44541bf5e657c8f',
      message: 'You have reached the limit of live interviews',
      timestamp: '2026-10-02T16:59:19.171Z',
    });

    expect(result).toEqual({
      id: 'a44541bf5e657c8f',
      message: 'You have reached the limit of live interviews',
    });
  });

  it('summarises request validation errors instead of reporting an unknown error', () => {
    const result = parseApiError({
      success: false,
      error: {
        name: 'ZodError',
        issues: [
          { code: 'too_small', path: ['functionName'], message: 'Required' },
          { code: 'custom', path: [], message: 'Invalid body' },
        ],
      },
    });

    expect(result.message).toBe('functionName: Required; Invalid body');
  });

  it('falls back to Error messages and unknown values', () => {
    expect(parseApiError(new Error('Failed to fetch room')).message).toBe('Failed to fetch room');
    expect(parseApiError('nope').message).toBe('Unknown error');
  });
});
