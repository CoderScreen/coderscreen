import { CollaborationManager } from './collaboration-manager';
import { CodeExecutionManager } from './code-execution-manager';
import { Env, RoomInfo, RoomStatus } from './types';
import { DurableObject } from 'cloudflare:workers';
import { AppContext } from '@/index';

export class UnifiedRoomDo extends DurableObject<AppContext['Bindings']> {
	private state: DurableObjectState;
	private codeManager: CollaborationManager;
	private instructionManager: CollaborationManager;
	private codeExecutionManager: CodeExecutionManager;

	constructor(state: DurableObjectState, env: AppContext['Bindings']) {
		super(state, env);
		this.state = state;
		this.env = env;

		this.codeManager = new CollaborationManager('code');
		this.instructionManager = new CollaborationManager('instructions');
		this.codeExecutionManager = new CodeExecutionManager();
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

		// Handle HTTP requests
		switch (url.pathname) {
			case '/':
				return this.handleInfo();
			case '/status':
				return this.handleStatus();
			case '/code/reset':
				return this.handleCodeReset();
			case '/instructions/reset':
				return this.handleInstructionReset();
			case '/reset':
				return this.handleFullReset();
			default:
				return new Response('Not Found', { status: 404 });
		}
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

	handleCodeExecution(
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

		// Handle WebSocket events
		ws.addEventListener('close', () => {
			this.codeManager.removeConnection(ws);
			this.instructionManager.removeConnection(ws);
			this.codeExecutionManager.removeConnection(ws);
		});

		ws.addEventListener('error', (error) => {
			console.error('WebSocket error:', error);
			this.codeManager.removeConnection(ws);
			this.instructionManager.removeConnection(ws);
			this.codeExecutionManager.removeConnection(ws);
		});

		ws.addEventListener('message', (event) => {
			try {
				const message = JSON.parse(event.data as string);
				this.handleMessage(ws, message, clientId);
			} catch (error) {
				console.error('Error processing message:', error);
			}
		});
	}

	private handleMessage(ws: WebSocket, message: any, clientId: string): void {
		console.log('Message received:', message);

		// Route message to appropriate manager based on message type or document type
		if (message.type === 'execution') {
			console.log('Code execution message received:', message);
			this.codeExecutionManager.handleMessage(ws, message, clientId);
			return;
		} else if (message.documentType === 'code') {
			this.codeManager.handleMessage(ws, message, clientId);
		} else if (message.documentType === 'instructions') {
			this.instructionManager.handleMessage(ws, message, clientId);
		} else {
			// Default to code if no document type specified
			this.codeManager.handleMessage(ws, message, clientId);
		}
	}

	private generateClientId(): string {
		return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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

	private async handleCodeReset(): Promise<Response> {
		await this.resetCodeDocument();
		return new Response(JSON.stringify({ message: 'Code document reset successfully' }), {
			headers: { 'Content-Type': 'application/json' },
		});
	}

	private async handleInstructionReset(): Promise<Response> {
		await this.resetInstructionDocument();
		return new Response(JSON.stringify({ message: 'Instructions document reset successfully' }), {
			headers: { 'Content-Type': 'application/json' },
		});
	}

	private async handleFullReset(): Promise<Response> {
		await this.resetAllDocuments();
		return new Response(JSON.stringify({ message: 'All documents reset successfully' }), {
			headers: { 'Content-Type': 'application/json' },
		});
	}

	private getRoomInfo(): RoomInfo {
		const codeConnections = this.codeManager.getConnections();
		const instructionConnections = this.instructionManager.getConnections();
		const executionConnections = this.codeExecutionManager.getConnections();
		const codeDoc = this.codeManager.getDocument();
		const instructionDoc = this.instructionManager.getDocument();

		return {
			roomId: this.state.id.toString(),
			connections: codeConnections.size + instructionConnections.size + executionConnections.size,
			documentSize: codeDoc.store.clients.size + instructionDoc.store.clients.size,
			lastModified: new Date().toISOString(),
			roomType: 'unified',
		};
	}

	private getRoomStatus(): RoomStatus {
		const codeConnections = this.codeManager.getConnections();
		const instructionConnections = this.instructionManager.getConnections();
		const executionConnections = this.codeExecutionManager.getConnections();
		const codeDoc = this.codeManager.getDocument();
		const instructionDoc = this.instructionManager.getDocument();

		return {
			connected: codeConnections.size > 0 || instructionConnections.size > 0 || executionConnections.size > 0,
			connectionCount: codeConnections.size + instructionConnections.size + executionConnections.size,
			documentExists: codeDoc.store.clients.size > 0 || instructionDoc.store.clients.size > 0,
			roomType: 'unified',
		};
	}

	private async resetCodeDocument(): Promise<void> {
		this.codeManager.reset();
		await this.state.storage.delete('ydoc-code');
		this.codeManager.setupPersistence(this.state.storage);
	}

	private async resetInstructionDocument(): Promise<void> {
		this.instructionManager.reset();
		await this.state.storage.delete('ydoc-instructions');
		this.instructionManager.setupPersistence(this.state.storage);
	}

	private async resetAllDocuments(): Promise<void> {
		await this.resetCodeDocument();
		await this.resetInstructionDocument();
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
