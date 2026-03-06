import { getSandbox } from '@cloudflare/sandbox';
import { Id } from '@coderscreen/common/id';
import { AssessmentLanguage } from '@coderscreen/db/assessment.db';
import { AssessmentTestCaseEntity } from '@coderscreen/db/assessmentTestCase.db';
import { Context } from 'hono';
import { LANGUAGE_CONFIG } from '@/sandbox/languageCommands';
import { AppContext } from '..';

const EXECUTION_TIMEOUT_MS = 15000;

export interface TestCaseRunResult {
  testCaseId: string;
  passed: boolean;
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
    testCases: AssessmentTestCaseEntity[];
  }): Promise<TestCaseRunResult[]> {
    const { submissionId, code, language, testCases } = params;

    const config = LANGUAGE_CONFIG[language];
    if (!config) {
      return testCases.map((tc) => ({
        testCaseId: tc.id,
        passed: false,
        actualOutput: '',
        stderr: `Language "${language}" is not supported for execution`,
        exitCode: 1,
        executionTimeMs: 0,
      }));
    }

    const sandboxId = this.getAssessmentSandboxId(submissionId);
    const sandbox = getSandbox(this.ctx.env.SANDBOX, sandboxId, { normalizeId: true });

    const filePath = `/workspace/main${config.extension}`;
    const outputPath = '/workspace/main_out';
    const inputPath = '/workspace/input.txt';

    // Write code to file
    await sandbox.writeFile(filePath, code);

    // Compile step (once) for compiled languages
    if (config.compileCommand) {
      const compileResult = await sandbox.exec(config.compileCommand(filePath, outputPath), {
        timeout: EXECUTION_TIMEOUT_MS,
      });

      if (!compileResult.success) {
        return testCases.map((tc) => ({
          testCaseId: tc.id,
          passed: false,
          actualOutput: compileResult.stdout,
          stderr: compileResult.stderr || 'Compilation failed',
          exitCode: compileResult.exitCode,
          executionTimeMs: 0,
        }));
      }
    }

    const runTarget = config.compileCommand ? outputPath : filePath;

    // Run each test case
    const results: TestCaseRunResult[] = [];
    for (const tc of testCases) {
      // Write stdin input
      await sandbox.writeFile(inputPath, tc.input);

      const start = Date.now();
      try {
        const result = await sandbox.exec(
          `${config.runCommand(runTarget)} < ${inputPath}`,
          { timeout: EXECUTION_TIMEOUT_MS }
        );
        const executionTimeMs = Date.now() - start;

        const actualOutput = result.stdout.trim();
        const expectedOutput = tc.expectedOutput.trim();

        results.push({
          testCaseId: tc.id,
          passed: result.success && actualOutput === expectedOutput,
          actualOutput: result.stdout,
          stderr: result.stderr,
          exitCode: result.exitCode,
          executionTimeMs,
        });
      } catch (error) {
        results.push({
          testCaseId: tc.id,
          passed: false,
          actualOutput: '',
          stderr: error instanceof Error ? error.message : 'Execution error',
          exitCode: 1,
          executionTimeMs: Date.now() - start,
        });
      }
    }

    return results;
  }
}
