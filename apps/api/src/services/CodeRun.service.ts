import { getSandbox } from '@cloudflare/sandbox';
import { Id } from '@coderscreen/common/id';
import { RoomEntity } from '@coderscreen/db/room.db';
import { Context } from 'hono';
import { FormattedOutput, getSandboxId } from '@/lib/sandbox';
import { LANGUAGE_CONFIG } from '@/sandbox/languageCommands';
import { AppContext } from '..';

const EXECUTION_TIMEOUT_MS = 15000;

export class CodeRunService {
  private ctx: Context<AppContext>;

  constructor(ctx: Context<AppContext>) {
    this.ctx = ctx;
  }

  async runCodeStream(params: {
    roomId: Id<'room'>;
    language: RoomEntity['language'];
  }): Promise<ReadableStream<Uint8Array>> {
    const { roomId, language } = params;

    const config = LANGUAGE_CONFIG[language];
    if (!config) {
      return this.sseErrorStream(
        `Language "${language}" does not support single-file execution. Use the preview feature instead.`
      );
    }

    const t0 = Date.now();
    const sandboxId = getSandboxId(roomId);
    const sandbox = getSandbox(this.ctx.env.SANDBOX, sandboxId, { normalizeId: true });
    const tStub = Date.now();

    // Re-sync the workspace from the Y.Doc in case the container was reclaimed
    // since the last edit, otherwise the entry file may be missing.
    await this.ensureWorkspaceSynced(roomId);
    const tSync = Date.now();

    const filePath = `/workspace/${config.fileName}`;
    const outputPath = '/workspace/main_out';

    try {
      // Compile step for compiled languages
      let compileMs = 0;
      if (config.compileCommand) {
        const compileStart = Date.now();
        const compileResult = await sandbox.exec(config.compileCommand(filePath, outputPath), {
          timeout: EXECUTION_TIMEOUT_MS,
        });
        compileMs = Date.now() - compileStart;

        if (!compileResult.success) {
          return this.sseErrorStream(compileResult.stderr || compileResult.stdout);
        }
      }

      // Stream the run step
      const runTarget = config.compileCommand ? outputPath : filePath;
      const streamStart = Date.now();
      const stream = await sandbox.execStream(config.runCommand(runTarget), {
        timeout: EXECUTION_TIMEOUT_MS,
      });

      // Note: streamStartMs is the time to dispatch the exec and get the stream
      // back, not the time the program takes to run (that is streamed out).
      this.logTimings('runCodeStream', roomId, language, {
        stubMs: tStub - t0,
        ensureSyncMs: tSync - tStub,
        compileMs,
        streamStartMs: Date.now() - streamStart,
        totalMs: Date.now() - t0,
      });

      return stream;
    } catch (error) {
      console.error('Error streaming code:', error);
      return this.sseErrorStream(error instanceof Error ? error.message : 'Error running code');
    }
  }

  /**
   * Ask the room's durable object to re-write its Y.Doc workspace to the
   * sandbox filesystem before running. The container is ephemeral and may have
   * been reclaimed since the candidate's last edit, which would otherwise leave
   * the entry file missing and the run failing with a "file not found" error.
   * Best-effort: a sync failure shouldn't block the run attempt itself.
   */
  private async ensureWorkspaceSynced(roomId: Id<'room'>): Promise<void> {
    try {
      const roomName = this.ctx.env.Room.idFromName(roomId);
      const roomStub = this.ctx.env.Room.get(roomName);
      await roomStub.ensureWorkspaceSynced();
    } catch (error) {
      console.error('Failed to ensure workspace synced before run:', error);
    }
  }

  /**
   * Emit a single structured timing line per run so the slowest phase is easy
   * to spot in `wrangler tail` / local dev logs. Grep for `[sandbox-timing]`.
   * Durations are in ms: stubMs (get sandbox stub), ensureSyncMs (Y.Doc ->
   * sandbox re-sync), compileMs, runMs / streamStartMs, totalMs.
   */
  private logTimings(
    method: string,
    roomId: Id<'room'>,
    language: RoomEntity['language'],
    timings: Record<string, number>
  ): void {
    console.log(`[sandbox-timing] ${JSON.stringify({ method, roomId, language, ...timings })}`);
  }

  private sseErrorStream(message: string): ReadableStream<Uint8Array> {
    const encoder = new TextEncoder();
    return new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`));
        controller.close();
      },
    });
  }

  async runCode(params: {
    roomId: Id<'room'>;
    language: RoomEntity['language'];
  }): Promise<FormattedOutput> {
    const { roomId, language } = params;

    const config = LANGUAGE_CONFIG[language];
    if (!config) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        stdout: '',
        stderr: `Language "${language}" does not support single-file execution. Use the preview feature instead.`,
        exitCode: 1,
        elapsedTime: -1,
        compileTime: undefined,
      };
    }

    const t0 = Date.now();
    const sandboxId = getSandboxId(roomId);
    const sandbox = getSandbox(this.ctx.env.SANDBOX, sandboxId, { normalizeId: true });
    const tStub = Date.now();

    // Re-sync the workspace from the Y.Doc in case the container was reclaimed
    // since the last edit, otherwise the entry file may be missing.
    await this.ensureWorkspaceSynced(roomId);
    const tSync = Date.now();

    const filePath = `/workspace/${config.fileName}`;
    const outputPath = '/workspace/main_out';

    try {
      const start = Date.now();
      let compileTime: number | undefined;

      // Compile step for compiled languages
      if (config.compileCommand) {
        const compileResult = await sandbox.exec(config.compileCommand(filePath, outputPath), {
          timeout: EXECUTION_TIMEOUT_MS,
        });
        compileTime = Date.now() - start;

        if (!compileResult.success) {
          this.logTimings('runCode', roomId, language, {
            stubMs: tStub - t0,
            ensureSyncMs: tSync - tStub,
            compileMs: compileTime,
            runMs: 0,
            totalMs: Date.now() - t0,
            outcome: -1, // compile failure
          });
          return {
            success: false,
            stdout: compileResult.stdout,
            stderr: compileResult.stderr,
            exitCode: compileResult.exitCode,
            elapsedTime: compileTime,
            compileTime,
            timestamp: new Date().toISOString(),
          };
        }
      }

      // Run the code
      const runTarget = config.compileCommand ? outputPath : filePath;
      const runStart = Date.now();
      const result = await sandbox.exec(config.runCommand(runTarget), {
        timeout: EXECUTION_TIMEOUT_MS,
      });
      const runMs = Date.now() - runStart;

      this.logTimings('runCode', roomId, language, {
        stubMs: tStub - t0,
        ensureSyncMs: tSync - tStub,
        compileMs: compileTime ?? 0,
        runMs,
        totalMs: Date.now() - t0,
        outcome: result.success ? 1 : 0,
      });

      return {
        success: result.success,
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
        elapsedTime: Date.now() - start,
        compileTime,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error running code:', error);
      return {
        success: false,
        timestamp: new Date().toISOString(),
        stdout: '',
        stderr: error instanceof Error ? error.message : 'Error running code',
        exitCode: 1,
        elapsedTime: -1,
        compileTime: undefined,
      };
    }
  }
}
