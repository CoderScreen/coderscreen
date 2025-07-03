import { YServer } from 'y-partyserver';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { AppContext } from '@/index';
import postgres from 'postgres';
import { Id } from '@coderscreen/common/id';
import { eq } from 'drizzle-orm';
import { RoomEntity, roomTable } from '@coderscreen/db/room.db';
import { RoomContentEntity, roomContentTable } from '@coderscreen/db/roomContent.db';
import * as Y from 'yjs';

export class RoomServer extends YServer<AppContext['Bindings']> {
	private db: PostgresJsDatabase | null = null;
	private room: RoomEntity | null = null;

	/* control how often the onSave handler
	 * is called with these options */
	static callbackOptions = {
		// all of these are optional
		debounceWait: /* number, default = */ 1000,
		debounceMaxWait: /* number, default = */ 1000,
		timeout: /* number, default = */ 1000,
	};
	private awareness = new Map<string, any>();

	async onLoad() {
		// when first started, fetch the details of the room associated with this room
		const roomId = this.name as Id<'room'>;
		const db = await this.getDb();
		const data = await db
			.select({
				room: roomTable,
				roomContent: roomContentTable,
			})
			.from(roomTable)
			.where(eq(roomTable.id, roomId))
			.leftJoin(roomContentTable, eq(roomContentTable.roomId, roomTable.id))
			.then((res) => (res.length > 0 ? res[0] : null));

		if (!data) {
			throw new Error('Room not found');
		}

		this.room = data.room;

		if (data.roomContent) {
			const yDoc = new Y.Doc();

			const codeValue = data.roomContent.code;
			const instructionsValue = data.roomContent.instructions;
			const executionHistoryValue = data.roomContent.executionHistory;

			// // An example of a `yDoc` modification
			// const codeText = yDoc.getText('code');
			// codeText.insert(0, codeValue);

			// const instructionsText = yDoc.getText('instructions');
			// instructionsText.insert(0, instructionsValue);

			// const executionHistoryArray = yDoc.getArray('executionHistory');
			// executionHistoryArray.insert(0, executionHistoryValue)

			// // Encode the document state as an update
			// const yUpdate = Y.encodeStateAsUpdate(yDoc);

			// const content = new Y.Doc();

			// Y.applyUpdate(this.document, content);
		}
	}

	async onSave() {
		// called every few seconds after edits, and when the room empties
		// you can use this to write to a database or some external storage

		const db = await this.getDb();
		const room = await this.getRoom();

		const rawCodeValue = this.document.getText('code');
		const codeValue = rawCodeValue.toJSON();

		const rawInstructionsValue = this.document.getXmlFragment('instructions');
		const instructionsValue = rawInstructionsValue.toJSON();

		const rawExecutionHistoryValue = this.document.getArray('executionHistory');
		const executionHistoryValue = rawExecutionHistoryValue.toJSON();

		const roomContent: RoomContentEntity = {
			roomId: room.id,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			userId: room.userId,
			organizationId: room.organizationId,
			code: codeValue,
			instructions: instructionsValue,
			executionHistory: executionHistoryValue,
		};

		await db
			.insert(roomContentTable)
			.values(roomContent)
			.onConflictDoUpdate({
				target: [roomContentTable.roomId],
				set: {
					updatedAt: new Date().toISOString(),
					code: codeValue,
					instructions: instructionsValue,
					executionHistory: executionHistoryValue,
				},
			});
	}

	private async getDb() {
		if (!this.db) {
			const sql = postgres(this.env.DATABASE_URL);
			this.db = drizzle(sql);
		}

		return this.db;
	}

	private async getRoom() {
		if (!this.room) {
			throw new Error('Room not found');
		}

		return this.room;
	}
}
