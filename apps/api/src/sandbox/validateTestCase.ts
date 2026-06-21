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

/**
 * Returns true if a signature change between the old and new shapes is one
 * that invalidates existing test cases. Any param add/remove/rename/retype
 * change, function name change, or return-type change qualifies. Two
 * signatures with the same JSON-stringified shape are considered equal.
 */
export function signatureChangesInvalidateTestCases(
  prev: { functionName: string; parameters: Parameter[]; returnType: TypeString },
  next: { functionName: string; parameters: Parameter[]; returnType: TypeString }
): boolean {
  if (prev.functionName !== next.functionName) return true;
  if (prev.returnType !== next.returnType) return true;
  if (prev.parameters.length !== next.parameters.length) return true;
  for (let i = 0; i < prev.parameters.length; i++) {
    if (prev.parameters[i].name !== next.parameters[i].name) return true;
    if (prev.parameters[i].type !== next.parameters[i].type) return true;
  }
  return false;
}
