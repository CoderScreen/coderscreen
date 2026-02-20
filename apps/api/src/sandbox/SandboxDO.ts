import { Sandbox } from '@cloudflare/sandbox';

export class SandboxDO extends Sandbox<Env> {
	sleepAfter = '10m';

	constructor(ctx: DurableObjectState, env: Env) {
		console.log('[SandboxDO] constructor called, container available:', ctx.container !== undefined);
		super(ctx, env);
		console.log('[SandboxDO] constructor completed successfully');
	}

	override onStart() {
		console.log('[SandboxDO] container started');
	}

	override onError(error: unknown) {
		console.error('[SandboxDO] container error:', error);
		if (error instanceof Error) throw error;
		throw new Error(String(error));
	}
}
