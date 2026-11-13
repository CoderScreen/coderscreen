import { HTTPException } from 'hono/http-exception';
import { describe, expect, it } from 'vitest';
import {
  INVALID_PACKAGE_JSON_MESSAGE,
  previewInstallFailure,
} from '../src/sandbox/previewInstallError';

describe('previewInstallFailure', () => {
  it('returns a 400 when package.json is not valid JSON', () => {
    const output = [
      'npm error code EJSONPARSE',
      'npm error path /workspace/package.json',
      'npm error JSON.parse Expected \',\' or \'}\' after property value in JSON at position 20 while parsing near "{\\"name\\": \\"demo\\" \\"private\\": true}"',
      'npm error',
    ].join('\n');

    const error = previewInstallFailure(output);

    expect(error).toBeInstanceOf(HTTPException);
    expect((error as HTTPException).status).toBe(400);
    expect(error.message).toBe(INVALID_PACKAGE_JSON_MESSAGE);
    expect(error.message).not.toContain('demo');
  });

  it('keeps registry and other install failures as server errors', () => {
    const output =
      'npm error code EAI_AGAIN\nnpm error request to https://registry.npmjs.org/react failed';

    const error = previewInstallFailure(output);

    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(HTTPException);
    expect(error.message).toContain('EAI_AGAIN');
  });

  it('still reports an install failure when npm prints no output', () => {
    const error = previewInstallFailure('   ');

    expect(error).not.toBeInstanceOf(HTTPException);
    expect(error.message).toBe('npm install failed');
  });
});
