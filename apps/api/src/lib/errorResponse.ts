import { HTTPException } from 'hono/http-exception';

export interface ErrorOutcome {
  status: number;
  /** Message safe to show the client. */
  message: string;
  report: boolean;
}

/**
 * How the root `onError` answers an error. Expected 4xx `HTTPException`s go
 * back as-is and aren't reported. Everything that ends as a 5xx is reported,
 * including `HTTPException(500)`. Unexpected errors get a generic message:
 * their own message can contain SQL or internal details.
 */
export function classifyError(err: unknown): ErrorOutcome {
  if (err instanceof HTTPException) {
    return { status: err.status, message: err.message, report: err.status >= 500 };
  }
  return { status: 500, message: 'Internal server error', report: true };
}
