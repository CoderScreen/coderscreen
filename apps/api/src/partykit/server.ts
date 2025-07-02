import type * as Party from 'partykit/server';
import { onConnect } from 'y-partykit';

export default class YjsServer implements Party.Server {
	private awareness = new Map<string, any>();

	constructor(public party: Party.Room) {}

	onConnect(conn: Party.Connection) {
		// Set up Y.js collaboration
		const provider = onConnect(conn, this.party);

		// Handle custom messages for user presence
		conn.addEventListener('message', (event) => {
			try {
				const message = JSON.parse(event.data as string);

				// Handle user join messages
				if (message.type === 'user-join') {
					const { email, name, color } = message;

					// Store user info in awareness
					const clientId = conn.id;
					this.awareness.set(clientId, {
						email,
						name,
						color,
						clientId,
						connectedAt: Date.now(),
					});

					// Broadcast user joined to other clients
					this.party.broadcast(
						JSON.stringify({
							type: 'user-joined',
							user: { email, name, color, clientId },
						}),
						[conn.id],
					);

					// Send current user list to the joining user
					const users = Array.from(this.awareness.values());
					conn.send(
						JSON.stringify({
							type: 'user-list',
							users,
						}),
					);
				}
			} catch (error) {
				// Ignore parsing errors for non-JSON messages (like Y.js updates)
			}
		});

		// Handle disconnection
		conn.addEventListener('close', () => {
			// Remove user from awareness
			const userInfo = this.awareness.get(conn.id);

			if (userInfo) {
				this.awareness.delete(conn.id);

				// Broadcast user left to other clients
				this.party.broadcast(
					JSON.stringify({
						type: 'user-left',
						user: userInfo,
					}),
					[conn.id],
				);
			}
		});

		return provider;
	}
}
