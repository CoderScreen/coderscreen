import { CollaborationManager } from './internal/collaboration-manager';
import { CodeExecutionManager } from './internal/code-execution-manager';
import { UserManager } from './internal/user-manager';
import { RoomInfo, RoomStatus, UserPresenceMessage } from './internal/types';
import { DurableObject } from 'cloudflare:workers';
import { AppContext } from '@/index';
// import { SandboxManagerService } from '@/durable-objects/internal/SandboxManager.service';
import { TemplateEntity } from '@coderscreen/db/template.db';

export class UnifiedRoomDo extends DurableObject<AppContext['Bindings']> {
	private state: DurableObjectState;
	private codeManager: CollaborationManager;
	private instructionManager: CollaborationManager;
	private codeExecutionManager: CodeExecutionManager;
	private userManager: UserManager;
	// private sandboxManager: SandboxManagerService;

	constructor(state: DurableObjectState, env: AppContext['Bindings']) {
		super(state, env);
		this.state = state;
		this.env = env;

		this.codeManager = new CollaborationManager('code');
		this.instructionManager = new CollaborationManager('instructions');
		this.codeExecutionManager = new CodeExecutionManager();
		this.userManager = new UserManager();
		// this.sandboxManager = new SandboxManagerService(this.env);
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

	// async handleRunCode(params: { language: string; code: string }): Promise<{ output: string; exitCode: number; error: string | null }> {
	// 	const { language, code } = params;

	// 	try {
	// 		// Broadcast execution start
	// 		this.handleCodeExecutioMessage({ type: 'start' });

	// 		// Execute the code in the sandbox
	// 		let start = Date.now();
	// 		const result = await this.sandboxManager.runCode(this.state.id.toString(), language, code);
	// 		let end = Date.now();
	// 		console.log('sandbox-result', result, 'time', end - start);

	// 		// Extract output from the result - handle both void and result object cases
	// 		let output = 'No output from execution';
	// 		let exitCode = 0;
	// 		let error = null;

	// 		if (result && typeof result === 'object' && 'stdout' in result) {
	// 			output = result.stdout || result.stderr || 'No output from execution';
	// 			exitCode = result.exitCode || 0;
	// 			error = result.stderr || null;
	// 		}

	// 		// Broadcast execution complete
	// 		this.handleCodeExecutioMessage({ type: 'complete', output });

	// 		return { output, exitCode, error };
	// 	} catch (error) {
	// 		const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
	// 		this.handleCodeExecutioMessage({ type: 'error', error: errorMessage });
	// 		throw error;
	// 	}
	// }

	public async handleLoadTemplate(template: TemplateEntity) {
		// TODO
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
					// await this.sandboxManager.startSandbox(this.state.id.toString());
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

		// Remove user from user manager first
		const removedUser = this.userManager.removeUser(ws);
		if (removedUser) {
			// Broadcast user left to other clients
			this.userManager.broadcastUserLeft(removedUser, ws);
		}

		this.codeManager.removeConnection(ws);
		this.instructionManager.removeConnection(ws);
		this.codeExecutionManager.removeConnection(ws);
	}

	// Cloudflare Durable Object WebSocket error handler
	webSocketError(ws: WebSocket, error: unknown): void {
		console.error('WebSocket error:', error);

		// Remove user from user manager first
		const removedUser = this.userManager.removeUser(ws);
		if (removedUser) {
			// Broadcast user left to other clients
			this.userManager.broadcastUserLeft(removedUser, ws);
		}

		this.codeManager.removeConnection(ws);
		this.instructionManager.removeConnection(ws);
		this.codeExecutionManager.removeConnection(ws);
	}

	private handleMessage(ws: WebSocket, message: any): void {
		console.log('Message received:', message);

		// Handle user presence messages
		if (message.type === 'user-join') {
			this.handleUserJoin(ws, message);
			return;
		}

		if (message.type === 'user-list-request') {
			this.userManager.broadcastUserList(ws);
			return;
		}

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

	private handleUserJoin(ws: WebSocket, message: any): void {
		const { email, name, color } = message;
		const clientId = this.getClientId(ws);

		if (!email || !name) {
			console.error('Invalid user join message: missing email or name');
			return;
		}

		const user = {
			email,
			name,
			color: color || this.generateRandomColor(),
			clientId,
			connectedAt: Date.now(),
			lastSeen: Date.now(),
		};

		// Add user to user manager
		this.userManager.addUser(ws, user);

		// Send current user list to the joining user
		this.userManager.broadcastUserList(ws);

		// Broadcast user joined to other clients
		this.userManager.broadcastUserJoined(user, ws);

		console.log(`User ${email} joined the room`);
	}

	private generateRandomColor(): string {
		const colors = [
			'#1f2937',
			'#374151',
			'#4b5563',
			'#dc2626',
			'#ea580c',
			'#d97706',
			'#ca8a04',
			'#65a30d',
			'#16a34a',
			'#0d9488',
			'#0891b2',
			'#0284c7',
			'#2563eb',
			'#7c3aed',
			'#9333ea',
			'#c026d3',
			'#e11d48',
		];
		return colors[Math.floor(Math.random() * colors.length)];
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
		this.userManager.destroy();
	}

	async alarm(): Promise<void> {
		console.log('Unified room alarm triggered');
	}
}
