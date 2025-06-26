import * as Y from 'yjs';
import { AwarenessState, CollaborationMessage } from './types';

export class CollaborationManager {
	private ydoc: Y.Doc;
	private connections: Map<WebSocket, string> = new Map();
	private clientCounter: number = 0;
	private roomType: 'code' | 'instructions';

	constructor(roomType: 'code' | 'instructions') {
		this.ydoc = new Y.Doc();
		this.roomType = roomType;
	}

	getDocument(): Y.Doc {
		return this.ydoc;
	}

	getConnections(): Map<WebSocket, string> {
		return this.connections;
	}

	getRoomType(): 'code' | 'instructions' {
		return this.roomType;
	}

	async loadFromStorage(storage: DurableObjectStorage): Promise<void> {
		const stored = await storage.get(`ydoc-${this.roomType}`);
		if (stored) {
			Y.applyUpdate(this.ydoc, new Uint8Array(stored as ArrayBuffer));
		}
	}

	async saveToStorage(storage: DurableObjectStorage): Promise<void> {
		const docState = Y.encodeStateAsUpdate(this.ydoc);
		await storage.put(`ydoc-${this.roomType}`, docState);
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
	}

	removeConnection(ws: WebSocket): string | undefined {
		const clientId = this.connections.get(ws);
		if (clientId) {
			// Remove from awareness
			const awareness = this.ydoc.getMap('awareness');
			awareness.delete(clientId);
			this.connections.delete(ws);
		}
		return clientId;
	}

	handleMessage(ws: WebSocket, message: CollaborationMessage, clientId: string): void {
		const awareness = this.ydoc.getMap('awareness');

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

				// Send current awareness state
				const awarenessState = Array.from(awareness.entries());
				ws.send(
					JSON.stringify({
						type: 'awareness-sync',
						data: awarenessState,
					}),
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
				const awarenessData: AwarenessState = message.awareness!;
				awareness.set(clientId, awarenessData);
				this.broadcastAwareness(
					{
						type: 'awareness',
						clientId: clientId,
						awareness: awarenessData,
					},
					ws,
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
					ws,
				);
				break;
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

	private broadcastAwareness(awarenessMessage: any, exclude: WebSocket): void {
		const message = JSON.stringify(awarenessMessage);

		for (const [connection] of this.connections) {
			if (connection !== exclude && connection.readyState === WebSocket.OPEN) {
				connection.send(message);
			}
		}
	}

	broadcastAwarenessRemove(clientId: string, exclude: WebSocket): void {
		const message = JSON.stringify({
			type: 'awareness-remove',
			clientId: clientId,
		});

		for (const [connection] of this.connections) {
			if (connection !== exclude && connection.readyState === WebSocket.OPEN) {
				connection.send(message);
			}
		}
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
