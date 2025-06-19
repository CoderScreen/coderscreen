export interface Env {
	// Add any environment variables you need
}

export interface AwarenessState {
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

export interface CollaborationMessage {
	type: 'sync' | 'update' | 'awareness' | 'cursor-update' | 'awareness-sync' | 'awareness-remove';
	data?: any;
	awareness?: AwarenessState;
	cursor?: any;
	clientId?: string;
}

export interface RoomInfo {
	roomId: string;
	connections: number;
	documentSize: number;
	lastModified: string;
	roomType: 'code' | 'instructions';
}

export interface RoomStatus {
	connected: boolean;
	connectionCount: number;
	documentExists: boolean;
	roomType: 'code' | 'instructions';
}
