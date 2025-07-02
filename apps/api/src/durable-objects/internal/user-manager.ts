export interface ConnectedUser {
	email: string;
	name: string;
	color: string;
	clientId: string;
	connectedAt: number;
	lastSeen: number;
}

export interface UserPresenceMessage {
	type: 'user-joined' | 'user-left' | 'user-list' | 'user-update';
	user?: ConnectedUser;
	users?: ConnectedUser[];
	clientId?: string;
}

export class UserManager {
	private connectedUsers: Map<string, ConnectedUser> = new Map(); // clientId -> user
	private userConnections: Map<string, Set<WebSocket>> = new Map(); // email -> Set of WebSockets
	private connectionUsers: Map<WebSocket, string> = new Map(); // WebSocket -> clientId

	constructor() {}

	getConnectedUsers(): ConnectedUser[] {
		return Array.from(this.connectedUsers.values());
	}

	getUserByClientId(clientId: string): ConnectedUser | undefined {
		return this.connectedUsers.get(clientId);
	}

	getUserByEmail(email: string): ConnectedUser | undefined {
		for (const user of this.connectedUsers.values()) {
			if (user.email === email) {
				return user;
			}
		}
		return undefined;
	}

	getConnections(): Map<WebSocket, string> {
		return this.connectionUsers;
	}

	addUser(ws: WebSocket, user: ConnectedUser): void {
		this.connectedUsers.set(user.clientId, user);
		this.connectionUsers.set(ws, user.clientId);

		// Track multiple connections per user (email)
		if (!this.userConnections.has(user.email)) {
			this.userConnections.set(user.email, new Set());
		}
		this.userConnections.get(user.email)!.add(ws);

		console.log(`User ${user.email} joined with clientId ${user.clientId}`);
	}

	removeUser(ws: WebSocket): ConnectedUser | undefined {
		const clientId = this.connectionUsers.get(ws);
		if (!clientId) return undefined;

		const user = this.connectedUsers.get(clientId);
		if (!user) return undefined;

		// Remove from connection tracking
		this.connectionUsers.delete(ws);
		this.connectedUsers.delete(clientId);

		// Remove from user connections
		const userWsSet = this.userConnections.get(user.email);
		if (userWsSet) {
			userWsSet.delete(ws);
			if (userWsSet.size === 0) {
				this.userConnections.delete(user.email);
				console.log(`User ${user.email} completely disconnected`);
			}
		}

		console.log(`User ${user.email} left with clientId ${clientId}`);
		return user;
	}

	updateUserLastSeen(clientId: string): void {
		const user = this.connectedUsers.get(clientId);
		if (user) {
			user.lastSeen = Date.now();
			this.connectedUsers.set(clientId, user);
		}
	}

	broadcastUserJoined(user: ConnectedUser, exclude?: WebSocket): void {
		const message: UserPresenceMessage = {
			type: 'user-joined',
			user,
		};

		this.broadcastMessage(message, exclude);
	}

	broadcastUserLeft(user: ConnectedUser, exclude?: WebSocket): void {
		const message: UserPresenceMessage = {
			type: 'user-left',
			user,
		};

		this.broadcastMessage(message, exclude);
	}

	broadcastUserList(ws: WebSocket): void {
		const message: UserPresenceMessage = {
			type: 'user-list',
			users: this.getConnectedUsers(),
		};

		if (ws.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify(message));
		}
	}

	private broadcastMessage(message: UserPresenceMessage, exclude?: WebSocket): void {
		const messageStr = JSON.stringify(message);

		for (const [connection] of this.connectionUsers) {
			if (connection !== exclude && connection.readyState === WebSocket.OPEN) {
				connection.send(messageStr);
			}
		}
	}

	getUniqueUsers(): ConnectedUser[] {
		// Return unique users by email (in case of multiple connections)
		const uniqueUsers = new Map<string, ConnectedUser>();

		for (const user of this.connectedUsers.values()) {
			if (!uniqueUsers.has(user.email)) {
				uniqueUsers.set(user.email, user);
			}
		}

		return Array.from(uniqueUsers.values());
	}

	destroy(): void {
		this.connectedUsers.clear();
		this.userConnections.clear();
		this.connectionUsers.clear();
	}
}
