import { getSandbox, LogEvent, parseSSEStream } from '@cloudflare/sandbox';
import { Id } from '@coderscreen/common/id';
import { RoomEntity } from '@coderscreen/db/room.db';
import { getSandboxId } from '@/lib/sandbox';

const FRAMEWORK_CONFIG: Record<string, { port: number }> = {
  react: { port: 5173 },
  vue: { port: 5173 },
  svelte: { port: 5173 },
};

const INSTALL_TIMEOUT_MS = 120_000;
const TUNNEL_URL_TIMEOUT_MS = 20_000;

export class PreviewService {
  private async startCloudflaredTunnel(
    sandbox: ReturnType<typeof getSandbox>,
    port: number
  ): Promise<string> {
    const process = await sandbox.startProcess(`cloudflared tunnel --url http://localhost:${port}`);

    const logStream = await sandbox.streamProcessLogs(process.id);

    return new Promise<string>((resolve) => {
      const timeout = setTimeout(() => {
        console.warn('Timeout waiting for cloudflared tunnel URL');
        resolve('');
      }, TUNNEL_URL_TIMEOUT_MS);

      const processLogs = async () => {
        try {
          for await (const event of parseSSEStream<LogEvent>(logStream)) {
            console.log('tunnel-log', event);
            if (event.data) {
              const urlMatch = event.data.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
              if (urlMatch) {
                clearTimeout(timeout);
                resolve(urlMatch[0]);
                return;
              }
            }
          }
        } catch (error) {
          console.error('Cloudflared tunnel process failed', error);
          clearTimeout(timeout);
          resolve('');
        }
      };

      processLogs();
    });
  }

  async startPreview(params: {
    sandboxBinding: Env['SANDBOX'];
    roomId: Id<'room'>;
    language: RoomEntity['language'];
    hostname: string;
    useTunnel: boolean;
  }): Promise<{ previewUrl: string }> {
    const { sandboxBinding, roomId, language, hostname, useTunnel } = params;

    const config = FRAMEWORK_CONFIG[language];
    if (!config) {
      throw new Error(`Language "${language}" does not support preview`);
    }

    const sandboxId = getSandboxId(roomId);
    const sandbox = getSandbox(sandboxBinding, sandboxId, { normalizeId: true });

    // 1. Clean up any previous preview (processes + exposed port)
    await sandbox.killAllProcesses();
    try {
      await sandbox.unexposePort(config.port);
    } catch {
      // Port may not be exposed — ignore
    }

    // 2. Start cloudflared tunnel in parallel with npm install (if using tunnel)
    const tunnelUrlPromise = useTunnel
      ? this.startCloudflaredTunnel(sandbox, config.port)
      : Promise.resolve('');

    // 3. Install dependencies (runs in parallel with tunnel startup)
    const [installResult, tunnelUrl] = await Promise.all([
      sandbox.exec('npm install', {
        cwd: '/workspace',
        timeout: INSTALL_TIMEOUT_MS,
      }),
      tunnelUrlPromise,
    ]);

    if (!installResult.success) {
      throw new Error(`npm install failed: ${installResult.stderr || installResult.stdout}`);
    }

    // 4. Start Vite dev server
    const devServer = await sandbox.startProcess('npx vite --host 0.0.0.0', {
      cwd: '/workspace',
    });

    // 5. Wait for the dev server port to be ready
    await devServer.waitForPort(config.port, {
      timeout: INSTALL_TIMEOUT_MS,
      mode: 'http',
    });

    // 6. Get preview URL
    if (useTunnel && tunnelUrl) {
      return { previewUrl: tunnelUrl };
    }

    // Production path: expose port via Cloudflare's subdomain routing
    const { url } = await sandbox.exposePort(config.port, { hostname });
    // In local dev, rewrite https:// to http:// since wrangler dev doesn't serve TLS
    const previewUrl = url.replace(/^https:\/\//, 'http://');

    return { previewUrl };
  }

  async stopPreview(params: { sandboxBinding: Env['SANDBOX']; roomId: Id<'room'> }): Promise<void> {
    const { sandboxBinding, roomId } = params;
    const sandboxId = getSandboxId(roomId);
    const sandbox = getSandbox(sandboxBinding, sandboxId, { normalizeId: true });

    await sandbox.killAllProcesses();

    // Unexpose all framework ports
    for (const config of Object.values(FRAMEWORK_CONFIG)) {
      try {
        await sandbox.unexposePort(config.port);
      } catch {
        // Port may not be exposed — ignore
      }
    }
  }
}
