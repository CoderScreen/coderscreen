import { HTTPException } from 'hono/http-exception';
import { describe, expect, it } from 'vitest';
import { classifyError } from '@/lib/errorResponse';

describe('classifyError', () => {
  it('passes expected 4xx through without reporting', () => {
    const outcome = classifyError(new HTTPException(403, { message: 'Not a member' }));
    expect(outcome).toEqual({ status: 403, message: 'Not a member', report: false });
  });

  it('reports an HTTPException that ends as a 5xx', () => {
    const outcome = classifyError(
      new HTTPException(500, { message: 'No active subscription found' })
    );
    expect(outcome).toEqual({
      status: 500,
      message: 'No active subscription found',
      report: true,
    });
  });

  it('reports unexpected errors and hides their message', () => {
    const outcome = classifyError(new Error('Failed query: select * from rooms where id = $1'));
    expect(outcome).toEqual({ status: 500, message: 'Internal server error', report: true });
  });

  it('handles thrown non-Error values', () => {
    expect(classifyError('boom')).toEqual({
      status: 500,
      message: 'Internal server error',
      report: true,
    });
  });
});
