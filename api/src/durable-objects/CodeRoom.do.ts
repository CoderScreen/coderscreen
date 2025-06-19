import * as Y from 'yjs';

export interface Env {
	// Add any environment variables you need
}

export class CodeRoom implements DurableObject {
	private state: DurableObjectState;
	private env: Env;
	private ydoc: Y.Doc;
	private connections: Set<WebSocket> = new Set();

	constructor(state: DurableObjectState, env: Env) {
		this.state = state;
		this.env = env;

		// Initialize Yjs document
		this.ydoc = new Y.Doc();

		// Set up persistence
		this.setupPersistence();
	}

	private async setupPersistence() {
		// Load existing document from storage
		const stored = await this.state.storage.get('ydoc');
		if (stored) {
			Y.applyUpdate(this.ydoc, new Uint8Array(stored as ArrayBuffer));
		}

		// Save document updates to storage
		this.ydoc.on('update', async (update: Uint8Array, origin: any) => {
			// Don't save updates that originated from this instance
			if (origin !== this) {
				const docState = Y.encodeStateAsUpdate(this.ydoc);
				await this.state.storage.put('ydoc', docState);
			}
		});
	}

	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);

		// Handle WebSocket connections for y-websocket
		if (request.headers.get('Upgrade') === 'websocket') {
			const pair = new WebSocketPair();
			const [client, server] = Object.values(pair) as [WebSocket, WebSocket];

			// Accept the WebSocket connection
			this.state.acceptWebSocket(server);

			// Set up y-websocket connection manually since we can't import the utils
			this.setupYWebSocketConnection(server, request);

			// Track the connection
			this.connections.add(server);

			// Handle WebSocket events
			server.addEventListener('close', () => {
				this.connections.delete(server);
			});

			server.addEventListener('error', (error) => {
				console.error('WebSocket error:', error);
				this.connections.delete(server);
			});

			return new Response(null, {
				status: 101,
				webSocket: client,
			});
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

	private setupYWebSocketConnection(ws: WebSocket, request: Request) {
		// Simple y-websocket protocol implementation
		const awareness = this.ydoc.getMap('awareness');

		ws.addEventListener('message', (event) => {
			try {
				const message = JSON.parse(event.data as string);

				switch (message.type) {
					case 'sync':
						// Send current document state
						const docState = Y.encodeStateAsUpdate(this.ydoc);
						ws.send(
							JSON.stringify({
								type: 'sync',
								data: Array.from(docState),
							})
						);
						break;

					case 'update':
						// Apply update to document
						const update = new Uint8Array(message.data);
						Y.applyUpdate(this.ydoc, update, ws);

						// Broadcast to other connections
						this.broadcastUpdate(update, ws);
						break;

					case 'awareness':
						// Handle awareness updates
						awareness.set(message.clientId, message.awareness);
						this.broadcastAwareness(message, ws);
						break;
				}
			} catch (error) {
				console.error('Error processing message:', error);
			}
		});
	}

	private broadcastUpdate(update: Uint8Array, exclude: WebSocket) {
		const message = JSON.stringify({
			type: 'update',
			data: Array.from(update),
		});

		for (const connection of this.connections) {
			if (connection !== exclude && connection.readyState === WebSocket.OPEN) {
				connection.send(message);
			}
		}
	}

	private broadcastAwareness(awarenessMessage: any, exclude: WebSocket) {
		const message = JSON.stringify(awarenessMessage);

		for (const connection of this.connections) {
			if (connection !== exclude && connection.readyState === WebSocket.OPEN) {
				connection.send(message);
			}
		}
	}

	private handleInfo(): Response {
		const info = {
			roomId: this.state.id.toString(),
			connections: this.connections.size,
			documentSize: this.ydoc.store.clients.size,
			lastModified: new Date().toISOString(),
		};

		return new Response(JSON.stringify(info, null, 2), {
			headers: { 'Content-Type': 'application/json' },
		});
	}

	private handleStatus(): Response {
		const status = {
			connected: this.connections.size > 0,
			connectionCount: this.connections.size,
			documentExists: this.ydoc.store.clients.size > 0,
		};

		return new Response(JSON.stringify(status, null, 2), {
			headers: { 'Content-Type': 'application/json' },
		});
	}

	private async handleReset(): Promise<Response> {
		// Clear the document
		this.ydoc.destroy();
		this.ydoc = new Y.Doc();

		// Clear storage
		await this.state.storage.delete('ydoc');

		// Close all connections
		for (const ws of this.connections) {
			ws.close(1000, 'Document reset');
		}
		this.connections.clear();

		// Set up persistence again
		this.setupPersistence();

		return new Response(JSON.stringify({ message: 'Document reset successfully' }), {
			headers: { 'Content-Type': 'application/json' },
		});
	}

	// Optional: Handle alarms for cleanup
	async alarm(): Promise<void> {
		// Clean up inactive connections or perform maintenance
		console.log('CodeRoom alarm triggered');
	}
}
