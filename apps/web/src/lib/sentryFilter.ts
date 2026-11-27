import type { ErrorEvent, EventHint } from '@sentry/react';

// Errors that mean "the user typed something wrong", from better-auth and our
// own form flows. The UI already shows them.
const EXPECTED_MESSAGES = new Set([
  'Password too short',
  'Password too long',
  'Invalid email or password',
  'Invalid email',
  'Invalid origin',
  'User already exists',
  'Email not verified',
]);

const NOISE_PATTERNS = [
  // Google Translate and similar extensions rewrite the DOM under React.
  /Failed to execute '(removeChild|insertBefore)' on 'Node'/,
  /The node to be removed is not a child of this node/,
  /The object can not be found here/,
  /ResizeObserver loop/,
  // The LSP client writes to its socket after it closed. Harmless; drop until
  // the write is guarded.
  /^WebSocket is not open$/,
  // A non-Error rejection: our API error body ({id, message, timestamp}) or a
  // validator body ({error, success}) thrown by `throwApiError`.
  /captured as promise rejection with keys: (id, message, timestamp|error, success)$/,
];

function isApiErrorBody(value: unknown): boolean {
  if (!value || typeof value !== 'object' || value instanceof Error) return false;
  const keys = Object.keys(value);
  const hasApiShape = keys.includes('id') && keys.includes('message') && keys.includes('timestamp');
  const hasValidatorShape = keys.includes('success') && keys.includes('error');
  return hasApiShape || hasValidatorShape;
}

/** Our bundle is served from `<origin>/assets/`. */
function isOwnFrame(url: string | undefined, origin: string): boolean {
  if (!url) return false;
  return url.startsWith(`${origin}/assets/`) || url.startsWith('/assets/');
}

/**
 * Why an event should be dropped, or null to keep it. Returns a reason (not a
 * boolean) so tests can say which rule fired.
 */
export function dropReason(event: ErrorEvent, hint: EventHint, origin: string): string | null {
  if (isApiErrorBody(hint.originalException)) {
    return 'expected-api-error';
  }

  const values = event.exception?.values ?? [];
  for (const value of values) {
    const text = value.value ?? '';
    if (EXPECTED_MESSAGES.has(text)) return 'expected-user-error';
    if (NOISE_PATTERNS.some((pattern) => pattern.test(text))) return 'known-noise';
  }

  // If every frame we have is somebody else's code (extensions, injected
  // scripts, third-party widgets), it isn't ours to fix. Events without any
  // frames are kept: we can't tell where they came from.
  const frames = values.flatMap((value) => value.stacktrace?.frames ?? []);
  if (
    frames.length > 0 &&
    !frames.some((frame) => isOwnFrame(frame.abs_path ?? frame.filename, origin))
  ) {
    return 'no-own-frames';
  }

  return null;
}

export function beforeSend(event: ErrorEvent, hint: EventHint): ErrorEvent | null {
  return dropReason(event, hint, window.location.origin) ? null : event;
}
