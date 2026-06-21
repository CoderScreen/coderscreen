import { getSandbox } from '@cloudflare/sandbox';
import { Id } from '@coderscreen/common/id';
import type { Signature } from '@coderscreen/common/types';
import { AssessmentLanguage } from '@coderscreen/db/assessment.db';
import { QuestionLibraryTestCaseEntity } from '@coderscreen/db/questionLibraryTestCase.db';
import type { TestCaseFailureReason } from '@coderscreen/db/testCaseResult.db';
import { Context } from 'hono';
import { getHarness, preprocessCandidateCode } from '@/sandbox/harnesses';
import { LANGUAGE_CONFIG } from '@/sandbox/languageCommands';
import { AppContext } from '..';

const EXECUTION_TIMEOUT_MS = 15000;
const MAX_OUTPUT_BYTES = 64 * 1024; // 64KB per stdout/stderr field
const TRUNCATION_MARKER = '\n…[output truncated at 64KB]';
const SANDBOX_RETRY_DELAY_MS = 250;

function capOutput(s: string): string {
  if (s.length <= MAX_OUTPUT_BYTES) return s;
  return s.slice(0, MAX_OUTPUT_BYTES) + TRUNCATION_MARKER;
}

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch {
    await new Promise((r) => setTimeout(r, SANDBOX_RETRY_DELAY_MS));
    return fn();
  }
}

// Deep structural equality for JSON-shaped values. Used to compare a parsed
// function return value against the test case's expected return. Arrays are
// order-sensitive; objects are key-set-sensitive. NaN is never equal.
function deepJsonEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object') return false; // primitive mismatch
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepJsonEqual(a[i], b[i])) return false;
    }
    return true;
  }
  const ao = a as Record<string, unknown>;
  const bo = b as Record<string, unknown>;
  const ak = Object.keys(ao);
  const bk = Object.keys(bo);
  if (ak.length !== bk.length) return false;
  for (const k of ak) {
    if (!Object.prototype.hasOwnProperty.call(bo, k)) return false;
    if (!deepJsonEqual(ao[k], bo[k])) return false;
  }
  return true;
}

function unsupportedLanguageResults(
  testCases: QuestionLibraryTestCaseEntity[],
  language: AssessmentLanguage
): TestCaseRunResult[] {
  return testCases.map((tc) => ({
    testCaseId: tc.id,
    passed: false,
    failureReason: 'crash',
    actualOutput: '',
    stderr: `Language "${language}" is not supported for function-mode questions`,
    exitCode: 1,
    executionTimeMs: 0,
  }));
}

export interface TestCaseRunResult {
  testCaseId: string;
  passed: boolean;
  failureReason: TestCaseFailureReason;
  actualOutput: string;
  stderr: string;
  exitCode: number;
  executionTimeMs: number;
}

export class AssessmentCodeRunService {
  constructor(private readonly ctx: Context<AppContext>) {}

  getAssessmentSandboxId(submissionId: Id<'assessmentSubmission'>) {
    return `s_assessment_${submissionId}`;
  }

  async runTestCases(params: {
    submissionId: Id<'assessmentSubmission'>;
    code: string;
    language: AssessmentLanguage;
    signature: Signature;
    testCases: QuestionLibraryTestCaseEntity[];
  }): Promise<TestCaseRunResult[]> {
    const { submissionId, code, language, signature, testCases } = params;

    const config = LANGUAGE_CONFIG[language];
    const harness = getHarness(language);
    if (!config || !config.supportsFunctionMode || !harness) {
      return unsupportedLanguageResults(testCases, language);
    }

    const sandboxId = this.getAssessmentSandboxId(submissionId);
    const sandbox = getSandbox(this.ctx.env.SANDBOX, sandboxId, { normalizeId: true });

    const filePath = `/workspace/main${config.extension}`;
    const outputPath = '/workspace/main_out';
    const inputPath = '/workspace/input.txt';

    // Assemble the file: candidate code (preprocessed) + auto-appended harness.
    // The candidate's function is in scope when the harness runs.
    const candidateCode = preprocessCandidateCode(code, language);
    const fileContents = candidateCode + harness.buildHarness(signature);
    await withRetry(() => sandbox.writeFile(filePath, fileContents));

    // Compile step (once) for compiled languages — currently none of our
    // function-mode languages compile, but the branch stays so adding e.g.
    // Java later just requires a harness + supportsFunctionMode=true.
    if (config.compileCommand) {
      const compileCommand = config.compileCommand;
      const compileResult = await withRetry(() =>
        sandbox.exec(compileCommand(filePath, outputPath), {
          timeout: EXECUTION_TIMEOUT_MS,
        })
      );

      if (!compileResult.success) {
        const stderr = capOutput(compileResult.stderr || 'Compilation failed');
        const stdout = capOutput(compileResult.stdout);
        return testCases.map((tc) => ({
          testCaseId: tc.id,
          passed: false,
          failureReason: 'compile',
          actualOutput: stdout,
          stderr,
          exitCode: compileResult.exitCode,
          executionTimeMs: 0,
        }));
      }
    }

    const runTarget = config.compileCommand ? outputPath : filePath;

    // Run each test case
    const results: TestCaseRunResult[] = [];
    for (const tc of testCases) {
      // Test case args are JSON-encoded for the harness's stdin reader.
      const argsJson = JSON.stringify(tc.args);
      await withRetry(() => sandbox.writeFile(inputPath, argsJson));

      const start = Date.now();
      try {
        const result = await withRetry(() =>
          sandbox.exec(`${config.runCommand(runTarget)} < ${inputPath}`, {
            timeout: EXECUTION_TIMEOUT_MS,
          })
        );
        const executionTimeMs = Date.now() - start;

        // Heuristic: a non-success result that hit the budget is almost always
        // a timeout. Sandbox SDK doesn't always throw — sometimes it sets
        // success=false with a timeout-shaped error.
        const looksLikeTimeout = !result.success && executionTimeMs >= EXECUTION_TIMEOUT_MS - 250;

        if (!result.success) {
          results.push({
            testCaseId: tc.id,
            passed: false,
            failureReason: looksLikeTimeout ? 'timeout' : 'crash',
            actualOutput: capOutput(result.stdout),
            stderr: capOutput(result.stderr),
            exitCode: result.exitCode,
            executionTimeMs,
          });
          continue;
        }

        // The harness writes a single JSON value to stdout (no trailing
        // newline; languages with print() that adds one are still fine —
        // JSON.parse tolerates surrounding whitespace).
        let returnValue: unknown;
        try {
          returnValue = JSON.parse(result.stdout);
        } catch {
          results.push({
            testCaseId: tc.id,
            passed: false,
            failureReason: 'crash',
            actualOutput: capOutput(result.stdout),
            stderr: capOutput(result.stderr || 'Could not parse function return value as JSON'),
            exitCode: result.exitCode,
            executionTimeMs,
          });
          continue;
        }

        const matched = deepJsonEqual(returnValue, tc.expectedReturn);
        results.push({
          testCaseId: tc.id,
          passed: matched,
          failureReason: matched ? 'passed' : 'wrong_output',
          actualOutput: capOutput(result.stdout),
          stderr: capOutput(result.stderr),
          exitCode: result.exitCode,
          executionTimeMs,
        });
      } catch (error) {
        const executionTimeMs = Date.now() - start;
        const message = error instanceof Error ? error.message : 'Execution error';
        const looksLikeTimeout =
          executionTimeMs >= EXECUTION_TIMEOUT_MS - 250 || /timeout/i.test(message);
        results.push({
          testCaseId: tc.id,
          passed: false,
          failureReason: looksLikeTimeout ? 'timeout' : 'crash',
          actualOutput: '',
          stderr: capOutput(message),
          exitCode: 1,
          executionTimeMs,
        });
      }
    }

    return results;
  }
}
