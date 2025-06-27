import { CollaborationManager } from './collaboration-manager';
import { CodeExecutionManager } from './code-execution-manager';
import { RoomInfo, RoomStatus } from './types';
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

		console.log(`WebSocket connection established with client ${clientId}`);
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
