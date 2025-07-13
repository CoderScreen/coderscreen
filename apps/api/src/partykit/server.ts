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
import { AIService, ChatMessage, User } from './internal/AI.service';

export class RoomServer extends YServer<AppContext['Bindings']> {
  private db: PostgresJsDatabase | null = null;
  private sandboxService: SandboxService;
  private aiService: AIService | null = null;
  private room: RoomEntity | null = null;

  /* control how often the onSave handler
   * is called with these options */
  static callbackOptions = {
    // all of these are optional
    debounceWait: /* number, default = */ 5000,
    debounceMaxWait: /* number, default = */ 10000,
    timeout: /* number, default = */ 10000,
  };

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);

    this.sandboxService = new SandboxService(env);
  }

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
    this.aiService = new AIService(this.env, this.document, this.room);

    if (data.roomContent) {
      Y.applyUpdate(
        this.document,
        new Uint8Array(Buffer.from(data.roomContent.rawContent, 'base64'))
      );
    } else {
      this.initializeDefaultValues();
    }

    // warm up the sandbox
    this.createNewSandbox(this.room.language);
  }

  private async initializeDefaultValues() {
    const isInitialized = await this.ctx.storage.get<boolean>('initialized');
    if (isInitialized) {
      return;
    }

    /**
     * need to set default values for:
     * - language
     * - status
     * rest will be created by user
     */
    const room = this.getRoom();
    const langValue = this.document.getText('language');
    const statusValue = this.document.getText('status');
    langValue.delete(0, langValue.length);
    statusValue.delete(0, statusValue.length);
    langValue.insert(0, room.language);
    statusValue.insert(0, room.status);

    // services init themselves
    this.aiService?.initialize();

    this.ctx.storage.put('initialized', true);
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

    const statusValue = this.document.getText('status');
    const status = statusValue.toJSON() as RoomEntity['status'];

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
      rawPrivateContent: '',
      status,
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
            rawPrivateContent: undefined,
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

  async handleStatusUpdate(status: RoomEntity['status']) {
    this.document.transact(() => {
      const statusText = this.document.getText('status');
      statusText.delete(0, statusText.length);
      statusText.insert(0, status);
    });

    // we can just update local state, the db remains source of truth
    if (this.room) {
      this.room.status = status;
      this.room.updatedAt = new Date().toISOString();
    }
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

  // AI Chat Methods
  async handleAiChat(params: {
    userMessage: ChatMessage & { user: User };
    assistantMessage: ChatMessage;
  }) {
    if (!this.aiService) {
      throw new Error('AI service not found');
    }

    // Start streaming AI response
    const messages = await this.aiService.streamResponse(params);

    this.ctx.waitUntil(this.aiService.onComplete(messages));
  }
}
