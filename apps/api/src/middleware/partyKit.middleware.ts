import { partyserverMiddleware } from 'hono-party';
import { AppContext } from '@/index';
import { RoomService } from '@/services/Room.service';
import { Id } from '@coderscreen/common/id';
import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { createMiddleware } from 'hono/factory';

export const partyKitMiddleware = createMiddleware(async (ctx, next) => {
	const roomId = ctx.req.param('roomId');

	if (!roomId) {
		throw new HTTPException(400, {
			message: 'Room ID is required',
		});
	}

	const room = await new RoomService(ctx).getPublicRoom(roomId as Id<'room'>);

	if (!room) {
		throw new HTTPException(404, {
			message: 'Room not found',
		});
	}

	// Call the partyserverMiddleware with the validated room
	const partyMiddleware = partyserverMiddleware<AppContext>({
		options: {
			prefix: `rooms/${roomId}/public/partykit/parties`,
			onBeforeRequest: async (req, { name }) => {
				// Room is already validated above, just return the request
				return req;
			},
		},
	});

	// Apply the party middleware and continue
	return partyMiddleware(ctx, next);
});
