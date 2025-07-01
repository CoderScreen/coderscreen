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
	documentType?: 'code' | 'instructions';
}

export interface CodeExecutionState {
	isRunning: boolean;
	output?: string;
	error?: string;
	timestamp: number;
}

export interface CodeExecutionMessage {
	type: 'execution_start' | 'execution_output' | 'execution_complete' | 'execution_error' | 'execution_state' | 'sync' | 'update';
	data:
		| {
				output?: string;
				error?: string;
				timestamp: number;
		  }
		| number[]; // For Y.js updates (ArrayBuffer as number array)
}

export interface RoomInfo {
	roomId: string;
	connections: number;
	documentSize: number;
	lastModified: string;
	roomType: 'code' | 'instructions' | 'unified';
}

export interface RoomStatus {
	connected: boolean;
	connectionCount: number;
	documentExists: boolean;
	roomType: 'code' | 'instructions' | 'unified';
}
