import { CollaborationManager } from './collaboration-manager';
import { CodeExecutionManager } from './code-execution-manager';
import { RoomInfo, RoomStatus } from './types';
import { DurableObject } from 'cloudflare:workers';
import { AppContext } from '@/index';
import { SandboxManagerService } from '@/durable-objects/internal/SandboxManager.service';

export class UnifiedRoomDo extends DurableObject<AppContext['Bindings']> {
	private state: DurableObjectState;
	private codeManager: CollaborationManager;
	private instructionManager: CollaborationManager;
	private codeExecutionManager: CodeExecutionManager;
	private sandboxManager: SandboxManagerService;

	constructor(state: DurableObjectState, env: AppContext['Bindings']) {
		super(state, env);
		this.state = state;
		this.env = env;

		this.codeManager = new CollaborationManager('code');
		this.instructionManager = new CollaborationManager('instructions');
		this.codeExecutionManager = new CodeExecutionManager();
		this.sandboxManager = new SandboxManagerService(this.env);
	}

	async initialize(): Promise<void> {
		// Load existing documents from storage
		await this.codeManager.loadFromStorage(this.state.storage);
		await this.instructionManager.loadFromStorage(this.state.storage);
		await this.codeExecutionManager.loadFromStorage(this.state.storage);

		// Set up persistence for both documents
		this.codeManager.setupPersistence(this.state.storage);
		this.instructionManager.setupPersistence(this.state.storage);
		this.codeExecutionManager.setupPersistence(this.state.storage);
	}

	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);

		// Handle WebSocket connections for y-websocket
		if (request.headers.get('Upgrade') === 'websocket') {
			return this.handleWebSocketUpgrade(request);
		}

		console.log('room.do fetch that isnt websocket', url.pathname, request.method);

		return new Response('Not Found', { status: 404 });
	}

	private handleWebSocketUpgrade(request: Request): Response {
		const pair = new WebSocketPair();
		const [client, server] = Object.values(pair) as [WebSocket, WebSocket];

		// Accept the WebSocket connection
		this.state.acceptWebSocket(server);

		// Set up the connection
		this.setupWebSocketConnection(server);

		return new Response(null, {
			status: 101,
			webSocket: client,
		});
	}

	async handleRunCode(params: { language: string; code: string }): Promise<{ output: string; exitCode: number; error: string | null }> {
		const { language, code } = params;

		try {
			// Broadcast execution start
			this.handleCodeExecutioMessage({ type: 'start' });

			// Execute the code in the sandbox
			let start = Date.now();
			const result = await this.sandboxManager.runCode(this.state.id.toString(), language, code);
			let end = Date.now();
			console.log('sandbox-result', result, 'time', end - start);

			// Extract output from the result - handle both void and result object cases
			let output = 'No output from execution';
			let exitCode = 0;
			let error = null;

			if (result && typeof result === 'object' && 'stdout' in result) {
				output = result.stdout || result.stderr || 'No output from execution';
				exitCode = result.exitCode || 0;
				error = result.stderr || null;
			}

			// Broadcast execution complete
			this.handleCodeExecutioMessage({ type: 'complete', output });

			return { output, exitCode, error };
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
			this.handleCodeExecutioMessage({ type: 'error', error: errorMessage });
			throw error;
		}
	}

	public handleCodeExecutioMessage(
		params:
			| {
					type: 'start';
			  }
			| {
					type: 'complete';
					output: string;
			  }
			| {
					type: 'error';
					error: string;
			  },
	) {
		switch (params.type) {
			case 'start':
				this.codeExecutionManager.broadcastExecutionStart(this.state.storage);
				break;
			case 'complete':
				this.codeExecutionManager.broadcastExecutionComplete({ output: params.output }, this.state.storage);
				break;
			case 'error':
				this.codeExecutionManager.broadcastExecutionError({ error: params.error }, this.state.storage);
				break;
		}
	}
	private setupWebSocketConnection(ws: WebSocket): void {
		// Generate unique client ID
		const clientId = this.generateClientId();

		// Add to all managers (client will specify which type they want to work with)
		this.codeManager.addConnection(ws, clientId);
		this.instructionManager.addConnection(ws, clientId);
		this.codeExecutionManager.addConnection(ws, clientId);

		console.log(`WebSocket connection established with client ${clientId}`);

		// if this is the first connection, start the sandbox
		this.state.waitUntil(
			new Promise(async (resolve) => {
				console.log('num-existing-connections', this.codeExecutionManager.getConnections().size);

				if (this.codeExecutionManager.getConnections().size === 1) {
					console.log('starting sandbox bc first connection');
					await this.sandboxManager.startSandbox(this.state.id.toString());
				}
				resolve(true);
			}),
		);
	}

	// Cloudflare Durable Object WebSocket message handler
	webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): void {
		try {
			// Handle string messages (JSON)
			if (typeof message === 'string') {
				console.log('room.do webSocketMessage received:', message);
				const parsedMessage = JSON.parse(message);
				this.handleMessage(ws, parsedMessage);
			} else {
				// Handle binary messages (Y.js updates)
				// console.log('Received binary message (likely Y.js update)');
				// You might want to handle binary messages differently
			}
		} catch (error) {
			console.error('Error processing WebSocket message:', error);
		}
	}

	// Cloudflare Durable Object WebSocket close handler
	webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean): void {
		console.log(`WebSocket closed: code=${code}, reason=${reason}, wasClean=${wasClean}`);

		this.codeManager.removeConnection(ws);
		this.instructionManager.removeConnection(ws);
		this.codeExecutionManager.removeConnection(ws);
	}

	// Cloudflare Durable Object WebSocket error handler
	webSocketError(ws: WebSocket, error: unknown): void {
		console.error('WebSocket error:', error);

		this.codeManager.removeConnection(ws);
		this.instructionManager.removeConnection(ws);
		this.codeExecutionManager.removeConnection(ws);
	}

	private handleMessage(ws: WebSocket, message: any): void {
		console.log('Message received:', message);

		// Route message to appropriate manager based on message type or document type
		if (message.type === 'execution') {
			console.log('Code execution message received:', message);
			// Extract the actual message type and create the proper message format
			const executionMessage = {
				type: message.messageType ?? message.type,
				data: message.data,
			};
			this.codeExecutionManager.handleMessage(ws, executionMessage);
			return;
		} else if (message.documentType === 'code') {
			this.codeManager.handleMessage(ws, message, this.getClientId(ws));
		} else if (message.documentType === 'instructions') {
			this.instructionManager.handleMessage(ws, message, this.getClientId(ws));
		} else {
			// Default to code if no document type specified
			this.codeManager.handleMessage(ws, message, this.getClientId(ws));
		}
	}

	private getClientId(ws: WebSocket): string {
		// Try to find the client ID from any of the managers
		const codeClientId = this.codeManager.getConnections().get(ws);
		if (codeClientId) return codeClientId;

		const instructionClientId = this.instructionManager.getConnections().get(ws);
		if (instructionClientId) return instructionClientId;

		const executionClientId = this.codeExecutionManager.getConnections().get(ws);
		if (executionClientId) return executionClientId;

		// If not found, generate a new one
		return this.generateClientId();
	}

	private generateClientId(): string {
		return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}

	destroy(): void {
		this.codeManager.destroy();
		this.instructionManager.destroy();
		this.codeExecutionManager.destroy();
	}

	async alarm(): Promise<void> {
		console.log('Unified room alarm triggered');
	}
}
