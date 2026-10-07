import { type Parameter, type TypeString, validateValue } from '@coderscreen/common/types';
import { HTTPException } from 'hono/http-exception';

/**
 * Validate a test case's positional args + expected return against a question
 * signature. Throws 400 on any mismatch — args count, arg type, or return type.
 * Used at test case save time so authoring errors don't leak into the runner.
 */
export function validateTestCaseShape(
  signature: { parameters: Parameter[]; returnType: TypeString },
  args: unknown[],
  expectedReturn: unknown
): void {
  if (args.length !== signature.parameters.length) {
    throw new HTTPException(400, {
      message: `Test case has ${args.length} arg(s) but the question signature expects ${signature.parameters.length}`,
    });
  }
  for (let i = 0; i < args.length; i++) {
    const param = signature.parameters[i];
    const r = validateValue(args[i], param.type);
    if (!r.ok) {
      throw new HTTPException(400, {
        message: `Arg "${param.name}" (${param.type}): ${r.reason}`,
      });
    }
  }
  const ret = validateValue(expectedReturn, signature.returnType);
  if (!ret.ok) {
    throw new HTTPException(400, {
      message: `Expected return (${signature.returnType}): ${ret.reason}`,
    });
  }
}

// Shared with the editor, which warns before a save that would delete tests.
export { signatureChangesInvalidateTestCases } from '@coderscreen/common/types';
