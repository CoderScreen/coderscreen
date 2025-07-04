import { YServer } from 'y-partyserver';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { AppContext } from '@/index';
import postgres from 'postgres';
import { Id } from '@coderscreen/common/id';
import { eq } from 'drizzle-orm';
import { RoomEntity, roomTable } from '@coderscreen/db/room.db';
import { RoomContentEntity, roomContentTable } from '@coderscreen/db/roomContent.db';
import * as Y from 'yjs';
import { SandboxService } from './internal/Sandbox.service';

export class RoomServer extends YServer<AppContext['Bindings']> {
	private db: PostgresJsDatabase | null = null;
	private sandboxService: SandboxService | null = null;
	private room: RoomEntity | null = null;

	/* control how often the onSave handler
	 * is called with these options */
	static callbackOptions = {
		// all of these are optional
		debounceWait: /* number, default = */ 1000,
		debounceMaxWait: /* number, default = */ 1000,
		timeout: /* number, default = */ 1000,
	};

	async onLoad() {
		this.sandboxService = new SandboxService(this.env);
		// when first started, fetch the details of the room associated with this room
		const roomId = this.name as Id<'room'>;
		const db = this.getDb();
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
			Y.applyUpdate(this.document, new Uint8Array(Buffer.from(data.roomContent.rawContent, 'base64')));
		}

		// warm up the sandbox
		this.createNewSandbox(this.room.language);

		// observe the language and start new sandbox if it changes
		const languageText = this.document.getText('language');
		languageText.observe(() => {
			const language = languageText.toJSON() as RoomEntity['language'];
			// this.createNewSandbox(language);
		});
	}

	async onSave() {
		// called every few seconds after edits, and when the room empties
		// you can use this to write to a database or some external storage

		const db = this.getDb();
		const room = this.getRoom();

		const rawCodeValue = this.document.getText('code');
		const codeValue = rawCodeValue.toJSON();

		const rawInstructionsValue = this.document.getXmlFragment('instructions');
		const instructionsValue = rawInstructionsValue.toArray();

		const rawExecutionHistoryValue = this.document.getArray('executionHistory');
		const executionHistoryValue = rawExecutionHistoryValue.toArray();

		const languageValue = this.document.getText('language');
		const language = languageValue.toJSON();

		const totalContent = Y.encodeStateAsUpdate(this.document);

		const roomContent: RoomContentEntity = {
			roomId: room.id,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			userId: room.userId,
			organizationId: room.organizationId,
			code: codeValue,
			language,
			instructions: instructionsValue,
			executionHistory: executionHistoryValue,
			rawContent: Buffer.from(totalContent).toString('base64'),
		};

		await Promise.all([
			db
				.insert(roomContentTable)
				.values(roomContent)
				.onConflictDoUpdate({
					target: [roomContentTable.roomId],
					set: {
						...roomContent,
						roomId: undefined,
						createdAt: undefined,
						updatedAt: undefined,
						userId: undefined,
						organizationId: undefined,
					},
				}),
			db
				.update(roomTable)
				.set({
					language: language as RoomEntity['language'],
					updatedAt: new Date().toISOString(),
				})
				.where(eq(roomTable.id, room.id)),
		]);
	}

	private getDb() {
		if (!this.db) {
			const sql = postgres(this.env.DATABASE_URL);
			this.db = drizzle(sql);
		}

		return this.db;
	}

	private getRoom() {
		if (!this.room) {
			throw new Error('Room not found');
		}

		return this.room;
	}

	private getSandbox() {
		if (!this.sandboxService) {
			throw new Error('Sandbox service not found');
		}

		return this.sandboxService;
	}

	private createNewSandbox(language: RoomEntity['language']) {
		const room = this.getRoom();
		const roomId = room.id;

		this.ctx.waitUntil(this.getSandbox().startSandbox({ roomId, language }));
	}
}
