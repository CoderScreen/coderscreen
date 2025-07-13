import { partyserverMiddleware } from 'hono-party';
import { AppContext } from '@/index';
import { HTTPException } from 'hono/http-exception';
import { createMiddleware } from 'hono/factory';
import { RoomService } from '@/services/Room.service';
import { Id } from '@coderscreen/common/id';

export const partyKitMiddleware = createMiddleware<AppContext>(async (ctx, next) => {
  const publicRoom = ctx.get('publicRoom');

  if (!publicRoom) {
    throw new HTTPException(404, {
      message: 'Room not found',
    });
  }

  // Call the partyserverMiddleware with the validated room
  const partyMiddleware = partyserverMiddleware<AppContext>({
    options: {
      prefix: `rooms/${publicRoom.id}/public/connect/parties`,
    },
  });

  // Apply the party middleware and continue
  return partyMiddleware(ctx, next);
});

export const privatePartyKitMiddleware = createMiddleware<AppContext>(async (ctx, next) => {
  const roomId = ctx.req.param('roomId');

  if (!roomId) {
    throw new HTTPException(400, {
      message: 'Room ID is required',
    });
  }

  // ensure room exists
  const roomService = new RoomService(ctx);
  const room = await roomService.getRoom(roomId as Id<'room'>);

  if (!room) {
    throw new HTTPException(404, {
      message: 'Room not found',
    });
  }

  const partyMiddleware = partyserverMiddleware<AppContext>({
    options: {
      prefix: `rooms/${room.id}/connect/parties`,
    },
  });

  return partyMiddleware(ctx, next);
});
