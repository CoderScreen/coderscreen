import { HTTPException } from 'hono/http-exception';

/** Shown in the preview panel when the workspace package.json is not JSON. */
export const INVALID_PACKAGE_JSON_MESSAGE =
  'package.json is not valid JSON, so preview could not install dependencies.';

/**
 * npm prints `error code EJSONPARSE` when `/workspace/package.json` is not
 * valid JSON. That file is the candidate's, so the failure is a client error.
 * Anything else (registry, network, a missing dependency) stays an unexpected
 * server error and is still reported.
 */
export function previewInstallFailure(output: string): Error {
  if (/npm error code EJSONPARSE\b/.test(output)) {
    return new HTTPException(400, { message: INVALID_PACKAGE_JSON_MESSAGE });
  }

  const detail = output.trim();
  return new Error(detail ? `npm install failed: ${detail}` : 'npm install failed');
}
