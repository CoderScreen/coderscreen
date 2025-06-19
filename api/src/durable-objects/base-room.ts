import { CollaborationManager } from './collaboration-manager';
import { Env, RoomInfo, RoomStatus } from './types';

export abstract class BaseRoom {
	protected state: DurableObjectState;
	protected env: Env;
	protected collaborationManager: CollaborationManager;

	constructor(state: DurableObjectState, env: Env, roomType: 'code' | 'instructions') {
		this.state = state;
		this.env = env;
		this.collaborationManager = new CollaborationManager(roomType);
	}

	async initialize(): Promise<void> {
		// Load existing document from storage
		await this.collaborationManager.loadFromStorage(this.state.storage);

		// Set up persistence
		this.collaborationManager.setupPersistence(this.state.storage);
	}

	protected async ensureInitialized(): Promise<void> {
		// This ensures the room is initialized when needed
		// The actual initialization will be called by the derived classes
	}

	protected setupWebSocketConnection(ws: WebSocket): void {
		// Generate unique client ID
		const clientId = this.collaborationManager.generateClientId();
		this.collaborationManager.addConnection(ws, clientId);

		// Handle WebSocket events
		ws.addEventListener('close', () => {
			const clientId = this.collaborationManager.removeConnection(ws);
			if (clientId) {
				// Broadcast removal to other clients
				this.collaborationManager.broadcastAwarenessRemove(clientId, ws);
			}
		});

		ws.addEventListener('error', (error) => {
			console.error('WebSocket error:', error);
			this.collaborationManager.removeConnection(ws);
		});

		ws.addEventListener('message', (event) => {
			try {
				const message = JSON.parse(event.data as string);
				this.collaborationManager.handleMessage(ws, message, clientId);
			} catch (error) {
				console.error('Error processing message:', error);
			}
		});
	}

	protected handleWebSocketUpgrade(request: Request): Response {
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

	protected getRoomInfo(): RoomInfo {
		const connections = this.collaborationManager.getConnections();
		const ydoc = this.collaborationManager.getDocument();

		return {
			roomId: this.state.id.toString(),
			connections: connections.size,
			documentSize: ydoc.store.clients.size,
			lastModified: new Date().toISOString(),
			roomType: this.collaborationManager.getRoomType(),
		};
	}

	protected getRoomStatus(): RoomStatus {
		const connections = this.collaborationManager.getConnections();
		const ydoc = this.collaborationManager.getDocument();

		return {
			connected: connections.size > 0,
			connectionCount: connections.size,
			documentExists: ydoc.store.clients.size > 0,
			roomType: this.collaborationManager.getRoomType(),
		};
	}

	protected async resetRoom(): Promise<void> {
		// Clear the document
		this.collaborationManager.reset();

		// Clear storage
		await this.state.storage.delete(`ydoc-${this.collaborationManager.getRoomType()}`);

		// Close all connections
		const connections = this.collaborationManager.getConnections();
		for (const [ws] of connections) {
			ws.close(1000, 'Document reset');
		}

		// Set up persistence again
		this.collaborationManager.setupPersistence(this.state.storage);
	}

	destroy(): void {
		this.collaborationManager.destroy();
	}

	// Optional: Handle alarms for cleanup
	async alarm(): Promise<void> {
		// Clean up inactive connections or perform maintenance
		console.log(`${this.collaborationManager.getRoomType()} room alarm triggered`);
	}
}
