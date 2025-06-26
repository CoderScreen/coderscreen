import * as Y from 'yjs';
import { CodeExecutionMessage, CodeExecutionState } from './types';

export class CodeExecutionManager {
	private ydoc: Y.Doc;
	private connections: Map<WebSocket, string> = new Map();
	private clientCounter: number = 0;

	constructor() {
		this.ydoc = new Y.Doc();
	}

	getDocument(): Y.Doc {
		return this.ydoc;
	}

	getConnections(): Map<WebSocket, string> {
		return this.connections;
	}

	async loadFromStorage(storage: DurableObjectStorage): Promise<void> {
		const stored = await storage.get('ydoc-code-execution');
		if (stored) {
			Y.applyUpdate(this.ydoc, new Uint8Array(stored as ArrayBuffer));
		}
	}

	async saveToStorage(storage: DurableObjectStorage): Promise<void> {
		const docState = Y.encodeStateAsUpdate(this.ydoc);
		await storage.put('ydoc-code-execution', docState);
	}

	setupPersistence(storage: DurableObjectStorage): void {
		// Save document updates to storage
		this.ydoc.on('update', async (update: Uint8Array, origin: any) => {
			// Don't save updates that originated from this instance
			if (origin !== this) {
				await this.saveToStorage(storage);
			}
		});
	}

	generateClientId(): string {
		return `client-${++this.clientCounter}-${Date.now()}`;
	}

	addConnection(ws: WebSocket, clientId: string): void {
		this.connections.set(ws, clientId);
		console.log(`Code execution client ${clientId} connected. Total connections: ${this.connections.size}`);
	}

	removeConnection(ws: WebSocket): string | undefined {
		const clientId = this.connections.get(ws);
		if (clientId) {
			this.connections.delete(ws);
			console.log(`Code execution client ${clientId} disconnected. Total connections: ${this.connections.size}`);
		}
		return clientId;
	}

	handleMessage(ws: WebSocket, message: CodeExecutionMessage, clientId: string): void {
		console.log('Code execution message received:', message);

		switch (message.type) {
			case 'sync':
				// Send current document state
				const docState = Y.encodeStateAsUpdate(this.ydoc);
				ws.send(
					JSON.stringify({
						type: 'sync',
						data: Array.from(docState),
					}),
				);
				break;

			case 'update':
				// Apply update to document
				if (Array.isArray(message.data)) {
					const update = new Uint8Array(message.data);
					Y.applyUpdate(this.ydoc, update, ws);

					// Broadcast to other connections
					this.broadcastUpdate(update, ws);
				}
				break;
		}
	}

	broadcastExecutionStart(storage?: DurableObjectStorage): void {
		const executionState = this.ydoc.getMap('execution');

		// Update the execution state
		executionState.set('status', {
			isRunning: true,
			output: undefined,
			error: undefined,
			timestamp: Date.now(),
		});

		// Broadcast the update to all connections
		this.broadcastExecutionUpdate();

		// Save to storage if available
		if (storage) {
			this.saveToStorage(storage);
		}
	}

	broadcastExecutionComplete(params: { output: string }, storage?: DurableObjectStorage): void {
		const executionState = this.ydoc.getMap('execution');

		// Update the execution state
		executionState.set('status', {
			isRunning: false,
			output: params.output,
			error: undefined,
			timestamp: Date.now(),
		});

		// Broadcast the update to all connections
		this.broadcastExecutionUpdate();

		// Save to storage if available
		if (storage) {
			this.saveToStorage(storage);
		}
	}

	broadcastExecutionError(params: { error: string }, storage?: DurableObjectStorage): void {
		const executionState = this.ydoc.getMap('execution');

		// Update the execution state
		executionState.set('status', {
			isRunning: false,
			output: undefined,
			error: params.error,
			timestamp: Date.now(),
		});

		// Broadcast the update to all connections
		this.broadcastExecutionUpdate();

		// Save to storage if available
		if (storage) {
			this.saveToStorage(storage);
		}
	}

	private broadcastExecutionUpdate(): void {
		const executionState = this.ydoc.getMap('execution');
		const currentStatus = executionState.get('status') as CodeExecutionState | undefined;

		if (currentStatus) {
			const message: CodeExecutionMessage = {
				type: currentStatus.isRunning ? 'execution_start' : currentStatus.error ? 'execution_error' : 'execution_complete',
				data: {
					output: currentStatus.output,
					error: currentStatus.error,
					timestamp: currentStatus.timestamp,
				},
			};

			this.broadcast(message);
		}
	}

	private broadcastUpdate(update: Uint8Array, exclude: WebSocket): void {
		const message = JSON.stringify({
			type: 'update',
			data: Array.from(update),
		});

		for (const [connection] of this.connections) {
			if (connection !== exclude && connection.readyState === WebSocket.OPEN) {
				connection.send(message);
			}
		}
	}

	private broadcast(message: CodeExecutionMessage): void {
		const messageStr = JSON.stringify(message);
		const closedConnections: WebSocket[] = [];

		this.connections.forEach((clientId, ws) => {
			if (ws.readyState === WebSocket.OPEN) {
				try {
					ws.send(messageStr);
				} catch (error) {
					console.error(`Error sending message to client ${clientId}:`, error);
					closedConnections.push(ws);
				}
			} else {
				closedConnections.push(ws);
			}
		});

		// Clean up closed connections
		closedConnections.forEach((ws) => {
			this.removeConnection(ws);
		});
	}

	getConnectionCount(): number {
		return this.connections.size;
	}

	getLastExecutionState() {
		const executionState = this.ydoc.getMap('execution');
		return (
			executionState.get('status') || {
				isRunning: false,
				timestamp: Date.now(),
			}
		);
	}

	destroy(): void {
		this.ydoc.destroy();
		this.connections.clear();
	}

	reset(): void {
		this.ydoc.destroy();
		this.ydoc = new Y.Doc();
		this.connections.clear();
	}
}
