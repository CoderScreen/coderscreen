import * as Y from 'yjs';

export interface Env {
	// Add any environment variables you need
}

interface AwarenessState {
	user: {
		name: string;
		color: string;
		id: string;
	};
	cursor?: {
		index: number;
		length: number;
	};
	selection?: {
		anchor: number;
		head: number;
	};
}

export class CodeRoom implements DurableObject {
	private state: DurableObjectState;
	private env: Env;
	private ydoc: Y.Doc;
	private connections: Map<WebSocket, string> = new Map(); // ws -> clientId
	private clientCounter: number = 0;

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

			// Handle WebSocket events
			server.addEventListener('close', () => {
				const clientId = this.connections.get(server);
				if (clientId) {
					// Remove from awareness
					const awareness = this.ydoc.getMap('awareness');
					awareness.delete(clientId);
					this.connections.delete(server);

					// Broadcast removal to other clients
					this.broadcastAwareness(
						{
							type: 'awareness-remove',
							clientId: clientId,
						},
						server
					);
				}
			});

			server.addEventListener('error', (error) => {
				console.error('WebSocket error:', error);
				const clientId = this.connections.get(server);
				if (clientId) {
					const awareness = this.ydoc.getMap('awareness');
					awareness.delete(clientId);
					this.connections.delete(server);
				}
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
		// Generate unique client ID
		const clientId = `client-${++this.clientCounter}-${Date.now()}`;
		this.connections.set(ws, clientId);

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

						// Send current awareness state
						const awarenessState = Array.from(awareness.entries());
						ws.send(
							JSON.stringify({
								type: 'awareness-sync',
								data: awarenessState,
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
						const awarenessData: AwarenessState = message.awareness;
						awareness.set(clientId, awarenessData);
						this.broadcastAwareness(
							{
								type: 'awareness',
								clientId: clientId,
								awareness: awarenessData,
							},
							ws
						);
						break;

					case 'cursor-update':
						// Handle cursor position updates
						const cursorData = message.cursor;
						const currentAwareness = awareness.get(clientId) || {};
						const updatedAwareness = {
							...currentAwareness,
							cursor: cursorData,
						};
						awareness.set(clientId, updatedAwareness);

						this.broadcastAwareness(
							{
								type: 'cursor-update',
								clientId: clientId,
								cursor: cursorData,
							},
							ws
						);
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

		for (const [connection] of this.connections) {
			if (connection !== exclude && connection.readyState === WebSocket.OPEN) {
				connection.send(message);
			}
		}
	}

	private broadcastAwareness(awarenessMessage: any, exclude: WebSocket) {
		const message = JSON.stringify(awarenessMessage);

		for (const [connection] of this.connections) {
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
		for (const [ws] of this.connections) {
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
