import { BaseRoom } from './base-room';
import { Env } from './types';

export class InstructionRoom extends BaseRoom {
	constructor(state: DurableObjectState, env: Env) {
		super(state, env, 'instructions');
		// Initialize the room
		this.initialize();
	}

	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);

		// Handle WebSocket connections for y-websocket
		if (request.headers.get('Upgrade') === 'websocket') {
			return this.handleWebSocketUpgrade(request);
		}

		// Handle HTTP requests
		switch (url.pathname) {
			case '/':
				return this.handleInfo();
			case '/status':
				return this.handleStatus();
			case '/reset':
				return this.handleReset();
			default:
				return new Response('Not Found', { status: 404 });
		}
	}

	private handleInfo(): Response {
		const info = this.getRoomInfo();
		return new Response(JSON.stringify(info, null, 2), {
			headers: { 'Content-Type': 'application/json' },
		});
	}

	private handleStatus(): Response {
		const status = this.getRoomStatus();
		return new Response(JSON.stringify(status, null, 2), {
			headers: { 'Content-Type': 'application/json' },
		});
	}

	private async handleReset(): Promise<Response> {
		await this.resetRoom();
		return new Response(JSON.stringify({ message: 'Instructions document reset successfully' }), {
			headers: { 'Content-Type': 'application/json' },
		});
	}
}
