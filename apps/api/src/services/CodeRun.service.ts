import { Id } from '@coderscreen/common/id';
import { RoomEntity } from '@coderscreen/db/room.db';
import { Context } from 'hono';
import { FormattedOutput, formatExecOutput, getSandboxId } from '@/lib/sandbox';
import { AppContext } from '..';

export class CodeRunService {
  private ctx: Context<AppContext>;

  constructor(ctx: Context<AppContext>) {
    this.ctx = ctx;
  }

  async runCode(params: {
    roomId: Id<'room'>;
    code: string;
    language: RoomEntity['language'];
  }): Promise<FormattedOutput> {
    const { roomId, code, language } = params;

    // Get the durable object to broadcast execution status
    // const id = this.ctx.env.ROOM_DO.idFromName(roomId);
    // const roomDo = this.ctx.env.ROOM_DO.get(id);

    // this.ctx.executionCtx.waitUntil(roomDo.handleCodeExecutioMessage({ type: 'start' }));

    const sandbox = await this.getSandbox(roomId);
    console.log('sandbox', sandbox);

    try {
      console.log('running code');
      const raw = await sandbox.runCode({ language, code });

      const result = formatExecOutput(raw);
      return result;
    } catch (error) {
      console.error('error', error);
      return {
        success: false,
        timestamp: new Date().toISOString(),
        stdout: '',
        stderr: 'Error running code',
        exitCode: 1,
        elapsedTime: -1,
        compileTime: undefined,
      };
    }

    // throw new Error('test');
    // console.log('result', result);

    // // // Broadcast execution complete
    // // this.ctx.executionCtx.waitUntil(
    // // 	roomDo.handleCodeExecutioMessage({ type: 'complete', output: result?.stdout || result?.stderr || 'No output from execution' }),
    // // );

    // return result;
  }

  private async getSandbox(roomId: Id<'room'>) {
    const sandboxId = getSandboxId(roomId);
    const sandbox = this.ctx.env.SANDBOX.get(this.ctx.env.SANDBOX.idFromName(sandboxId));
    return sandbox;
  }
}
